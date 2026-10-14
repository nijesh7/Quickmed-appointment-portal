const db = require('./db');

async function addDoctors() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    console.log('Adding more Indian doctors to the database...');

    const doctors = [
      ['Dr. Vikram Malhotra', 'Cardiologist', 22, 1200, '👨‍⚕️', '#e0f2fe'],
      ['Dr. Sneha Kulkarni', 'Neurologist', 14, 1100, '👩‍⚕️', '#f5f3ff'],
      ['Dr. Rajesh Deshmukh', 'Orthopedic Surgeon', 19, 950, '👨‍⚕️', '#ecfdf5'],
      ['Dr. Ishita Bhardwaj', 'Gynecologist', 11, 850, '👩‍⚕️', '#fff1f2'],
      ['Dr. Amitav Ghosh', 'Pediatrician', 15, 750, '👨‍⚕️', '#fefce8'],
      ['Dr. Pooja Reddy', 'Dentist', 9, 600, '👩‍⚕️', '#fff7ed'],
      ['Dr. Sanjay Singhania', 'General Physician', 25, 500, '👨‍⚕️', '#f0f9ff'],
      ['Dr. Neha Agarwal', 'Dermatologist', 8, 700, '👩‍⚕️', '#fdf2f8'],
      ['Dr. Aditya Roy', 'Ophthalmologist', 12, 650, '👨‍⚕️', '#eff6ff'],
      ['Dr. Kiran Rao', 'Psychiatrist', 18, 1500, '👨‍⚕️', '#f5f3ff']
    ];

    for (const doc of doctors) {
      await c.execute(
        `INSERT INTO qm_doctors (name, specialization, experience_yrs, fee, emoji, bg_color) VALUES (:1, :2, :3, :4, :5, :6)`,
        doc
      );
    }

    await c.commit();
    console.log('✅ Success! Added 10 new Indian doctors.');
  } catch (err) {
    console.error('Error adding doctors:', err);
  } finally {
    if (c) await c.close();
    process.exit(0);
  }
}

addDoctors();
