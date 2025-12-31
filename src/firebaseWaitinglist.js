// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const waitlistConfig= {
  apiKey: "AIzaSyAUx3rsXdcJO0H8dgMYy9IpjI7-jV7vZE4",
  authDomain: "debt-ai-waitinglist.firebaseapp.com",
  projectId: "debt-ai-waitinglist",
  storageBucket: "debt-ai-waitinglist.firebasestorage.app",
  messagingSenderId: "68065376942",
  appId: "1:68065376942:web:a87d01d8fd0958a2ca0b3f",
  measurementId: "G-KYED7SXP3D"
};

const waitingListApp = initializeApp(waitlistConfig,"waitingListApp");
const waitlistDb = getDatabase(waitingListApp);
const analytics = getAnalytics(waitingListApp);
export { waitlistDb };