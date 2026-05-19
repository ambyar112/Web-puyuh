import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../db';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result after Google login redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login berhasil:", result.user.email);
        }
      })
      .catch((error) => {
        console.error("Redirect result error:", error);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          picture: firebaseUser.photoURL,
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Use redirect instead of popup to avoid COOP/CORS issues on Vercel
      await signInWithRedirect(auth, googleProvider);
      // Page will redirect, no return value needed
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // Force page reload to clear all state cleanly
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
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
