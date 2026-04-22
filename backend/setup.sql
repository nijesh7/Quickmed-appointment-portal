-- ============================================================
-- QuickMed — Oracle Database Setup
-- Run this script in SQL Developer or sqlplus to create
-- all tables and seed initial data.
-- ============================================================

-- ─── DROP existing tables (comment these out on first run if tables don't exist) ───
BEGIN EXECUTE IMMEDIATE 'DROP TABLE appointments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE doctors CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ═══════════════════════════════════════════════════════════
-- TABLE: users
-- ═══════════════════════════════════════════════════════════
CREATE TABLE users (
  id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR2(100)   NOT NULL,
  email       VARCHAR2(150)   NOT NULL UNIQUE,
  password    VARCHAR2(255)   NOT NULL,
  phone       VARCHAR2(20),
  role        VARCHAR2(20)    DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at  TIMESTAMP       DEFAULT SYSTIMESTAMP
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: doctors
-- ═══════════════════════════════════════════════════════════
CREATE TABLE doctors (
  id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            VARCHAR2(100)   NOT NULL,
  specialization  VARCHAR2(100)   NOT NULL,
  experience_yrs  NUMBER(3),
  fee             NUMBER(10, 2),
  available       NUMBER(1)       DEFAULT 1,
  emoji           VARCHAR2(20)    DEFAULT '👨‍⚕️',
  bg_color        VARCHAR2(20)    DEFAULT '#dbeafe'
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: appointments
-- ═══════════════════════════════════════════════════════════
CREATE TABLE appointments (
  id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_name  VARCHAR2(100)   NOT NULL,
  age           NUMBER(3)       NOT NULL,
  gender        VARCHAR2(20)    NOT NULL,
  specialist    VARCHAR2(100)   NOT NULL,
  date          VARCHAR2(20)    NOT NULL,
  time          VARCHAR2(20)    NOT NULL,
  description   VARCHAR2(500)
);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA: Admin user
-- Password: admin123 (bcrypt hash)
-- ═══════════════════════════════════════════════════════════
INSERT INTO users (name, email, password, phone, role)
VALUES ('Admin', 'admin@quickmed.com', '$2a$10$8K1p/LEstXpJe4GH4.Aj5OHzGQGxyMzU8IhVbGKL2qFqGpLjK4SHm', '9999999999', 'admin');

-- ═══════════════════════════════════════════════════════════
-- SEED DATA: Sample patient
-- Password: patient123 (bcrypt hash)
-- ═══════════════════════════════════════════════════════════
INSERT INTO users (name, email, password, phone, role)
VALUES ('Rahul Sharma', 'rahul@gmail.com', '$2a$10$8K1p/LEstXpJe4GH4.Aj5OHzGQGxyMzU8IhVbGKL2qFqGpLjK4SHm', '9876543210', 'patient');

-- ═══════════════════════════════════════════════════════════
-- SEED DATA: Doctors
-- ═══════════════════════════════════════════════════════════
INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Arjun Mehta', 'Cardiologist', 18, 900, '👨‍⚕️', '#dbeafe');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Priya Sharma', 'Neurologist', 15, 1000, '👩‍⚕️', '#fce7f3');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Ravi Patel', 'Orthopedic Surgeon', 16, 800, '👨‍⚕️', '#d1fae5');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Ananya Iyer', 'Pediatrician', 13, 600, '👩‍⚕️', '#fef3c7');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Suresh Kumar', 'General Physician', 14, 500, '👨‍⚕️', '#dbeafe');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Meena Joshi', 'General Physician', 10, 450, '👩‍⚕️', '#fce7f3');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Kavita Singh', 'Cardiologist', 12, 850, '👩‍⚕️', '#ede9fe');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Leena Bose', 'Ophthalmologist', 20, 700, '👩‍⚕️', '#ede9fe');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Rashmi Gupta', 'Dermatologist', 12, 650, '👩‍⚕️', '#fce7f3');

INSERT INTO doctors (name, specialization, experience_yrs, fee, emoji, bg_color)
VALUES ('Dr. Anjali Verma', 'Gynecologist', 17, 800, '👩‍⚕️', '#fce7f3');

-- ═══════════════════════════════════════════════════════════
-- TABLE: appointment_bookings (Simple — no login required)
-- ═══════════════════════════════════════════════════════════
BEGIN EXECUTE IMMEDIATE 'DROP TABLE appointment_bookings CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

CREATE TABLE appointment_bookings (
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
);

COMMIT;

-- ═══════════════════════════════════════════════════════════
-- VERIFY
-- ═══════════════════════════════════════════════════════════
SELECT 'Users:' AS info, COUNT(*) AS cnt FROM users
UNION ALL
SELECT 'Doctors:', COUNT(*) FROM doctors
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM appointments;
