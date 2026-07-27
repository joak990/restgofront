// filepath: src/lib/firebase.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (isConfigured()) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Faltan variables VITE_FIREBASE_* en .env. El login con Google no va a funcionar.',
  );
}

export const firebaseAuth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export const isFirebaseReady = isConfigured;