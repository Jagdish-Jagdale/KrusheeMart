import { db } from '../firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";

export const addProduct = async (product) => {
  await addDoc(collection(db, "products"), {
    ...product,
    createdAt: new Date()
  });
};

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  const items = [];
  snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  return items;
};
