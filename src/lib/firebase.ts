import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function isConfigured() {
  return Boolean(
    config.apiKey &&
      config.projectId &&
      config.appId
  )
}

let db: ReturnType<typeof getFirestore> | null = null

export function getDb() {
  if (!db) {
    if (!isConfigured()) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* in .env')
    }
    const app = initializeApp(config)
    db = getFirestore(app)
  }
  return db
}

export function isFirebaseConfigured() {
  return isConfigured()
}
