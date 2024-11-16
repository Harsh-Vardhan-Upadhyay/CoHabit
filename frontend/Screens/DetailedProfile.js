import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { db } from "../Firebase"; // Ensure Firebase is properly initialized
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";

const DetailedProfile = ({ navigation }) => {
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
  const [loading, setLoading] = useState(true);

  const { user } = useUser(); // Get the logged-in user
  const userId = user?.id;

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Check if profile is completed, if so, navigate to HomeScreen
          if (data.profileCompleted?.detailedProfileCompleted) {
            navigation.navigate("HomeScreen");
            return;
          }

          // Populate state with the existing data if available
          setLivingSpaceType(data.livingPreferences || []);
          setRoomType(data.roomType || []);
          setSmoking(data.smoking || []);
          setCleaningFrequency(data.cleaningFrequency || []);
          setSleepSchedule(data.sleepSchedule || []);
          setGuestFrequency(data.guestFrequency || []);
          setNoiseTolerance(data.noiseTolerance || []);
          setSocialLevel(data.socialLevel || []);
          setWorkSchedule(data.workSchedule || []);
          setBudgetMin(data.budget?.min || "");
          setBudgetMax(data.budget?.max || "");
          setRoommatePreferences(data.roommatePreferences || []);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, navigation]);

  const savePreferencesToFirebase = async () => {
    // Check if required fields are filled
    if (
      !livingSpaceType.length ||
      !roomType.length ||
      !smoking.length ||
      !cleaningFrequency.length ||
      !sleepSchedule.length ||
      !guestFrequency.length ||
      !noiseTolerance.length ||
      !socialLevel.length ||
      !workSchedule.length ||
      !budgetMin ||
      !budgetMax ||
      !roommatePreferences.length
    ) {
      Alert.alert("Incomplete Profile", "Please fill out all the preferences before saving.");
      return;
    }

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
        profileCompleted: true,
      };

      await setDoc(
        doc(db, "users", userId),
        { profileCompleted: { detailedProfileCompleted: true }, ...preferences },
        { merge: true }
      );

      Alert.alert("Success", "Preferences saved successfully!");
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "There was an issue saving your preferences.");
    }
  };

  const toggleSelection = (selection, setSelection) => {
    setSelection((prevState) =>
      prevState.includes(selection)
        ? prevState.filter((item) => item !== selection)
        : [...prevState, selection]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Roommate Matchmaking Preferences</Text>

        {/* Living Preferences */}
        <Text style={styles.subtitle}>Living Preferences</Text>

        <Text>Living Space Type</Text>
        <View style={styles.optionsContainer}>
          {["Apartment", "House", "Condo", "Shared Room", "Other"].map(
            (space) => (
              <TouchableOpacity
                key={space}
                style={[
                  styles.option,
                  livingSpaceType.includes(space) && styles.selectedOption,
                ]}
                onPress={() => toggleSelection(space, setLivingSpaceType)}
              >
                <Text
                  style={
                    livingSpaceType.includes(space)
                      ? styles.selectedText
                      : styles.unselectedText
                  }
                >
                  {space}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Text>Room Type</Text>
        <View style={styles.optionsContainer}>
          {["Single", "Double", "Master Bedroom", "Shared"].map((room) => (
            <TouchableOpacity
              key={room}
              style={[
                styles.option,
                roomType.includes(room) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(room, setRoomType)}
            >
              <Text
                style={
                  roomType.includes(room)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {room}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Smoking</Text>
        <View style={styles.optionsContainer}>
          {["Yes", "No", "Occasionally"].map((smoke) => (
            <TouchableOpacity
              key={smoke}
              style={[
                styles.option,
                smoking.includes(smoke) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(smoke, setSmoking)}
            >
              <Text
                style={
                  smoking.includes(smoke)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {smoke}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lifestyle & Habits */}
        <Text style={styles.subtitle}>Lifestyle & Habits</Text>

        <Text>Cleaning Frequency</Text>
        <View style={styles.optionsContainer}>
          {["Daily", "Weekly", "Monthly"].map((cleaning) => (
            <TouchableOpacity
              key={cleaning}
              style={[
                styles.option,
                cleaningFrequency.includes(cleaning) &&
                  styles.selectedOption,
              ]}
              onPress={() => toggleSelection(cleaning, setCleaningFrequency)}
            >
              <Text
                style={
                  cleaningFrequency.includes(cleaning)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {cleaning}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Sleep Schedule</Text>
        <View style={styles.optionsContainer}>
          {["Night Owl", "Early Riser", "Flexible"].map((sleep) => (
            <TouchableOpacity
              key={sleep}
              style={[
                styles.option,
                sleepSchedule.includes(sleep) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(sleep, setSleepSchedule)}
            >
              <Text
                style={
                  sleepSchedule.includes(sleep)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {sleep}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Guest Frequency</Text>
        <View style={styles.optionsContainer}>
          {["Occasionally", "Frequently", "Never"].map((guest) => (
            <TouchableOpacity
              key={guest}
              style={[
                styles.option,
                guestFrequency.includes(guest) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(guest, setGuestFrequency)}
            >
              <Text
                style={
                  guestFrequency.includes(guest)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {guest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Noise Tolerance</Text>
        <View style={styles.optionsContainer}>
          {["High", "Medium", "Low"].map((noise) => (
            <TouchableOpacity
              key={noise}
              style={[
                styles.option,
                noiseTolerance.includes(noise) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(noise, setNoiseTolerance)}
            >
              <Text
                style={
                  noiseTolerance.includes(noise)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {noise}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>How Social are you?</Text>
        <View style={styles.optionsContainer}>
          {["Very Social", "Somewhat Social", "Not Social"].map((social) => (
            <TouchableOpacity
              key={social}
              style={[
                styles.option,
                socialLevel.includes(social) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(social, setSocialLevel)}
            >
              <Text
                style={
                  socialLevel.includes(social)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {social}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>Work Schedule</Text>
        <View style={styles.optionsContainer}>
          {["Remote", "On-Site", "Hybrid"].map((work) => (
            <TouchableOpacity
              key={work}
              style={[
                styles.option,
                workSchedule.includes(work) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(work, setWorkSchedule)}
            >
              <Text
                style={
                  workSchedule.includes(work)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {work}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget */}
        <Text style={styles.subtitle}>Budget</Text>
        <TextInput
          placeholder="Minimum Budget"
          value={budgetMin}
          onChangeText={setBudgetMin}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Maximum Budget"
          value={budgetMax}
          onChangeText={setBudgetMax}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Roommate Preferences */}
        <Text style={styles.subtitle}>Roommate Preferences</Text>
        <Text>Roommate Preferences (Choose all that apply)</Text>
        <View style={styles.optionsContainer}>
          {["Male", "Female", "Non-Binary", "Flexible"].map((preference) => (
            <TouchableOpacity
              key={preference}
              style={[
                styles.option,
                roommatePreferences.includes(preference) &&
                  styles.selectedOption,
              ]}
              onPress={() => toggleSelection(preference, setRoommatePreferences)}
            >
              <Text
                style={
                  roommatePreferences.includes(preference)
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                {preference}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePreferencesToFirebase}
        >
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  option: {
    backgroundColor: "#d9d9d9",
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  selectedOption: {
    backgroundColor: "#007bff",
  },
  unselectedText: {
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetailedProfile;
