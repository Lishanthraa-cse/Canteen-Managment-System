// Import necessary functions from Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration object (replace with your project details)
const firebaseConfig = {
  apiKey: "AIzaSyAZoNT0YDuAMSFgie5QVH4_yrkGlvb4Q1I",
  authDomain: "canteen-management-adea4.firebaseapp.com",
  projectId: "canteen-management-adea4",
  storageBucket: "canteen-management-adea4.firebasestorage.app",
  messagingSenderId: "100347990683",
  appId: "1:100347990683:web:18f2accc25f402b54cac3e",
  measurementId: "G-3QX07ZDCDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Export the necessary functions for authentication
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
