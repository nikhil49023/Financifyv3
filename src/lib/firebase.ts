
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "uplift-ai-lab-95648316-bbea9",
  "appId": "1:511087468573:web:8562b57ae07093d34ee6f4",
  "apiKey": "AIzaSyA69d-QroxdswRLV2Tr8ttzdY90OVA6Q7U",
  "authDomain": "uplift-ai-lab-95648316-bbea9.firebaseapp.com",
  "measurementId": "G-G1TPGDDV4J",
  "storageBucket": "uplift-ai-lab-95648316-bbea9.appspot.com",
  "messagingSenderId": "511087468573"
};


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, db, auth, storage, googleProvider, githubProvider };
