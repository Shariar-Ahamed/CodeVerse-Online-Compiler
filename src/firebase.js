import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// CodeVerse Firebase configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyDPAoTyMZbZCCQzlA48vxaKMLJeJGTf0Tg",
  authDomain: "codeverse-79496.firebaseapp.com",
  projectId: "codeverse-79496",
  storageBucket: "codeverse-79496.firebasestorage.app",
  messagingSenderId: "184408179665",
  appId: "1:184408179665:web:6e30a8ee568471c60196f0",
  measurementId: "G-LGY705LM2N"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize & Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export default app;
