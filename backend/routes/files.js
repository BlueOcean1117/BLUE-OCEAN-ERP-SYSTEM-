// backend/routes/files.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadFolder = path.join(__dirname, "..", "uploads");

if(!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb)=> cb(null, uploadFolder),
  filename: (req, file, cb)=> cb(null, Date.now()+"_"+file.originalname)
});

const upload = multer({ storage });

router.post("/upload", upload.array("files", 10), (req, res)=>{
  // return URLs (local paths) — in prod upload to S3 and return public URLs
  const files = req.files.map(f => ({ filename: f.filename, url: `/uploads/${f.filename}` }));
  res.json(files);
});

export default router;
