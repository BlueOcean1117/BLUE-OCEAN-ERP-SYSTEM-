const connectDB = require("./db/connect");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
//const { Pool } = require("pg");
const nodemailer = require("nodemailer");
//const Shipment = require("./models/Shipments");

const fileRoutes = require("./routes/files");
const mailRoutes = require("./routes/mail");
const shipmentRoutes = require("./routes/shipments");
let pool = null;
try {
  pool = require("./db");
} catch (e) {
  console.log('Postgres pool not available, continuing in Mongo mode');
}
//const pool = require("./db");



const app = express();

// CORS - configurable via environment. Default: allow all origins (use in production with care)
const corsOrigin = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true;
app.use(
  cors({ origin: corsOrigin, methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], credentials: true })
);

app.use(express.json());
//testing the connectivity of the database  
const mongoose = require("mongoose");

/* ======================
   TEMP: DB CONNECTION TEST
====================== */
app.get("/api/db-test", async (req, res) => {
  try {
    // Check mongoose connection state
    const state = mongoose.connection.readyState;

    /*
      0 = disconnected
      1 = connected
      2 = connecting
      3 = disconnecting
    */

    if (state === 1) {
      return res.json({
        success: true,
        message: "✅ MongoDB Atlas connected",
      });
    }

    return res.status(500).json({
      success: false,
      message: "❌ MongoDB not connected",
      state,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ MongoDB test failed",
      error: err.message,
    });
  }
});





//const PORT = process.env.PORT || 4000;
// Mock data for offline mode
/*const mockShipments = [
  {
    id: 1,
    enquiry_no: "QMRel-2024-0001",
    ff: "ABC Logistics",
    customer: "Tech Corp",
    invoice_no: "INV001",
    invoice_date: "2024-01-15",
    part_desc: "Engine Component",
    part_no: "PART001",
    part_qty: 100,
    box_size: "10x10x5",
    net_wt: 50.5,
    gross_wt: 55.0,
    package_type: "Box",
    mode: "Sea",
    dispatch_date: "2024-01-20",
    incoterm: "FOB",
    sb_no: "SB001",
    sb_date: "2024-01-18",
    etd: "2024-01-25",
    bl_no: "BL001",
    container_no: "CONT001",
    eta: "2024-02-10",
    final_delivery: "2024-02-15",
    total_cost: 5000.00,
    status: "ACTIVE",
    delivery_status: "IN_TRANSIT",
    manual_desc: "",
    created_at: "2024-01-10T00:00:00Z"
  },
  {
    id: 2,
    enquiry_no: "QMRel-2024-0002",
    ff: "XYZ Shipping",
    customer: "Auto Industries",
    invoice_no: "INV002",
    invoice_date: "2024-01-20",
    part_desc: "Transmission Gear",
    part_no: "PART002",
    part_qty: 50,
    box_size: "8x8x4",
    net_wt: 25.0,
    gross_wt: 28.0,
    package_type: "Crate",
    mode: "Air",
    dispatch_date: "2024-01-25",
    incoterm: "CIF",
    sb_no: "SB002",
    sb_date: "2024-01-22",
    etd: "2024-01-28",
    bl_no: "BL002",
    container_no: "CONT002",
    eta: "2024-02-01",
    final_delivery: "2024-02-05",
    total_cost: 7500.00,
    status: "ACTIVE",
    delivery_status: "DELIVERED",
    manual_desc: "",
    created_at: "2024-01-15T00:00:00Z"
  }
];

const mockDashboard = {
  totalShipments: 2,
  modeWise: [
    { mode: "Sea", count: 1 },
    { mode: "Air", count: 1 }
  ],
  statusWise: [
    { status: "ACTIVE", count: 2 }
  ]
};*/

/* ======================
   MIDDLEWARE
====================== */
// (CORS and json are configured above)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/shipments", shipmentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/mail", mailRoutes);

app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

/* ======================
   DATABASE
====================== */
//let dbConnected = false;

/*async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");
    const client = await pool.connect();
    console.log("🔍 Connected to pool, running test query...");
    await client.query('SELECT 1');
    client.release();
    console.log("✅ PostgreSQL connected successfully");
    dbConnected = true;
    console.log("🔍 dbConnected set to:", dbConnected);
    return true;
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    console.log("⚠️  Running in offline mode with mock data");
    dbConnected = false;
    return false;
  }
}

// Test connection on startup
testDatabaseConnection();
*/
/* ======================
   MAIL (SMTP - GMAIL)
====================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

if (process.env.MAIL_USER && process.env.MAIL_PASS) {
  transporter.verify((err) => {
    if (err) console.log("MAIL ERROR:", err);
    else console.log("MAIL READY");
  });
} else {
  console.log('MAIL not configured - skipping SMTP verification');
}

/* ======================
   HELPERS
====================== */
function cleanDate(v) {
  return v && v !== "" ? v : null;
}
function cleanNumber(v) {
  if (!v) return null;
  return Number(String(v).replace(/[^\d.-]/g, ""));
}

/* ======================
   TEST API (HEALTH CHECK)
====================== */
app.get("/api/test", (req, res) => {
  res.json({
    status: "OK",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString()
  });
});

/* ======================
   ENQUIRY NUMBER
====================== */
app.get("/api/enquiry-number", async (_, res) => {
  const year = new Date().getFullYear();

  try {
    const count = await require("/api/models/Shipment").countDocuments();
    const seq = count + 1;

    res.json({
      enquiryNo: `QMRel-${year}-${String(seq).padStart(4, "0")}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate enquiry number" });
  }
});

/* ======================
   FETCH ALL SHIPMENTS
   ====================== */
const Shipment = require("./models/Shipment");

app.get("/api/shipments", async (req, res) => {
  try {
    console.log("➡️ HIT /api/shipments");

    const shipments = await Shipment.find();
    console.log("📦 Shipments fetched:", shipments.length);

    res.json(shipments);
  } catch (err) {
    console.error("❌ SHIPMENTS API ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ======================
   DASHBOARD SUMMARY
====================== */
app.get("/api/shipments/dashboard/summary", async (_, res) => {
  try {
    const totalShipments = await Shipment.countDocuments();

    const modeWise = await Shipment.aggregate([
      { $group: { _id: "$mode", count: { $sum: 1 } } },
      { $project: { mode: "$_id", count: 1, _id: 0 } }
    ]);

    const statusWise = await Shipment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);

    res.json({ totalShipments, modeWise, statusWise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
});


/* ======================
   PART MASTER
====================== */
app.get("/api/parts/:partNo", async (req, res) => {
  if (!pool) return res.status(501).json({ error: 'Parts API requires Postgres pool (not configured)' });
  const r = await pool.query(
    "SELECT part_desc FROM parts_master WHERE part_no=$1",
    [req.params.partNo]
  );
  res.json(r.rows[0] || {});
});
app.post("/api/parts", async (req, res) => {
  const { part_no, part_desc } = req.body;

  if (!part_no || !part_desc) {
    return res.status(400).json({ error: "Missing data" });
  }

  if (!pool) return res.status(501).json({ error: 'Parts API requires Postgres pool (not configured)' });
  await pool.query(
    `INSERT INTO parts_master (part_no, part_desc)
     VALUES ($1, $2)
     ON CONFLICT (part_no) DO NOTHING`,
    [part_no, part_desc]
  );

  res.json({ success: true });
});


/* =======================
   SEND EMAIL (STEP 2)
====================== */
app.post("/api/shipments/send-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    await transporter.sendMail({
      from: `"Logistics ERP" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html: `<p>${message}</p>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* Test connection on startup
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ERP API running on port ${PORT}`);
  });
});
*/

 /* ======================
   START SERVER (AFTER DB)
====================== */
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB(); // attempt MongoDB Atlas connect if MONGO_URI set
  } catch (err) {
    console.error("⚠️ MongoDB connect failed:", err.message);
    console.log("⚠️ Continuing startup without MongoDB (degraded mode)");
  }

  // Start server regardless of Mongo status (Postgres or mocked routes may still work)
  app.listen(PORT, HOST, () => {
    console.log(`🚀 ERP API running on ${HOST}:${PORT}`);
  });
};

startServer();
