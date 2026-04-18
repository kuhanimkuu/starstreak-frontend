import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCEXOB6AuXzaLtqfjFudh4Luhf1IJ1PDEY",
  authDomain: "starstreak-3ec7b.firebaseapp.com",
  projectId: "starstreak-3ec7b",
  storageBucket: "starstreak-3ec7b.firebasestorage.app",
  messagingSenderId: "896590579222",
  appId: "1:896590579222:web:175647a7d44cbded83d737",
  measurementId: "G-N2V3HPYFGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
