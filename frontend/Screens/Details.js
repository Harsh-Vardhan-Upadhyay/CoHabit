import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ImageBackground, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ActivityIndicator 
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';

const Details = ({ navigation }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // User details states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [hometown, setHometown] = useState('');
  const [gender, setGender] = useState('');
  const [languages, setLanguages] = useState('');
  const [occupation, setOccupation] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);

  const prompts = [
    "Enter Name",
    "Enter Your Age and Hometown",
    "Select Your Gender",
    "Enter Known Languages and Occupation",
    "Write a Short Introduction",
  ];

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setAge(data.age ? data.age.toString() : '');
        setHometown(data.hometown || '');
        setGender(data.gender || '');
        setLanguages(data.languages || '');
        setOccupation(data.occupation || '');
        setIntroduction(data.introduction || '');
        setProfileCompleted(data.profileCompleted || false);

        // Redirect to the next step or DetailedProfile if already completed
        if (data.profileCompleted) {
          navigation.navigate('MapScreen');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const saveUserData = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        firstName,
        lastName,
        age: parseInt(age, 10),
        hometown,
        gender,
        languages,
        occupation,
        introduction,
        profileCompleted: currentStep === prompts.length - 1, // Mark profile complete if last step
      };

      await setDoc(doc(db, 'users', user.id), dataToSave, { merge: true });

      if (currentStep < prompts.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setProfileCompleted(true);
        navigation.navigate('MapScreen'); // Adjust to your desired next screen
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('/Users/harshvardhanupadhyay/CoHabit/frontend/assets/images/details.png')}
          style={styles.background}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title}>{prompts[currentStep]}</Text>

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
                <TextInput
                  style={styles.input}
                  placeholder="Hometown"
                  value={hometown}
                  onChangeText={setHometown}
                  placeholderTextColor="#ccc"
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'Male' && styles.selectedOption]}
                  onPress={() => handleGenderSelect('Male')}
                >
                  <Text style={gender === 'Male' ? styles.selectedText : styles.unselectedText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'Female' && styles.selectedOption]}
                  onPress={() => handleGenderSelect('Female')}
                >
                  <Text style={gender === 'Female' ? styles.selectedText : styles.unselectedText}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'Non-Binary' && styles.selectedOption]}
                  onPress={() => handleGenderSelect('Non-Binary')}
                >
                  <Text style={gender === 'Non-Binary' ? styles.selectedText : styles.unselectedText}>Non-Binary</Text>
                </TouchableOpacity>
              </>
            )}

            {currentStep === 3 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Known Languages"
                  value={languages}
                  onChangeText={setLanguages}
                  placeholderTextColor="#ccc"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Occupation"
                  value={occupation}
                  onChangeText={setOccupation}
                  placeholderTextColor="#ccc"
                />
              </>
            )}

            {currentStep === 4 && (
              <TextInput
                style={[styles.input, { height: 138 }]}
                placeholder="Short Introduction"
                value={introduction}
                onChangeText={setIntroduction}
                placeholderTextColor="#ccc"
                multiline
                textAlignVertical="top"
              />
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={saveUserData}>
                <Text style={styles.buttonText}>
                  {currentStep === prompts.length - 1 ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    width: '100%',
    height: 312,
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
    },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 5,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: 150,
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#000',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unselectedText: {
    color: '#000',
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