import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../Firebase";
import { doc, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";

const ProfilePictureScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null); // Store profile image
  const [additionalImages, setAdditionalImages] = useState([]); // Store up to 3 additional images
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { user } = useUser();

  // Function to pick an image from the gallery
  const pickImage = async (type) => {
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
        setProfileImage(imageUri); // Set profile picture
      } else {
        if (additionalImages.length < 3) {
          setAdditionalImages([...additionalImages, imageUri]); // Add to additional images
        } else {
          Alert.alert("Limit reached", "You can upload a maximum of 3 additional images.");
        }
      }
    }
  };

  // Function to upload an image to Firebase Storage
  const uploadImageToFirebase = async (uri, name) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profile_pictures/${user.id}/${name}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error in uploadImageToFirebase:", error);
      throw error;
    }
  };

  // Function to save profile data
  const saveProfileData = async () => {
    if (!profileImage || additionalImages.length === 0) {
      Alert.alert("Incomplete", "Please add a profile picture and at least one additional picture.");
      return;
    }

    setIsLoading(true); // Start loading
    try {
      // Upload profile image
      const profilePicURL = await uploadImageToFirebase(profileImage, `profile_${user.id}.jpg`);

      // Upload additional images
      const additionalPicsURLs = await Promise.all(
        additionalImages.map((imageUri, index) =>
          uploadImageToFirebase(imageUri, `additional_${user.id}_${index + 1}.jpg`)
        )
      );

      // Save data to Firestore
      await setDoc(
        doc(db, "users", user.id),
        {
          profilePicture: profilePicURL,
          additionalPictures: additionalPicsURLs,
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully!");
      
      // Navigate to the DetailedProfile screen
      navigation.navigate("DetailedProfile");
    } catch (error) {
      console.error("Error in saveProfileData:", error);
      Alert.alert("Error", "There was an issue saving your profile data.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Your Photos and Videos</Text>

      {/* Grid for Images */}
      <View style={styles.imageGrid}>
        {/* Profile Picture Slot */}
        <TouchableOpacity
          style={[styles.imageSlot, !profileImage && styles.imageSlotEmpty]}
          onPress={() => pickImage("profile")}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.image} />
          ) : (
            <Text style={styles.addIcon}>+</Text>
          )}
        </TouchableOpacity>

        {/* Additional Pictures Slots */}
        {additionalImages.concat([null, null, null]).slice(0, 3).map((imageUri, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.imageSlot, !imageUri && styles.imageSlotEmpty]}
            onPress={() => pickImage("additional")}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.addIcon}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Proceed Button */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.proceedButton} onPress={saveProfileData}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  imageSlot: {
    width: 142,
    height: 142,
    margin: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  imageSlotEmpty: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  addIcon: {
    fontSize: 30,
    color: "#aaa",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  proceedButton: {
    backgroundColor: '#3A3A3A',
    borderRadius: 14,
    padding: 10,
    width: '90%', // Adjust width to fit well on screen
    height: 50, // Fixed height for buttons
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Make it float
    bottom: 40, // Distance from the bottom of the screen
},
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: "600",
  },
});

export default ProfilePictureScreen;