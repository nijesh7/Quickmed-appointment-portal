const db = require('./db');

async function run() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    await c.execute("BEGIN EXECUTE IMMEDIATE 'DROP TABLE appointment_bookings CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;");
  } catch (e) {}

  await c.execute(`
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
    )
  `);
  await c.commit();
  console.log('Created appointment_bookings table');
  process.exit(0);
}
run();
