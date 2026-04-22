/**
 * Oracle Database Connection Pool
 * 
 * Uses oracledb to create a connection pool on startup.
 * All routes use getConnection() to borrow a connection from the pool.
 */

const oracledb = require('oracledb');
require('dotenv').config();

// Use thin mode (no Oracle Instant Client required for oracledb 6.x+)
// If you have Instant Client, you can remove this and use thick mode
try {
  oracledb.initOracleClient();
  console.log('  → Oracle Thick mode enabled (Instant Client found)');
} catch (err) {
  console.log('  → Oracle Thin mode (no Instant Client needed)');
}

// Return rows as objects instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// Auto-commit by default
oracledb.autoCommit = true;

/**
 * Initialize the connection pool
 */
async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('  ✓ Oracle DB connection pool created');
  } catch (err) {
    console.error('  ✗ Oracle DB connection failed:', err.message);
    throw err;
  }
}

/**
 * Get a connection from the pool
 */
async function getConnection() {
  return await oracledb.getConnection();
}

/**
 * Close the connection pool on shutdown
 */
async function close() {
  try {
    await oracledb.getPool().close(2);
    console.log('  ✓ Oracle DB pool closed');
  } catch (err) {
    console.error('  ✗ Error closing Oracle pool:', err.message);
  }
}

module.exports = { initialize, getConnection, close };
