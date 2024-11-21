// Import the necessary Firebase functions
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Correct import for Storage
import Constants from 'expo-constants';

// Firebase configuration object (use your own config)
const firebaseConfig = {
  // add your firebaseconfig
};

// Initialize Firebase app if it's not already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Use the existing initialized app
}

// Initialize Firestore database and Firebase Storage
const db = getFirestore(app);
const storage = getStorage(app); // Use getStorage for the new modular SDK

export { db, storage };
