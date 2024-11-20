import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase"; 
import { useUser } from "@clerk/clerk-expo";

const DetailedProfile = ({ navigation }) => {
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
    roommatePreferences: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { user } = useUser(); 
  const userId = user?.id;

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (!userId) return;

        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Check if profile is completed
          if (data.profileCompleted?.detailedProfileCompleted) {
            navigation.navigate("HomeScreen");
            return;
          }

          // Map existing data to preferences state
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
            budget: { 
              min: data.budget?.min || '', 
              max: data.budget?.max || '' 
            },
            roommatePreferences: data.roommatePreferences || [],
          });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, navigation]);

  const handleSave = async () => {
    // Validation checks
    const requiredFields = [
      'livingPreferences', 'roomType', 'smoking', 'cleaningFrequency', 
      'sleepSchedule', 'guestFrequency', 'noiseTolerance', 
      'socialLevel', 'workSchedule', 'roommatePreferences'
    ];

    const isValid = requiredFields.every(field => preferences[field].length > 0) 
      && preferences.budget.min 
      && preferences.budget.max;

    if (!isValid) {
      Alert.alert("Incomplete Profile", "Please fill out all preferences before saving.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", userId),
        { 
          ...preferences, 
          profileCompleted: { detailedProfileCompleted: true } 
        },
        { merge: true }
      );
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert("Error", "There was an issue saving your preferences.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (category, item) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item],
    }));
  };

  const renderOptions = (category, options) => (
    <View style={styles.optionsContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            preferences[category].includes(option) && styles.selectedOption,
          ]}
          onPress={() => toggleSelection(category, option)}
        >
          <Text
            style={[
              styles.optionText,
              preferences[category].includes(option) && styles.selectedOptionText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Tell Us About You</Text>
        
        <Animated.View entering={FadeInUp.duration(500).delay(100)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Living Preferences</Text>
            <Text style={styles.label}>Living Space Type</Text>
            {renderOptions('livingPreferences', ['Apartment', 'House', 'Condo', 'Shared Room', 'Other'])}
            
            <Text style={styles.label}>Room Type</Text>
            {renderOptions('roomType', ['Single', 'Double', 'Master Bedroom', 'Shared'])}
            
            <Text style={styles.label}>Smoking</Text>
            {renderOptions('smoking', ['Yes', 'No', 'Occasionally'])}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Lifestyle & Habits</Text>
            <Text style={styles.label}>Cleaning Frequency</Text>
            {renderOptions('cleaningFrequency', ['Daily', 'Weekly', 'Monthly'])}
            
            <Text style={styles.label}>Sleep Schedule</Text>
            {renderOptions('sleepSchedule', ['Night Owl', 'Early Riser', 'Flexible'])}
            
            <Text style={styles.label}>Guest Frequency</Text>
            {renderOptions('guestFrequency', ['Occasionally', 'Frequently', 'Never'])}
            
            <Text style={styles.label}>Noise Tolerance</Text>
            {renderOptions('noiseTolerance', ['High', 'Medium', 'Low'])}
            
            <Text style={styles.label}>Social Level</Text>
            {renderOptions('socialLevel', ['Very Social', 'Somewhat Social', 'Not Social'])}
            
            <Text style={styles.label}>Work Schedule</Text>
            {renderOptions('workSchedule', ['Remote', 'On-Site', 'Hybrid'])}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(300)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.budgetContainer}>
              <View style={styles.budgetInput}>
                <Text style={styles.label}>Minimum</Text>
                <TextInput
                  style={styles.input}
                  value={preferences.budget.min}
                  onChangeText={(value) => setPreferences(prev => ({ ...prev, budget: { ...prev.budget, min: value } }))}
                  placeholder="Min Budget"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetInput}>
                <Text style={styles.label}>Maximum</Text>
                <TextInput
                  style={styles.input}
                  value={preferences.budget.max}
                  onChangeText={(value) => setPreferences(prev => ({ ...prev, budget: { ...prev.budget, max: value } }))}
                  placeholder="Max Budget"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(400)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Roommate Preferences</Text>
            <Text style={styles.label}>Preferred Roommate</Text>
            {renderOptions('roommatePreferences', ['Male', 'Female', 'Non-Binary', 'Flexible'])}
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  option: {
    backgroundColor: '#F0F0F0',
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
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetInput: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3A3A3A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%', // Adjust width to fit well on screen
    height: 50,
    marginTop: 20,
    marginBottom: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: "600",
  },
});

export default DetailedProfile;