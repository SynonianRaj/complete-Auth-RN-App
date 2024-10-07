import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { useAuth } from './AuthContext';
import axios from 'axios';


export default function ProfileScreen() {
    const { getToken } = useAuth();
    const uri  = 'http://localhost:8000/api';


    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const selectImage = () => {
        Alert.alert(
            "Change Profile Picture",
            "Choose an option",
            [
                {
                    text: "Camera",
                    onPress: () => launchCamera({ mediaType: 'photo', cameraType: "front" }, handleImageSelection),
                },
                {
                    text: "Gallery",
                    onPress: () => launchImageLibrary({ mediaType: 'photo' }, handleImageSelection),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                }
            ]
        );
    };

    const handleImageSelection = (response) => {
        if (response.didCancel) {
            console.log("User cancelled image picker");
        } else if (response.error) {
            console.log("ImagePicker Error: ", response.error);
        } else if (response.assets) {
            const uri = response.assets[0].uri;

            // Crop the image
            ImagePicker.openCropper({
                path: uri,
                width: 300,
                height: 400,
                freeStyleCropEnabled: true,
            }).then(croppedImage => {
                setProfileImage(croppedImage.path);
                console.log(croppedImage.path);
            }).catch(err => {
                console.log("Crop Error: ", err);
            });
        } else {
            console.log("Unexpected response format: ", response);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = await getToken(); // Get the token
            if (token) {
                try {
                    const response = await axios.get(`${uri}/user/profile/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    setProfileData(response.data);
                    setProfileImage(response.data.image)
                    console.log("Profile Data : ", response.data)
                } catch (err) {
                    console.error('Error fetching profile data:', err);
                } finally {
                    setLoading(false);
                    if  (profileData?.image) {
                        setProfileImage(profileData.image)
                    }

                    TODO : // have to removed and add some better logic profile image exist then show other wise show an placeholder image like react logo
                    if (profileImage){
                        setProfileImage(profileData.image)
                    }else{
                        setProfileImage('https://reactnative.dev/img/tiny_logo.png')
                    }
                    
                }
            } else {
                console.error('No token found');
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [getToken]);

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#3bceff" />
                    <Text style={styles.loadingText}>Loading Details...</Text>
                </View>
            ) : (
                <>

                    <View style={styles.profileCard}>
                        <TouchableOpacity onPress={selectImage}>
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                        <Text style={styles.name}>{profileData?.first_name} {profileData?.last_name}</Text>

                        <Text style={styles.email}>{profileData?.email}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailsTitle}>Profile Details</Text>
                        <Text style={styles.detailItem}>Name: {profileData?.first_name} {profileData?.last_name}</Text>
                        <Text style={styles.detailItem}>Height: {profileData?.height}</Text>
                        <Text style={styles.detailItem}>Weight: {profileData?.weight}</Text>
                        
                        <Text style={styles.detailItem}>Age: {profileData?.age}</Text>
                        <Text style={styles.detailItem}>Location: {profileData?.location}</Text>
                        <Text style={styles.detailItem}>Phone: +91 {profileData?.phone}</Text>
                        <Text style={styles.detailItem}>Bio: {profileData?.bio}</Text>
                    </View>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </>

            )}

        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        padding: 20,
    },
    profileCard: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#4a90e2',
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4a90e2',
        marginBottom: 10,
    },
    detailItem: {
        fontSize: 16,
        color: '#444',
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#4a90e2',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: "#000",
    }
});
