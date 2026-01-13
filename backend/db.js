// backend/db.js
const { Pool } = require("pg");

let pool;
if (process.env.DATABASE_URL) {
  // When using a hosted Postgres (Heroku, Render, etc.), provide DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "erpdb",
    password: process.env.DB_PASSWORD || "6789",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432
  });
}

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
  // don't crash the process on transient errors here; let the server decide
});

module.exports = pool;
