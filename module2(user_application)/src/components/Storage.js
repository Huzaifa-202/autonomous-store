import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error storing data:', error);
        throw error;
    }
};

const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error retrieving data:', error);
        throw error;
    }
};

export { storeData, getData };
