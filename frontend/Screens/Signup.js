import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Text, View, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { useOAuth, useUser } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../hooks/warmupBrowser';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../Firebase'; // Ensure the path is correct

WebBrowser.maybeCompleteAuthSession();

function Signup() {
  useWarmUpBrowser();
  const navigation = useNavigation();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log('User ID:', user.id);
      saveUserToFirestore(user); // Save user to Firestore
      navigation.navigate('Details');
    }
  }, [user, isLoaded, navigation]);

  const saveUserToFirestore = async (user) => {
    try {
      await setDoc(doc(db, 'users', user.id), {
        email: user.email,
        name: user.firstName, // Adjust this according to your user data
        // Add any other user details you want to save
      });
      console.log('User saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [startOAuthFlow]);

  return (
    <ImageBackground
      source={require("/Users/harshvardhanupadhyay/CoHabit/frontend/assets/images/Homescreen.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Add more content here if needed */}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#3A3A3A",
    borderRadius: 14,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "#FFFFFF", // Change this to your desired text color
    fontSize: 17,
    fontWeight:'600' // Optional: adjust font size as needed
  },
});

export default Signup;