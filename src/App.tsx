import { useState, useEffect, useCallback } from 'react'
import type { Roommate, Expense } from './types'
import { api } from './api'
import { isFirebaseConfigured } from './lib/firebase'
import { AddExpense } from './components/AddExpense'
import { Roommates } from './components/Roommates'
import { ExpenseHistory } from './components/ExpenseHistory'
import { Settlements } from './components/Settlements'
import './App.css'

function App() {
  const [roommates, setRoommates] = useState<Roommate[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasApi = isFirebaseConfigured()
  type TabId = 'expenses' | 'users' | 'who-owes' | 'coming-soon'
  const [activeTab, setActiveTab] = useState<TabId>('expenses')

  const tabs: { id: TabId; label: string }[] = [
    { id: 'expenses', label: 'Expenses' },
    { id: 'users', label: 'Users' },
    { id: 'who-owes', label: 'Who owes whom' },
    { id: 'coming-soon', label: 'Coming soon' },
  ]

  const refresh = useCallback(async () => {
    if (!hasApi) {
      setRoommates([])
      setExpenses([])
      setError(null)
      setLoading(false)
      return
    }
    setError(null)
    try {
      const [rRes, eRes] = await Promise.all([
        api.getRoommates(),
        api.getExpenses(),
      ])
      setRoommates(rRes.roommates)
      setExpenses(eRes.expenses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [hasApi])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (loading) {
    return (
      <div className="app">
        <p className="loading">Loading…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Roommate Expenses</h1>
      {!hasApi && (
        <div className="section banner-demo">
          <p className="banner-demo-text">
            <strong>Demo mode</strong> — data isn’t saved. To connect Firebase:
          </p>
          <ol className="banner-demo-steps">
            <li>Create a project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase Console</a> → enable Firestore.</li>
            <li>Project settings → Your apps → Add web app → copy the <code>firebaseConfig</code> object.</li>
            <li>Create <code>.env</code> in the project root with <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_PROJECT_ID</code>, <code>VITE_FIREBASE_APP_ID</code> (and optionally authDomain, storageBucket, messagingSenderId). See <code>SETUP.md</code>.</li>
          </ol>
        </div>
      )}
      {error && (
        <div className="section">
          <p className="error-msg">{error}</p>
        </div>
      )}

      <nav className="tabs" role="tablist">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={`tab ${activeTab === id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        {activeTab === 'expenses' && (
          <>
            <AddExpense roommates={roommates} onAdded={refresh} />
            <ExpenseHistory expenses={expenses} roommates={roommates} />
          </>
        )}
        {activeTab === 'users' && (
          <Roommates roommates={roommates} onChanged={refresh} />
        )}
        {activeTab === 'who-owes' && (
          <Settlements expenses={expenses} roommates={roommates} />
        )}
        {activeTab === 'coming-soon' && (
          <div className="section">
            <p className="empty">Coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
