import express from "express";
import { sendTrackingMail } from "../controllers/mailController.js";

const router = express.Router();

router.post("/send", sendTrackingMail);

export default router;

