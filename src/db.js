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
export const userCol = (uid, name) => collection(db, 'users', uid, name);
export const userDoc = (uid, ...path) => doc(db, 'users', uid, ...path);

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
  const docRef = userDoc(uid, 'settings', key);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().value;
  }
  return null;
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
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-primary {
  background: linear-gradient(135deg, var(--cyan), #0891b2);
  color: #fff;
  box-shadow: 0 4px 16px rgba(34,211,238,0.25);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,211,238,0.35); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-danger {
  background: linear-gradient(135deg, var(--red), #dc2626);
  color: #fff;
  box-shadow: 0 4px 16px rgba(248,113,113,0.25);
}
.btn-accent {
  background: linear-gradient(135deg, var(--purple), #7c3aed);
  color: #fff;
  box-shadow: 0 4px 16px rgba(167,139,250,0.25);
}
.btn-ghost {
  background: var(--card);
  border: 1px solid var(--card-border);
  color: var(--text2);
}
.btn-ghost:hover { border-color: var(--cyan); color: var(--cyan); }
.btn-income {
  background: linear-gradient(135deg, #059669, #047857);
  color: #fff;
  box-shadow: 0 4px 16px rgba(52,211,153,0.2);
}
.btn-expense {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  box-shadow: 0 4px 16px rgba(248,113,113,0.2);
}
.btn-large { padding: 16px 24px; font-size: 16px; min-height: 56px; }
.btn-medium { padding: 13px 16px; font-size: 14px; min-height: 48px; }
.btn-sm { padding: 8px 12px; font-size: 12px; min-height: 36px; }
.btn-icon-sm {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--card);
  border: 1px solid var(--card-border);
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon-sm:hover { color: var(--text); border-color: var(--cyan); }
.btn-icon-sm.danger:hover { color: var(--red); border-color: var(--red); }
.w-full { width: 100%; }
.flex-1 { flex: 1; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }

// ===== INIT DEFAULTS (run on first login for a user) =====
export async function initDefaults(uid) {
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

  /* Page title bigger on desktop */
  .page-title { font-size:28px; }

  /* Stock grid — 4 cols on desktop */
  .stock-grid { grid-template-columns:repeat(4, 1fr); gap:12px; }

  /* Quick actions — 4 cols on desktop */
  .quick-actions { grid-template-columns:repeat(4, 1fr); gap:10px; }
  .quick-action-btn { padding:18px 12px; font-size:13px; }

  /* Finance cards row */
  .finance-cards-row { gap:12px; }

  /* Report cards — horizontal on desktop */
  .report-type-cards { flex-direction:row; }
  .report-type-card { flex:1; }

  /* Modal — centered dialog on desktop */
  .modal-overlay { align-items:center; justify-content:center; }
  .modal-container {
    border-radius:var(--radius-lg);
    max-width:540px; max-height:88vh;
    width:100%;
  }

  /* Toast — top-right corner on desktop */
  .toast-container {
    left:auto; right:24px;
    transform:none;
    top:24px; max-width:360px; width:auto;
  }

  /* Forms — wider spacing */
  .form-row { gap:16px; }
  .input-big { font-size:32px; }

  /* Equipment grid */
  .equipment-group { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; }
  .equipment-group-label { grid-column:1/-1; }

  /* More menu grid */
  .more-menu-list { display:grid; grid-template-columns:repeat(2, 1fr); }

  /* Settings */
  .settings-section { max-width:600px; }
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

