const express = require("express");
const Shipment = require("../models/Shipment");
const { Parser } = require("json2csv");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("REPORT ROUTES WORKING");
});

// Monthly CSV export via Mongo aggregation
router.get("/export/monthly/csv", async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = Number(month);
    const y = Number(year);

    const docs = await Shipment.aggregate([
      { $addFields: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
      { $match: { month: m, year: y } }
    ]);

    const parser = new Parser();
    const csv = parser.parse(docs);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=monthly-report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("CSV generation failed");
  }
});

module.exports = router;
