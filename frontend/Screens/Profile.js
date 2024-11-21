import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../Firebase';
import { Modal } from 'react-native';

const Profile = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [isPreferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const [selectedPreferenceCategory, setSelectedPreferenceCategory] = useState(null);
  
  // Personal Details
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    hometown: '',
    gender: '',
    languages: '',
    occupation: '',
    introduction: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    livingPreferences: [],
    roomType: [],
    smoking: [],
    cleaningFrequency: [],
    sleepSchedule: [],
    guestFrequency: [],
    noiseTolerance: [],
    socialLevel: [],
    workSchedule: [],
    budget: { min: '', max: '' },
    roommatePreferences: []
  });
  const preferenceOptions = {
    livingPreferences: ['Apartment', 'House', 'Condo', 'Shared Room', 'Other'],
    roomType: ['Single', 'Double', 'Master Bedroom', 'Shared'],
    smoking: ['Yes', 'No', 'Occasionally'],
    cleaningFrequency: ['Daily', 'Weekly', 'Monthly'],
    sleepSchedule: ['Night Owl', 'Early Riser', 'Flexible'],
    guestFrequency: ['Occasionally', 'Frequently', 'Never'],
    noiseTolerance: ['High', 'Medium', 'Low'],
    socialLevel: ['Very Social', 'Somewhat Social', 'Not Social'],
    workSchedule: ['Remote', 'On-Site', 'Hybrid'],
    roommatePreferences: ['Male', 'Female', 'Non-Binary', 'Flexible']
  }; const togglePreferenceSelection = (category, item) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  // Render preference selection modal
  const renderPreferencesModal = () => (
    <Modal
      visible={isPreferencesModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Select {selectedPreferenceCategory}
          </Text>
          <View style={styles.optionsContainer}>
            {selectedPreferenceCategory && preferenceOptions[selectedPreferenceCategory].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  preferences[selectedPreferenceCategory]?.includes(option) && styles.selectedOption
                ]}
                onPress={() => togglePreferenceSelection(selectedPreferenceCategory, option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences[selectedPreferenceCategory]?.includes(option) && styles.selectedOptionText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setPreferencesModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (!user?.id) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Set personal details
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          age: data.age ? data.age.toString() : '',
          hometown: data.hometown || '',
          gender: data.gender || '',
          languages: data.languages || '',
          occupation: data.occupation || '',
          introduction: data.introduction || '',
        });

        // Set preferences
        setPreferences({
          livingPreferences: data.livingPreferences || [],
          roomType: data.roomType || [],
          smoking: data.smoking || [],
          cleaningFrequency: data.cleaningFrequency || [],
          sleepSchedule: data.sleepSchedule || [],
          guestFrequency: data.guestFrequency || [],
          noiseTolerance: data.noiseTolerance || [],
          socialLevel: data.socialLevel || [],
          workSchedule: data.workSchedule || [],
          budget: data.budget || { min: '', max: '' },
          roommatePreferences: data.roommatePreferences || []
        });

        // Set images
        setProfileImage(data.profilePicture || null);
        setAdditionalImages(data.additionalPictures || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type, index = null) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Permission to access gallery is needed.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      if (type === "profile") {
        setProfileImage(imageUri);
      } else if (type === "additional" && index !== null) {
        const newAdditionalImages = [...additionalImages];
        newAdditionalImages[index] = imageUri;
        setAdditionalImages(newAdditionalImages);
      }
    }
  };

  const uploadImageToFirebase = async (uri, name) => {
    if (!uri) return null;
    if (uri.startsWith('https://')) return uri; // Skip if it's already a URL

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profile_pictures/${user.id}/${name}`);
      await uploadBytes(storageRef, blob);

      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Upload images first
      const profilePicURL = await uploadImageToFirebase(
        profileImage,
        `profile_${user.id}.jpg`
      );

      const additionalPicsURLs = await Promise.all(
        additionalImages.map((uri, index) =>
          uri ? uploadImageToFirebase(uri, `additional_${user.id}_${index + 1}.jpg`) : null
        )
      ).then(urls => urls.filter(url => url !== null));

      // Update all user data
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        ...userData,
        age: parseInt(userData.age, 10),
        ...preferences,
        profilePicture: profilePicURL,
        additionalPictures: additionalPicsURLs,
      });

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderPhotoSection = () => (
    <View style={styles.photoSection}>
      {/* Background Image */}
      <Image 
        source={require("../assets/images/Switch.png")} // Replace with your actual gradient image
        style={styles.backgroundImage}
      />
      
      {/* Profile Content */}
      <View style={styles.profileContent}>
        {/* Profile Picture */}
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={() => editing && pickImage('profile')}
          disabled={!editing}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>+</Text>
            </View>
          )}
        </TouchableOpacity>
  
        {/* Name and Occupation */}
        <Text style={styles.profileName}>
          {`${userData.firstName} ${userData.lastName}`}
        </Text>
        <Text style={styles.profileOccupation}>
          {userData.occupation || 'Add Occupation'}
        </Text>
      </View>
  
      {/* Additional Pictures */}
      <View style={styles.additionalPhotosContainer}>
        {[0, 1, 2].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.additionalImageContainer}
            onPress={() => editing && pickImage('additional', index)}
            disabled={!editing}
          >
            {additionalImages[index] ? (
              <Image 
                source={{ uri: additionalImages[index] }} 
                style={styles.additionalImage} 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPreferenceList = (title, category, items) => (
    <View style={styles.preferenceSection}>
      <View style={styles.preferenceHeaderContainer}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        {editing && (
          <TouchableOpacity
            onPress={() => {
              setSelectedPreferenceCategory(category);
              setPreferencesModalVisible(true);
            }}
          >
            <Text style={styles.editPreferencesText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.preferenceList}>
        {items.map((item, index) => (
          <Text key={index} style={styles.preferenceItem}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editing ? handleSave() : setEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {editing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photos Section */}
        {renderPhotoSection()}

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabledInput]}
              value={`${userData.firstName} ${userData.lastName}`}
              onChangeText={(text) => {
                const [first, ...rest] = text.split(' ');
                setUserData(prev => ({
                  ...prev,
                  firstName: first,
                  lastName: rest.join(' ')
                }));
              }}
              editable={editing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabledInput]}
              value={userData.age}
              onChangeText={(text) => setUserData(prev => ({ ...prev, age: text }))}
              keyboardType="numeric"
              editable={editing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hometown</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabledInput]}
              value={userData.hometown}
              onChangeText={(text) => setUserData(prev => ({ ...prev, hometown: text }))}
              editable={editing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Introduction</Text>
            <TextInput
              style={[styles.textArea, !editing && styles.disabledInput]}
              value={userData.introduction}
              onChangeText={(text) => setUserData(prev => ({ ...prev, introduction: text }))}
              multiline
              numberOfLines={4}
              editable={editing}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Living Preferences</Text>
  {renderPreferenceList('Living Space', 'livingPreferences', preferences.livingPreferences)}
  {renderPreferenceList('Room Type', 'roomType', preferences.roomType)}
  {renderPreferenceList('Smoking', 'smoking', preferences.smoking)}
  
          
          <View style={styles.budgetSection}>
            <Text style={styles.preferenceTitle}>Budget Range</Text>
            <Text style={styles.budgetText}>
              ${preferences.budget.min} - ${preferences.budget.max}
            </Text>
          </View>
        </View>

        {/* Lifestyle Section */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Lifestyle</Text>
  {renderPreferenceList('Cleaning Frequency', 'cleaningFrequency', preferences.cleaningFrequency)}
  {renderPreferenceList('Sleep Schedule', 'sleepSchedule', preferences.sleepSchedule)}
  {renderPreferenceList('Guest Frequency', 'guestFrequency', preferences.guestFrequency)}
  {renderPreferenceList('Noise Tolerance', 'noiseTolerance', preferences.noiseTolerance)}
  {renderPreferenceList('Social Level', 'socialLevel', preferences.socialLevel)}
  {renderPreferenceList('Work Schedule', 'workSchedule', preferences.workSchedule)}
</View>

        
      </ScrollView>

      {renderPreferencesModal()}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',

  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  option: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedOption: {
    backgroundColor: '#3A3A3A',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  modalCloseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  preferenceHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editPreferencesText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    width: '45%',
  },
  budgetDivider: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',

    zIndex: 1
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600'
  },

  // Photo Section Styles
  photoSection: {
    height: 350,
    width: '100%',
    position: 'relative',
    marginBottom: 100,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 169,
    width: '100%',
    borderRadius:20,
    paddingHorizontal:18,
    

  },
  profileContent: {
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 2,
    marginBottom:-10,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
    backgroundColor: '#fff',
    marginTop:50,
  },
  profileImage: {
    width: '100%',
    height: '100%'
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 1,
    textAlign: 'center'
  },
  profileOccupation: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center'
  },
  additionalPhotosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 20,
    
  },
  additionalImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  additionalImage: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed'
  },
  placeholderText: {
    fontSize: 24,
    color: '#999'
  },

  // Section Styles
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop:15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top'
  },

  // Preference Styles
  preferenceSection: {
    marginBottom: 16
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  preferenceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  preferenceItem: {
    backgroundColor: '#e1e1e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden'
  },
  budgetSection: {
    marginTop: 16
  },
  budgetText: {
    fontSize: 16,
    color: '#666'
  }
});

export default Profile;