const Order = require('../models/Order');

const includesText = (value, query) =>
  String(value || '').toLowerCase().includes(String(query || '').toLowerCase());

// Qaytish yo'nalishi bo'yicha eng mos yuklarni topish algoritmi
// Haydovchi masalan Qarshi -> Toshkent qaytmoqda
exports.findMatchingLoads = async (req, res) => {
  try {
    const vehicle = req.user.vehicle || {};
    const {
      fromCity = '',
      toCity = '',
      capacityTons = vehicle.maxPayloadTons || 20,
      bodyType = vehicle.bodyType || 'tent',
    } = req.query;

    // Faqat haydovchi kutayotgan va o'ziga tegishli bo'lmagan yuklar
    const activeOrders = await Order.find({
      status: 'active',
      owner: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

    // Moslik foizini hisoblash (Smart Matching Score)
    const matches = activeOrders.map((order) => {
      let score = 0;

      // 1. Shaharlar mosligi (40 ball). Yo'nalish berilmagan bo'lsa neytral 20 ball
      if (!fromCity && !toCity) {
        score += 20;
      } else {
        const isFromMatch = fromCity && includesText(order.fromCity, fromCity);
        const isToMatch = toCity && includesText(order.toCity, toCity);
        if (isFromMatch && isToMatch) score += 40;
        else if (isFromMatch || isToMatch) score += 20;
      }

      // 2. Yuk vazni va mashina sig'imi (30 ball)
      const truckCap = Number(capacityTons) || 20;
      const weight = order.weightTons || order.volumeM3 * 0.8;
      if (weight <= truckCap) {
        const loadRatio = weight / truckCap;
        // Agar mashinani 70-100% to'ldirsa eng yuqori ball
        score += loadRatio >= 0.7 ? 30 : Math.round(loadRatio * 30);
      } else {
        score -= 20; // Mashina sig'imidan ortiq bo'lsa
      }

      // 3. Kuzov turi mosligi (20 ball)
      score += includesText(order.bodyTypeRequired || 'tent', bodyType) ? 20 : 5;

      // 4. Vaqt mosligi (10 ball): yetkazish sanasi hali o'tmagan bo'lsa
      if (!order.deliveryDate || order.deliveryDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
        score += 10;
      }

      return {
        ...order.toObject(),
        matchScore: Math.max(10, Math.min(98, score)),
      };
    });

    // Moslik foizi bo'yicha kamayish tartibida saralash
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      searchCriteria: { fromCity, toCity, capacityTons, bodyType },
      count: matches.length,
      matches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
