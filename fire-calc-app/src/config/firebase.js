// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
// 1. Import App Check
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"; 

const firebaseConfig = {
  // ... your existing config vars ...
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// 2. Initialize App Check
// Replace "YOUR_RECAPTCHA_SITE_KEY" with the key you got from Google Recaptcha Admin
// You should add this to your Vercel Env Vars as VITE_RECAPTCHA_SITE_KEY
if (typeof window !== "undefined") {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.DEV; // Allow localhost debugging
  
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY_HERE"),
    isTokenAutoRefreshEnabled: true
  });
}

export let analytics = null;
isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
});
