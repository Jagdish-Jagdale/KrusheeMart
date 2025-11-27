import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSBaaohONpwHJI_PX-oTbPcHS0mgGHm6g",
  authDomain: "krusheemart.firebaseapp.com",
  projectId: "krusheemart",
  storageBucket: "krusheemart.firebasestorage.app",
  messagingSenderId: "780629221093",
  appId: "1:780629221093:web:7b86bcd68325b987077e0c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);