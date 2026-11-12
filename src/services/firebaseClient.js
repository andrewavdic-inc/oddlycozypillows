import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Uses your Vercel/local env key + pre-fills your oddlycozypillows project identifiers
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'oddlycozypillows.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'oddlycozypillows',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'oddlycozypillows.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '318236555026',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || '1:318236555026:web:b87530d867a3e0f4f4a5cb',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10
);

let app = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

/**
 * Fallback canvas compression (kept small so localStorage never hits quota if offline)
 */
async function compressImageToDataUrl(file, maxDim = 600, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        const mimeType = isPng ? 'image/png' : 'image/webp';
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Cloud Storage and returns a permanent https:// URL
 */
export async function uploadImageFile(file, folder = 'inventory') {
  if (!file) throw new Error('No file selected');

  if (isFirebaseConfigured && storage) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `oddlycozy/${folder}/${Date.now()}_${safeName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.error('Firebase Storage Upload Error:', err);
      throw new Error(
        `Firebase Storage upload failed (${err.code || err.message}). Check Storage Rules in Firebase Console.`
      );
    }
  }

  return await compressImageToDataUrl(file);
}

/**
 * Fetches initial cloud store state once on load
 */
export async function fetchInitialCloudStore(docId) {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const docRef = doc(db, 'oddlyCozyStore', docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('Error fetching initial Firestore doc:', err);
    throw err;
  }
}

/**
 * Real-time listener for changes across all devices
 */
export function subscribeToCloudStore(docId, onUpdate, onError) {
  if (!isFirebaseConfigured || !db) return () => {};
  const docRef = doc(db, 'oddlyCozyStore', docId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Sanitizes undefined fields and saves the entire store state to Cloud Firestore
 */
export async function saveToCloudStore(docId, payload) {
  if (!isFirebaseConfigured || !db) {
    return { ok: false, reason: 'missing-api-key' };
  }
  try {
    const docRef = doc(db, 'oddlyCozyStore', docId);
    // Strip any undefined properties so Firestore setDoc never fails
    const cleanPayload = JSON.parse(JSON.stringify(payload));
    await setDoc(
      docRef,
      { ...cleanPayload, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return { ok: true };
  } catch (err) {
    console.error('Error saving to Firestore:', err);
    return { ok: false, reason: err.code || err.message };
  }
}
