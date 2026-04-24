const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    await conn.execute('SELECT 1 FROM DUAL');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Middleware: Authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Routes
// 1. Auth - Register
app.post('/api/auth/register', async (req, res) => {
  let { name, email, password, phone } = req.body;
  email = email.toLowerCase().trim();
  let conn;
  try {
    console.log(`  → Register attempt: ${email} (password length: ${password.length})`);
    const hashedPassword = await bcrypt.hash(password, 10);
    conn = await db.getConnection();
    
    await conn.execute(
      `INSERT INTO users (name, email, password, phone, role) VALUES (:name, :email, :p_password, :phone, 'patient')`,
      { name, email, p_password: hashedPassword, phone }
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    if (err.errorNum === 1) { // Unique constraint violation
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error registering user', error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// 2. Auth - Login
app.post('/api/auth/login', async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase().trim();
  let conn;
  try {
    conn = await db.getConnection();
    console.log(`  → Login attempt: ${email} (password length: ${password.length})`);
    const result = await conn.execute(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(:identifier) OR LOWER(name) = LOWER(:identifier)`,
      { identifier: email }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.PASSWORD);

    if (!isMatch) {
      console.log(`  ✗ Password mismatch for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.ID, email: user.EMAIL, role: user.ROLE },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
        role: user.ROLE
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  } finally {
    if (conn) await conn.close();
  }
});

// 3. Get Doctors
app.get('/api/doctors', async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.execute(`SELECT * FROM doctors WHERE available = 1`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching doctors' });
  } finally {
    if (conn) await conn.close();
  }
});

// 4. Book Appointment (Protected)
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { patient_name, age, gender, specialist, date, time, description } = req.body;
  const user_email = req.user.email;
  
  if (!patient_name || !age || !gender || !specialist || !date || !time) {
    return res.status(400).json({ message: 'All fields except description are required' });
  }
  
  let conn;
  try {
    conn = await db.getConnection();
    
    await conn.execute(
      `INSERT INTO appointments (patient_name, age, gender, specialist, "date", "time", description, user_email) 
       VALUES (:patient_name, :age, :gender, :specialist, :p_date, :p_time, :description, :user_email)`,
      { patient_name, age, gender, specialist, p_date: date, p_time: time, description: description || '', user_email }
    );

    res.status(201).json({ message: 'Appointment Booked Successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error booking appointment', error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// 4b. Get Appointments for patient (Protected)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.execute(
      `SELECT * FROM appointments WHERE user_email = :email ORDER BY id DESC`,
      { email: req.user.email }
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching appointments' });
  } finally {
    if (conn) await conn.close();
  }
});

// 5. Admin - View all users
app.get('/api/admin/users', async (req, res) => {
  // Simple auth check could be added here
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.execute(`SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  } finally {
    if (conn) await conn.close();
  }
});

// 6. Admin - View all appointments
app.get('/api/admin/appointments', async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.execute(
      `SELECT * FROM appointments ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching appointments' });
  } finally {
    if (conn) await conn.close();
  }
});

// Start Server
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database pool', err);
});
