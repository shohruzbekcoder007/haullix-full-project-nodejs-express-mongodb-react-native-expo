const User = require('../models/User');

// In-memory OTP ombori (Productionda Redis tavsiya etiladi)
const otpStore = new Map();

// 1. SMS Kod yuborish (60 soniya cheklov bilan)
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Telefon raqam talab qilinadi' });
    }

    const lastOtp = otpStore.get(phone);
    const now = Date.now();

    // 60 soniya ichida qayta yuborishga yo'l qo'ymaslik
    if (lastOtp && now - lastOtp.timestamp < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastOtp.timestamp)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Iltimos kuting. Yangi SMS yuborish uchun ${waitSeconds} soniya qoldi`,
        cooldownSeconds: waitSeconds,
      });
    }

    // Demo SMS kod (haqiqiy tizimda Eskiz.uz yoki PlayMobile SMS API ulanadi)
    const code = '1234';
    otpStore.set(phone, { code, timestamp: now });

    res.status(200).json({
      success: true,
      message: 'SMS tasdiqlash kodi muvaffaqiyatli yuborildi',
      cooldownSeconds: 60,
      demoCode: code, // Prototiplash uchun
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. SMS Kodni tekshirish
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const stored = otpStore.get(phone);

    if (!stored || (stored.code !== code && code !== '1234')) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri SMS kod kiritildi' });
    }

    otpStore.delete(phone);

    let user = await User.findOne({ phone });
    const isNewUser = !user;

    res.status(200).json({
      success: true,
      isNewUser,
      token: 'jwt_mock_token_' + Date.now(),
      user: user || { phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. To'liq profilni saqlash (Alohida Ism va Familiya, Moshina logosi/rusumi, UZ plate)
exports.saveProfile = async (req, res) => {
  try {
    const {
      phone,
      firstName,
      lastName,
      role,
      companyName,
      companyLogo,
      taxId,
      vehicle,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Ism va Familiya alohida maydonlarda kiritilishi shart',
      });
    }

    let user = await User.findOne({ phone });

    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = role || user.role;
      if (companyName) user.companyName = companyName;
      if (companyLogo) user.companyLogo = companyLogo;
      if (taxId) user.taxId = taxId;
      if (vehicle) user.vehicle = vehicle;
      await user.save();
    } else {
      user = await User.create({
        phone,
        firstName,
        lastName,
        role: role || 'driver',
        companyName,
        companyLogo,
        taxId,
        vehicle,
        isVerified: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profil muvaffaqiyatli saqlandi',
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
