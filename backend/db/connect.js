const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Atlas connected");
};

module.exports = connectDB;


