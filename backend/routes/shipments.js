// backend/routes/shipments.js
import express from "express";
import XLSX from "xlsx";
import fs from "fs";
import Shipment from "../models/Shipment.js";
import { create, update, list, get, dashboard, sendTrackingMail, bulkUpload } from "../controllers/shipments.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// =======================
// BASIC SHIPMENT ROUTES
// =======================
router.post("/", create);
router.put("/:id", update);
router.get("/", list);
router.get("/:id", get);

// =======================
// DASHBOARD
// =======================
router.get("/dashboard/summary", dashboard);

// =======================
// EMAIL
// =======================
router.post("/send-mail", sendTrackingMail);

// =======================
// BULK UPLOAD
// =======================
router.post("/bulk-upload", upload.single("file"), bulkUpload);

// =======================
// DELIVERY STATUS UPDATE
// =======================
router.patch("/:id/delivery-status", async (req, res) => {
  const { id } = req.params;
  const { delivery_status } = req.body;

  try {
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      { delivery_status },
      { new: true }
    );

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update delivery status" });
  }
});

// =======================
// STATUS UPDATE (ACTIVE/CANCELLED)
// =======================
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// =======================
// MANUAL DESCRIPTION UPDATE
// =======================
router.put("/:id/manual-desc", async (req, res) => {
  const { id } = req.params;
  const { manual_desc } = req.body;

  try {
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      { manual_desc },
      { new: true }
    );

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update manual description" });
  }
});

export default router;

