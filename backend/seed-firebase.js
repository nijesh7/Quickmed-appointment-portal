/**
 * QuickMed Firebase Firestore Seed Script
 * 
 * Run with: `node seed-firebase.js`
 * Populates:
 * - Admin user (admin@quickmed.com / admin123)
 * - Test patient (rahul@gmail.com / patient123)
 * - 20 Indian doctors with specializations, fees, ratings, emojis
 */

const bcrypt = require('bcryptjs');
const { getDb, getMode } = require('./firebase');

const DOCTORS = [
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

async function seed() {
  console.log('🌱 Starting Firebase Firestore Seeding...');
  const db = getDb();
  console.log(`  Database Mode: ${getMode()}`);

  try {
    // 1. Seed Users
    console.log('  → Seeding users...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedPatientPassword = await bcrypt.hash('patient123', 10);

    const usersToSeed = [
      {
        name: 'Admin',
        email: 'admin@quickmed.com',
        password: hashedAdminPassword,
        phone: '9999999999',
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        password: hashedPatientPassword,
        phone: '9876543210',
        role: 'patient',
        created_at: new Date().toISOString()
      }
    ];

    for (const u of usersToSeed) {
      const snap = await db.collection('users').where('email', '==', u.email).get();
      if (snap.empty) {
        await db.collection('users').add(u);
        console.log(`    + Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`    ✓ User already exists: ${u.email}`);
      }
    }

    // 2. Seed Doctors
    console.log('  → Seeding doctors...');
    for (const doc of DOCTORS) {
      const snap = await db.collection('doctors').where('name', '==', doc.name).get();
      if (snap.empty) {
        await db.collection('doctors').add({
          ...doc,
          created_at: new Date().toISOString()
        });
        console.log(`    + Added doctor: ${doc.name} (${doc.specialization})`);
      } else {
        console.log(`    ✓ Doctor already exists: ${doc.name}`);
      }
    }

    console.log('✅ Firebase Firestore seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during Firebase seeding:', err);
  }
}

seed().then(() => {
  process.exit(0);
});
