import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Image, StyleSheet, Text, Platform } from 'react-native';
import Home from './Home';
import ProfileScreen from './ProfileScreen';
import FeedBack from './FeedBack';
import Receipt from './Receipt';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const TabIcon = ({ source, focused, label }) => (
    <View style={styles.tabIconContainer}>
        <View style={[
            styles.iconWrapper,
            focused && styles.iconWrapperActive
        ]}>
            <Image
                source={source}
                style={[
                    styles.icon,
                    focused && styles.iconActive
                ]}
            />
        </View>
        <Text style={[
            styles.tabLabel,
            focused && styles.tabLabelActive
        ]}>
            {label}
        </Text>
    </View>
);

const BottomScreen = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: 60 + insets.bottom,
                        paddingBottom: insets.bottom,
                    }
                ],
                tabBarItemStyle: styles.tabBarItem,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            source={focused ? ImagesPath.homeWhiteImage : ImagesPath.homeBlackImage}
                            focused={focused}
                            label="Home"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            source={focused ? ImagesPath.Profile : ImagesPath.profileBlack}
                            focused={focused}
                            label="Profile"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="FeedBack"
                component={FeedBack}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            source={focused ? ImagesPath.feedbackBlack : ImagesPath.feedbackWhite}
                            focused={focused}
                            label="Feedback"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Receipt"
                component={Receipt}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            source={focused ? ImagesPath.feedbackBlack : ImagesPath.feedbackWhite}
                            focused={focused}
                            label="Receipt"
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#ffffff',
        borderTopColor: '#f0f0f0',
        borderTopWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: -4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    tabBarItem: {
        paddingVertical: 8,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    iconWrapperActive: {
        backgroundColor: 'rgba(0, 128, 255, 0.1)',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#666',
    },
    iconActive: {
        tintColor: '#0080FF',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginTop: 2,
    },
    tabLabelActive: {
        color: '#0080FF',
        fontWeight: '600',
    },
});

export default BottomScreen;