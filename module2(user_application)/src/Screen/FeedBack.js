import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import Toast from 'react-native-simple-toast';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const FeedbackScreen = ({ navigation }) => {
  const [shoppingExperience, setShoppingExperience] = useState(null);
  const [checkoutEfficiency, setCheckoutEfficiency] = useState(null);
  const [productFinding, setProductFinding] = useState(null);
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  const ratingOptions = [
    { label: 'Very Satisfied', value: 5, color: '#00A86B', baseColor: 'rgba(0, 168, 107, 0.1)' },
    { label: 'Satisfied', value: 4, color: '#2ECC40', baseColor: 'rgba(46, 204, 64, 0.1)' },
    { label: 'Neutral', value: 3, color: '#FFDC00', baseColor: 'rgba(255, 220, 0, 0.1)'},
    { label: 'Dissatisfied', value: 2, color: '#FF851B', baseColor: 'rgba(255, 133, 27, 0.1)' },
    { label: 'Very Dissatisfied', value: 1, color: '#FF4136', baseColor: 'rgba(255, 65, 54, 0.1)'}
  ];

  const renderRatingButtons = (category, currentValue, onValueChange) => (
    <View style={styles.ratingContainer}>
      {ratingOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.ratingButton,
            { 
              backgroundColor: currentValue === option.value 
                ? option.color 
                : option.baseColor
            },
            currentValue === option.value && styles.selectedRatingButton
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text style={styles.ratingEmoji}>{option.icon}</Text>
          <Text 
            style={[
              styles.ratingButtonText,
              { 
                color: currentValue === option.value 
                  ? 'white' 
                  : option.color
              }
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const resetFeedbackStates = () => {
    setShoppingExperience(null);
    setCheckoutEfficiency(null);
    setProductFinding(null);
    setAdditionalFeedback('');
  };

  const handleFeedbackSubmit = async () => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      Alert.alert('Authentication Error', 'Please log in to submit feedback');
      return;
    }

    if (!shoppingExperience || !checkoutEfficiency || !productFinding) {
      Toast.show('Please rate all categories', Toast.LONG);
      return;
    }

    const trimmedFeedback = additionalFeedback.trim();
    if (trimmedFeedback.split(/\s+/).length > 100) {
      Toast.show('Additional feedback must be within 100 words', Toast.LONG);
      return;
    }

    try {
      await firestore().collection('app_feedback').add({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Anonymous',
        userEmail: currentUser.email,
        shoppingExperience: {
          rating: shoppingExperience,
          ratingLabel: ratingOptions.find(r => r.value === shoppingExperience)?.label
        },
        checkoutEfficiency: {
          rating: checkoutEfficiency,
          ratingLabel: ratingOptions.find(r => r.value === checkoutEfficiency)?.label
        },
        productFinding: {
          rating: productFinding,
          ratingLabel: ratingOptions.find(r => r.value === productFinding)?.label
        },
        additionalFeedback: trimmedFeedback,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      resetFeedbackStates();
      Toast.show('Thank you for your feedback!', Toast.LONG);
      navigation.goBack();
    } catch (error) {
      console.error('Feedback submission error:', error);
      Toast.show('Failed to submit feedback. Please try again.', Toast.LONG);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Store Feedback</Text>
          <Text style={styles.headerSubtitle}>Help us improve your shopping experience</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.categoryTitle}>
            Shopping Experience
          </Text>
          <Text style={styles.categoryDescription}>
            How satisfied are you with the seamless shopping experience?
          </Text>
          {renderRatingButtons(
            'Shopping Experience', 
            shoppingExperience, 
            setShoppingExperience
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.categoryTitle}>
            Checkout Process
          </Text>
          <Text style={styles.categoryDescription}>
            Rate the efficiency of our checkout process
          </Text>
          {renderRatingButtons(
            'Checkout Efficiency', 
            checkoutEfficiency, 
            setCheckoutEfficiency
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.categoryTitle}>
            Product Navigation
          </Text>
          <Text style={styles.categoryDescription}>
            How easy was it to find products in our store?
          </Text>
          {renderRatingButtons(
            'Product Finding', 
            productFinding, 
            setProductFinding
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.categoryTitle}>
            Additional Thoughts
          </Text>
          <TextInput
            style={styles.additionalFeedbackInput}
            placeholder="Share any suggestions or comments (optional, max 100 words)"
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            value={additionalFeedback}
            onChangeText={setAdditionalFeedback}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleFeedbackSubmit}
        >
          <Text style={styles.submitButtonText}>
            Submit Feedback
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  ratingContainer: {
    marginTop: 8,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedRatingButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  additionalFeedbackInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 18,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;