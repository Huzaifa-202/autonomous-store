import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LogBox, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Screen/Login';
import SignUp from './src/Screen/SignUp';
import Images from './src/Screen/Images';
import SplashScreen from './src/Screen/SplashScreen';
import ForgotPassword from './src/Screen/ForgotPassword';
import OTP from './src/Screen/OTP';
import Home from './src/Screen/Home';
import ProfileScreen from './src/Screen/ProfileScreen';
import BottomScreen from './src/Screen/BottomScreen';
import FeedBack from './src/Screen/FeedBack';
import Receipt from './src/Screen/Receipt';

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const Tab = createNativeStackNavigator();

function App() {

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="SplashScreen" component={SplashScreen}/>
          <Tab.Screen name="Login" component={Login}/>
          <Tab.Screen name="SignUp" component={SignUp}/>
          <Tab.Screen name="Images" component={Images}/>
          <Tab.Screen name="ForgotPassword" component={ForgotPassword}/>
          <Tab.Screen name="OTP" component={OTP}/>
          <Tab.Screen name="FeedBack" component={FeedBack}/>
          <Tab.Screen name="Receipt" component={Receipt}/>
          <Tab.Screen name="BottomScreen" component={BottomScreen}/>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;