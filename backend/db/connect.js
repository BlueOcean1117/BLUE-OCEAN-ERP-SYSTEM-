// backend/db/connect.js
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI set; skipping MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error('Mongo connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;

