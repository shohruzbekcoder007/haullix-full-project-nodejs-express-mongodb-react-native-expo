const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Telefon raqam kiritilishi shart'],
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'Ism kiritilishi shart'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Familiya kiritilishi shart'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['driver', 'cargo_owner', 'company'],
    default: 'driver',
  },
  companyName: {
    type: String,
    trim: true,
  },
  companyLogo: {
    type: String, // Korxona logotipi URL yoki base64
  },
  taxId: {
    type: String, // STIR / INN
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  completedTrips: {
    type: Number,
    default: 0,
  },
  vehicle: {
    brand: { type: String }, // MAN, Isuzu, Kamaz, Volvo va h.k.
    model: { type: String }, // TGS 18.400, NPR 75 va h.k.
    plateRegion: { type: String }, // 01, 10, 70, 30...
    plateNumber: { type: String }, // A 777 AA
    manufactureYear: { type: Number },
    maxPayloadTons: { type: Number },
    bodyType: {
      type: String,
      enum: ['tent', 'fura', 'bort', 'ref', 'isotherm', 'tipper', 'cistern'],
      default: 'tent'
    },
    ratePerKm: { type: Number, default: 7000 },
    minTripSum: { type: Number, default: 2500000 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
