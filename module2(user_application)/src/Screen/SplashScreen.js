import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';
import { AppFonts } from '../Constant/Fonts/Font';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(1));

    const slides = [
        {
            image: ImagesPath.SplashScreen,
            heading: 'Welcome to Autonomous Store',
            paragraph: 'Experience the future of retail with our check-out free shopping experience.'
        },
        {
            image: ImagesPath.supermarket2,
            heading: 'Seamless Shopping',
            paragraph: 'Enjoy smart store operations, from inventory management to customer behavior analysis.'
        },
        {
            image: ImagesPath.manSuperMarket,
            heading: 'Get Started',
            paragraph: 'Join us in redefining retail with enhanced efficiency and customer satisfaction.'
        }
    ];

    const handleNext = async () => {
        if (step < 2) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();

            setTimeout(() => {
                setStep(step + 1);
            }, 200);
        } else {
            // Always navigate to Login screen after the last splash slide
            navigation.replace('Login');
        }
    };

    const renderProgressDots = () => {
        return [0, 1, 2].map((index) => (
            <View
                key={index}
                style={[
                    styles.progressDot,
                    {
                        width: step === index ? 24 : 8,
                        backgroundColor: step >= index ? '#114e95' : '#E0E0E0'
                    }
                ]}
            />
        ));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="white"
            />
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.imageContainer}>
                    <Image
                        source={slides[step].image}
                        style={styles.image}
                    />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.heading}>
                            {slides[step].heading}
                        </Text>
                        <Text style={styles.paragraph}>
                            {slides[step].paragraph}
                        </Text>
                    </View>

                    <View style={styles.bottomContainer}>
                        <View style={styles.progressContainer}>
                            {renderProgressDots()}
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleNext}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {step < 2 ? 'Next' : 'Get Started'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
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
    imageContainer: {
        height: height * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width * 0.8,
        height: height * 0.4,
        resizeMode: 'contain',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    },
    textContainer: {
        alignItems: 'center',
        paddingTop: 32,
    },
    heading: {
        fontSize: 28,
        color: '#114e95',
        fontFamily: AppFonts.bold,
        textAlign: 'center',
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 16,
        color: '#666',
        fontFamily: AppFonts.regular,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 24,
    },
    bottomContainer: {
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    progressDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        transition: 'all 0.3s ease',
    },
    button: {
        backgroundColor: '#114e95',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#114e95',
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: AppFonts.bold,
    },
});

export default SplashScreen;
