import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
  meta: Object
});

const File = mongoose.model('File', FileSchema);

export default File;
