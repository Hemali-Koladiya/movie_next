
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD5cWGywRVLUIdqCRoGOHP_8TNVPVtnFwo",
  authDomain: "searchapp-63529.firebaseapp.com",
  projectId: "searchapp-63529",
  storageBucket: "searchapp-63529.firebasestorage.app",
  messagingSenderId: "1071786402803",
  appId: "1:1071786402803:web:b8f170d3aec154c9022886"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


