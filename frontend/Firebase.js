// Import the necessary Firebase functions
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Correct import for Storage
import Constants from 'expo-constants';

// Firebase configuration object (use your own config)
const firebaseConfig = {
  apiKey: "AIzaSyA1UtxKEn7T6cqIz1vX25ezyy7IzNm4V7M",
  authDomain: "cohabit-efc71.firebaseapp.com",
  projectId: "cohabit-efc71",
  storageBucket: "cohabit-efc71.appspot.com",
  messagingSenderId: "456825457205",
  appId: "1:456825457205:web:12afba838284d45568bf7c",
  measurementId: "G-4NP9404YD8"
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
