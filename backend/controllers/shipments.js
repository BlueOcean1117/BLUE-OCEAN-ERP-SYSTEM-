// backend/controllers/shipments.js
import Shipment from '../models/Shipment.js';
import nodemailer from 'nodemailer';
import XLSX from 'xlsx';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// =======================
// CREATE SHIPMENT
// =======================
export const create = async (req, res) => {
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

    const shipment = new Shipment(cleanData);
    const savedShipment = await shipment.save();

    res.json({ id: savedShipment._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create shipment", error: err.message });
  }
};

// =======================
// UPDATE SHIPMENT
// =======================
export const update = async (req, res) => {
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

    const updatedShipment = await Shipment.findByIdAndUpdate(id, cleanData, { new: true });

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json(updatedShipment);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update shipment", error: err.message });
  }
};

// =======================
// GET ALL SHIPMENTS
// =======================
export const list = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch shipments", error: err.message });
  }
};

// =======================
// GET SINGLE SHIPMENT
// =======================
export const get = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    res.json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch shipment", error: err.message });
  }
};

// =======================
// DASHBOARD SUMMARY
// =======================
export const dashboard = async (req, res) => {
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

    res.json({
      totalShipments,
      modeWise,
      statusWise
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
  }
};

// =======================
// SEND TRACKING MAIL
// =======================
export const sendTrackingMail = async (req, res) => {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

// =======================
// BULK UPLOAD FROM EXCEL
// =======================
export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const shipments = [];
    for (const r of rows) {
      const shipmentData = {
        enquiry_no: r.enquiry_no,
        customer: r.customer,
        ff: r.ff,
        invoice_no: r.invoice_no,
        part_no: r.part_no,
        part_desc: r.part_desc,
        part_qty: r.part_qty ? Number(r.part_qty) : null,
        net_wt: r.net_wt ? Number(r.net_wt) : null,
        gross_wt: r.gross_wt ? Number(r.gross_wt) : null,
        mode: r.mode,
        bl_no: r.bl_no,
        container_no: r.container_no,
        etd: r.etd,
        eta: r.eta,
        final_delivery: r.final_delivery,
        total_cost: r.total_cost ? Number(r.total_cost) : null,
        status: 'ACTIVE'
      };
      shipments.push(shipmentData);
    }

    await Shipment.insertMany(shipments);
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
