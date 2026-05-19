import { createContext, useContext, useState, useEffect } from 'react';
import { getSetting, auth, googleProvider } from '../db';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Validate whitelist
          const whitelist = await getSetting('whitelistEmails');
          const demoMode = await getSetting('demoMode');
          
          if (demoMode || !whitelist || whitelist.length === 0 || whitelist.includes(firebaseUser.email)) {
            setUser({
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              picture: firebaseUser.photoURL,
              uid: firebaseUser.uid
            });
          } else {
            // Deny access
            await firebaseSignOut(auth);
            setUser(null);
            alert('Akses Ditolak. Email Anda tidak terdaftar sebagai pengelola.');
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          await firebaseSignOut(auth);
          setUser(null);
          alert('Gagal mengakses database: ' + error.message + '\n\nPastikan aturan Firestore (Firestore Rules) di Firebase Console Anda sudah diset untuk mengizinkan akses. Contoh rule dasar: allow read, write: if request.auth != null;');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error) {
      console.error(error);
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
