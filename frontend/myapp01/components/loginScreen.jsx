import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Image,
} from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const storeData = async (token) => {
    try {
        await AsyncStorage.setItem('accessToken', token);
    } catch (e) {
        console.error(e);
    }
};

export default function LoginScreen({ navigation }) {

    const { login } = useAuth();

    const [emailField, setEmailField] = useState('');
    const [passwordField, setPasswordField] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    const uri = "http://localhost:8000/api/login/";

    const handleLogin = async () => {
        // Trim whitespace from input fields
        const trimmedEmail = emailField.trim();
        const trimmedPassword = passwordField.trim();

        if (!trimmedEmail || !trimmedPassword) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true); // Start loading
       

        try {
            const response = await axios.post(uri, {
                email: trimmedEmail.toLowerCase(),
                password: trimmedPassword,
            });
            
            const { tokens, is_profile_complete } = response.data; // Destructure response
            console.log(is_profile_complete)
            console.log("Data -> ",response.data )
            const isLoggedIn = await login(tokens.access);

            if (isLoggedIn) {
                if (is_profile_complete) {
                    navigation.navigate("HomeScreen");
                } else {
                    navigation.navigate("ProfileSetupScreen");
                }
            } else {
                Alert.alert("Login Failed", "Unable to log in. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error); // Adjusted logging

            let errorMessage;

            if (error.message === "Network Error") {
                errorMessage = "Network Error. Please check your connection.";
            } else if (error.response) {
                switch (error.response.status) {
                    case 401:
                        errorMessage = "Please enter correct credentials.";
                        break;
                    case 403:
                        errorMessage = "Your account is not authorized.";
                        break;
                    default:
                        errorMessage = "Login Failed. Please try again.";
                }
            } else {
                errorMessage = "Login Failed. An unexpected error occurred.";
            }

            Alert.alert("Login Failed", errorMessage);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? ( // Conditional rendering for loading state
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#3bceff" />
                    <Text style={styles.loadingText}>Checking your credentials...</Text>
                </View>
            ) : (
                <>
                    <Image style={styles.logo}
                        source={{
                            uri: 'https://reactnative.dev/img/tiny_logo.png',
                        }} />
                    <Text style={styles.wlcmText}>Welcome Back</Text>

                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#a6a4a4"
                            keyboardType="email-address"
                            value={emailField}
                            autoCapitalize='none'
                            onChangeText={setEmailField}
                        />

                        <TextInput
                            secureTextEntry={true}
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#a6a4a4"
                            value={passwordField}
                            onChangeText={setPasswordField}
                        />

                        <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Hello')}>
                            <Text style={styles.frgtPassText}>Forgot Your Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.loginBtn}
                            onPress={handleLogin}
                        >
                            <Text style={styles.loginText}>LOGIN</Text>
                        </TouchableOpacity>

                        <View style={styles.txtContainer}>
                            <Text style={styles.signUpText}>Don't have an Account?</Text>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                style={styles.signUpBtn}
                                onPress={() => navigation.navigate('RegisterScreen')}>

                                <Text style={styles.signtxt}>Register here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
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
    },
    logo: {
        alignSelf: 'center',
        height: 100,
        width: 100,
        marginBottom: 20,
    },
    wlcmText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#343a40',
        marginBottom: 20,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    input: {
        height: 50,
        marginBottom: 15,
        borderWidth: 1,
        padding: 10,
        borderColor: '#ced4da',
        borderRadius: 5,
        backgroundColor: '#f8f9fa',
        fontSize: 16,
        color: '#0d0d0d',
    },
    frgtPassText: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    loginBtn: {
        backgroundColor: '#007bff',
        alignItems: 'center',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
        elevation: 2,
    },
    txtContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    loginText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    signUpText: {
        fontSize: 16,
        color: '#6c757d',
    },
    signtxt: {
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 5,
    },
    signUpBtn: {
        paddingHorizontal: 5,
    },
});

