const db = require('./db');
const bcrypt = require('bcryptjs');

async function test() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    const hp = await bcrypt.hash('123456', 10);
    await c.execute(`INSERT INTO users (name, email, password, phone, role) VALUES (:name, :email, :p_password, :phone, 'patient')`, 
    { name: 'Test User', email: 'test3@example.com', p_password: hp, phone: '1234567890' });
    await c.commit();
    console.log('Insert OK');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}
test();
