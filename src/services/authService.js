import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, doc, setDoc } from "firebase/firestore";

export const register = async (name, email, password, role) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  // Use setDoc with user uid as document ID for consistency
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    name,
    email,
    password, // Store password for admin panel display
    role
  });
  return true;
};

export const login = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
  return true;
};

export const logout = async () => {
  await signOut(auth);
};

export const getCurrentUser = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserData = async (uid) => {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  let userData = null;
  snapshot.forEach(doc => {
    userData = doc.data();
  });
  return userData;
};
