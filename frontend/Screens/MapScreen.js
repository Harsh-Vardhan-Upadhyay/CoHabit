import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { getDistance } from "geolib";

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
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Select Preferred Region</Text>
        <Text style={styles.subtitle}>
          Please select the preferred location{"\n"}where you're looking to find a{"\n"}roommate.
        </Text>
        <TouchableOpacity style={styles.button} onPress={saveLocation}>
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    height: 239,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius:18,
    marginHorizontal: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    }
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
