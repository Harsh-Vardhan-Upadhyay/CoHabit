import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, ImageBackground, StyleSheet, Animated } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

const Details = () => {
  const { signOut } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showAgeInput, setShowAgeInput] = useState(false); // State to track if age input should be shown
  const [age, setAge] = useState(''); // State to store age
  const ageAnimation = useRef(new Animated.Value(0)).current; // Animated value for the age input

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const handleProceed = () => {
    setShowAgeInput(true); // Show age input when proceeding
    Animated.spring(ageAnimation, {
      toValue: 1, // Animate to full position
      useNativeDriver: true, // Use native driver for performance
    }).start();
  };

  // Reset animation when age input is hidden
  useEffect(() => {
    if (!showAgeInput) {
      ageAnimation.setValue(0);
    }
  }, [showAgeInput]);

  // Calculate the translation for the age input based on the animated value
  const ageInputStyle = {
    transform: [
      {
        translateX: ageAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0], // Move in from the right
        }),
      },
    ],
  };

  return (
    <ImageBackground
      source={require('/Users/harshvardhanupadhyay/CoHabit/frontend/assets/images/details.png')}
      style={styles.background}
    >
      <View style={styles.container}>
       
        
        {/* Conditionally render name or age input */}
        {!showAgeInput ? (
          <>
            <Text style={styles.label}>Enter Name</Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#ccc"
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#ccc"
            />
            <Button title="Proceed" onPress={handleProceed} />
          </>
        ) : (
          <Animated.View style={[ageInputStyle, styles.ageContainer]}>
            <Text style={styles.label}>Enter Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              placeholderTextColor="#ccc"
              keyboardType="numeric" // Ensure only numbers can be entered
            />
          </Animated.View>
        )}
      </View>
      <Button title="Log Out" onPress={handleLogout} color="#fff" />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end', // Align content to the bottom
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginBottom: 30, // Add margin from the bottom
  },
  description: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  ageContainer: {
    width: '100%', // Make sure the age container takes full width
  },
});

export default Details;