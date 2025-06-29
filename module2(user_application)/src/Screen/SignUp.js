import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Text, ScrollView, TouchableOpacity, Platform, Image, Keyboard, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-simple-toast';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import api from '../server/api';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import { AppFonts } from '../Constant/Fonts/Font';

const SignUp = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dob, setDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [creditCardNumber, setCreditCardNumber] = useState('');
    const [creditCardExpiry, setCreditCardExpiry] = useState('');
    const [creditCardExpiryPickerVisible, setCreditCardExpiryPickerVisible] = useState(false);
    const [creditCardCVC, setCreditCardCVC] = useState('');
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [numberOfVisits, setNumberOfVisits] = useState(0); // Default to 0
    const [registrationDate, setRegistrationDate] = useState(new Date()); // Current date
    const [lastVisitedTime, setLastVisitedTime] = useState(null); // Initially null
    const [loading, setLoading] = useState(false);

    // const handleSignUp = async () => {
    //     if (validateInputs()) {
    //         try {
    //             await api.signup({ firstName, lastName, email, password, dob, creditCardNumber, creditCardExpiry, creditCardCVC })
    //             Toast.show('Signup successful!', Toast.LONG);
    //             // navigation.replace('Images')
    //             navigation.replace('OTP')
    //         } catch (error) {
    //             Toast.show('Signup failed. Please try again.', Toast.LONG);
    //         }
    //     }
    // };

    const handleSignUp = async () => {
        if (validateInputs()) {
            setLoading(true);
            try {
                const userCredential = await auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
    
                await firestore().collection('users').doc(user.uid).set({
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    phoneNumber: phoneNumber, // Store phone number
                    DOB: dob,
                    creditCardNumber: creditCardNumber,
                    creditCardExpiry: creditCardExpiry,
                    creditCardCVC: creditCardCVC,
                    numberOfVisits: numberOfVisits, // Default value of 0
                    registrationDate: registrationDate, // Current date
                    lastVisitedTime: lastVisitedTime, // Initially null
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
    
                console.log('User signed up and data stored successfully in Firestore');
    
                await api.sendOtp({ email });
    
                // Reset fields
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setDob(new Date());
                setPhoneNumber(''); // Reset phone number
                setCreditCardNumber('');
                setCreditCardExpiry('');
                setCreditCardCVC('');
                setConfirmPassword('');
    
                showToast('Your account has been created and OTP has been sent to your email.');
                navigation.navigate('OTP')
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log('That email address is already in use!');
                    showToast('That email address is already in use!')
                } else if (error.code === 'auth/invalid-email') {
                    console.log('That email address is invalid!');
                } else {
                    console.error(error);
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
    }, []);

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || dob;
        setShowDatePicker(Platform.OS === 'ios');
        setDob(currentDate);
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const validateInputs = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        const creditCardNumberRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|7[0-9]{15})$/;
        const phoneRegex = /^(?:\+92|0)?(3[0-9]{2}|2[1-9][0-9]|[1-9][0-9]{1,4})[0-9]{7}$/;
        const creditCardExpiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const creditCardCVCRegex = /^\d{3}$/;

        if (!firstName) {
            showToast('Please enter your first name');
            return false;
        }
        if (!lastName) {
            showToast('Please enter your last name');
            return false;
        }
        if (!email) {
            showToast('Please enter your email address');
            return false;
        } else if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address');
            return false;
        }
        if (!password) {
            showToast('Please enter your password');
            return false;
        } else if (!passwordRegex.test(password)) {
            showToast('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit');
            return false;
        }
        if (password !== confirmPassword) {
            showToast('Passwords do not match');
            return false;
        }
        if (!dob) {
            showToast('Please select your date of birth');
            return false;
        }
        if (!phoneNumber) {
            showToast('Please enter your phone number');
            return false;
        } else if (!phoneRegex.test(phoneNumber)) {
            showToast('Please enter a valid phone number (10 digits)');
            return false;
        }
        
        if (!creditCardNumber) {
            showToast('Please enter your credit card number');
            return false;
        } else if (!creditCardNumberRegex.test(creditCardNumber)) {
            showToast('Please enter a valid credit card number');
            return false;
        }
        if (!creditCardExpiry) {
            showToast('Please enter your credit card expiry date');
            return false;
        } else if (!creditCardExpiryRegex.test(creditCardExpiry)) {
            showToast('Please enter a valid credit card expiry date (MM/YY)');
            return false;
        }
        if (!creditCardCVC) {
            showToast('Please enter your credit card CVC');
            return false;
        } else if (!creditCardCVCRegex.test(creditCardCVC)) {
            showToast('Please enter a valid credit card CVC');
            return false;
        }
        return true;
    };

    const showToast = (text) => {
        Toast.show(text, Toast.LONG);
    };

    const handleCreditCardExpiryConfirm = (date) => {
        setCreditCardExpiry(moment(date).format('MM/YY'));
        setCreditCardExpiryPickerVisible(false);
    };


    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    const Loader = () => (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#114e95" />
        </View>
    );


    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Login')}>
                    <Image source={ImagesPath.arrowBack} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.header}>
                    <Text style={styles.title1}>Register</Text>
                    <Text style={styles.subtitle}>Create Your New Account</Text>
                </View>
                <View style={[styles.inputContainer, { marginTop: keyboardOpen ? '10%' : "10%" }]}>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.firstName} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="black"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.firstName} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="black"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.emailImages} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="black"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
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
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isPasswordVisible}
                        />
                        <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', right: 10, top: 5 }}>
                            <Image
                                source={isPasswordVisible ? ImagesPath.eyeSlashImage : ImagesPath.eyeImage}
                                style={{ width: 25, height: 25, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.passwordImages} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="black"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isConfirmPasswordVisible}
                        />
                        <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={{ position: 'absolute', right: 10, top: 5 }}>
                            <Image
                                source={isConfirmPasswordVisible ? ImagesPath.eyeSlashImage : ImagesPath.eyeImage}
                                style={{ width: 25, height: 25, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.PhoneIcon} style={styles.icon} /> 
                        </View>
                        <TextInput
                            style={styles.input}
                             placeholder="Phone Number"
                            placeholderTextColor="black"
                            value={phoneNumber}
                             onChangeText={setPhoneNumber}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <TouchableOpacity onPress={showDatePickerModal} style={styles.dateInput}>
                            <Text style={styles.dateText}>
                                {dob ? dob.toLocaleDateString() : 'Date of Birth'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={dob}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                            />
                        )}
                    </View>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.creditCardNumber} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Credit Card Number"
                            placeholderTextColor="black"
                            value={creditCardNumber}
                            onChangeText={setCreditCardNumber}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity onPress={() => setCreditCardExpiryPickerVisible(true)} style={styles.dateInput}>
                            <Text style={styles.dateText}>
                                {creditCardExpiry ? creditCardExpiry : 'Credit Card Expiry (MM/YY)'}
                            </Text>
                        </TouchableOpacity>
                        <DateTimePickerModal
                            isVisible={creditCardExpiryPickerVisible}
                            mode="date"
                            onConfirm={handleCreditCardExpiryConfirm}
                            onCancel={() => setCreditCardExpiryPickerVisible(false)}
                            display="spinner"
                            date={dob}
                            minimumDate={new Date()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIcon}>
                            <Image source={ImagesPath.creditCardNumber} style={styles.icon} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Credit Card CVC"
                            placeholderTextColor="black"
                            value={creditCardCVC}
                            onChangeText={setCreditCardCVC}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Next</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'white'
    },
    header: {
        marginTop: 40
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
    image: {
        position: 'absolute',
        resizeMode: 'cover',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
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
    dateInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        justifyContent: 'center',
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    dateText: {
        color: 'black',
    },
    inputContainer: {
        paddingHorizontal: 0,
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
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loader: {
        marginTop: 20,
    },
});

export default SignUp;
