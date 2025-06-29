import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { ImagesPath } from '../Constant/ImagesPath/ImagesPath';

const ReceiptScreen = () => {
  const [receiptData, setReceiptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [timestampCheckCounter, setTimestampCheckCounter] = useState(0);
  const currentUser = auth().currentUser;

  const items = {
    'bottle': {
      icon: ImagesPath.BottleIcon,
      price: 50,
      description: 'Refreshing water bottle, perfect for staying hydrated.'
    },
    'apple': {
      icon: ImagesPath.AppleIcon,
      price: 30,
      description: 'Fresh, crisp apple picked from local orchards.'
    },
    'banana': {
      icon: ImagesPath.BananaIcon,
      price: 20,
      description: 'Ripe, sweet banana packed with natural energy.'
    },
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const onValueChange = database()
      .ref('/receipts')
      .orderByKey()
      .on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
          const userReceipt = Object.entries(data).find(([key]) =>
            key === currentUser.uid
          );

          if (userReceipt) {
            setReceiptData(userReceipt[1].items || []);

            // Check timestamp
            const currentTimestamp = userReceipt[1].timestamp;
            if (lastTimestamp !== null && currentTimestamp !== lastTimestamp) {
              setTimestampCheckCounter(prev => prev + 1);
            } else {
              setTimestampCheckCounter(0);
            }
            setLastTimestamp(currentTimestamp);
          } else {
            setReceiptData([]);
          }
        } else {
          setReceiptData([]);
        }
        setLoading(false);
      });

    return () => database().ref('/receipts').off('value', onValueChange);
  }, [currentUser, lastTimestamp]);

  // Check if timestamp hasn't changed for 3 consecutive checks
  useEffect(() => {
    if (timestampCheckCounter >= 3 && receiptData.length > 0) {
      Alert.alert(
        "Purchase Complete",
        `Your total amount is PKR ${calculateTotal()}. Thank you for shopping!`,
        [{ text: "OK", onPress: () => setTimestampCheckCounter(0) }]
      );
    }
  }, [timestampCheckCounter]);

  const calculateTotal = () => {
    return receiptData.reduce((total, item) => {
      return total + (items[item]?.price || 0);
    }, 0);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading receipt...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>Please login to view your receipt.</Text>
        </View>
      </View>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.receiptContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Store Receipt</Text>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>

          <View style={styles.divider} />

          {receiptData.length > 0 ? (
            <>
              <View style={styles.itemsContainer}>
                <View style={styles.columnHeaders}>
                  <Text style={styles.headerText}>Item</Text>
                  <Text style={styles.headerText}>Price</Text>
                </View>

                {Object.values(receiptData).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.itemRow}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={styles.itemInfo}>
                      <Image
                        source={items[item]?.icon}
                        style={styles.icon}
                      />
                      <Text style={styles.itemText}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>PKR {items[item]?.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.totalSection}>
                <View style={styles.finalTotal}>
                  <Text style={styles.totalText}>Total</Text>
                  <Text style={styles.totalAmount}>PKR {calculateTotal()}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Thank you for shopping with us!</Text>
                <Text style={styles.footerSubText}>Store ID: {currentUser.uid.slice(0, 8)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No items in your receipt yet.</Text>
              <Text style={styles.emptyStateSubText}>Items will appear here as you shop.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Item Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedItem}
        onRequestClose={closeItemDetails}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Image
                  source={items[selectedItem]?.icon}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalItemName}>
                  {selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}
                </Text>
                <Text style={styles.modalItemPrice}>PKR {items[selectedItem]?.price}</Text>
                <Text style={styles.modalItemDescription}>
                  {items[selectedItem]?.description}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeItemDetails}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  receiptContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  columnHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalSection: {
    marginTop: 8,
  },
  subtotalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  subtotalAmount: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    marginTop: 4,
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: '#999',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItemPrice: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 15,
  },
  modalItemDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

});

export default ReceiptScreen;