
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyANZRlyzKDXsnB8QP6dTrKsq5-WFaZTJDY",
    authDomain: "bookofgrit.firebaseapp.com",
    projectId: "bookofgrit",
    storageBucket: "bookofgrit.firebasestorage.app",
    messagingSenderId: "416633269965",
    appId: "1:416633269965:web:8e82d613d1b9f004590384",
    measurementId: "G-WKRTDR23SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
