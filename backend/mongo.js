const mongoose = require('mongoose');

const connectMongo = async () => {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.log('No Mongo URI provided, skipping Mongo connection');
    return null;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    return mongoose;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    return null;
  }
};

module.exports = { connectMongo };
