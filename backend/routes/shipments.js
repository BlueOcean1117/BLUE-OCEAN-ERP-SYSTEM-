// backend/routes/shipments.js
const router = require("express").Router();
const ctrl = require("../controllers/shipments");

const XLSX = require("xlsx");
const fs = require("fs");
const pool = require("../db");
const upload = require("../middleware/upload"); // ✅ only once

// =======================
// BASIC SHIPMENT ROUTES
// =======================
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

// =======================
// DASHBOARD
// =======================
router.get("/dashboard/summary", ctrl.dashboard);

// =======================
// EMAIL
// =======================
router.post("/send-mail", ctrl.sendTrackingMail);

// =======================
// BULK UPLOAD
// =======================
router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const r of rows) {
      await pool.query(
        `INSERT INTO shipments (
          enquiry_no, customer, ff, invoice_no, invoice_date,
          part_no, part_desc, part_qty, net_wt, gross_wt,
          mode, bl_no, container_no, etd, eta, status
        ) VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16
        )`,
        [
          r.enquiry_no,
          r.customer,
          r.ff,
          r.invoice_no,
          r.invoice_date,
          r.part_no,
          r.part_desc,
          r.part_qty,
          r.net_wt,
          r.gross_wt,
          r.mode,
          r.bl_no,
          r.container_no,
          r.etd,
          r.eta,
          r.status || "ACTIVE"
        ]
      );
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, total: rows.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bulk upload failed" });
  }
});

// =======================
// DELIVERY STATUS
// =======================
router.patch("/:id/delivery-status", async (req, res) => {
  const { id } = req.params;
  const { delivery_status } = req.body;

  await pool.query(
    "UPDATE shipments SET delivery_status = $1 WHERE id = $2",
    [delivery_status, id]
  );

  res.json({ success: true });
});

// =======================
// STATUS UPDATE (ACTIVE/CANCELLED)
// =======================
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await pool.query(
    "UPDATE shipments SET status = $1 WHERE id = $2",
    [status, id]
  );

  res.json({ success: true });
});

// =======================
// MANUAL DESCRIPTION UPDATE
// =======================
router.put("/:id/manual-desc", async (req, res) => {
  const { id } = req.params;
  const { manual_desc } = req.body;

  await pool.query(
    "UPDATE shipments SET manual_desc = $1 WHERE id = $2",
    [manual_desc, id]
  );

  res.json({ success: true });
});

module.exports = router;
