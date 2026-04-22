const db = require('./db');

async function run() {
  await db.initialize();
  const c = await db.getConnection();
  try {
    await c.execute("BEGIN EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;");
  } catch (e) {}

  await c.execute(`
    CREATE TABLE users (
      id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name        VARCHAR2(100)   NOT NULL,
      email       VARCHAR2(150)   NOT NULL UNIQUE,
      password    VARCHAR2(255)   NOT NULL,
      phone       VARCHAR2(20),
      role        VARCHAR2(20)    DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
      created_at  TIMESTAMP       DEFAULT SYSTIMESTAMP
    )
  `);

  // Insert Admin
  await c.execute(`INSERT INTO users (name, email, password, phone, role) VALUES ('Admin', 'admin@quickmed.com', '$2a$10$8K1p/LEstXpJe4GH4.Aj5OHzGQGxyMzU8IhVbGKL2qFqGpLjK4SHm', '9999999999', 'admin')`);
  
  // Insert Test User
  await c.execute(`INSERT INTO users (name, email, password, phone, role) VALUES ('Rahul Sharma', 'rahul@gmail.com', '$2a$10$8K1p/LEstXpJe4GH4.Aj5OHzGQGxyMzU8IhVbGKL2qFqGpLjK4SHm', '9876543210', 'patient')`);

  await c.commit();
  console.log('Created users table successfully!');
  process.exit(0);
}
run();
