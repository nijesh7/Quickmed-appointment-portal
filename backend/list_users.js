const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function listUsers() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });
    const result = await conn.execute(`SELECT id, name, email, role FROM users ORDER BY id DESC FETCH FIRST 5 ROWS ONLY`);
    console.log('Recent Users:');
    console.table(result.rows);
  } catch (err) {
    console.error('✗ Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
}

listUsers();
