// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1UtxKEn7T6cqIz1vX25ezyy7IzNm4V7M",
  authDomain: "cohabit-efc71.firebaseapp.com",
  projectId: "cohabit-efc71",
  storageBucket: "cohabit-efc71.appspot.com",
  messagingSenderId: "456825457205",
  appId: "1:456825457205:web:12afba838284d45568bf7c",
  measurementId: "G-4NP9404YD8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore()

export {db}