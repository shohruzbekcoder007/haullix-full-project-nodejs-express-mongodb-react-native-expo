// ========================================================
// HAULLIX LOGISTICS PLATFORM - BACKEND REST API
// Node.js + Express + MongoDB Mongoose
// ========================================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// MongoDB ga ulanish
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Profil rasmi base64 holida keladi, shuning uchun cheklov 2 MB
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Asosiy API yo'nalishlari
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/matching', require('./routes/matchingRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));

// Salomatlik tekshiruvi (Health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Haullix Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Xatoliklarni ushlash (Centralized Error Handler)
app.use((err, req, res, next) => {
  console.error('[Haullix Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Serverda ichki xatolik yuz berdi',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Haullix Server http://localhost:${PORT} portida ishga tushdi`);
});
