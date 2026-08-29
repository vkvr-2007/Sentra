const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "secureflow_db",
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
});


// Report both API and database availability without exposing connection details.
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "OK",
      message: "SecureFlow API and PostgreSQL are available",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({
      status: "ERROR",
      message: "SecureFlow API is running but PostgreSQL is unavailable",
    });
  }
});

// Get all security events
app.get("/api/security-events", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, ip_address, threat_type, risk_level, status, event_time
      FROM public.security_events
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database query failed",
    });
  }
});

// Get threat summary
app.get("/api/threat-summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT threat_type, COUNT(*) AS total
      FROM public.security_events
      GROUP BY threat_type
      ORDER BY total DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database query failed",
    });
  }
});

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`SecureFlow API running on http://localhost:${PORT}`);
});