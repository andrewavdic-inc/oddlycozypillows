import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
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
 * Compresses an uploaded image file on an HTML5 Canvas (preserves PNG transparency)
 */
async function compressImageToDataUrl(file, maxDim = 1100, quality = 0.84) {
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
 * Uploads an image file from an <input type="file"> button.
 * Uses Firebase Storage if configured; otherwise compresses to a portable Data URL.
 */
export async function uploadImageFile(file, folder = 'inventory') {
  if (!file) throw new Error('No file selected');

  if (isFirebaseConfigured && storage) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `oddlycozy/${folder}/${Date.now()}_${safeName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('Firebase Storage fallback to compressed Data URL:', err);
    }
  }

  return await compressImageToDataUrl(file);
}

/**
 * Syncs store state document with Cloud Firestore
 */
export function subscribeToCloudStore(docId, onUpdate) {
  if (!isFirebaseConfigured || !db) return () => {};
  const docRef = doc(db, 'oddlyCozyStore', docId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data());
    }
  });
}

export async function saveToCloudStore(docId, payload) {
  if (!isFirebaseConfigured || !db) return;
  try {
    const docRef = doc(db, 'oddlyCozyStore', docId);
    await setDoc(docRef, { ...payload, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving to Firestore:', err);
  }
}
