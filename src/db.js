import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDGHr2lF2P5tpxt7TH2rZ7sJt7svIDckw",
  authDomain: "gen-lang-client-0740538788.firebaseapp.com",
  projectId: "gen-lang-client-0740538788",
  storageBucket: "gen-lang-client-0740538788.firebasestorage.app",
  messagingSenderId: "673649713904",
  appId: "1:673649713904:web:7e64804759f305af07d835",
  measurementId: "G-V24NB5V2B1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function useFirestoreQuery(q) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!q) return;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(results);
    }, (error) => {
      console.error("Error in useFirestoreQuery:", error);
    });
    return () => unsubscribe();
  }, [q]);
  return data;
}

export async function getSetting(key) {
  const docRef = doc(db, 'settings', key);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().value;
  }
  return null;
}

export async function setSetting(key, value) {
  await setDoc(doc(db, 'settings', key), { value });
}

export async function getStock(type) {
  const docRef = doc(db, 'stocks', type);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return { id: type, type, quantity: 0, unit: type === 'telur' ? 'kg' : 'karung' };
}

export async function updateStock(type, delta, unit = '') {
  const stock = await getStock(type);
  const newQty = Math.max(0, stock.quantity + delta);
  await setDoc(doc(db, 'stocks', type), {
    type,
    quantity: newQty,
    unit: unit || stock.unit,
    lastUpdated: new Date().toISOString()
  });
  return newQty;
}

export async function getLivestock() {
  const docRef = doc(db, 'livestock', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return { totalPopulation: 0 };
}

export async function updateLivestock(delta) {
  const current = await getLivestock();
  const newPop = Math.max(0, (current.totalPopulation || 0) + delta);
  await setDoc(doc(db, 'livestock', 'main'), {
    totalPopulation: newPop,
    dateUpdated: new Date().toISOString()
  });
  return newPop;
}

export async function initDefaults() {
  // Try getting a setting to see if initialized
  const farmName = await getSetting('farmName');
  if (!farmName) {
    await setSetting('farmName', 'Peternakan Puyuhku');
    await setSetting('whitelistEmails', []);
    await setSetting('hargaKarung', 2000);
    await setSetting('hargaKarungPerKg', 50);
    await setSetting('alarmPakanKritis', 10);
    await setSetting('alarmPakanDarurat', 5);
    await setSetting('demoMode', true);
  }

  const pakan = await getStock('pakan');
  if (pakan.quantity === 0 && !pakan.lastUpdated) {
    await setDoc(doc(db, 'stocks', 'pakan'), { type: 'pakan', quantity: 20, unit: 'karung', lastUpdated: new Date().toISOString() });
    await setDoc(doc(db, 'stocks', 'karungBekas'), { type: 'karungBekas', quantity: 0, unit: 'karung', lastUpdated: new Date().toISOString() });
    await setDoc(doc(db, 'stocks', 'telur'), { type: 'telur', quantity: 0, unit: 'kg', lastUpdated: new Date().toISOString() });
  }

  const lv = await getLivestock();
  if (!lv.dateUpdated) {
    await setDoc(doc(db, 'livestock', 'main'), { totalPopulation: 1000, dateUpdated: new Date().toISOString() });
  }
}

export async function factoryReset() {
  const collectionsToDelete = ['dailyRecords', 'transactions', 'feedPurchases', 'equipment'];
  for (const collName of collectionsToDelete) {
    const q = query(collection(db, collName));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, collName, d.id));
    }
  }

  // Reset stock to 0
  await setDoc(doc(db, 'stocks', 'pakan'), { type: 'pakan', quantity: 0, unit: 'karung', lastUpdated: new Date().toISOString() });
  await setDoc(doc(db, 'stocks', 'karungBekas'), { type: 'karungBekas', quantity: 0, unit: 'karung', lastUpdated: new Date().toISOString() });
  await setDoc(doc(db, 'stocks', 'telur'), { type: 'telur', quantity: 0, unit: 'kg', lastUpdated: new Date().toISOString() });

  // Reset livestock to 0
  await setDoc(doc(db, 'livestock', 'main'), { totalPopulation: 0, dateUpdated: new Date().toISOString() });
}
