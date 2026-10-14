# 🔥 QuickMed — Oracle to Firebase Firestore Migration Guide

The QuickMed project database has been successfully converted from **Oracle PL/SQL** (`oracledb`, SQL tables, TNS listeners) to **Google Firebase Firestore**!

---

## 🚀 Key Advantages of Moving to Firebase

1. **No Heavy Database Software Required**: No need to install Oracle Database XE/19c/21c, Instant Client binaries, or configure TNS/Listeners.
2. **Cloud Scalable**: Runs on Google Cloud's globally distributed NoSQL Firestore.
3. **Zero Frontend Breakage**: Retains full compatibility with all existing frontend pages (`index.html`, `login.html`, `register.html`, `appointment.html`, `my-appointments.html`, `admin.html`).
4. **Instant Zero-Setup Fallback**: If you run the server right now without Firebase keys, it automatically runs in **Local Emulation Mode** using local storage (`firestore-local-store.json`) with pre-seeded data so you can test immediately!

---

## 🛠️ How to Connect Your Live Firebase Project (3 Easy Steps)

### Step 1: Create a Free Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (e.g., name it `quickmed-portal`).
3. Under the left menu, click **Build > Firestore Database** and click **Create database** (choose "Start in test mode" or production mode).

### Step 2: Download Your Service Account Key
1. In Firebase Console, click the ⚙️ **Project settings** gear icon (top left).
2. Go to the **Service accounts** tab.
3. Select **Node.js** and click **Generate new private key**.
4. A `.json` file will download to your computer.
5. Rename the downloaded file to:
   ```text
   serviceAccountKey.json
   ```
6. Move `serviceAccountKey.json` into the `backend/` folder:
   ```text
   backend/
   ├── serviceAccountKey.json   <-- Place it here!
   ├── server.js
   ├── firebase.js
   └── ...
   ```

*(Alternatively, you can copy the values from that JSON into `backend/.env` under `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`)*

### Step 3: Install `firebase-admin` & Seed Your Database
Open your terminal in the `backend` folder and run:

```bash
cd backend
npm install firebase-admin
npm run seed
```

This will automatically populate your Firestore with:
- **Admin account**: `admin@quickmed.com` (password: `admin123`)
- **Patient account**: `rahul@gmail.com` (password: `patient123`)
- **20 Verified Indian Doctors** across Cardiology, Neurology, Orthopedics, Pediatrics, Gynecology, Dermatology, etc.

---

## 🏃 Running the Application

### 1. Start the Backend:
```bash
cd backend
npm start
```
You will see:
```text
🔥 Connected to Google Firebase Cloud Firestore via serviceAccountKey.json!
🚀 QuickMed Server running on port 5000
🌐 API ready at http://localhost:5000/api
```

*(If you haven't added the key yet, it will display: `ℹ️ Running in Local Firestore Emulation mode`)*

### 2. Start the Frontend:
Simply open `frontend/index.html` in your browser (or use VS Code Live Server / `npx serve frontend`).

---

## 📂 Summary of Changes

| Component | Oracle PL/SQL (Previous) | Firebase Firestore (New) |
| :--- | :--- | :--- |
| **Database Driver** | `oracledb` (6.4.0) | `firebase-admin` (Cloud Firestore) |
| **Connection File** | `backend/db.js` (Oracle connection pool) | `backend/firebase.js` + bridge in `db.js` |
| **API Queries** | Raw SQL queries (`SELECT`, `INSERT INTO qm_...`) | Firestore Collection references (`.collection('users').get()`, etc.) |
| **Data Collections** | `qm_users`, `qm_doctors`, `qm_appointments` | `users`, `doctors`, `appointments` collections |
| **Seeding Script** | `setup.sql` / `setup-quickmed.js` | `seed-firebase.js` (`npm run seed`) |
| **Config File** | Oracle User, Password, Connect string in `.env` | `serviceAccountKey.json` or Firebase env vars |
| **Offline Testing** | Crashes if Oracle DB service is down | Automatic local mock fallback |
