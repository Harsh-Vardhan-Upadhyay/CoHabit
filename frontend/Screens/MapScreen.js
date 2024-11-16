import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Button, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";

const MapScreen = ({ navigation }) => {
  const [region, setRegion] = useState(null); // For the map's region
  const [markerCoords, setMarkerCoords] = useState(null); // For the draggable marker
  const [errorMsg, setErrorMsg] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }

      // Get the user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Set the initial region for the map
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01, // Zoom level
        longitudeDelta: 0.01,
      });

      // Place the marker at the user's location
      setMarkerCoords({ latitude, longitude });
    })();
  }, []);

  const saveLocation = async () => {
    try {
      if (user && markerCoords) {
        await setDoc(
          doc(db, "users", user.id),
          {
            location: {
              latitude: markerCoords.latitude,
              longitude: markerCoords.longitude,
            },
          },
          { merge: true }
        );
        console.log("Location saved successfully!");
        // Navigate to the next step or provide feedback
        navigation.navigate("Home");
      } else {
        console.log("No user or marker coordinates found.");
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setMarkerCoords(coordinate); // Update marker position to where the user taps
  };

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(region) => setRegion(region)}
        onPress={handleMapPress} // Handle map click to update marker
      >
        {markerCoords && (
          <Marker
            coordinate={markerCoords}
            draggable
            onDragEnd={(e) => setMarkerCoords(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>
      <View style={styles.saveButtonContainer}>
        <Button title="Save Location" onPress={saveLocation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;