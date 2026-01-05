// backend/routes/shipments.js
const router = require("express").Router();
const ctrl = require("../controllers/shipments");


const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const pool = require("../db"); // your existing DB connection
const upload = multer({dest: "uploads/"});
const upload = require("../middleware/upload");

router.post("/send-mail", ctrl.sendTrackingMail);
// AFTER nodemailer sends email successfully
res.json({ success: true, message: "Email sent" });
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.post("/bulk-upload",upload.single("file"),ctrl.bulkUpload);


router.get("/dashboard/summary", ctrl.dashboard);
router.get("/:id", ctrl.get);
router.get("/", ctrl.list);


// export endpoints
router.get("/:id/export/excel", ctrl.exportExcel); // stub
router.get("/:id/export/pdf", ctrl.exportPDF); // stub


// ===============================
// BULK SHIPMENT UPLOAD (EXCEL)
// ===============================
router.post(
  "/bulk-upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const client = await pool.connect();

      for (const r of rows) {
        await client.query(
          `INSERT INTO shipments (
            enquiry_no, customer, ff, invoice_no, invoice_date,
            part_no, part_desc, part_qty, net_wt, gross_wt,
            mode, bl_no, container_no, etd, eta, status
          )
          VALUES (
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

      client.release();
      fs.unlinkSync(req.file.path);

      res.json({
        message: "Bulk shipments uploaded successfully",
        total: rows.length
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Bulk upload failed" });
    }
  }
);


module.exports = router;
