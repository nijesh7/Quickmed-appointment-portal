const db = require('./db');

async function checkUsers() {
  let conn;
  try {
    await db.initialize();
    conn = await db.getConnection();
    const result = await conn.execute('SELECT id, name, email, password, role FROM users');
    console.log('Users in database:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
    process.exit(0);
  }
}

checkUsers();
