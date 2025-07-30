const Material = require("../models/Material");
const Donation = require("../models/Donation");
const Family = require("../models/Family");
const Notification = require("../models/Notification");

exports.getSummary = async (req, res) => {
  try {
    const [totalDonations, totalStock, registeredFamilies, materialsList] =
      await Promise.all([
        Donation.countDocuments(),
        Material.aggregate([
          { $group: { _id: null, total: { $sum: "$currentQuantity" } } },
        ]).then((r) => r[0]?.total || 0),
        Family.countDocuments(),
        Material.find(),
      ]);

    const totalStockByUnit = { kg: 0, L: 0, units: 0, boxes: 0 };
    for (const m of materialsList) {
      if (totalStockByUnit[m.unit] !== undefined) {
        totalStockByUnit[m.unit] += m.currentQuantity;
      }
    }

    const stockByCategoryAgg = await Material.aggregate([
      {
        $group: {
          _id: "$category",
          quantity: { $sum: "$currentQuantity" },
        },
      },
    ]);
    const stockByCategory = stockByCategoryAgg.map((c) => ({
      category: c._id,
      quantity: c.quantity,
    }));

    const now = new Date();
    const weekLabels = [];
    const weekData = [];
    for (let i = 0; i < 5; i++) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7 - 6);
      start.setHours(0, 0, 0, 0);
      weekLabels.unshift(
        `${start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`
      );
      const sum = await Donation.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]).then((r) => r[0]?.total || 0);
      weekData.unshift(sum);
    }

    const criticalItems = materialsList
      .filter((m) => m.status === "shortage" || m.status === "surplus")
      .map((m) => ({
        _id: m._id,
        name: m.name,
        category: m.category,
        currentQuantity: m.currentQuantity,
        requiredLevel: m.averageMonthlyNeed,
        unit: m.unit,
        status: m.status,
      }));
    const activeAlerts = criticalItems.length;

    res.json({
      summary: {
        totalDonations,
        totalStock,
        totalStockByUnit,
        registeredFamilies,
        activeAlerts,
      },
      stockByCategory,
      donationTrends: {
        labels: weekLabels,
        data: weekData,
      },
      criticalItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
