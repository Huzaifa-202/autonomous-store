import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Text, Image, ScrollView, Keyboard, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-simple-toast';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import api from '../server/api';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AppFonts } from '../Constant/Fonts/Font';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // const handleLogin = async () => {
    //     if (validateInputs()) {
    //         try {
    //             await api.login({ email, password });
    //             Toast.show('Login successful!', Toast.LONG);
    //             setEmail('');
    //             setPassword('');
    //         } catch (error) {
    //             showToast('Login failed. Please check your credentials.');
    //         }
    //     }
    // };

    GoogleSignin.configure({
        webClientId: '824330957680-c0hag4cl1dm1g3gq9lnkq6022okk2qdt.apps.googleusercontent.com',
        offlineAccess: true,
    });

    const handleGoogle = async () => {
        try {


        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login');
                showToast('Sign-In cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign-in is in progress already');
                showToast('Sign-In is in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services are not available');
                showToast('Play services are not available');
            } else {
                console.error('Google sign-in error:', error);
                showToast('Google Sign-In failed. Please try again.');
            }
        }
    };

    const handleLogin = async () => {
        if (validateInputs()) {
            setLoading(true);
            try {
                await auth().signInWithEmailAndPassword(email, password);
                Toast.show('Login successful!', Toast.LONG);
                await AsyncStorage.setItem('isLoggedIn', 'true');
                setEmail('');
                setPassword('');
                navigation.replace('BottomScreen')
            } catch (error) {
                if (error.code === 'auth/invalid-credential') {
                    console.log('The email address you entered does not exist in our records.');
                    showToast('The email address you entered does not exist in our records.');
                } else if (error.code === 'auth/invalid-email') {
                    console.log('That email address is invalid!');
                } else if (error.code === 'auth/user-not-found') {
                    showToast('The email address you entered does not exist in our records.');
                    console.log('That email address is invalid!');
                } else if (error.code === 'auth/wrong-password') {
                    showToast('Your Password Is Wrong.');
                    console.log('That email address is invalid!');
                } else {
                    console.error("errror=====>>>>> ", error);
                }
            } finally {
                setLoading(false);
            }
        }
    };

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
        }
    }, [])


    const validateInputs = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[a-z])(?=.*\d).{8,}$/;

        if (!email && !password) {
            showToast('Please fill in all fields');
            return false;
        } else if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address');
            return false;
        } else if (!passwordRegex.test(password)) {
            showToast('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit');
            return false;
        } else {
            return true;
        }
    };

    const showToast = (text) => {
        Toast.show(text, Toast.LONG);
    };

    const handleRegister = () => {
        navigation.replace('SignUp');
    }

    const handleForgotPassword = () => {
        navigation.replace('ForgotPassword')
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled' behavior="padding" >
            <View style={styles.container}>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 50 }}>
                    <Image source={ImagesPath.logo} style={styles.image} />
                </View>
                <View style={styles.header}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>Welcome Back!</Text>
                </View>
                <View style={[styles.inputContainer, { marginTop: keyboardOpen ? '10%' : "10%" }]}>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.emailImages} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            placeholderTextColor="black"
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.passwordImages} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="black"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.passwordToggle}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Image source={showPassword ? ImagesPath.eyeImage : ImagesPath.eyeSlashImage} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.registerTextContainer}>
                        <Text style={styles.registerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={handleRegister}>
                            <Text style={styles.registerLink}> Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* <Text style={{ color: 'black', textAlign: 'center', marginTop: 10 }}>Or Signin with</Text> */}
                {/* <View style={styles.googleContainer}>
                    <TouchableOpacity style={[styles.fgaSubContainer, { marginRight: 15 }]} onPress={handleGoogle}>
                        <Image source={ImagesPath.GoogleImages} style={styles.loginImages} />
                    </TouchableOpacity>
                </View> */}
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
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 0,
        top: 7,
    },
    icon: {
        height: 25,
        width: 25,
    },
    image: {
        resizeMode: 'cover',
        width: 200,
        height: 200
    },
    text: {
        fontSize: 50,
        color: 'white',
        marginBottom: 30,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
    },
    overlaySub: {
        marginTop: 100
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        color: 'black'
    },
    input: {
        height: 40,
        borderColor: 'black',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginBottom: 12,
        paddingLeft: 35,
        color: 'black',
        fontFamily: AppFonts.regular
    },
    inputContainer: {
        paddingHorizontal: 0,
        marginTop: 200
    },
    registerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        fontFamily: AppFonts.regular
    },
    registerText: {
        color: 'black',
        fontSize: 16,
        fontFamily: AppFonts.regular
    },
    registerLink: {
        color: '#114e95',
        fontSize: 16,
    },
    forgotPasswordLink: {
        color: '#F1565D',
        textAlign: 'right',
        marginBottom: 12,
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
    title: {
        fontSize: 32,
        // fontWeight: 'bold',
        marginTop: 20,
        color: '#114e95',
        fontFamily: AppFonts.bold,
    },
    subtitle: {
        fontSize: 18,
        color: 'black',
        marginTop: 10,
        fontFamily: AppFonts.regular,
    },
    passwordToggle: {
        position: 'absolute',
        top: 10,
        right: 20,
    },
    googleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20
    },
    fgaSubContainer: {
        backgroundColor: 'white',
        height: 80,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20
    },
    loginImages: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
    },
    accountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Login;
