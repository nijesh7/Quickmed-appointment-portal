const oracledb = require('oracledb');
require('dotenv').config();

async function checkSchema() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });
    
    const result = await conn.execute(`
      SELECT column_name, data_type, data_length 
      FROM all_tab_columns 
      WHERE table_name = 'USERS'
    `);
    console.table(result.rows);
  } catch (err) {
    console.error('✗ Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
}

checkSchema();
