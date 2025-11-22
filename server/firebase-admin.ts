import admin from 'firebase-admin';

export function initFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export function getStorage() {
  return admin.storage();
}

export function getFirestore() {
  return admin.firestore();
}

export function getAuth() {
  return admin.auth();
}
