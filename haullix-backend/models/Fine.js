const mongoose = require('mongoose');

const FineSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
  plateNumber: {
    type: String,
    required: true,
    index: true,
  },
  violationType: {
    type: String,
    required: true,
  },
  violationDate: String,
  violationTime: String,
  location: String,
  amount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  discountDaysLeft: {
    type: Number,
    default: 15,
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  radarName: String,
  speedRecorded: Number,
  speedAllowed: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Fine', FineSchema);
