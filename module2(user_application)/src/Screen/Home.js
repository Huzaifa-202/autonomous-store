import React, { useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { AppFonts } from '../Constant/Fonts/Font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation }) => {
    const currentUser = auth().currentUser;

    const handleLogout = async () => {
        try {
            await auth().signOut();
            await AsyncStorage.setItem('isLoggedIn', 'false');
            showToast('Logged out successfully');
            navigation.navigate('Login');
        } catch (error) {
            console.error("Error logging out: ", error);
            showToast('Logout failed. Please try again.');
        }
    };

    const showToast = (text) => {
        Toast.show(text, Toast.LONG);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar 
                barStyle="dark-content" 
                backgroundColor="white"
            />
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Welcome</Text>
                        <Text style={styles.userEmail}>
                            {currentUser?.email ? currentUser.email.split('@')[0] : 'Guest'}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        <Image 
                            source={ImagesPath.logoutIcon} 
                            style={styles.logoutIcon}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={ImagesPath.HomeScreenLogo} 
                            style={styles.logo}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: 'white',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    welcomeContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 28,
        fontFamily: AppFonts.bold,
        color: '#114e95',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        fontFamily: AppFonts.regular,
        color: '#666',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
    },
    logoutIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: '#114e95',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 32,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: width * 0.8,
        height: height * 0.4,
        resizeMode: 'contain',
    },
});

export default Home;