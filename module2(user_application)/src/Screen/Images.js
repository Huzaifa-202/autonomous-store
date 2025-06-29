import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-simple-toast';
import { launchCamera } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { AppFonts } from '../Constant/Fonts/Font';

const Images = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleCameraLaunch = () => {
        if (image) {
            Toast.show('You can only select one image.');
            return;
        }

        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                Toast.show('User cancelled image picker');
            } else if (response.errorMessage) {
                //Toast.show(ImagePicker Error: ${response.errorMessage});
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                if (validateImage(response.assets[0])) {
                    setImage(uri);
                } else {
                    Toast.show('Invalid image. Please take a proper photo.');
                }
            }
        });
    };

    const validateImage = (asset) => {
        const { width, height } = asset;
        return width >= 400 && height >= 400;
    };

    const handleNext = async () => {
        setLoading(true);

        try {
            if (image) {
                const user = auth().currentUser;
                if (user) {
                    const response = await fetch(image);
                    const blob = await response.blob();
                    //const ref = storage().ref(images/${user.uid}/${Date.now()});
                    const ref = storage().ref(`images/${user.uid}`);
                    await ref.put(blob);

                    const imageUrl = await ref.getDownloadURL();
                    await firestore().collection('users').doc(user.uid).update({
                        imageUrl: imageUrl,
                    });

                    Toast.show('Image Successfully Uploaded!', Toast.LONG);
                    navigation.navigate('Login');
                } else {
                    Toast.show('No user is currently signed in.', Toast.LONG);
                }
            } else {
                Toast.show('No image selected.', Toast.LONG);
            }
        } catch (error) {
    console.log('Upload error:', error);
    Toast.show('Image Upload failed. Please try again.', Toast.LONG);
}finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select an image</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.loginButton} onPress={handleCameraLaunch} disabled={!!image}>
                    <Text style={styles.loginButtonText}>Take Photo</Text>
                </TouchableOpacity>
            </View>
            {image && (
                <Image source={{ uri: image }} style={styles.image} />
            )}
            <Text style={styles.imageCount}>Image Selected: {image ? 1 : 0}/1</Text>
            {image && (
            <View style={styles.nextButtonContainer}>
                <TouchableOpacity style={styles.loginButton} onPress={handleNext}>
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.loginButtonText}>Next</Text>
                    )}
                </TouchableOpacity>
            </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
        color: "black",
        fontFamily: AppFonts.regular
    },
    buttonContainer: {
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    imageCount: {
        textAlign: 'center',
        marginTop: 10,
        fontFamily: AppFonts.regular
    },
    nextButtonContainer: {
        marginTop: 20,
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

export default Images;