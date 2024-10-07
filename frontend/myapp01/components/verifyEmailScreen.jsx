import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerifyEmailScreen( { route, navigation  } ) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
const uri = 'http://localhost:8000/api'

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailVerifyBtnClick = async () => {
    if (!otp){
      Alert.alert('Error',  'Please enter OTP');
      return
    }
    console.log(otp);
    try {
      const response = await axios.post(`${uri}/user/email_verify/`, {
        email: email,
        otp : otp
      });
      if (response.status === 200){
        navigation.replace('LoginScreen')
      }
      
    }  catch (error) {
      console.log(error);
    }

    
  }

  const handleResendOtp = () => {
    // Your logic here to resend the OTP
    console.log("Resending OTP...");
    setCountdown(60); // Set countdown to 30 seconds
    setIsResendDisabled(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subTitle}>
          Please enter the OTP sent to your email.
        </Text>
        
        <TextInput
          style={styles.otpInput}
          placeholder="Enter OTP"
          placeholderTextColor="#a6a4a4"
          value={otp}
          onChangeText={setOtp}
        />
        
        <TouchableOpacity style={styles.verifyBtn}
        onPress={handleEmailVerifyBtnClick}>
          <Text style={styles.verifyBtnTxt}>Verify</Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={[styles.resendBtn, isResendDisabled && styles.disabledBtn]} 
          onPress={handleResendOtp} 
          disabled={isResendDisabled}
        >
          <Text style={styles.resendBtnTxt}>
            {isResendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: StatusBar.currentHeight + 20,
    justifyContent: 'center',
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: {
    height: 50,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    padding: 10,
    borderColor: '#ced4da',
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
    fontSize: 16,
  },
  verifyBtn: {
    backgroundColor: '#007bff',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    elevation: 2,
    width: '100%', // Full width for button
  },
  verifyBtnTxt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },

  resendBtn: {
    marginTop: 15,
    padding: 10,
  },
  resendBtnTxt: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
