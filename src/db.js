import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
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

// ===== PER-USER PATH HELPERS =====
// All data is scoped under /users/{uid}/ so each Google account has separate data
export const userCol = (uid, name) => {
  console.log(`[userCol] uid: ${uid}, collection: ${name}`);
  return collection(db, 'users', uid, name);
};
export const userDoc = (uid, ...path) => {
  console.log(`[userDoc] uid: ${uid}, path:`, path);
  return doc(db, 'users', uid, ...path);
};

// ===== REAL-TIME QUERY HOOK =====
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

// ===== SETTINGS =====
export async function getSetting(uid, key) {
  console.log(`[getSetting] uid: ${uid}, key: ${key}`);
  try {
    if (!uid) {
      console.warn("[getSetting] uid is undefined or empty. Returning null.");
      return null;
    }
    const docRef = userDoc(uid, 'settings', key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().value;
    }
    return null;
  } catch (error) {
    console.error(`[getSetting Error] uid: ${uid}, key: ${key}, message:`, error.message);
    throw error;
  }
}

export async function hasRegistered(uid) {
  const farmName = await getSetting(uid, 'farmName');
  return farmName !== null;
}

export async function setSetting(uid, key, value) {
  await setDoc(userDoc(uid, 'settings', key), { value });
}

// ===== STOCK =====
export async function getStock(uid, type) {
  const docRef = userDoc(uid, 'stocks', type);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return { id: type, type, quantity: 0, unit: type === 'telur' ? 'kg' : 'karung' };
}

export async function updateStock(uid, type, delta, unit = '') {
  const stock = await getStock(uid, type);
  const newQty = Math.max(0, stock.quantity + delta);
  await setDoc(userDoc(uid, 'stocks', type), {
    type,
    quantity: newQty,
    unit: unit || stock.unit,
    lastUpdated: new Date().toISOString()
  });
  return newQty;
}

// ===== LIVESTOCK =====
export async function getLivestock(uid) {
  const docRef = userDoc(uid, 'livestock', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return { totalPopulation: 0 };
}

export async function updateLivestock(uid, delta) {
  const current = await getLivestock(uid);
  const newPop = Math.max(0, (current.totalPopulation || 0) + delta);
  await setDoc(userDoc(uid, 'livestock', 'main'), {
    totalPopulation: newPop,
    dateUpdated: new Date().toISOString()
  });
  return newPop;
}

// ===== INIT DEFAULTS (run on first login for a user) =====
export async function initDefaults(uid) {
  if (!uid) {
    console.warn("[initDefaults] uid is empty!");
    return;
  }
  const farmName = await getSetting(uid, 'farmName');
  if (!farmName) {
    await setSetting(uid, 'farmName', 'Peternakan Puyuhku');
    await setSetting(uid, 'whitelistEmails', []);
    await setSetting(uid, 'hargaKarung', 2000);
    await setSetting(uid, 'hargaKarungPerKg', 50);
    await setSetting(uid, 'alarmPakanKritis', 10);
    await setSetting(uid, 'alarmPakanDarurat', 5);
    await setSetting(uid, 'demoMode', true);
  }

  const pakan = await getStock(uid, 'pakan');
  if (pakan.quantity === 0 && !pakan.lastUpdated) {
    await setDoc(userDoc(uid, 'stocks', 'pakan'), { type: 'pakan', quantity: 20, unit: 'karung', lastUpdated: new Date().toISOString() });
    await setDoc(userDoc(uid, 'stocks', 'karungBekas'), { type: 'karungBekas', quantity: 0, unit: 'karung', lastUpdated: new Date().toISOString() });
    await setDoc(userDoc(uid, 'stocks', 'telur'), { type: 'telur', quantity: 0, unit: 'kg', lastUpdated: new Date().toISOString() });
  }

  const lv = await getLivestock(uid);
  if (!lv.dateUpdated) {
    await setDoc(userDoc(uid, 'livestock', 'main'), { totalPopulation: 1000, dateUpdated: new Date().toISOString() });
  }
}

// ===== FACTORY RESET (only resets current user's data) =====
export async function factoryReset(uid) {
  const collectionsToDelete = ['dailyRecords', 'transactions', 'feedPurchases', 'equipment'];
  for (const collName of collectionsToDelete) {
    const q = query(userCol(uid, collName));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(userDoc(uid, collName, d.id));
    }
  }

  await setDoc(userDoc(uid, 'stocks', 'pakan'), { type: 'pakan', quantity: 0, unit: 'karung', lastUpdated: new Date().toISOString() });
  await setDoc(userDoc(uid, 'stocks', 'karungBekas'), { type: 'karungBekas', quantity: 0, unit: 'karung', lastUpdated: new Date().toISOString() });
  await setDoc(userDoc(uid, 'stocks', 'telur'), { type: 'telur', quantity: 0, unit: 'kg', lastUpdated: new Date().toISOString() });
  await setDoc(userDoc(uid, 'livestock', 'main'), { totalPopulation: 0, dateUpdated: new Date().toISOString() });
}
