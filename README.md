# Roommate Expenses

A simple, responsive web app to track shared expenses between roommates and see who owes whom. Data is stored in **Firebase Firestore**; the app is **frontend-only** (React on Vercel) and uses very little storage—ideal for a few roommates.

**→ New to the project?** Follow **[SETUP.md](./SETUP.md)** for a step-by-step guide to get Firebase connected and the app running.

## Features

- **Add roommates** – Anyone with the link can add a roommate; they appear in “involved” when adding expenses.
- **Add expense** – Choose who paid, amount (AED), who was involved (multi-select), optional note.
- **Who owes whom** – Automatic calculation: e.g. “Zahoor owes Dayim 16.67 AED”.
- **Expense history** – List of all expenses with date and details.

## Tech

- **Frontend:** React (Vite) + TypeScript
- **Hosting:** Vercel (free)
- **Data:** Firebase Firestore (free tier is enough for this app)

## Setup (short)

1. Create a [Firebase](https://console.firebase.google.com) project and enable **Firestore**.
2. Register a **web app** and copy the `firebaseConfig` values.
3. Create **`.env`** in the project root with `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` (and the rest from `.env.example`).
4. Set Firestore **Rules** so `roommates` and `expenses` are readable/writable (see SETUP.md).
5. Run `npm install` and `npm run dev`; open http://localhost:5173.

Full steps: **[SETUP.md](./SETUP.md)**.

## Deploy to Vercel

1. Push to GitHub (don’t commit `.env`).
2. In Vercel: **New Project** → Import repo.
3. Add environment variables: all `VITE_FIREBASE_*` from your `.env`.
4. Deploy. Share the URL with your roommates.

## License

MIT
