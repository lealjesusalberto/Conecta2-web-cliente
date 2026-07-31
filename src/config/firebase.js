import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAEACkKW6vBnFsAftPqnRvFqr97-aoJnX8",
  authDomain: "conecta2-drive.firebaseapp.com",
  databaseURL: "https://conecta2-drive-default-rtdb.firebaseio.com",
  projectId: "conecta2-drive",
  storageBucket: "conecta2-drive.firebasestorage.app",
  messagingSenderId: "967297739363",
  appId: "1:967297739363:web:45b5aeae56ce755db26656"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth, Realtime Database & Storage
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
