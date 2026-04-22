const db = require('./db');

async function test() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    await c.execute(`INSERT INTO appointments (patient_name, age, gender, specialist, "date", "time", description) VALUES (:patient_name, :age, :gender, :specialist, :p_date, :p_time, :description)`, 
    { patient_name: 'test', age: 20, gender: 'Male', specialist: 'Cardiology', p_date: '2026-04-24', p_time: '10:00 AM', description: 'test' });
    await c.commit();
    console.log('Insert OK');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}
test();
