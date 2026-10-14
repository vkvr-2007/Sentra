const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
require("dotenv").config();

const app = express();

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted && character === '"' && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.filter((record) => record.length === headers.length).map((record) => {
    const event = Object.fromEntries(headers.map((header, index) => [header, record[index]]));
    const statusByAction = { allowed: "Resolved", alerted: "Review", blocked: "Blocked", quarantined: "Blocked" };
    const severity = event.severity || event.risk_level;
    return {
      ...event,
      id: Number(event.event_id || event.id),
      ip_address: event.src_ip || event.ip_address,
      risk_level: severity === "Informational" ? "Low" : severity,
      status: statusByAction[event.action] || event.status || "Review",
      event_time: event.timestamp || event.event_time,
    };
  });
}

const fallbackCsvPath = resolve(__dirname, process.env.SAMPLE_LOGS_CSV || "../sample-network-logs.csv");
const fallbackEvents = parseCsv(readFileSync(fallbackCsvPath, "utf8"))
  .sort((left, right) => right.id - left.id);

app.use(express.json());
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "secureflow_db",
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
  connectionTimeoutMillis: 1500,
});


// Report both API and database availability without exposing connection details.
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "OK",
      database: "connected",
      message: "SecureFlow API and PostgreSQL are available",
    });
  } catch (error) {
    console.warn("Health check failed; using bundled CSV data:", error.message);
    res.json({
      status: "OK",
      database: "unavailable",
      message: "PostgreSQL is unavailable; serving sample-network-logs.csv",
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
    console.warn("Security event query failed; using bundled CSV data:", error.message);
    res.json(fallbackEvents);
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
    console.warn("Threat summary query failed; using bundled CSV data:", error.message);
    const totals = fallbackEvents.reduce((counts, event) => {
      counts[event.threat_type] = (counts[event.threat_type] || 0) + 1;
      return counts;
    }, {});
    res.json(Object.entries(totals)
      .map(([threat_type, total]) => ({ threat_type, total }))
      .sort((left, right) => right.total - left.total));
  }
});

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`SecureFlow API running on http://localhost:${PORT}`);
});