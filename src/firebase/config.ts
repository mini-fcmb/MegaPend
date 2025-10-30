// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ add this

const firebaseConfig = {
  apiKey: "AIzaSyC1iNKDm__uI06XWv5ZJKJFo0VKSnpFHQY",
  authDomain: "megapend-auth.firebaseapp.com",
  projectId: "megapend-auth",
  storageBucket: "megapend-auth.firebasestorage.app",
  messagingSenderId: "827105755249",
  appId: "1:827105755249:web:f9c6954d99582be497dbd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app); // ✅ export db

export default app;
