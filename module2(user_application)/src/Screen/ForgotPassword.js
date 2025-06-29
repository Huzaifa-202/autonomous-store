import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, Image, ScrollView, Keyboard, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-simple-toast';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import auth from '@react-native-firebase/auth';
import { AppFonts } from '../Constant/Fonts/Font';

const ForgotPassword = ({ navigation }) => {
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [email, setEmail] = useState('');
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
        }
    }, []);

    const handleResetPassword = async () => {
        if (!email) {
            Toast.show('Please enter your email address');
            return;
        }

        setLoading(true)

        try {
            await auth().sendPasswordResetEmail(email);
            Toast.show('Password reset email sent!');
            navigation.replace('Login');
        } catch (error) {
            console.error(error);
            Toast.show('An error occurred while sending the reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Login')}>
                    <Image source={ImagesPath.arrowBack} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.header}>
                    <Text style={styles.title1}>Forgot Password</Text>
                    <Text style={styles.subtitle}>Enter your email to receive a password reset link</Text>
                </View>
                <View style={[styles.inputContainer, { marginTop: keyboardOpen ? '10%' : '10%' }]}>
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
                    <TouchableOpacity style={styles.loginButton} onPress={handleResetPassword}>
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Send Reset Link</Text>
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
    header: {
        alignItems: 'center',
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
    inputWrapper: {
        position: 'relative',
        marginBottom: 10
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
        textAlign: 'center',
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
    passwordToggle: {
        position: 'absolute',
        top: 10,
        right: 20,
    },
});

export default ForgotPassword;
