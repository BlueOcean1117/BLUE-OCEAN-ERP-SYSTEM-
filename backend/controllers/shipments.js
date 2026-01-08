// backend/controllers/shipments.js
const { Pool } = require("pg");
const XLSX = require("xlsx"); // ✅ ADD
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '6789'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'erpdb'}`
});

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});
exports.create = async (req, res) => {
  console.log("Create shipment called with data:", req.body);
  try {

    // Clean data: convert empty strings to null, parse numbers
    const cleanData = {};
    for (const key in req.body) {
      if (req.body[key] === "") {
        cleanData[key] = null;
      } else if (["part_qty", "net_wt", "gross_wt", "total_cost"].includes(key)) {
        cleanData[key] = req.body[key] ? Number(req.body[key]) : null;
      } else {
        cleanData[key] = req.body[key];
      }
    }

    // If part_no and part_desc are provided and part doesn't exist, save it
    if (cleanData.part_no && cleanData.part_desc) {
      try {
        await pool.query(
          `INSERT INTO parts_master (part_no, part_desc)
           VALUES ($1, $2)
           ON CONFLICT (part_no) DO NOTHING`,
          [cleanData.part_no, cleanData.part_desc]
        );
      } catch (err) {
        console.log("Part save failed, continuing:", err.message);
      }
    }

    const q = `
      INSERT INTO shipments(
        enquiry_no, ff, customer, invoice_no, invoice_date,
        part_desc, part_no, part_qty, box_size,
        net_wt, gross_wt, package_type, mode,
        dispatch_date, incoterm, sb_no, sb_date,
        etd, bl_no, container_no, eta,
        final_delivery, total_cost, status, delivery_status, manual_desc
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
      )
      RETURNING id
    `;

    const vals = [
      cleanData.enquiry_no, cleanData.ff, cleanData.customer, cleanData.invoice_no, cleanData.invoice_date,
      cleanData.part_desc, cleanData.part_no, cleanData.part_qty, cleanData.box_size,
      cleanData.net_wt, cleanData.gross_wt, cleanData.package_type, cleanData.mode,
      cleanData.dispatch_date, cleanData.incoterm, cleanData.sb_no, cleanData.sb_date,
      cleanData.etd, cleanData.bl_no, cleanData.container_no, cleanData.eta,
      cleanData.final_delivery, cleanData.total_cost, 'ACTIVE', 'IN_PROCESS', cleanData.manual_desc
    ];

    const result = await pool.query(q, vals);
    res.json({ id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create shipment", error: err.message });
  }
};

// =======================
// UPDATE SHIPMENT
// =======================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Clean data: convert empty strings to null, parse numbers
    const cleanData = {};
    for (const key in data) {
      if (data[key] === "") {
        cleanData[key] = null;
      } else if (["part_qty", "net_wt", "gross_wt", "total_cost"].includes(key)) {
        cleanData[key] = data[key] ? Number(data[key]) : null;
      } else {
        cleanData[key] = data[key];
      }
    }

    // If part_no and part_desc are provided and part doesn't exist, save it
    if (cleanData.part_no && cleanData.part_desc) {
      try {
        await pool.query(
          `INSERT INTO parts_master (part_no, part_desc)
           VALUES ($1, $2)
           ON CONFLICT (part_no) DO NOTHING`,
          [cleanData.part_no, cleanData.part_desc]
        );
      } catch (err) {
        console.log("Part save failed, continuing:", err.message);
      }
    }

    const q = `
      UPDATE shipments SET
        enquiry_no=$1, ff=$2, customer=$3,
        invoice_no=$4, invoice_date=$5,
        part_desc=$6, part_no=$7, part_qty=$8,
        box_size=$9, net_wt=$10, gross_wt=$11,
        package_type=$12, mode=$13, dispatch_date=$14,
        incoterm=$15, sb_no=$16, sb_date=$17,
        etd=$18, bl_no=$19, container_no=$20,
        eta=$21, final_delivery=$22, total_cost=$23,
        manual_desc=$24
      WHERE id=$25
    `;

    const vals = [
      cleanData.enquiry_no, cleanData.ff, cleanData.customer, cleanData.invoice_no, cleanData.invoice_date,
      cleanData.part_desc, cleanData.part_no, cleanData.part_qty, cleanData.box_size,
      cleanData.net_wt, cleanData.gross_wt, cleanData.package_type, cleanData.mode,
      cleanData.dispatch_date, cleanData.incoterm, cleanData.sb_no, cleanData.sb_date,
      cleanData.etd, cleanData.bl_no, cleanData.container_no, cleanData.eta,
      cleanData.final_delivery, cleanData.total_cost, cleanData.manual_desc,
      id
    ];

    await pool.query(q, vals);
    res.json({ message: "updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "update failed", error: err.message });
  }
};

exports.sendTrackingMail = async (req, res) => {
  try {
    console.log("MAIL BODY:", req.body);

    const { notify_email, bl_no, container_no, etd, eta, email_message } = req.body;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: notify_email,
      subject: "Shipment Tracking Update",
      html: `
        <p><b>BL No:</b> ${bl_no}</p>
        <p><b>Container No:</b> ${container_no}</p>
        <p><b>ETD:</b> ${etd}</p>
        <p><b>ETA:</b> ${eta}</p>
        <p>${email_message || ""}</p>
      `
    });

    console.log("✅ MAIL SENT");
     res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ MAIL ERROR:", err.message);
   res.status(500).json({ success: false, error: err.message });
  }
};




// =======================
// GET ONE
// =======================
exports.get = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM shipments WHERE id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "fetch failed", error: err.message });
  }
};

// =======================
// LIST
// =======================
exports.list = async (req, res) => {
  try {
    const q = `
      SELECT * FROM shipments
      ORDER BY id DESC
      LIMIT 500
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "list failed", error: err.message });
  }
};

// ==================================================
// ✅ BULK UPLOAD FROM EXCEL (NEW)
// ==================================================
exports.bulkUpload = async (req, res) => {
  try {
    const XLSX = require("xlsx");
    const fs = require("fs");

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const r of rows) {
      await pool.query(
        `INSERT INTO shipments (
          customer, ff, invoice_no,
          part_no, part_desc, part_qty,
          net_wt, gross_wt, mode,
          bl_no, container_no,
          etd, eta, final_delivery,
          total_cost, status
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'ACTIVE'
        )`,
        [
          r.customer,
          r.ff,
          r.invoice_no,
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
          r.final_delivery,
          r.total_cost
        ]
      );
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      inserted: rows.length
    });

  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ error: "Bulk upload failed" });
  }
};

// =======================
// EXPORT STUBS
// =======================
exports.exportExcel = (req, res) => {
  res.status(501).json({ message: "Export Excel not implemented" });
};

exports.exportPDF = (req, res) => {
  res.status(501).json({ message: "Export PDF not implemented" });
};

//dashboard part 
exports.dashboard = async (req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*) FROM shipments`);
    const modeWise = await pool.query(`
      SELECT mode, COUNT(*) as count
      FROM shipments
      GROUP BY mode
    `);
    const statusWise = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM shipments
      GROUP BY status
    `);

    res.json({
      totalShipments: Number(total.rows[0].count),
      modeWise: modeWise.rows,
      statusWise: statusWise.rows
    });
  } catch (e) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};


async function ensurePartExists(part_no, part_desc) {
  if (!part_no || !part_desc) return;

  await pool.query(
    `INSERT INTO parts_master (part_no, part_desc)
     VALUES ($1, $2)
     ON CONFLICT (part_no) DO NOTHING`,
    [part_no, part_desc]
  );
}
