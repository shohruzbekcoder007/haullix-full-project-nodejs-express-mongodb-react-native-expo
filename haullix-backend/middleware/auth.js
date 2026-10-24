const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getSecret = () => process.env.JWT_SECRET || 'haullix_dev_secret';

exports.signToken = (phone) => jwt.sign({ phone }, getSecret(), { expiresIn: '30d' });

// Tokenni tekshiradi: req.phone va (agar ro'yxatdan o'tgan bo'lsa) req.user ni o'rnatadi
exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Avtorizatsiya talab qilinadi' });
    }
    const payload = jwt.verify(token, getSecret());
    req.phone = payload.phone;
    req.user = await User.findOne({ phone: payload.phone });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sessiya muddati tugagan. Qaytadan kiring' });
  }
};

// Profil to'ldirilgan bo'lishi shart
exports.requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ success: false, code: 'PROFILE_REQUIRED', message: 'Avval profilni to\'ldiring' });
  }
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Bu amal sizning rolingiz uchun ruxsat etilmagan' });
  }
  next();
};
