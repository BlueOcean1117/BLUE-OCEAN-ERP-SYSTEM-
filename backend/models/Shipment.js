const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  enquiry_no: { type: String, unique: false },
  ff: String,
  customer: String,
  invoice_no: String,
  invoice_date: String,
  part_desc: String,
  part_no: String,
  part_qty: Number,
  box_size: String,
  net_wt: Number,
  gross_wt: Number,
  package_type: String,
  mode: String,
  dispatch_date: String,
  incoterm: String,
  sb_no: String,
  sb_date: String,
  etd: String,
  bl_no: String,
  container_no: String,
  eta: String,
  final_delivery: String,
  total_cost: Number,
  status: { type: String, default: 'ACTIVE' },
  delivery_status: { type: String, default: 'IN_PROCESS' },
  manual_desc: String
}, { timestamps: true });

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);
