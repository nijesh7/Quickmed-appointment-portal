/**
 * QuickMed - Firebase Web Configuration & Client Service
 * Configured with project: quick-med-40ab9
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBye4tf2HWYoYZcecS9oXs6Y442okUmfQI",
  authDomain: "quick-med-40ab9.firebaseapp.com",
  projectId: "quick-med-40ab9",
  storageBucket: "quick-med-40ab9.firebasestorage.app",
  messagingSenderId: "258143284637",
  appId: "1:258143284637:web:e805b074c2892fbb1cd374",
  measurementId: "G-LE11WDLD81"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics if supported in this environment
isSupported().then(yes => {
  if (yes) getAnalytics(app);
}).catch(() => {});

// Initial doctor dataset to automatically seed Firestore if empty
export const INITIAL_DOCTORS = [
  { name: 'Dr. Arjun Mehta', specialization: 'Cardiologist', experience_yrs: 18, fee: 900, emoji: '👨‍⚕️', bg_color: '#dbeafe', available: true },
  { name: 'Dr. Priya Sharma', specialization: 'Neurologist', experience_yrs: 15, fee: 1000, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
  { name: 'Dr. Ravi Patel', specialization: 'Orthopedic Surgeon', experience_yrs: 16, fee: 800, emoji: '👨‍⚕️', bg_color: '#d1fae5', available: true },
  { name: 'Dr. Ananya Iyer', specialization: 'Pediatrician', experience_yrs: 13, fee: 600, emoji: '👩‍⚕️', bg_color: '#fef3c7', available: true },
  { name: 'Dr. Suresh Kumar', specialization: 'General Physician', experience_yrs: 14, fee: 500, emoji: '👨‍⚕️', bg_color: '#dbeafe', available: true },
  { name: 'Dr. Meena Joshi', specialization: 'General Physician', experience_yrs: 10, fee: 450, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
  { name: 'Dr. Kavita Singh', specialization: 'Cardiologist', experience_yrs: 12, fee: 850, emoji: '👩‍⚕️', bg_color: '#ede9fe', available: true },
  { name: 'Dr. Leena Bose', specialization: 'Ophthalmologist', experience_yrs: 20, fee: 700, emoji: '👩‍⚕️', bg_color: '#ede9fe', available: true },
  { name: 'Dr. Rashmi Gupta', specialization: 'Dermatologist', experience_yrs: 12, fee: 650, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
  { name: 'Dr. Anjali Verma', specialization: 'Gynecologist', experience_yrs: 17, fee: 800, emoji: '👩‍⚕️', bg_color: '#fce7f3', available: true },
  { name: 'Dr. Vikram Malhotra', specialization: 'Cardiologist', experience_yrs: 22, fee: 1200, emoji: '👨‍⚕️', bg_color: '#e0f2fe', available: true },
  { name: 'Dr. Sneha Kulkarni', specialization: 'Neurologist', experience_yrs: 14, fee: 1100, emoji: '👩‍⚕️', bg_color: '#f5f3ff', available: true },
  { name: 'Dr. Rajesh Deshmukh', specialization: 'Orthopedic Surgeon', experience_yrs: 19, fee: 950, emoji: '👨‍⚕️', bg_color: '#ecfdf5', available: true },
  { name: 'Dr. Ishita Bhardwaj', specialization: 'Gynecologist', experience_yrs: 11, fee: 850, emoji: '👩‍⚕️', bg_color: '#fff1f2', available: true },
  { name: 'Dr. Amitav Ghosh', specialization: 'Pediatrician', experience_yrs: 15, fee: 750, emoji: '👨‍⚕️', bg_color: '#fefce8', available: true },
  { name: 'Dr. Pooja Reddy', specialization: 'Dentist', experience_yrs: 9, fee: 600, emoji: '👩‍⚕️', bg_color: '#fff7ed', available: true },
  { name: 'Dr. Sanjay Singhania', specialization: 'General Physician', experience_yrs: 25, fee: 500, emoji: '👨‍⚕️', bg_color: '#f0f9ff', available: true },
  { name: 'Dr. Neha Agarwal', specialization: 'Dermatologist', experience_yrs: 8, fee: 700, emoji: '👩‍⚕️', bg_color: '#fdf2f8', available: true },
  { name: 'Dr. Aditya Roy', specialization: 'Ophthalmologist', experience_yrs: 12, fee: 650, emoji: '👨‍⚕️', bg_color: '#eff6ff', available: true },
  { name: 'Dr. Kiran Rao', specialization: 'Psychiatrist', experience_yrs: 18, fee: 1500, emoji: '👨‍⚕️', bg_color: '#f5f3ff', available: true }
];

/**
 * High-level Firebase Services exposed globally for all pages
 */
const QuickMedFirebase = {
  app,
  db,
  auth,
  config: firebaseConfig,

  // 1. Fetch all doctors from Firestore (with automatic seeding if empty)
  async getDoctors() {
    try {
      const doctorsRef = collection(db, 'doctors');
      let snap = await getDocs(doctorsRef);
      
      // If collection is empty, automatically seed initial doctors
      if (snap.empty) {
        console.log('⚡ Auto-seeding doctors to Firebase Firestore...');
        for (const docData of INITIAL_DOCTORS) {
          await addDoc(doctorsRef, { ...docData, createdAt: new Date().toISOString() });
        }
        snap = await getDocs(doctorsRef);
      }

      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Support both uppercase & lowercase for backwards compatibility
          ID: d.id,
          NAME: data.name,
          SPECIALIZATION: data.specialization,
          EXPERIENCE_YRS: data.experience_yrs,
          FEE: data.fee,
          AVAILABLE: data.available !== false ? 1 : 0,
          EMOJI: data.emoji || '👨‍⚕️',
          BG_COLOR: data.bg_color || '#dbeafe'
        };
      });
    } catch (err) {
      console.warn('Firebase direct fetch error:', err);
      throw err;
    }
  },

  // 2. Register user
  async registerUser({ name, email, password, phone }) {
    email = email.toLowerCase().trim();
    // Check if user document already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('Email already registered');
    }

    // Try creating with Firebase Auth (if enabled in project)
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
    } catch (authErr) {
      console.log('Firebase Auth note:', authErr.message);
      // Fallback: continue storing user document in Firestore users collection
    }

    // Save in Firestore `users` collection
    const newUser = {
      name: name.trim(),
      email,
      phone: phone ? phone.trim() : '',
      role: 'patient',
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(usersRef, newUser);
    return { id: ref.id, ...newUser };
  },

  // 3. Login user
  async loginUser({ email, password }) {
    const identifier = email.toLowerCase().trim();
    const usersRef = collection(db, 'users');
    
    // Check by email
    let q = query(usersRef, where('email', '==', identifier));
    let snap = await getDocs(q);

    // If not found by email, check by name
    if (snap.empty) {
      q = query(usersRef, where('name', '==', email.trim()));
      snap = await getDocs(q);
    }

    if (snap.empty) {
      // Also check Admin hardcoded fallback if Firestore users collection hasn't been seeded yet
      if (identifier === 'admin@quickmed.com' && password === 'admin123') {
        return {
          id: 'admin_local',
          name: 'Admin',
          email: 'admin@quickmed.com',
          role: 'admin',
          token: 'fb_token_' + Date.now()
        };
      }
      throw new Error('User not found. Please register first.');
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    // Check Firebase Auth if available, otherwise approve session
    try {
      await signInWithEmailAndPassword(auth, userData.email, password);
    } catch (e) {
      console.log('Firebase Auth sign-in note:', e.message);
    }

    return {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || (userData.email === 'admin@quickmed.com' ? 'admin' : 'patient'),
      token: 'fb_token_' + Date.now()
    };
  },

  // 4. Book appointment
  async bookAppointment(appointmentData) {
    const apptsRef = collection(db, 'appointments');
    const docRef = await addDoc(apptsRef, {
      ...appointmentData,
      status: 'Upcoming',
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...appointmentData };
  },

  // 5. Get user appointments
  async getUserAppointments(userEmail) {
    const apptsRef = collection(db, 'appointments');
    const q = query(apptsRef, where('user_email', '==', userEmail.toLowerCase().trim()));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        PATIENT_NAME: data.patient_name,
        SPECIALIST: data.specialist,
        DATE: data.date,
        TIME: data.time,
        STATUS: data.status || 'Upcoming'
      };
    });
  },

  // 6. Admin: Get all users & appointments
  async getAdminData() {
    const usersSnap = await getDocs(collection(db, 'users'));
    const apptsSnap = await getDocs(collection(db, 'appointments'));
    return {
      users: usersSnap.docs.map(d => ({ id: d.id, ...d.data(), NAME: d.data().name, EMAIL: d.data().email, ROLE: d.data().role || 'patient' })),
      appointments: apptsSnap.docs.map(d => ({ id: d.id, ...d.data(), PATIENT_NAME: d.data().patient_name, SPECIALIST: d.data().specialist, DATE: d.data().date, TIME: d.data().time, STATUS: d.data().status || 'Upcoming' }))
    };
  }
};

// Mount to window for easy access across all existing scripts
window.QuickMedFirebase = QuickMedFirebase;
export default QuickMedFirebase;
