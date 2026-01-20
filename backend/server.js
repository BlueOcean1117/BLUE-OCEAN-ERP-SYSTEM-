const connectDB = require("./db/connect");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const nodemailer = require("nodemailer");


const fileRoutes = require("./routes/files");
const mailRoutes = require("./routes/mail");
const shipmentRoutes = require("./routes/shipments");
// Postgres removed: only MongoDB (Mongoose) is used now.





const app = express();

// CORS - configurable via environment. Default: allow all origins (use in production with care)

const allowedOrigins = [
  "https://blue-ocean-erp-system-1.vercel.app",
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // in dev it's fine to allow local origins; otherwise block
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

app.options("*", cors());


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

// Simple root route for quick checks
app.get('/', (req, res) => {
  res.send('ERP Backend running. Use /api/test for health.');
});

/* ======================
   ENQUIRY NUMBER
====================== */
app.get("/api/enquiry-number", async (_, res) => {
  const year = new Date().getFullYear();

  try {
    const count = await require("./models/Shipment").countDocuments();
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
    console.log("➡️ MongoDB /api/shipments hit");

    const shipments = await Shipment.find().lean();
    res.json(shipments);
  } catch (err) {
    console.error("❌ MongoDB fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ======================
   DASHBOARD SUMMARY
====================== */
app.get("/api/dashboard/summary", async (req, res) => {
  try {
    const totalShipments = await Shipment.countDocuments();
    const activeShipments = await Shipment.countDocuments({ status: "ACTIVE" });
    const deliveredShipments = await Shipment.countDocuments({ delivery_status: "DELIVERED" });
    const inTransitShipments = await Shipment.countDocuments({ delivery_status: "IN_TRANSIT" });

    res.json({
      totalShipments,
      activeShipments,
      deliveredShipments,
      inTransitShipments
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Dashboard summary failed" });
  }
});



/* ======================
   PART MASTER
====================== */
const Part = require("./models/Part");

app.get("/api/parts/:partNo", async (req, res) => {
  try {
    const p = await Part.findOne({ part_no: req.params.partNo }).lean();
    res.json(p || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/parts", async (req, res) => {
  try {
    const { part_no, part_desc } = req.body;
    if (!part_no || !part_desc) return res.status(400).json({ error: "Missing data" });
    await Part.updateOne({ part_no }, { part_no, part_desc }, { upsert: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
