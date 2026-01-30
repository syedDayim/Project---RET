# Step-by-step: Get Roommate Expenses up and running (Firebase)

Data is stored in **Firebase Firestore**. The free tier is more than enough for a few roommates and expenses. Follow these steps in order.

---

## Part 1: Firebase project and Firestore

### Step 1: Create a Firebase project

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and sign in with Google.
2. Click **Add project** (or **Create a project**).
3. Enter a name (e.g. **Roommate Expenses**) → **Continue**.
4. Disable Google Analytics if you don’t need it → **Create project** → **Continue**.

---

### Step 2: Enable Firestore

1. In the left sidebar, click **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (we’ll lock it down in a moment) → **Next**.
4. Pick a location (e.g. closest to you) → **Enable**.
5. After the database is created, go to the **Rules** tab and replace the rules with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /roommates/{doc} {
         allow read, write: if true;
       }
       match /expenses/{doc} {
         allow read, write: if true;
       }
     }
   }
   ```

   This allows anyone with your app’s URL to read/write. For a private roommate app that’s usually fine; you can add auth later. Click **Publish**.

---

### Step 3: Register the web app and get config

1. In the project overview (home icon), click the **web** icon `</>` to **Add app**.
2. Enter an app nickname (e.g. **Roommate Expenses Web**) → **Register app**.
3. You’ll see a `firebaseConfig` object. Copy it or leave the page open. It looks like:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   };
   ```

4. Click **Continue to console** (you don’t need to add the SDK script in the HTML; we use the npm package).

---

## Part 2: Run the app on your computer

### Step 4: Install dependencies

1. Open a terminal and go to the project folder:

   ```bash
   cd "/Users/mac/Documents/Dayim/Web Projects/RET"
   ```

2. Install packages (including Firebase):

   ```bash
   npm install
   ```

---

### Step 5: Create `.env` with your Firebase config

1. In the **same** project folder, copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Open **`.env`** and fill in the values from the `firebaseConfig` you saw in Step 3:

   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

   Use your real values; no quotes. At minimum you need **apiKey**, **projectId**, and **appId** for the app to connect.

3. Save the file.

---

### Step 6: Start the app

1. In the terminal (still in the project folder):

   ```bash
   npm run dev
   ```

2. Open **http://localhost:5173** in your browser.
3. The “Demo mode” banner should disappear. If it doesn’t, check that:
   - `.env` is in the project root (same folder as `package.json`).
   - Variable names start with `VITE_FIREBASE_` and match `.env.example`.
   - You restarted the dev server after changing `.env` (Ctrl+C, then `npm run dev` again).

---

### Step 7: Test that data is saving

1. Go to the **Users** tab and add a roommate (e.g. your name).
2. Go to the **Expenses** tab and add an expense (who paid, amount, who was involved).
3. In **[Firebase Console](https://console.firebase.google.com)** → your project → **Firestore Database**, you should see two collections:
   - **roommates** – one document per roommate.
   - **expenses** – one document per expense.

If you see that, the app is **up and running** with Firebase.

---

## Quick checklist

- [ ] Firebase project created.
- [ ] Firestore created (test mode then Rules updated as above).
- [ ] Web app registered; `firebaseConfig` copied.
- [ ] `.env` created with all `VITE_FIREBASE_*` variables.
- [ ] `npm install` and `npm run dev`; app opened at http://localhost:5173.
- [ ] Demo banner gone; added a user and an expense; data visible in Firestore.

---

## Deploying to Vercel

### 1. Push your code to GitHub

1. Create a new repository on [github.com](https://github.com) (e.g. `roommate-expenses`). Don’t add a README if your project already has one.
2. In your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   **Important:** Your `.env` file is in `.gitignore`, so it will **not** be pushed. That’s correct—you’ll add the same variables in Vercel.

### 2. Import the project in Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project**.
3. Under “Import Git Repository”, select your **RET** (or roommate-expenses) repo. Click **Import**.

### 3. Add environment variables

1. Before clicking **Deploy**, open **Environment Variables**.
2. Add each variable from your local `.env` (use the same names and values):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. For each one: **Key** = name above, **Value** = the value from your `.env`. Leave “Environment” as **Production** (and optionally add the same for Preview if you use branches).
4. Click **Save**.

### 4. Deploy

1. Click **Deploy**. Vercel will run `npm install` and `npm run build` and then host the app.
2. When it’s done, you’ll get a URL like `https://your-project.vercel.app`. Open it—the app should load and connect to Firebase (no “Demo mode” banner if the env vars are set).
3. Share this URL with your roommates so they can open it on their phones or laptops and add expenses.

---

## Troubleshooting

- **“Demo mode” still showing**  
  Restart the dev server after changing `.env`. Ensure variable names are exactly as in `.env.example`.

- **“Firebase is not configured” or “Permission denied”**  
  - Check that all required `VITE_FIREBASE_*` values are in `.env` and that you published Firestore rules.
  - In Firestore Rules, ensure `roommates` and `expenses` have `allow read, write: if true` (or your intended rule).

- **Data not appearing in the app**  
  Confirm the collections in Firestore are named **roommates** and **expenses** (lowercase). The app creates documents automatically when you add data.
