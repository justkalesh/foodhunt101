import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCNC_80YujtU_O3wtk4tKgw24jdfXZquRs",
    authDomain: "food-hunt-101.firebaseapp.com",
    projectId: "food-hunt-101",
    storageBucket: "food-hunt-101.firebasestorage.app",
    messagingSenderId: "23751876828",
    appId: "1:23751876828:web:fdd3db56a631d389629419"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
