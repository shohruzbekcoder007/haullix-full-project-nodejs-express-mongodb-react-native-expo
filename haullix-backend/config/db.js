const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/haullix_db');
    console.log(`✅ MongoDB ga muvaffaqiyatli ulandi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB ulanishida xatolik: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
