const db = require('./db');
const bcrypt = require('bcryptjs');

async function setup() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    console.log('Creating Quick Med tables with qm_ prefix...');

    // Drop tables if they exist
    const tablesToDrop = ['qm_appointments', 'qm_doctors', 'qm_users', 'qm_appointment_bookings'];
    for (const table of tablesToDrop) {
      try {
        await c.execute(`BEGIN EXECUTE IMMEDIATE 'DROP TABLE ${table} CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;`);
      } catch (e) {}
    }

    // 1. Create qm_users
    await c.execute(`
      CREATE TABLE qm_users (
        id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name        VARCHAR2(100)   NOT NULL,
        email       VARCHAR2(150)   NOT NULL UNIQUE,
        password    VARCHAR2(255)   NOT NULL,
        phone       VARCHAR2(20),
        role        VARCHAR2(20)    DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
        created_at  TIMESTAMP       DEFAULT SYSTIMESTAMP
      )
    `);

    // 2. Create qm_doctors
    await c.execute(`
      CREATE TABLE qm_doctors (
        id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name            VARCHAR2(100)   NOT NULL,
        specialization  VARCHAR2(100)   NOT NULL,
        experience_yrs  NUMBER(3),
        fee             NUMBER(10, 2),
        available       NUMBER(1)       DEFAULT 1,
        emoji           VARCHAR2(20)    DEFAULT '👨‍⚕️',
        bg_color        VARCHAR2(20)    DEFAULT '#dbeafe'
      )
    `);

    // 3. Create qm_appointments
    await c.execute(`
      CREATE TABLE qm_appointments (
        id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        patient_name  VARCHAR2(100)   NOT NULL,
        age           NUMBER(3)       NOT NULL,
        gender        VARCHAR2(20)    NOT NULL,
        specialist    VARCHAR2(100)   NOT NULL,
        "date"        VARCHAR2(20)    NOT NULL,
        "time"        VARCHAR2(20)    NOT NULL,
        description   VARCHAR2(500),
        user_email    VARCHAR2(150)
      )
    `);

    // 4. Create qm_appointment_bookings
    await c.execute(`
      CREATE TABLE qm_appointment_bookings (
        id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        patient_name  VARCHAR2(100)   NOT NULL,
        age           NUMBER(3)       NOT NULL,
        gender        VARCHAR2(20)    NOT NULL,
        specialist    VARCHAR2(100)   NOT NULL,
        appt_date     VARCHAR2(20)    NOT NULL,
        time_slot     VARCHAR2(20)    NOT NULL,
        description   VARCHAR2(500),
        status        VARCHAR2(20)    DEFAULT 'upcoming',
        created_at    TIMESTAMP       DEFAULT SYSTIMESTAMP
      )
    `);

    console.log('Inserting seed data...');

    // Seed Admin
    const adminPass = await bcrypt.hash('admin123', 10);
    await c.execute(
      `INSERT INTO qm_users (name, email, password, phone, role) VALUES ('Admin', 'admin@quickmed.com', :pw, '9999999999', 'admin')`,
      { pw: adminPass }
    );

    // Seed Patient
    const patientPass = await bcrypt.hash('patient123', 10);
    await c.execute(
      `INSERT INTO qm_users (name, email, password, phone, role) VALUES ('Rahul Sharma', 'rahul@gmail.com', :pw, '9876543210', 'patient')`,
      { pw: patientPass }
    );

    // Seed Doctors
    const doctors = [
      ['Dr. Arjun Mehta', 'Cardiologist', 18, 900, '👨‍⚕️', '#dbeafe'],
      ['Dr. Priya Sharma', 'Neurologist', 15, 1000, '👩‍⚕️', '#fce7f3'],
      ['Dr. Ravi Patel', 'Orthopedic Surgeon', 16, 800, '👨‍⚕️', '#d1fae5'],
      ['Dr. Ananya Iyer', 'Pediatrician', 13, 600, '👩‍⚕️', '#fef3c7'],
      ['Dr. Suresh Kumar', 'General Physician', 14, 500, '👨‍⚕️', '#dbeafe'],
      ['Dr. Meena Joshi', 'General Physician', 10, 450, '👩‍⚕️', '#fce7f3'],
      ['Dr. Kavita Singh', 'Cardiologist', 12, 850, '👩‍⚕️', '#ede9fe'],
      ['Dr. Leena Bose', 'Ophthalmologist', 20, 700, '👩‍⚕️', '#ede9fe'],
      ['Dr. Rashmi Gupta', 'Dermatologist', 12, 650, '👩‍⚕️', '#fce7f3'],
      ['Dr. Anjali Verma', 'Gynecologist', 17, 800, '👩‍⚕️', '#fce7f3']
    ];

    for (const doc of doctors) {
      await c.execute(
        `INSERT INTO qm_doctors (name, specialization, experience_yrs, fee, emoji, bg_color) VALUES (:1, :2, :3, :4, :5, :6)`,
        doc
      );
    }

    await c.commit();
    console.log('✅ Setup complete! Created tables with qm_ prefix and seeded data.');
    
  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    if (c) {
      try {
        await c.close();
      } catch (err) {
        console.error(err);
      }
    }
    process.exit(0);
  }
}

setup();
