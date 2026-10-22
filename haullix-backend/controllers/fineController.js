const Fine = require('../models/Fine');

// 1. Gos nomer bo'yicha jarimalarni qidirish (Masalan: 01 A 777 AA)
exports.checkFinesByPlate = async (req, res) => {
  try {
    const { plateNumber } = req.query;
    if (!plateNumber) {
      return res.status(400).json({ success: false, message: 'Avtomobil davlat raqamini kiriting' });
    }

    const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
    const fines = await Fine.find({
      plateNumber: new RegExp(cleanPlate, 'i'),
    }).sort({ createdAt: -1 });

    const totalUnpaid = fines
      .filter((f) => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.discountAmount, 0);

    res.status(200).json({
      success: true,
      plateNumber: cleanPlate,
      count: fines.length,
      totalUnpaid,
      fines,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. O'zbekiston trassalari bo'ylab radarlar ro'yxati (M39, A373 va h.k.)
exports.getRadarPoints = async (req, res) => {
  const radars = [
    { id: 'r1', name: 'M39 Chinoz tezyurar kamerasi', highway: 'M39', speedLimit: 70, type: 'camera' },
    { id: 'r2', name: 'Sirdaryo YPX post statsionar radar', highway: 'M39', speedLimit: 60, type: 'radar' },
    { id: 'r3', name: 'G\'allaorol Tarozi nazorati', highway: 'M39', speedLimit: 50, type: 'weight' },
    { id: 'r4', name: 'Bulung\'ur radar posti', highway: 'M39', speedLimit: 70, type: 'radar' },
    { id: 'r5', name: 'Qamashi dovon kamerasi', highway: 'A378', speedLimit: 70, type: 'camera' },
    { id: 'r6', name: 'Nasaf tarozi nazorati', highway: 'M39', speedLimit: 50, type: 'weight' },
  ];

  res.status(200).json({ success: true, count: radars.length, radars });
};
