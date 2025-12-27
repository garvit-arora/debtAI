// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCHwUF4HvNIV-GEG7H2eVwfvlP_5pm8oN0",
  authDomain: "tearswipe.firebaseapp.com",
  projectId: "tearswipe",
  storageBucket: "tearswipe.firebasestorage.app",
  messagingSenderId: "629590545878",
  appId: "1:629590545878:web:c138770c6b57a0341a0077",
  measurementId: "G-1D2K90L1MJ",
  databaseURL : "https://tearswipe-default-rtdb.firebaseio.com",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);