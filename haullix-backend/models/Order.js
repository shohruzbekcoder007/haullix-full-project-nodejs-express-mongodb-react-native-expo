const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Yuk nomini kiriting'],
  },
  cargoType: {
    type: String,
    required: true,
  },
  fromCity: {
    type: String,
    required: [true, 'Qayerdan yuk olinadi'],
  },
  toCity: {
    type: String,
    required: [true, 'Qayerga yetkaziladi'],
  },
  fromDistrict: String,
  toDistrict: String,
  weightTons: {
    type: Number,
    required: [true, 'Yuk vazni (tonna)'],
  },
  volumeM3: Number,
  bodyTypeRequired: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Tashish narxi'],
  },
  currency: {
    type: String,
    default: "so'm",
  },
  paymentType: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer'],
    default: 'cash',
  },
  departureDate: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'in_transit', 'completed', 'cancelled'],
    default: 'active',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ownerName: String,
  ownerPhone: String,
  ownerCompany: String,
  ownerLogo: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
