import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { getDb } from './lib/firebase'
import type { Roommate, Expense } from './types'

const ROOMMATES = 'roommates'
const EXPENSES = 'expenses'
const CURRENCY = 'AED'

function mapRoommate(docId: string, data: Record<string, unknown>): Roommate {
  const addedAt = data.addedAt as Timestamp | string | undefined
  return {
    id: docId,
    name: String(data.name ?? ''),
    addedAt: addedAt instanceof Timestamp ? addedAt.toDate().toISOString() : String(addedAt ?? ''),
  }
}

function mapExpense(docId: string, data: Record<string, unknown>): Expense {
  const createdAt = data.createdAt as Timestamp | string | undefined
  const involved = data.involved as string[] | undefined
  return {
    id: docId,
    paidBy: String(data.paidBy ?? ''),
    amount: Number(data.amount ?? 0),
    currency: String(data.currency ?? CURRENCY),
    involved: Array.isArray(involved) ? involved : [],
    note: data.note ? String(data.note) : undefined,
    createdAt:
      createdAt instanceof Timestamp
        ? createdAt.toDate().toISOString()
        : String(createdAt ?? ''),
  }
}

export const api = {
  async getRoommates(): Promise<{ roommates: Roommate[] }> {
    const db = getDb()
    const snap = await getDocs(collection(db, ROOMMATES))
    const roommates = snap.docs.map((d) => mapRoommate(d.id, d.data()))
    return { roommates }
  },

  async addRoommate(name: string): Promise<{ roommate: Roommate }> {
    const db = getDb()
    const ref = await addDoc(collection(db, ROOMMATES), {
      name: name.trim(),
      addedAt: serverTimestamp(),
    })
    const roommate: Roommate = {
      id: ref.id,
      name: name.trim(),
      addedAt: new Date().toISOString(),
    }
    return { roommate }
  },

  async deleteRoommate(id: string): Promise<void> {
    const db = getDb()
    await deleteDoc(doc(db, ROOMMATES, id))
  },

  async getExpenses(): Promise<{ expenses: Expense[] }> {
    const db = getDb()
    const q = query(
      collection(db, EXPENSES),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    const expenses = snap.docs.map((d) => mapExpense(d.id, d.data()))
    return { expenses }
  },

  async deleteExpense(id: string): Promise<void> {
    const db = getDb()
    await deleteDoc(doc(db, EXPENSES, id))
  },

  async deleteAllExpenses(): Promise<void> {
    const db = getDb()
    const snap = await getDocs(collection(db, EXPENSES))
    if (snap.empty) return
    const batch = writeBatch(db)
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  },

  async addExpense(data: {
    paidBy: string
    amount: number
    involved: string[]
    note?: string
  }): Promise<{ expense: Expense }> {
    const db = getDb()
    const ref = await addDoc(collection(db, EXPENSES), {
      paidBy: data.paidBy,
      amount: data.amount,
      currency: CURRENCY,
      involved: data.involved,
      note: data.note ?? '',
      createdAt: serverTimestamp(),
    })
    const expense: Expense = {
      id: ref.id,
      paidBy: data.paidBy,
      amount: data.amount,
      currency: CURRENCY,
      involved: data.involved,
      note: data.note,
      createdAt: new Date().toISOString(),
    }
    return { expense }
  },
}


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC7UBeMduvB20tptObzVcr69qyu52pJSWg",
//   authDomain: "roomexp105.firebaseapp.com",
//   projectId: "roomexp105",
//   storageBucket: "roomexp105.firebasestorage.app",
//   messagingSenderId: "918186914452",
//   appId: "1:918186914452:web:1f0e0faa6b38c63c19fa81",
//   measurementId: "G-YDJV4Y14CK"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);