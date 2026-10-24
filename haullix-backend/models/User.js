const mongoose = require('mongoose');

// Ilovadagi asosiy rollar. 'company' eski yozuvlar uchun saqlangan (yuridik shaxs yuk egasi).
const ROLES = ['driver', 'cargo_owner'];

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
    enum: [...ROLES, 'company'],
    default: 'cargo_owner',
  },
  // Shaxs turi: jismoniy yoki yuridik
  entityType: {
    type: String,
    enum: ['individual', 'legal'],
    default: 'individual',
  },
  // Yuk bo'yicha: qabul qiluvchi yoki yuboruvchi (faqat yuk egasi uchun)
  cargoSide: {
    type: String,
    enum: ['receiver', 'sender'],
    default: 'receiver',
  },
  companyName: {
    type: String,
    trim: true,
  },
  companyLogo: {
    type: String, // Korxona logotipi URL yoki base64
  },
  // Profil rasmi (kichraytirilgan JPEG). Og'ir bo'lgani uchun so'rovlarda avtomatik olinmaydi
  avatar: {
    type: Buffer,
    select: false,
  },
  avatarUpdatedAt: Date,
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
  ratingCount: {
    type: Number,
    default: 0,
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

// Eski 'company' rolini yangi modelga o'tkazish
UserSchema.pre('save', function (next) {
  if (this.role === 'company') {
    this.role = 'cargo_owner';
    this.entityType = 'legal';
  }
  next();
});

UserSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', UserSchema);
