import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import nodemailer from "nodemailer";

import connectDB from "./db/connect.js";
import shipmentRoutes from "./routes/shipments.js";
import fileRoutes from "./routes/files.js";
import mailRoutes from "./routes/mail.js";

const app = express();
const PORT = process.env.PORT || 4000;

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: ["https://blue-ocean-erp-system-1.vercel.app"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ======================
   ROUTES
====================== */
app.use("/api/shipments", shipmentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/mail", mailRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    status: "OK",
    database: "MongoDB Atlas"
  });
});

/* ======================
   MAIL
====================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.verify(err => {
  if (err) console.log("MAIL ERROR:", err);
  else console.log("MAIL READY");
});

/* ======================
   START SERVER
====================== */
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 ERP API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
