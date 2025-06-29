import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getData, storeData } from '../components/Storage';
const BASE_URL = "https://backhand-fbi.vercel.app"
// const BASE_URL="https://fbi-backhand.vercel.app"

const apiService = axios.create({
    baseURL: BASE_URL,
});

const storeAndSetLoggedIn = async (data) => {
    await storeData('userData', data);
};

const api = {
    login: async (userData) => {
        try {
            const response = await apiService.post('/api/login', userData);
            await storeAndSetLoggedIn(response.data);
            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },
    signup: async (userData) => {
        try {
            const response = await apiService.post('/api/signup', userData);
            await storeAndSetLoggedIn(response.data);
            return response.data;
        } catch (error) {
            console.error('Error during signup:', error);
            throw error;
        }
    },
    verifyOtp: async (userData) => {
        try {
            const response = await apiService.post('/verify-otp', userData);
            return response.data
        } catch (error) {
            console.error('Error during verifyOtp:', error);
            throw error;
        }
    },
    sendOtp: async (userData) => {
        try {
            const response = await apiService.post('/send-otp', userData);
            await storeData('userToken', response.data);
            return response.data
        } catch (error) {
            console.error('Error during verifyOtp:', error); // This should be 'Error during sendOtp:'
            throw error;
        }
    },
    resetPassword: async (userData) => {
        try {
            const response = await apiService.post('/api/reset-password', userData);
            return response.data
        } catch (error) {
            console.error('Error during resetPassword:', error);
            throw error;
        }
    },
    uploadImage: async (images) => {
        try {
            if (!Array.isArray(images)) {
                throw new Error('The images parameter should be an array.');
            }

            const data = await AsyncStorage.getItem('userData');
            const userData = JSON.parse(data);

            if (!userData || !userData.user || !userData.user.id) {
                throw new Error('User data not found');
            }

            const userId = userData.user.id;

            const formData = new FormData();
            formData.append('userId', userId);

            images.forEach((uri, index) => {
                const image = {
                    uri: uri,
                    type: 'image/jpeg',
                    name: `image${index}.jpg`,
                };
                formData.append('images', image);
            });

            console.log('FormData:', formData);

            const response = await apiService.post('/api/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error during image upload:', error);
            throw error;
        }
    },
    signGoogle: async (idToken) => {
        try {
            const response = await apiService.get('/api/auth/google', {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            await storeAndSetLoggedIn(response.data);
            return response.data;
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            throw error;
        }
    },

};

export default api;
