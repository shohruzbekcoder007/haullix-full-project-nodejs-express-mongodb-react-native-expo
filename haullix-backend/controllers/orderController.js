const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

const fullName = (user) => `${user.lastName || ''} ${user.firstName || ''}`.trim();

const isOwner = (order, user) => order.owner && order.owner.equals(user._id);
const isDriver = (order, user) => order.assignedDriver && order.assignedDriver.equals(user._id);

// "24/10/2026", "24.10.2026" yoki ISO formatdagi sanani o'qish
const parseDate = (value) => {
  if (!value) return null;
  const match = String(value).match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  const date = match
    ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// ID noto'g'ri bo'lsa CastError o'rniga null qaytaradi
const findOrder = async (id) => {
  if (mongoose.isValidObjectId(id)) {
    return Order.findById(id);
  }
  return Order.findOne({ orderNumber: id });
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: 'Bunday buyurtma topilmadi yoki o\'chirilgan' });

const forbidden = (res, message = 'Bu buyurtma uchun ruxsat yo\'q') =>
  res.status(403).json({ success: false, message });

// Joriy foydalanuvchining buyurtmalari (yuk egasi — joylaganlari, haydovchi — olganlari)
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = req.user.role === 'driver'
      ? { assignedDriver: req.user._id }
      : { owner: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Buyurtmalarni yuklashda xatolik yuz berdi' });
  }
};

// Sharhlar: haydovchi — o'zi olgan baholar, yuk egasi — o'zi yozgan baholar
exports.getMyReviews = async (req, res) => {
  try {
    const filter = req.user.role === 'driver'
      ? { assignedDriver: req.user._id }
      : { owner: req.user._id };
    const orders = await Order.find({ ...filter, 'review.rating': { $exists: true } })
      .sort({ 'review.createdAt': -1 })
      .select('orderNumber cargoType fromCity toCity ownerName driverName assignedDriver review');

    res.status(200).json({ success: true, count: orders.length, reviews: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Bitta buyurtma (egasi, biriktirilgan haydovchi yoki faol yukni ko'rayotgan haydovchi)
exports.getOrder = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return notFound(res);

    const canView = isOwner(order, req.user)
      || isDriver(order, req.user)
      || (req.user.role === 'driver' && order.status === 'active');
    if (!canView) return forbidden(res);

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Yangi buyurtma joylash (Yuk joylash)
exports.createOrder = async (req, res) => {
  try {
    const data = req.body;
    const deliveryDate = parseDate(data.deliveryDate);
    if (!deliveryDate) {
      return res.status(400).json({ success: false, message: 'Yetib borish sanasi noto\'g\'ri' });
    }

    const volumeM3 = Number(data.volumeM3);
    const order = await Order.create({
      orderNumber: 'HL-' + Date.now().toString(36).toUpperCase(),
      cargoType: data.cargoType,
      fromCity: data.fromCity,
      toCity: data.toCity,
      volumeM3,
      weightTons: Number(data.weightTons) || Math.round(volumeM3 * 0.8 * 10) / 10,
      price: Number(data.price),
      deliveryDate,
      payerName: data.payerName,
      payerId: data.payerId,
      notes: data.notes,
      owner: req.user._id,
      ownerName: fullName(req.user),
      ownerPhone: req.user.phone,
      status: 'active',
    });

    res.status(201).json({ success: true, message: 'Buyurtma muvaffaqiyatli joylashtirildi', order });
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

// Eng so'nggi yo'ldagi buyurtma
exports.getActiveTracking = async (req, res) => {
  try {
    const filter = req.user.role === 'driver'
      ? { assignedDriver: req.user._id }
      : { owner: req.user._id };
    const order = await Order.findOne({ ...filter, status: 'in_transit' }).sort({ acceptedAt: -1 });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Haydovchi yukni qabul qiladi
exports.acceptOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    // Bir vaqtda ikki haydovchi olib qo'ymasligi uchun atomar yangilash
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'active',
        owner: { $ne: req.user._id },
      },
      {
        status: 'in_transit',
        assignedDriver: req.user._id,
        driverName: fullName(req.user),
        driverPhone: req.user.phone,
        acceptedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(409).json({ success: false, message: 'Bu yuk allaqachon olingan yoki mavjud emas' });
    }
    res.status(200).json({ success: true, message: 'Yuk qabul qilindi', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Haydovchi yukni yetkazib berdi
exports.completeOrder = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return notFound(res);
    if (!isDriver(order, req.user)) return forbidden(res);
    if (order.status !== 'in_transit') {
      return res.status(400).json({ success: false, message: 'Faqat yo\'ldagi buyurtmani yakunlash mumkin' });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();
    await User.updateOne({ _id: req.user._id }, { $inc: { completedTrips: 1 } });

    res.status(200).json({ success: true, message: 'Yuk yetkazildi', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Yuk egasi haydovchini baholaydi (Haydovchi haqida)
exports.reviewDriver = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return notFound(res);
    if (!isOwner(order, req.user)) return forbidden(res);
    if (!order.assignedDriver) {
      return res.status(400).json({ success: false, message: 'Bu buyurtmaga hali haydovchi biriktirilmagan' });
    }

    const { arrivalTime, driverFee, notes } = req.body;
    const rating = Math.round(Number(req.body.rating));
    if (!(rating >= 1 && rating <= 5)) {
      return res.status(400).json({ success: false, message: 'Bahoni 1 dan 5 gacha tanlang' });
    }

    const previousRating = order.review && order.review.rating;
    order.review = {
      arrivalTime,
      driverFee: driverFee ? Number(driverFee) : undefined,
      notes,
      rating,
      createdAt: new Date(),
    };
    await order.save();

    // Haydovchining o'rtacha reytingini yangilash
    const driver = await User.findById(order.assignedDriver);
    if (driver) {
      const count = driver.ratingCount || 0;
      const total = (driver.rating || 0) * count;
      if (previousRating) {
        driver.rating = count ? (total - previousRating + rating) / count : rating;
      } else {
        driver.rating = (total + rating) / (count + 1);
        driver.ratingCount = count + 1;
      }
      await driver.save();
    }

    res.status(200).json({ success: true, message: 'Haydovchi haqida ma\'lumot va baholash saqlandi', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Buyurtmani o'zgartirish (faqat egasi va faqat haydovchi olmaguncha)
exports.updateOrder = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return notFound(res);
    if (!isOwner(order, req.user)) return forbidden(res);
    if (order.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Haydovchi olgan buyurtmani o\'zgartirib bo\'lmaydi' });
    }

    const updateData = req.body;
    const allowedFields = ['cargoType', 'fromCity', 'toCity', 'volumeM3', 'price', 'payerName', 'payerId', 'notes', 'paymentType'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        order[field] = updateData[field];
      }
    });
    if (updateData.deliveryDate !== undefined) {
      const date = parseDate(updateData.deliveryDate);
      if (!date) {
        return res.status(400).json({ success: false, message: 'Yetib borish sanasi noto\'g\'ri' });
      }
      order.deliveryDate = date;
    }
    if (updateData.status === 'cancelled') order.status = 'cancelled';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Buyurtma ma\'lumotlari muvaffaqiyatli yangilandi',
      order,
    });
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? err.message : 'Buyurtmani yangilashda xatolik yuz berdi. Iltimos qaytadan urining.',
    });
  }
};

// Buyurtmani o'chirish (faqat haydovchi olmagan bo'lsa)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return notFound(res);
    if (!isOwner(order, req.user)) return forbidden(res);
    if (order.status === 'in_transit') {
      return res.status(400).json({ success: false, message: 'Yo\'ldagi buyurtmani o\'chirib bo\'lmaydi' });
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Buyurtma o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
