import { useNavigation } from '@react-navigation/native';
import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Text, View, ImageBackground, StyleSheet, Button } from 'react-native';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../hooks/warmupBrowser';

WebBrowser.maybeCompleteAuthSession();

function Signup() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const navigation = useNavigation();

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
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
          <Button title='Sign in with Google' onPress={onPress} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensure the image covers the entire background
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Distribute space evenly
    alignItems: 'center', // Center content horizontally
    padding: 20, // Optional padding
  },
  content: {
    flex: 1, // Allow this section to grow and take available space
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  buttonContainer: {
    marginBottom: 20, // Space from the bottom
    width: '100%', // Button takes full width
    backgroundColor:"black",
  },
});

export default Signup;