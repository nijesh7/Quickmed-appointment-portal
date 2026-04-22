const db = require('./db');

async function run() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    await c.execute("BEGIN EXECUTE IMMEDIATE 'DROP TABLE appointments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;");
  } catch (e) {}

  await c.execute(`
    CREATE TABLE appointments (
      id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      patient_name  VARCHAR2(100)   NOT NULL,
      age           NUMBER(3)       NOT NULL,
      gender        VARCHAR2(20)    NOT NULL,
      specialist    VARCHAR2(100)   NOT NULL,
      "date"        VARCHAR2(20)    NOT NULL,
      "time"        VARCHAR2(20)    NOT NULL,
      description   VARCHAR2(500)
    )
  `);
  await c.commit();
  console.log('Created appointments table successfully!');
  process.exit(0);
}
run();
