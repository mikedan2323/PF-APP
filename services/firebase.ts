// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxZnbmmxga5Xx0khtgtQknkyl2aeIZdJI",
  authDomain: "pf-app-35a76.firebaseapp.com",
  projectId: "pf-app-35a76",
  storageBucket: "pf-app-35a76.firebasestorage.app",
  messagingSenderId: "206921619869",
  appId: "1:206921619869:web:00f1058ad5f39465bd3774",
  measurementId: "G-K7BH34Y07E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export them for use in other parts of the app
export { app, auth, db };