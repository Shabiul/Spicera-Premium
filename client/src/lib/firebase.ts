import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCx-I8sP91gCg9zKxK8VOE5kTsO-VWSwC0",
  authDomain: "spicera-premium-8bc0a.firebaseapp.com",
  projectId: "spicera-premium-8bc0a",
  storageBucket: "spicera-premium-8bc0a.firebasestorage.app",
  messagingSenderId: "332656634702",
  appId: "1:332656634702:web:b7349d54b22d2603f18c1f",
  measurementId: "G-ZFH4JJM4RV",
};

export const app = initializeApp(firebaseConfig);

export async function getAuthInstance() {
  const mod = await import("firebase/auth");
  const auth = mod.getAuth(app);
  const googleProvider = new mod.GoogleAuthProvider();
  return { auth, googleProvider };
}

export const analyticsPromise = (async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
})();
