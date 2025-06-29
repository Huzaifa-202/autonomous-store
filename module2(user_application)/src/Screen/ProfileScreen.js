import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppFonts } from '../Constant/Fonts/Font';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchCamera } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Toast from 'react-native-simple-toast';

const ProfileScreen = () => {
    const [profile, setProfile] = useState({});
    const [editing, setEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showExpiryPicker, setShowExpiryPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedExpiryDate, setSelectedExpiryDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth().currentUser;
                if (user) {
                    const userDoc = await firestore().collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        console.log("userData=====>>>>>>> ", userData);

                        setProfile(userData);

                        if (userData.DOB) {
                            const date = userData.DOB.toDate();
                            setSelectedDate(date);
                        }

                        if (userData.creditCardExpiry) {
                            const expiryDate = userData.creditCardExpiry.toDate();
                            setSelectedExpiryDate(expiryDate);
                        }
                    } else {
                        console.log('No such document!');
                    }
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const user = auth().currentUser;
            if (user) {
                const updatedData = {
                    ...profile,
                    DOB: selectedDate ? firestore.Timestamp.fromDate(selectedDate) : null, // Convert Date to Firestore Timestamp
                    creditCardExpiry: selectedExpiryDate ? firestore.Timestamp.fromDate(selectedExpiryDate) : null, // Convert Date to Firestore Timestamp
                };

                await firestore().collection('users').doc(user.uid).update(updatedData);
                if (profile.email !== user.email) {
                    await user.updateEmail(profile.email);
                }

                setEditing(false);
                showToast('Profile is updated!')
            }
        } catch (error) {
            console.error("Error updating profile: ", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (text) => {
        Toast.show(text, Toast.LONG);
    };

    const openCamera = () => {
        launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                const source = response.assets[0].uri;
                setProfile({ ...profile, imageUrl: source });
            }
        });
    };

    const handleDateConfirm = (date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    const handleExpiryDateConfirm = (date) => {
        setSelectedExpiryDate(date);
        setShowExpiryPicker(false);
    };


    const handleDeleteProfile = async () => {
        setDeleteLoading(true);
        try {
            const user = auth().currentUser;
            if (user) {
                await firestore().collection('users').doc(user.uid).delete();
                await user.delete();
                navigation.replace('Login')
            }
        } catch (error) {
            console.error("Error deleting profile: ", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const confirmDeleteProfile = () => {
        Alert.alert(
            "Delete Profile",
            "Are you sure you want to delete your profile? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Yes, Delete",
                    onPress: handleDeleteProfile,
                    style: "destructive",
                }
            ]
        );
        
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Image source={ImagesPath.backIcON} style={styles.backImage} />
            </TouchableOpacity> */}

            <TouchableOpacity onPress={editing ? openCamera : () => { }}>
                <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
            </TouchableOpacity>

            <Text style={styles.name}>{profile.firstname} {profile.lastname}</Text>
            <Text style={styles.email}>{profile.email}</Text>

            {editing ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.input}
                        value={profile.firstname}
                        onChangeText={(text) => setProfile({ ...profile, firstname: text })}
                        placeholder="First Name"
                    />
                    <TextInput
                        style={styles.input}
                        value={profile.lastname}
                        onChangeText={(text) => setProfile({ ...profile, lastname: text })}
                        placeholder="Last Name"
                    />
                    <TextInput
                        style={styles.input}
                        value={profile.email}
                        onChangeText={(text) => setProfile({ ...profile, email: text })}
                        placeholder="Email"
                        keyboardType="email-address"
                    />
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text style={styles.datePickerText}>
                            {selectedDate ? `${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}` : 'Select Date of Birth'}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={() => setShowDatePicker(false)}
                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} // Limit to past dates
                    />
                    <TextInput
                        style={styles.input}
                        value={profile.creditCardNumber}
                        onChangeText={(text) => setProfile({ ...profile, creditCardNumber: text })}
                        placeholder="Credit Card Number"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => setShowExpiryPicker(true)} style={styles.input}>
                        <Text style={styles.datePickerText}>
                            {selectedExpiryDate ? `${selectedExpiryDate.getMonth() + 1}/${selectedExpiryDate.getFullYear()}` : 'Select Expiry Date'}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={showExpiryPicker}
                        mode="date"
                        onConfirm={handleExpiryDateConfirm}
                        onCancel={() => setShowExpiryPicker(false)}
                        minimumDate={new Date()}
                    />
                    <TextInput
                        style={styles.input}
                        value={profile.creditCardCVC}
                        onChangeText={(text) => setProfile({ ...profile, creditCardCVC: text })}
                        placeholder="CVC"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.editButton} onPress={handleSave}>
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.editButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteProfile}>
                {deleteLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text style={styles.deleteButtonText}>Delete Profile</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    backImage: {
        width: 30,
        height: 30,
        tintColor: '#007bff',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#E0E0E0',
        marginTop: 100,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 6,
    },
    name: {
        fontSize: 28,
        fontFamily: AppFonts.bold,
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    email: {
        fontSize: 16,
        fontFamily: AppFonts.regular,
        color: '#777',
        marginBottom: 20,
        textAlign: 'center',
    },
    editButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 6,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: AppFonts.medium,
        textAlign: 'center'
    },
    editContainer: {
        marginTop: 20,
        width: '100%',
    },
    input: {
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: AppFonts.regular,
        color: '#333',
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 50,
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 6,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: AppFonts.medium,
        textAlign: 'center',
    },
});

export default ProfileScreen;
