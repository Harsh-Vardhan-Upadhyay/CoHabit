import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { db } from "../Firebase"; // Ensure Firebase is properly initialized
import { doc, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";

const DetailedProfile = ({ navigation }) => {
  // State variables for each category
  const [livingSpaceType, setLivingSpaceType] = useState([]);
  const [roomType, setRoomType] = useState([]);
  const [smoking, setSmoking] = useState([]);
  const [cleaningFrequency, setCleaningFrequency] = useState([]);
  const [sleepSchedule, setSleepSchedule] = useState([]);
  const [guestFrequency, setGuestFrequency] = useState([]);
  const [noiseTolerance, setNoiseTolerance] = useState([]);
  const [socialLevel, setSocialLevel] = useState([]);
  const [workSchedule, setWorkSchedule] = useState([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [roommatePreferences, setRoommatePreferences] = useState([]);

  const { user } = useUser(); // Get the logged-in user
  const userId = user?.id;

  // Function to save user preferences to Firebase Firestore
  const savePreferencesToFirebase = async () => {
    try {
      const preferences = {
        livingPreferences: livingSpaceType,
        roomType,
        smoking,
        cleaningFrequency,
        sleepSchedule,
        guestFrequency,
        noiseTolerance,
        socialLevel,
        workSchedule,
        budget: { min: budgetMin, max: budgetMax },
        roommatePreferences,
      };

      // Save preferences to Firebase
      await setDoc(doc(db, "user_preferences", userId), preferences);
      Alert.alert("Success", "Preferences saved successfully!");

      // Navigate to another screen after saving
      navigation.navigate("HomeScreen"); // Adjust to your navigation flow
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "There was an issue saving your preferences.");
    }
  };

  // Function to handle adding/removing selections
  const toggleSelection = (selection, setSelection) => {
    setSelection(prevState => {
      if (prevState.includes(selection)) {
        return prevState.filter(item => item !== selection);  // Remove from the list
      } else {
        return [...prevState, selection];  // Add to the list
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Roommate Matchmaking Preferences</Text>

        {/* Living Preferences */}
        <Text style={styles.subtitle}>Living Preferences</Text>
        
        <Text>Living Space Type</Text>
        <View style={styles.optionsContainer}>
          {["Apartment", "House", "Condo", "Shared Room", "Other"].map(space => (
            <TouchableOpacity
              key={space}
              style={[styles.option, livingSpaceType.includes(space) && styles.selectedOption]}
              onPress={() => toggleSelection(space, setLivingSpaceType)}
            >
              <Text style={livingSpaceType.includes(space) ? styles.selectedText : styles.unselectedText}>{space}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Room Type</Text>
        <View style={styles.optionsContainer}>
          {["Single", "Double", "Master Bedroom", "Shared"].map(room => (
            <TouchableOpacity
              key={room}
              style={[styles.option, roomType.includes(room) && styles.selectedOption]}
              onPress={() => toggleSelection(room, setRoomType)}
            >
              <Text style={roomType.includes(room) ? styles.selectedText : styles.unselectedText}>{room}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Smoking</Text>
        <View style={styles.optionsContainer}>
          {["Yes", "No", "Occasionally"].map(smoke => (
            <TouchableOpacity
              key={smoke}
              style={[styles.option, smoking.includes(smoke) && styles.selectedOption]}
              onPress={() => toggleSelection(smoke, setSmoking)}
            >
              <Text style={smoking.includes(smoke) ? styles.selectedText : styles.unselectedText}>{smoke}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lifestyle & Habits */}
        <Text style={styles.subtitle}>Lifestyle & Habits</Text>
        
        <Text>Cleaning Frequency</Text>
        <View style={styles.optionsContainer}>
          {["Daily", "Weekly", "Monthly"].map(cleaning => (
            <TouchableOpacity
              key={cleaning}
              style={[styles.option, cleaningFrequency.includes(cleaning) && styles.selectedOption]}
              onPress={() => toggleSelection(cleaning, setCleaningFrequency)}
            >
              <Text style={cleaningFrequency.includes(cleaning) ? styles.selectedText : styles.unselectedText}>{cleaning}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Sleep Schedule</Text>
        <View style={styles.optionsContainer}>
          {["Night Owl", "Early Riser", "Flexible"].map(sleep => (
            <TouchableOpacity
              key={sleep}
              style={[styles.option, sleepSchedule.includes(sleep) && styles.selectedOption]}
              onPress={() => toggleSelection(sleep, setSleepSchedule)}
            >
              <Text style={sleepSchedule.includes(sleep) ? styles.selectedText : styles.unselectedText}>{sleep}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Guest Frequency</Text>
        <View style={styles.optionsContainer}>
          {["Occasionally", "Frequently", "Never"].map(guest => (
            <TouchableOpacity
              key={guest}
              style={[styles.option, guestFrequency.includes(guest) && styles.selectedOption]}
              onPress={() => toggleSelection(guest, setGuestFrequency)}
            >
              <Text style={guestFrequency.includes(guest) ? styles.selectedText : styles.unselectedText}>{guest}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Noise Tolerance</Text>
        <View style={styles.optionsContainer}>
          {["High", "Medium", "Low"].map(noise => (
            <TouchableOpacity
              key={noise}
              style={[styles.option, noiseTolerance.includes(noise) && styles.selectedOption]}
              onPress={() => toggleSelection(noise, setNoiseTolerance)}
            >
              <Text style={noiseTolerance.includes(noise) ? styles.selectedText : styles.unselectedText}>{noise}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>How Social are you?</Text>
        <View style={styles.optionsContainer}>
          {["Very Social", "Somewhat Social", "Not Social"].map(social => (
            <TouchableOpacity
              key={social}
              style={[styles.option, socialLevel.includes(social) && styles.selectedOption]}
              onPress={() => toggleSelection(social, setSocialLevel)}
            >
              <Text style={socialLevel.includes(social) ? styles.selectedText : styles.unselectedText}>{social}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Work Schedule</Text>
        <View style={styles.optionsContainer}>
          {["Full-time", "Part-time", "Flexible"].map(work => (
            <TouchableOpacity
              key={work}
              style={[styles.option, workSchedule.includes(work) && styles.selectedOption]}
              onPress={() => toggleSelection(work, setWorkSchedule)}
            >
              <Text style={workSchedule.includes(work) ? styles.selectedText : styles.unselectedText}>{work}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Roommate Preferences */}
        <Text style={styles.subtitle}>Roommate Preferences</Text>
        <View style={styles.optionsContainer}>
          {["Age 18-25", "Age 25-35", "Male", "Female"].map(pref => (
            <TouchableOpacity
              key={pref}
              style={[styles.option, roommatePreferences.includes(pref) && styles.selectedOption]}
              onPress={() => toggleSelection(pref, setRoommatePreferences)}
            >
              <Text style={roommatePreferences.includes(pref) ? styles.selectedText : styles.unselectedText}>{pref}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget */}
        <Text style={styles.subtitle}>Budget</Text>
        <Text>Min Budget</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Min Budget"
          value={budgetMin}
          onChangeText={setBudgetMin}
        />
        <Text>Max Budget</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Max Budget"
          value={budgetMax}
          onChangeText={setBudgetMax}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={savePreferencesToFirebase}>
          <Text style={styles.buttonText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  option: {
    padding: 10,
    margin: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: "#d0e0ff",
  },
  selectedText: {
    color: "#000",
    fontWeight: "bold",
  },
  unselectedText: {
    color: "#888",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#3A3A3A',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    width: '100%', // Ensures full width
    height: 50, // Fixed height for buttons
    alignItems: 'center',
    justifyContent: "center",
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: "600",
  },
});

export default DetailedProfile;