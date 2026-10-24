const mongoose = require('mongoose');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { normalizePhone, isValidUzPhone } = require('../utils/phone');

// In-memory OTP ombori (Productionda Redis tavsiya etiladi)
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;

const PROFILE_FIELDS = ['firstName', 'lastName', 'entityType', 'cargoSide', 'companyName', 'companyLogo', 'taxId'];

const pickProfile = (body) => {
  const data = {};
  PROFILE_FIELDS.forEach((field) => {
    if (typeof body[field] === 'string') data[field] = body[field].trim();
  });
  if (body.vehicle && typeof body.vehicle === 'object') data.vehicle = body.vehicle;
  return data;
};

// 1. SMS Kod yuborish (60 soniya cheklov bilan)
exports.sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!isValidUzPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Telefon raqam noto\'g\'ri. Masalan: 90 123 45 67' });
    }

    const lastOtp = otpStore.get(phone);
    const now = Date.now();

    // 60 soniya ichida qayta yuborishga yo'l qo'ymaslik
    if (lastOtp && now - lastOtp.timestamp < OTP_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - (now - lastOtp.timestamp)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Iltimos kuting. Yangi SMS yuborish uchun ${waitSeconds} soniya qoldi`,
        cooldownSeconds: waitSeconds,
      });
    }

    // Demo SMS kod (haqiqiy tizimda Eskiz.uz yoki PlayMobile SMS API ulanadi)
    const code = process.env.OTP_DEMO_CODE || '1234';
    otpStore.set(phone, { code, timestamp: now });

    res.status(200).json({
      success: true,
      message: 'SMS tasdiqlash kodi muvaffaqiyatli yuborildi',
      cooldownSeconds: OTP_COOLDOWN_MS / 1000,
      demoCode: code, // SMS provayder ulanmaguncha
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. SMS Kodni tekshirish
exports.verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();
    const stored = otpStore.get(phone);

    if (!stored || Date.now() - stored.timestamp > OTP_TTL_MS) {
      return res.status(400).json({ success: false, message: 'SMS kod eskirgan. Kodni qayta so\'rang' });
    }
    if (stored.code !== code) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri SMS kod kiritildi' });
    }

    otpStore.delete(phone);

    const user = await User.findOne({ phone });

    res.status(200).json({
      success: true,
      isNewUser: !user,
      token: signToken(phone),
      user: user || { phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Profilni yaratish yoki tahrirlash (telefon tokendan olinadi)
exports.saveProfile = async (req, res) => {
  try {
    const data = pickProfile(req.body);
    const { role } = req.body;

    if (role !== undefined && !User.ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol noto\'g\'ri tanlangan' });
    }
    if (role) data.role = role;

    let user = req.user;
    if (user) {
      Object.assign(user, data);
      await user.save();
    } else {
      if (!data.firstName || !data.lastName) {
        return res.status(400).json({ success: false, message: 'Ism va familiyani kiriting' });
      }
      user = await User.create({ ...data, phone: req.phone, isVerified: true });
    }

    res.status(200).json({ success: true, message: 'Profil muvaffaqiyatli saqlandi', user });
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

// 4. Foydalanuvchi rolini o'zgartirish (Yuk egasi <-> Haydovchi)
exports.switchRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!User.ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol noto\'g\'ri tanlangan' });
    }

    req.user.role = role;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: `Rol muvaffaqiyatli o'zgartirildi: ${role === 'cargo_owner' ? 'Yuk egasi' : 'Haydovchi'}`,
      role,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Joriy foydalanuvchi profili
exports.getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const MAX_AVATAR_BYTES = 1024 * 1024;

// 6. Profil rasmini yuklash: { image: "<base64 JPEG>" } (data: prefiksi bilan yoki usiz)
exports.uploadAvatar = async (req, res) => {
  try {
    const base64 = String(req.body.image || '').replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    // JPEG fayllari FF D8 FF baytlari bilan boshlanadi
    const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if (!isJpeg) {
      return res.status(400).json({ success: false, message: 'Rasm formati noto\'g\'ri' });
    }
    if (buffer.length > MAX_AVATAR_BYTES) {
      return res.status(413).json({ success: false, message: 'Rasm hajmi juda katta (1 MB gacha)' });
    }

    req.user.avatar = buffer;
    req.user.avatarUpdatedAt = new Date();
    await req.user.save();
    req.user.avatar = undefined;

    res.status(200).json({ success: true, message: 'Profil rasmi yangilandi', user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Profil rasmini o'chirish
exports.deleteAvatar = async (req, res) => {
  try {
    req.user.avatar = undefined;
    req.user.avatarUpdatedAt = undefined;
    await req.user.save();
    res.status(200).json({ success: true, message: 'Profil rasmi o\'chirildi', user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Foydalanuvchi rasmini berish (<Image>/<img> header yubora olmagani uchun ochiq)
exports.getAvatar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) return res.sendStatus(404);
    const user = await User.findById(req.params.userId).select('+avatar');
    if (!user || !user.avatar) return res.sendStatus(404);

    res.set('Content-Type', 'image/jpeg');
    // URL ?v=<avatarUpdatedAt> bilan versiyalanadi, shuning uchun uzoq kesh xavfsiz
    res.set('Cache-Control', req.query.v ? 'public, max-age=31536000, immutable' : 'no-cache');
    res.send(user.avatar);
  } catch (err) {
    res.sendStatus(500);
  }
};
