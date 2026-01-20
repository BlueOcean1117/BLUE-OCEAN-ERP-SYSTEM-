// backend/routes/shipments.js
const router = require("express").Router();
const ctrl = require("../controllers/shipments");
const upload = require("../middleware/upload");
const pool = require("../db");

// Basic CRUD
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);

// Dashboard summary
router.get("/dashboard/summary", ctrl.dashboard);

// Email
router.post("/send-mail", ctrl.sendTrackingMail);

// Bulk upload (file)
router.post("/bulk-upload", upload.single("file"), ctrl.bulkUpload);

// Update delivery status
router.patch("/:id/delivery-status", async (req, res) => {
  const { id } = req.params;
  const { delivery_status } = req.body;
  await pool.query("UPDATE shipments SET delivery_status = $1 WHERE id = $2", [delivery_status, id]);
  res.json({ success: true });
});

// Update status (ACTIVE/CANCELLED)
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query("UPDATE shipments SET status = $1 WHERE id = $2", [status, id]);
  res.json({ success: true });
});

// Update manual description
router.put("/:id/manual-desc", async (req, res) => {
  const { id } = req.params;
  const { manual_desc } = req.body;
  await pool.query("UPDATE shipments SET manual_desc = $1 WHERE id = $2", [manual_desc, id]);
  res.json({ success: true });
});

module.exports = router;
