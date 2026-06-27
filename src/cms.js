import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, firebaseReady } from "./firebase.js";

export const getPortfolioItems = async () => {
  if (!firebaseReady) return [];
  const snapshot = await getDocs(query(collection(db, "portfolioItems"), orderBy("order", "asc")));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((item) => item.active !== false);
};

export const getServices = async () => {
  if (!firebaseReady) return [];
  const snapshot = await getDocs(query(collection(db, "services"), orderBy("order", "asc")));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((item) => item.active !== false);
};
