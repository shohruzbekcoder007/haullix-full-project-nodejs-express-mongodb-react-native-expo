const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  arrivalTime: String, // "18:00"
  driverFee: Number,
  notes: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  cargoType: {
    type: String,
    required: [true, 'Tovar turi kiritilishi shart'],
    trim: true,
  },
  fromCity: {
    type: String,
    required: [true, 'Jo\'nash manzili kiritilishi shart'],
    trim: true,
  },
  toCity: {
    type: String,
    required: [true, 'Yetib borish manzili kiritilishi shart'],
    trim: true,
  },
  volumeM3: {
    type: Number,
    required: [true, 'Tovar hajmi kiritilishi shart'],
    min: [0.1, 'Tovar hajmi noto\'g\'ri'],
  },
  weightTons: Number,
  bodyTypeRequired: {
    type: String,
    default: 'tent',
  },
  price: {
    type: Number,
    required: [true, 'Summa kiritilishi shart'],
    min: [1, 'Summa noto\'g\'ri'],
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
  deliveryDate: {
    type: Date,
    required: [true, 'Yetib borish sanasi kiritilishi shart'],
  },
  // active: haydovchi kutilmoqda, in_transit: yo'lda, completed: yetkazildi
  status: {
    type: String,
    enum: ['active', 'in_transit', 'completed', 'cancelled'],
    default: 'active',
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  ownerName: String,
  ownerPhone: String,
  payerName: String,
  payerId: String,
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  driverName: String,
  driverPhone: String,
  acceptedAt: Date,
  completedAt: Date,
  review: ReviewSchema,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
