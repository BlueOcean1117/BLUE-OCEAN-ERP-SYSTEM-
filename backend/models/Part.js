const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  part_no: { type: String, required: true, unique: true },
  part_desc: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Part || mongoose.model('Part', partSchema);
