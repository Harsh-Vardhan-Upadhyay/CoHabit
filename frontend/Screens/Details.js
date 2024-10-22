import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ImageBackground, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';

const Details = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  
  // State variables for user input
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [hometown, setHometown] = useState('');
  const [gender, setGender] = useState('');
  const [languages, setLanguages] = useState('');
  const [occupation, setOccupation] = useState('');
  const [introduction, setIntroduction] = useState('');
  
  // Track which step of input the user is on
  const [currentStep, setCurrentStep] = useState(0);
  
  // For animation
  const ageAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setAge(userData.age ? userData.age.toString() : '');
          setHometown(userData.hometown || '');
          setGender(userData.gender || '');
          setLanguages(userData.languages || '');
          setOccupation(userData.occupation || '');
          setIntroduction(userData.introduction || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const handleNextStep = async () => {
    // Save the current step's data to Firestore
    try {
      if (user && user.id) {
        const dataToSave = {};
        if (currentStep === 0) {
          dataToSave.firstName = firstName;
          dataToSave.lastName = lastName;
        } else if (currentStep === 1) {
          dataToSave.age = parseInt(age, 10);
        } else if (currentStep === 2) {
          dataToSave.hometown = hometown;
        } else if (currentStep === 3) {
          dataToSave.gender = gender;
        } else if (currentStep === 4) {
          dataToSave.languages = languages;
        } else if (currentStep === 5) {
          dataToSave.occupation = occupation;
        } else if (currentStep === 6) {
          dataToSave.introduction = introduction;
        }

        await setDoc(doc(db, 'users', user.id), dataToSave, { merge: true });

        if (currentStep < 6) {
          setCurrentStep(currentStep + 1);
        } else {
          console.log('All data saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving user information:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('/Users/harshvardhanupadhyay/CoHabit/frontend/assets/images/details.png')}
          style={styles.background}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Step {currentStep + 1}</Text>
            {currentStep === 0 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#ccc"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#ccc"
                />
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Proceed</Text>
                </TouchableOpacity>
              </>
            )}
            {currentStep === 1 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholderTextColor="#ccc"
                />
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Save Age</Text>
                </TouchableOpacity>
              </>
            )}
            {currentStep === 2 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Hometown"
                  value={hometown}
                  onChangeText={setHometown}
                  placeholderTextColor="#ccc"
                />
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}
            {currentStep === 3 && (
              <>
                <Text style={styles.genderTitle}>Select Gender:</Text>
                <TouchableOpacity onPress={() => setGender('Male')}>
                  <Text style={styles.genderOption}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setGender('Female')}>
                  <Text style={styles.genderOption}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setGender('Other')}>
                  <Text style={styles.genderOption}>Other</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}
            {currentStep === 4 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Languages Known"
                  value={languages}
                  onChangeText={setLanguages}
                  placeholderTextColor="#ccc"
                />
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}
            {currentStep === 5 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Occupation"
                  value={occupation}
                  onChangeText={setOccupation}
                  placeholderTextColor="#ccc"
                />
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}
            {currentStep === 6 && (
              <>
                <TextInput
                  style={[styles.input, { height: 100 }]} // Increased height for introduction
                  placeholder="Small Introduction About You"
                  value={introduction}
                  onChangeText={setIntroduction}
                  placeholderTextColor="#ccc"
                  multiline
                  textAlignVertical="top" // Aligns text at the top for multiline
                />
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <Text style={styles.buttonText}>Finish</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    width: 375,
    height: 312,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 5,
  },
  title: {
    fontSize: 17,
    color: 'black',
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  input: {
    height: 50, // Fixed height for input fields
    width: '100%', // Ensures full width
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  ageContainer: {
    marginTop: 20,
    width: '100%', // Ensures full width for the container
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

export default Details;