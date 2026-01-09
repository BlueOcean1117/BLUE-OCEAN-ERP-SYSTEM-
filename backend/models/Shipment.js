import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  enquiry_no: { type: String, required: true, unique: true },
  ff: { type: String },
  customer: { type: String },
  invoice_no: { type: String },
  invoice_date: { type: String },
  part_desc: { type: String },
  part_no: { type: String },
  part_qty: { type: Number },
  box_size: { type: String },
  net_wt: { type: Number },
  gross_wt: { type: Number },
  package_type: { type: String },
  mode: { type: String },
  dispatch_date: { type: String },
  incoterm: { type: String },
  sb_no: { type: String },
  sb_date: { type: String },
  etd: { type: String },
  bl_no: { type: String },
  container_no: { type: String },
  eta: { type: String },
  final_delivery: { type: String },
  total_cost: { type: Number },
  status: { type: String, default: 'ACTIVE' },
  delivery_status: { type: String, default: 'IN_PROCESS' },
  manual_desc: { type: String }
}, {
  timestamps: true
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;