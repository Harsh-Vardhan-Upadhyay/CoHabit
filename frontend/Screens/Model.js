import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';

const Model = ({ route, navigation }) => {
  const [additionalData, setAdditionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = route.params; // Get the user data passed from HomeScreen

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          setAdditionalData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching additional user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalData();
  }, [user.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profileImage}
        />

        {/* Basic Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.nameText}>
            {user.firstName}, {user.age}
          </Text>
          <Text style={styles.occupationText}>{user.occupation}</Text>
        </View>

        
        {/* Additional Info Sections */}
        <View style={styles.detailsContainer}>
          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{user.introduction}</Text>
          </View>

          {/* {user Preferences} */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>User's Preferences</Text>
            <Text style={styles.sectionText}>{user.livingPreferences}</Text>
            <Text style={styles.sectionText}>{user.roomType}</Text>
            <Text style={styles.sectionText}>{user.sleepSchedule}</Text>
            <Text style={styles.sectionText}>{user.socialLevel}</Text>
          </View>

          {/* Languages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.sectionText}>{user.languages}</Text>
          </View>
          
          {/* Additional Pictures Section */}
          <View style={styles.section}>

            <View style={styles.imageGrid}>
              {additionalData && additionalData.additionalPictures && additionalData.additionalPictures.length > 0 ? (
                additionalData.additionalPictures.map((imageUri, index) => (
                  <View key={index} style={styles.imageSlot}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                  </View>
                ))
              ) : (
                <Text>No additional pictures available.</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute', // Position the back button absolutely within the header
    top: 20, // Adjust as needed to place the button correctly
    left: 20, // Adjust as needed to place the button correctly
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  profileImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
    zIndex: 0,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  occupationText: {
    fontSize: 16,
    color: '#666',
  },
  detailsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageSlot: {
    width: "100%",
    height: 300,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default Model;
