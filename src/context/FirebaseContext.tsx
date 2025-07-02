import React, { useState, useEffect, createContext, ReactNode } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

import localFirebaseConfig from "../utils/firebaseConfig";

export interface FirebaseContextType {
  db: Firestore | null;
  auth: Auth | null;
  userId: string | null;
  isAuthReady: boolean;
  appId: string | null;
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    let firebaseAppInstance: FirebaseApp | undefined;

    try {
      const canvasFirebaseConfigRaw: string | null =
        typeof window !== "undefined" &&
        typeof (window as any).__firebase_config !== "undefined"
          ? (window as any).__firebase_config
          : null;
      const canvasAppIdGlobal: string | null =
        typeof window !== "undefined" &&
        typeof (window as any).__app_id !== "undefined"
          ? (window as any).__app_id
          : null;
      const canvasInitialAuthTokenGlobal: string | null =
        typeof window !== "undefined" &&
        typeof (window as any).__initial_auth_token !== "undefined"
          ? (window as any).__initial_auth_token
          : null;

      const canvasFirebaseConfig = canvasFirebaseConfigRaw
        ? JSON.parse(canvasFirebaseConfigRaw)
        : null;

      const finalFirebaseConfig = canvasFirebaseConfig || localFirebaseConfig;

      const finalAppId = canvasAppIdGlobal || "default-quiz-app-id-local";
      setAppId(finalAppId);

      if (
        !finalFirebaseConfig ||
        !finalFirebaseConfig.apiKey ||
        Object.keys(finalFirebaseConfig).length === 0
      ) {
        console.warn(
          "Firebase config is missing or invalid. Leaderboard and storage features will not work."
        );
        setIsAuthReady(true);
        return;
      }

      firebaseAppInstance = initializeApp(finalFirebaseConfig);
      const firestore = getFirestore(firebaseAppInstance);
      const firebaseAuth = getAuth(firebaseAppInstance);

      setDb(firestore);
      setAuth(firebaseAuth);

      const signIn = async () => {
        try {
          if (canvasInitialAuthTokenGlobal) {
            await signInWithCustomToken(
              firebaseAuth,
              canvasInitialAuthTokenGlobal
            );
          } else {
            await signInAnonymously(firebaseAuth);
          }
        } catch (error) {
          console.error("Firebase authentication error:", error);
        }
      };

      signIn();

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(crypto.randomUUID());
        }
        setIsAuthReady(true);
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setIsAuthReady(true);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ db, auth, userId, isAuthReady, appId }}>
      {children}
    </FirebaseContext.Provider>
  );
};
