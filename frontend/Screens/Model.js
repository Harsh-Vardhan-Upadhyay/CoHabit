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

  const normalizePreferences = (preferences) => {
    // If preferences is already an array, return it
    if (Array.isArray(preferences)) return preferences;
    
    // If preferences is a string, split it
    if (typeof preferences === 'string') {
      return preferences
        .split(',')
        .map(pref => pref.trim())
        .filter(pref => pref !== '');
    }
    
    // If preferences is undefined or not a string/array, return an empty array
    return [];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const livingPreferences = normalizePreferences(user.livingPreferences);
  const roomTypes = normalizePreferences(user.roomType);
  const sleepSchedules = normalizePreferences(user.sleepSchedule);
  const socialLevels = normalizePreferences(user.socialLevel);


  
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

          {/* User Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User's Preferences</Text>
          
          {/* Living Preferences */}
          {livingPreferences.length > 0 && (
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceCategoryTitle}>Living Preferences</Text>
              <View style={styles.preferenceBubblesContainer}>
                {livingPreferences.map((pref, index) => (
                  <View key={index} style={styles.preferenceBubble}>
                    <Text style={styles.preferenceBubbleText}>{pref}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Room Types */}
          {roomTypes.length > 0 && (
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceCategoryTitle}>Room Types</Text>
              <View style={styles.preferenceBubblesContainer}>
                {roomTypes.map((type, index) => (
                  <View key={index} style={styles.preferenceBubble}>
                    <Text style={styles.preferenceBubbleText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sleep Schedules */}
          {sleepSchedules.length > 0 && (
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceCategoryTitle}>Sleep Schedules</Text>
              <View style={styles.preferenceBubblesContainer}>
                {sleepSchedules.map((schedule, index) => (
                  <View key={index} style={styles.preferenceBubble}>
                    <Text style={styles.preferenceBubbleText}>{schedule}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Social Levels */}
          {socialLevels.length > 0 && (
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceCategoryTitle}>Social Levels</Text>
              <View style={styles.preferenceBubblesContainer}>
                {socialLevels.map((level, index) => (
                  <View key={index} style={styles.preferenceBubble}>
                    <Text style={styles.preferenceBubbleText}>{level}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
  preferenceBubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10, // Space between bubbles
  },
  preferenceBubble: {
    backgroundColor: '#f0f0f0', // Light grey background
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // Rounded corners to look like bubbles
    marginVertical: 5,
  },
  preferenceBubbleText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
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
  preferenceSection: {
    marginBottom: 15,
  },
  preferenceCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',

  },
  preferenceBubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10, // Space between bubbles
  },
  preferenceBubble: {
    backgroundColor: '#f0f0f0', // Light grey background
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20, // Rounded corners to look like bubbles
    marginVertical: 3,
  },
  preferenceBubbleText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },

});

export default Model;
