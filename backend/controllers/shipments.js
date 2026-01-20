// backend/controllers/shipments.js
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const Shipment = require("../models/Shipment");
const Part = require("../models/Part");

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

    // Create via Mongoose
    const doc = await Shipment.create({ ...cleanData, status: cleanData.status || 'ACTIVE', delivery_status: cleanData.delivery_status || 'IN_PROCESS' });
    // ensure part saved in parts collection
    if (cleanData.part_no && cleanData.part_desc) {
      try {
        await Part.updateOne({ part_no: cleanData.part_no }, { $setOnInsert: { part_desc: cleanData.part_desc } }, { upsert: true });
      } catch (e) {
        console.log("Part save failed:", e.message);
      }
    }

    return res.json({ id: doc._id });

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

    // Update via Mongoose
    if (cleanData.part_no && cleanData.part_desc) {
      try {
        await Part.updateOne({ part_no: cleanData.part_no }, { $setOnInsert: { part_desc: cleanData.part_desc } }, { upsert: true });
      } catch (e) {
        console.log("Part save failed:", e.message);
      }
    }

    const updated = await Shipment.findByIdAndUpdate(id, cleanData, { new: true });
    if (!updated) return res.status(404).json({ message: 'not found' });
    return res.json({ message: 'updated', id: updated._id });

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
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) return res.status(404).json(null);
    return res.json(shipment);
  } catch (err) {
    console.error("Shipment get error:", err);
    return res.status(500).json(null);
  }
};
// =======================
// LIST
// =======================
 
exports.list = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 }).lean();
    return res.json(shipments);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
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

    const docs = rows.map((r) => ({
      enquiry_no: r.enquiry_no,
      ff: r.ff,
      customer: r.customer,
      invoice_no: r.invoice_no,
      invoice_date: r.invoice_date,
      part_no: r.part_no,
      part_desc: r.part_desc,
      part_qty: r.part_qty,
      net_wt: r.net_wt,
      gross_wt: r.gross_wt,
      mode: r.mode,
      bl_no: r.bl_no,
      container_no: r.container_no,
      etd: r.etd,
      eta: r.eta,
      final_delivery: r.final_delivery,
      total_cost: r.total_cost,
      status: r.status || 'ACTIVE'
    }));
    await Shipment.insertMany(docs);
    fs.unlinkSync(req.file.path);
    return res.json({ success: true, inserted: docs.length });

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

// Dashboard summary
exports.dashboard = async (req, res) => {
  try {
    const totalShipments = await Shipment.countDocuments();
    const modeAgg = await Shipment.aggregate([
      { $group: { _id: '$mode', count: { $sum: 1 } } }
    ]);
    const statusAgg = await Shipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const modeWise = modeAgg.map(m => ({ mode: m._id, count: m.count }));
    const statusWise = statusAgg.map(s => ({ status: s._id, count: s.count }));

    return res.json({ totalShipments, modeWise, statusWise });
  } catch (e) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};

async function ensurePartExists(part_no, part_desc) {
  if (!part_no || !part_desc) return;
  try {
    await Part.updateOne({ part_no }, { part_no, part_desc }, { upsert: true });
  } catch (e) {
    console.log('ensurePartExists error', e.message);
  }
}
