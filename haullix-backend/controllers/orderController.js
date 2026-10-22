const Order = require('../models/Order');

// Barcha buyurtmalarni olish (Filterlash imkoniyati bilan)
exports.getOrders = async (req, res) => {
  try {
    const { status, fromCity, toCity } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (fromCity) filter.fromCity = new RegExp(fromCity, 'i');
    if (toCity) filter.toCity = new RegExp(toCity, 'i');

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Buyurtmalarni yuklashda xatolik yuz berdi' });
  }
};

// Yangi buyurtma joylash
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    orderData.orderNumber = '#' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = await Order.create(orderData);
    res.status(201).json({ success: true, message: 'Buyurtma yaratildi', order: newOrder });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Buyurtmani xatoliksiz o'zgartirish (Fixes: "zakaz tarixini o'zgartirish kere ilovadan hato db otvorvoti")
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // ID mavjudligini xavfsiz tekshirish
    let order = await Order.findById(id);
    if (!order) {
      // Agar ID string bo'lsa (mock ID)
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Bunday buyurtma topilmadi yoki o\'chirilgan',
      });
    }

    // Faqat ruxsat berilgan maydonlarni yangilash
    const allowedFields = [
      'title', 'price', 'status', 'departureDate', 'departureTime',
      'weightTons', 'fromCity', 'toCity', 'notes', 'paymentType'
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        order[field] = updateData[field];
      }
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Buyurtma ma\'lumotlari muvaffaqiyatli yangilandi',
      order,
    });
  } catch (err) {
    console.error('[Order Update Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Buyurtmani yangilashda xatolik yuz berdi. Iltimos qaytadan urining.',
      details: err.message,
    });
  }
};

// Buyurtmani o'chirish
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Buyurtma o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
