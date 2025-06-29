import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, Image, ScrollView, Keyboard, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-simple-toast';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import api from '../server/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppFonts } from '../Constant/Fonts/Font';

const OTP = ({ navigation }) => {
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [otpCode, setOtpCode] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardOpen(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardOpen(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const user = await AsyncStorage.getItem('userToken');
            if (user) {
                const parsedUser = JSON.parse(user);
                console.log("parsedUser===>>>>>>>> ", parsedUser.token);
                setToken(parsedUser.token);
            }
        };

        fetchData();
    }, []);

    const handleNext = async () => {
        setLoading(true);

        try {
            const enteredOtp = otpCode.join('');
            await api.verifyOtp({ token, enteredOtp });
            Toast.show('OTP verified successfully!', Toast.LONG);
            navigation.replace('Images');
        } catch (error) {
            Toast.show('OTP verification failed. Please try again.', Toast.LONG);
        } finally {
            setLoading(false); 
        }
    };

    const handleOtpChange = (index, value) => {
        const newOtpCode = [...otpCode];
        newOtpCode[index] = value;
        setOtpCode(newOtpCode);

        if (value && index < otpCode.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('SignUp')}>
                    <Image source={ImagesPath.arrowBack} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.header}>
                    <Text style={styles.title1}>Verification</Text>
                    <Text style={styles.subtitle}>Enter the code sent to the email</Text>
                </View>
                <View style={[styles.inputContainer, { marginTop: keyboardOpen ? '10%' : "10%" }]}>
                    <View style={styles.otpContainer}>
                        {otpCode.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpInput}
                                keyboardType="numeric"
                                maxLength={1}
                                onChangeText={(value) => handleOtpChange(index, value)}
                                value={digit}
                                ref={el => inputRefs.current[index] = el}
                            />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.loginButton} onPress={handleNext}>
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Next</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'white'
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 10,
        padding: 10,
        backgroundColor: 'white',
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 20,
        borderRadius: 10
    },
    backIcon: {
        height: 20,
        width: 20,
    },
    header: {
        alignItems: 'center'
    },
    otpContainer: {
        flexDirection: 'row',
        marginLeft: 30,
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    otpInput: {
        width: 40,
        height: 40,
        textAlign: 'center',
        fontSize: 18,
        color: 'black',
        backgroundColor: '#f9fafc',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        fontFamily: AppFonts.regular
    },
    title1: {
        fontSize: 32,
        // fontWeight: 'bold',
        marginTop: 20,
        color: '#114e95',
        fontFamily: AppFonts.bold
    },
    subtitle: {
        fontSize: 18,
        color: 'black',
        marginTop: 10,
        fontFamily: AppFonts.regular
    },
    loginButton: {
        backgroundColor: '#114e95',
        borderRadius: 15,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: AppFonts.regular
    },
    loader: {
        marginTop: 20,
    },
});

export default OTP;
