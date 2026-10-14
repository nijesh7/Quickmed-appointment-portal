/**
 * Firebase Firestore Database Adapter for QuickMed
 * 
 * Supports:
 * 1. Live Google Firebase Cloud Firestore via `firebase-admin` SDK (serviceAccountKey.json or .env)
 * 2. Automatic Local JSON/In-Memory fallback store so the project runs immediately out-of-the-box
 *    even before you download your Firebase service account credentials.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

let dbInstance = null;
let mode = 'unknown';

// Local storage file for fallback mode
const LOCAL_DB_PATH = path.join(__dirname, 'firestore-local-store.json');

// Initial default seed data for local fallback mode
const DEFAULT_FALLBACK_DATA = {
  users: {
    'user_admin_01': {
      name: 'Admin',
      email: 'admin@quickmed.com',
      password: '$2a$10$8K1p/LEstXpJe4GH4.Aj5OHzGQGxyMzU8IhVbGKL2qFqGpLjK4SHm', // admin123
      phone: '9999999999',
      role: 'admin',
      created_at: new Date().toISOString()
    },
    'user_patient_01': {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: '$2a$10$8K1p/LEstXpJe4GH4.Aj5OHzGQGxyMzU8IhVbGKL2qFqGpLjK4SHm', // patient123
      phone: '9876543210',
      role: 'patient',
      created_at: new Date().toISOString()
    }
  },
  doctors: {
    'doc_1': { name: 'Dr. Arjun Mehta', specialization: 'Cardiologist', experience_yrs: 18, fee: 900, emoji: '👨‍⚕️', bg_color: '#dbeafe', available: true },
    'doc_2': { name: 'Dr. Priya Sharma', specialization: 'Neurologist', experience_yrs: 15, fee: 1000, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
    'doc_3': { name: 'Dr. Ravi Patel', specialization: 'Orthopedic Surgeon', experience_yrs: 16, fee: 800, emoji: '👨‍⚕️', bg_color: '#d1fae5', available: true },
    'doc_4': { name: 'Dr. Ananya Iyer', specialization: 'Pediatrician', experience_yrs: 13, fee: 600, emoji: '👩‍⚕️', bg_color: '#fef3c7', available: true },
    'doc_5': { name: 'Dr. Suresh Kumar', specialization: 'General Physician', experience_yrs: 14, fee: 500, emoji: '👨‍⚕️', bg_color: '#dbeafe', available: true },
    'doc_6': { name: 'Dr. Meena Joshi', specialization: 'General Physician', experience_yrs: 10, fee: 450, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
    'doc_7': { name: 'Dr. Kavita Singh', specialization: 'Cardiologist', experience_yrs: 12, fee: 850, emoji: '👩‍⚕️', bg_color: '#ede9fe', available: true },
    'doc_8': { name: 'Dr. Leena Bose', specialization: 'Ophthalmologist', experience_yrs: 20, fee: 700, emoji: '👩‍⚕️', bg_color: '#ede9fe', available: true },
    'doc_9': { name: 'Dr. Rashmi Gupta', specialization: 'Dermatologist', experience_yrs: 12, fee: 650, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
    'doc_10': { name: 'Dr. Anjali Verma', specialization: 'Gynecologist', experience_yrs: 17, fee: 800, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
    'doc_11': { name: 'Dr. Vikram Malhotra', specialization: 'Cardiologist', experience_yrs: 22, fee: 1200, emoji: '👨‍⚕️', bg_color: '#e0f2fe', available: true },
    'doc_12': { name: 'Dr. Sneha Kulkarni', specialization: 'Neurologist', experience_yrs: 14, fee: 1100, emoji: '👩‍⚕️', bg_color: '#f5f3ff', available: true },
    'doc_13': { name: 'Dr. Rajesh Deshmukh', specialization: 'Orthopedic Surgeon', experience_yrs: 19, fee: 950, emoji: '👨‍⚕️', bg_color: '#ecfdf5', available: true },
    'doc_14': { name: 'Dr. Ishita Bhardwaj', specialization: 'Gynecologist', experience_yrs: 11, fee: 850, emoji: '👩‍⚕️', bg_color: '#fff1f2', available: true },
    'doc_15': { name: 'Dr. Amitav Ghosh', specialization: 'Pediatrician', experience_yrs: 15, fee: 750, emoji: '👨‍⚕️', bg_color: '#fefce8', available: true },
    'doc_16': { name: 'Dr. Pooja Reddy', specialization: 'Dentist', experience_yrs: 9, fee: 600, emoji: '👩‍⚕️', bg_color: '#fff7ed', available: true },
    'doc_17': { name: 'Dr. Sanjay Singhania', specialization: 'General Physician', experience_yrs: 25, fee: 500, emoji: '👨‍⚕️', bg_color: '#f0f9ff', available: true },
    'doc_18': { name: 'Dr. Neha Agarwal', specialization: 'Dermatologist', experience_yrs: 8, fee: 700, emoji: '👩‍⚕️', bg_color: '#fdf2f8', available: true },
    'doc_19': { name: 'Dr. Aditya Roy', specialization: 'Ophthalmologist', experience_yrs: 12, fee: 650, emoji: '👨‍⚕️', bg_color: '#eff6ff', available: true },
    'doc_20': { name: 'Dr. Kiran Rao', specialization: 'Psychiatrist', experience_yrs: 18, fee: 1500, emoji: '👨‍⚕️', bg_color: '#f5f3ff', available: true }
  },
  appointments: {}
};

/**
 * Creates a lightweight in-memory & file-persisted Firestore-compatible mock.
 * Ensures the app works 100% out of the box without waiting for service account credentials.
 */
function createLocalFirestoreMock() {
  let store = { ...DEFAULT_FALLBACK_DATA };

  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const saved = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
      store = { ...DEFAULT_FALLBACK_DATA, ...saved };
    } catch (e) {
      console.warn('  ⚠️ Could not read existing local store, using default seed.');
    }
  } else {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {}
  }

  const persist = () => {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {}
  };

  class LocalQuery {
    constructor(collectionName, filters = [], orderField = null, orderDir = 'asc') {
      this.collectionName = collectionName;
      this.filters = filters;
      this.orderField = orderField;
      this.orderDir = orderDir;
    }

    where(field, op, val) {
      return new LocalQuery(this.collectionName, [...this.filters, { field, op, val }], this.orderField, this.orderDir);
    }

    orderBy(field, dir = 'asc') {
      return new LocalQuery(this.collectionName, this.filters, field, dir);
    }

    async get() {
      const colData = store[this.collectionName] || {};
      let items = Object.entries(colData).map(([id, data]) => ({ id, ...data }));

      for (const filter of this.filters) {
        items = items.filter(item => {
          const itemVal = item[filter.field];
          if (filter.op === '==' || filter.op === '===') {
            return String(itemVal).toLowerCase() === String(filter.val).toLowerCase();
          }
          if (filter.op === 'in' && Array.isArray(filter.val)) {
            return filter.val.includes(itemVal);
          }
          return true;
        });
      }

      if (this.orderField) {
        items.sort((a, b) => {
          const vA = a[this.orderField] || '';
          const vB = b[this.orderField] || '';
          if (this.orderDir === 'desc') {
            return vA < vB ? 1 : vA > vB ? -1 : 0;
          }
          return vA > vB ? 1 : vA < vB ? -1 : 0;
        });
      }

      const docs = items.map(item => ({
        id: item.id,
        data: () => {
          const clone = { ...item };
          delete clone.id;
          return clone;
        },
        exists: true
      }));

      return {
        empty: docs.length === 0,
        size: docs.length,
        docs,
        forEach: (cb) => docs.forEach(cb)
      };
    }
  }

  class LocalCollection extends LocalQuery {
    constructor(collectionName) {
      super(collectionName);
    }

    doc(docId) {
      const collectionName = this.collectionName;
      return {
        id: docId,
        async get() {
          const item = store[collectionName]?.[docId];
          return {
            id: docId,
            exists: !!item,
            data: () => (item ? { ...item } : undefined)
          };
        },
        async set(data, options = {}) {
          if (!store[collectionName]) store[collectionName] = {};
          if (options.merge && store[collectionName][docId]) {
            store[collectionName][docId] = { ...store[collectionName][docId], ...data };
          } else {
            store[collectionName][docId] = { ...data };
          }
          persist();
          return { id: docId };
        },
        async update(data) {
          if (!store[collectionName] || !store[collectionName][docId]) {
            throw new Error(`Document ${docId} does not exist`);
          }
          store[collectionName][docId] = { ...store[collectionName][docId], ...data };
          persist();
          return { id: docId };
        },
        async delete() {
          if (store[collectionName] && store[collectionName][docId]) {
            delete store[collectionName][docId];
            persist();
          }
          return true;
        }
      };
    }

    async add(data) {
      const id = 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      if (!store[this.collectionName]) store[this.collectionName] = {};
      store[this.collectionName][id] = { ...data };
      persist();
      return { id };
    }
  }

  return {
    collection: (name) => new LocalCollection(name),
    _isMock: true,
    _getStore: () => store,
    _resetStore: (newStore) => {
      store = newStore || { ...DEFAULT_FALLBACK_DATA };
      persist();
    }
  };
}

/**
 * Initialize Firebase / Firestore
 */
function initializeFirestore() {
  if (dbInstance) return dbInstance;

  // 1. Try loading real firebase-admin if installed
  let admin = null;
  try {
    admin = require('firebase-admin');
  } catch (err) {
    // firebase-admin is not installed yet
    console.log('  ℹ️ `firebase-admin` package not installed yet. Running in Local Firestore Emulation mode.');
    dbInstance = createLocalFirestoreMock();
    mode = 'local-mock';
    return dbInstance;
  }

  // 2. Check for serviceAccountKey.json
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      dbInstance = admin.firestore();
      mode = 'firebase-cloud (serviceAccountKey.json)';
      console.log('  🔥 Connected to Google Firebase Cloud Firestore via serviceAccountKey.json!');
      return dbInstance;
    } catch (err) {
      console.error('  ⚠️ Failed to initialize Firebase with serviceAccountKey.json:', err.message);
    }
  }

  // 3. Check for .env variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
      }
      dbInstance = admin.firestore();
      mode = 'firebase-cloud (.env)';
      console.log('  🔥 Connected to Google Firebase Cloud Firestore via environment variables!');
      return dbInstance;
    } catch (err) {
      console.error('  ⚠️ Failed to initialize Firebase from .env:', err.message);
    }
  }

  // 4. Default project init (e.g. if GOOGLE_APPLICATION_CREDENTIALS or Firebase Emulator is set)
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      dbInstance = admin.firestore();
      mode = 'firebase-cloud (default credentials)';
      console.log('  🔥 Connected to Firebase Firestore (default environment credentials)!');
      return dbInstance;
    } catch (err) {
      console.warn('  ⚠️ Default Firebase initialization did not succeed:', err.message);
    }
  }

  // 5. Fallback: Local Firestore Mock
  console.log('  ℹ️ No Firebase credentials found. Running in Local Firestore Emulation mode.');
  console.log('  💡 To connect to your live Firebase project, download `serviceAccountKey.json` into the `backend/` folder.');
  dbInstance = createLocalFirestoreMock();
  mode = 'local-mock';
  return dbInstance;
}

function getDb() {
  if (!dbInstance) {
    return initializeFirestore();
  }
  return dbInstance;
}

function getMode() {
  return mode;
}

module.exports = {
  initialize: initializeFirestore,
  getDb,
  getMode,
  DEFAULT_FALLBACK_DATA
};
