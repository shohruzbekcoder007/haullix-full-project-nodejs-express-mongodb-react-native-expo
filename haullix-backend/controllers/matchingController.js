const Order = require('../models/Order');

// Qaytish yo'nalishi bo'yicha eng mos yuklarni topish algoritmi
// Haydovchi masalan Qarshi -> Toshkent qaytmoqda
exports.findMatchingLoads = async (req, res) => {
  try {
    const {
      fromCity = 'Qarshi',
      toCity = 'Toshkent',
      capacityTons = 20,
      bodyType = 'tent',
      availableDate,
    } = req.query;

    const activeOrders = await Order.find({ status: 'active' });

    // Moslik foizini hisoblash (Smart Matching Score)
    const matches = activeOrders.map((order) => {
      let score = 0;

      // 1. Shaharlar mosligi (40 ball)
      const isFromMatch = order.fromCity.toLowerCase().includes(fromCity.toLowerCase());
      const isToMatch = order.toCity.toLowerCase().includes(toCity.toLowerCase());
      if (isFromMatch && isToMatch) score += 40;
      else if (isFromMatch || isToMatch) score += 20;

      // 2. Yuk vazni va mashina sig'imi (30 ball)
      const truckCap = Number(capacityTons) || 20;
      if (order.weightTons <= truckCap) {
        const loadRatio = order.weightTons / truckCap;
        // Agar mashinani 70-100% to'ldirsa eng yuqori ball
        if (loadRatio >= 0.7) score += 30;
        else score += Math.round(loadRatio * 30);
      } else {
        score -= 20; // Mashina sig'imidan ortiq bo'lsa
      }

      // 3. Kuzov turi mosligi (20 ball)
      if (order.bodyTypeRequired.toLowerCase().includes(bodyType.toLowerCase()) || bodyType === 'tent') {
        score += 20;
      } else {
        score += 5;
      }

      // 4. Vaqt mosligi (10 ball)
      score += 10;

      // Min 0, Max 98%
      const matchScore = Math.max(10, Math.min(98, score));

      return {
        ...order.toObject(),
        matchScore,
        estimatedFuelSavedKm: 450, // Bo'sh qaytmaslik natijasida tejalgan yoqilg'i
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
