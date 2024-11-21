import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";

const ProfilePictureScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Check for existing profile data on component mount
  useEffect(() => {
    const checkExistingProfileData = async () => {
      try {
        const userDocRef = doc(db, "users", user.id);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profilePicture && userData.additionalPictures && userData.additionalPictures.length > 0) {
            // If profile picture and additional pictures exist, navigate to next screen
            navigation.navigate("DetailedProfile");
          }
        }
      } catch (error) {
        console.error("Error checking existing profile data:", error);
      }
    };

    checkExistingProfileData();
  }, [user, navigation]);

  // Rest of the existing code remains the same as in the previous implementation
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
        setProfileImage(imageUri);
      } else {
        if (additionalImages.length < 3) {
          setAdditionalImages([...additionalImages, imageUri]);
        } else {
          Alert.alert("Limit reached", "You can upload a maximum of 3 additional images.");
        }
      }
    }
  };

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

  const saveProfileData = async () => {
    if (!profileImage || additionalImages.length === 0) {
      Alert.alert("Incomplete", "Please add a profile picture and at least one additional picture.");
      return;
    }

    setIsLoading(true);
    try {
      const profilePicURL = await uploadImageToFirebase(profileImage, `profile_${user.id}.jpg`);

      const additionalPicsURLs = await Promise.all(
        additionalImages.map((imageUri, index) =>
          uploadImageToFirebase(imageUri, `additional_${user.id}_${index + 1}.jpg`)
        )
      );

      await setDoc(
        doc(db, "users", user.id),
        {
          profilePicture: profilePicURL,
          additionalPictures: additionalPicsURLs,
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully!");
      navigation.navigate("DetailedProfile");
    } catch (error) {
      console.error("Error in saveProfileData:", error);
      Alert.alert("Error", "There was an issue saving your profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render method remains the same as in the previous implementation
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Your Photos and Videos</Text>

      <View style={styles.imageGrid}>
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