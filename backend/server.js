const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { initialize, getDb, getMode } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'quickmed_jwt_secret_key_2026';

// Initialize Firebase Firestore
initialize();

// Helpers to format Firestore documents with backward compatibility for uppercase frontend keys
function formatUser(doc) {
  const u = typeof doc.data === 'function' ? doc.data() : doc;
  const id = doc.id || u.id;
  return {
    id,
    name: u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role || 'patient',
    created_at: u.created_at || u.createdAt || '',
    // Uppercase aliases
    ID: id,
    NAME: u.name || '',
    EMAIL: u.email || '',
    PHONE: u.phone || '',
    ROLE: u.role || 'patient',
    CREATED_AT: u.created_at || u.createdAt || ''
  };
}

function formatDoctor(doc) {
  const d = typeof doc.data === 'function' ? doc.data() : doc;
  const id = doc.id || d.id;
  return {
    id,
    name: d.name || '',
    specialization: d.specialization || '',
    experience_yrs: d.experience_yrs || 0,
    fee: d.fee || 0,
    available: d.available !== false ? 1 : 0,
    emoji: d.emoji || '👨‍⚕️',
    bg_color: d.bg_color || '#dbeafe',
    // Uppercase aliases
    ID: id,
    NAME: d.name || '',
    SPECIALIZATION: d.specialization || '',
    EXPERIENCE_YRS: d.experience_yrs || 0,
    FEE: d.fee || 0,
    AVAILABLE: d.available !== false ? 1 : 0,
    EMOJI: d.emoji || '👨‍⚕️',
    BG_COLOR: d.bg_color || '#dbeafe'
  };
}

function formatAppointment(doc) {
  const a = typeof doc.data === 'function' ? doc.data() : doc;
  const id = doc.id || a.id;
  return {
    id,
    patient_name: a.patient_name || '',
    age: a.age || '',
    gender: a.gender || '',
    specialist: a.specialist || '',
    date: a.date || a.appt_date || '',
    time: a.time || a.time_slot || '',
    description: a.description || '',
    user_email: a.user_email || '',
    status: a.status || 'Upcoming',
    created_at: a.created_at || a.createdAt || '',
    // Uppercase aliases
    ID: id,
    PATIENT_NAME: a.patient_name || '',
    AGE: a.age || '',
    GENDER: a.gender || '',
    SPECIALIST: a.specialist || '',
    DATE: a.date || a.appt_date || '',
    TIME: a.time || a.time_slot || '',
    DESCRIPTION: a.description || '',
    USER_EMAIL: a.user_email || '',
    STATUS: a.status || 'Upcoming',
    CREATED_AT: a.created_at || a.createdAt || ''
  };
}

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
// Serve frontend static directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = getDb();
    res.json({
      status: 'ok',
      database: 'firebase-firestore',
      mode: getMode()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

// Middleware: Authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Routes
// 1. Auth - Register
app.post('/api/auth/register', async (req, res) => {
  let { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  email = email.toLowerCase().trim();
  try {
    const db = getDb();
    console.log(`  → Register attempt: ${email} (password length: ${password.length})`);

    // Check if email already exists in Firestore
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name: name.trim(),
      email,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'patient',
      created_at: new Date().toISOString()
    };

    await db.collection('users').add(newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// 2. Auth - Login
app.post('/api/auth/login', async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const identifier = email.toLowerCase().trim();
  try {
    const db = getDb();
    console.log(`  → Login attempt: ${identifier}`);

    // Check by email
    let userDoc = null;
    let snap = await db.collection('users').where('email', '==', identifier).get();

    // If not found by email, check by name
    if (snap.empty) {
      snap = await db.collection('users').where('name', '==', email.trim()).get();
    }

    if (snap.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    userDoc = snap.docs[0];
    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(password, userData.password || userData.PASSWORD);

    if (!isMatch) {
      console.log(`  ✗ Password mismatch for user: ${identifier}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = userDoc.id;
    const token = jwt.sign(
      { id: userId, email: userData.email, role: userData.role || 'patient' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'patient'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// 3. Get Doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection('doctors').get();
    const doctors = snap.docs
      .map(doc => formatDoctor(doc))
      .filter(doc => doc.available !== 0 && doc.available !== false);

    res.json(doctors);
  } catch (err) {
    console.error('Doctors fetch error:', err);
    res.status(500).json({ message: 'Error fetching doctors', error: err.message });
  }
});

// 4. Book Appointment (Protected)
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { patient_name, age, gender, specialist, date, time, description } = req.body;
  const user_email = req.user.email;

  if (!patient_name || !age || !gender || !specialist || !date || !time) {
    return res.status(400).json({ message: 'All fields except description are required' });
  }

  try {
    const db = getDb();
    const appointmentData = {
      patient_name: patient_name.trim(),
      age: Number(age),
      gender: gender.trim(),
      specialist: specialist.trim(),
      date,
      time,
      description: description ? description.trim() : '',
      user_email,
      status: 'Upcoming',
      created_at: new Date().toISOString()
    };

    await db.collection('appointments').add(appointmentData);
    res.status(201).json({ message: 'Appointment Booked Successfully' });
  } catch (err) {
    console.error('Appointment booking error:', err);
    res.status(500).json({ message: 'Error booking appointment', error: err.message });
  }
});

// 4b. Get Appointments for patient (Protected)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection('appointments').where('user_email', '==', req.user.email).get();
    const appointments = snap.docs.map(doc => formatAppointment(doc));
    
    // Sort newest first
    appointments.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    res.json(appointments);
  } catch (err) {
    console.error('Appointments fetch error:', err);
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
});

// 5. Admin - View all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection('users').get();
    const users = snap.docs.map(doc => {
      const u = formatUser(doc);
      // Omit sensitive password
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        created_at: u.created_at,
        // Uppercase aliases
        ID: u.id,
        NAME: u.name,
        EMAIL: u.email,
        PHONE: u.phone,
        ROLE: u.role,
        CREATED_AT: u.created_at
      };
    });

    users.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    res.json(users);
  } catch (err) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// 6. Admin - View all appointments
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection('appointments').get();
    const appointments = snap.docs.map(doc => formatAppointment(doc));

    appointments.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    res.json(appointments);
  } catch (err) {
    console.error('Admin appointments fetch error:', err);
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 QuickMed Server running on port ${PORT}`);
  console.log(`🔥 Database Mode: ${getMode()}`);
  console.log(`🌐 API ready at http://localhost:${PORT}/api`);
});
