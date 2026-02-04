
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyANZRlyzKDXsnB8QP6dTrKsq5-WFaZTJDY",
    authDomain: "bookofgrit.firebaseapp.com",
    projectId: "bookofgrit",
    storageBucket: "bookofgrit.firebasestorage.app",
    messagingSenderId: "416633269965",
    appId: "1:416633269965:web:8e82d613d1b9f004590384",
    measurementId: "G-WKRTDR23SF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, "admin@bookofgrit.com", "GRIT2026");
        console.log("Admin account created:", userCredential.user.uid);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log("Admin account already exists.");
        } else {
            console.error("Error creating admin:", error);
        }
    }
}

createAdmin();
