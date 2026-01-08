// backend/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "erpdb",
  password: process.env.DB_PASSWORD || "6789",
  port: process.env.DB_PORT || 5432
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
  process.exit(1);
});

module.exports = pool;
