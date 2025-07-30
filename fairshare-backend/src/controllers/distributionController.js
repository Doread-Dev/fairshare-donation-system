const Family = require("../models/Family");
const Material = require("../models/Material");
const Distribution = require("../models/Distribution");
const {
  createMaterialStatusNotifications,
} = require("../utils/notificationService");

async function handleMaterialNotification(materialDoc, req) {
  const status = materialDoc.status;
  if (status === "shortage" || status === "surplus") {
    await createMaterialStatusNotifications(
      materialDoc,
      status,
      req?.app?.locals?.io
    );
  }
}

exports.suggestDistribution = async (req, res) => {
  try {
    const { materialId, strategy } = req.body;
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ error: "Material not found" });
    const families = await Family.find();
    if (!families.length)
      return res.status(404).json({ error: "No families found" });
    let suggestions = [];
    if (strategy === "equal") {
      const perFamily = Math.floor(material.currentQuantity / families.length);
      suggestions = families.map((fam) => ({
        familyId: fam._id,
        familyName: fam.name,
        quantity: perFamily,
        familySize: fam.familySize,
        vulnerability: fam.vulnerability,
        specialNeeds: fam.specialNeeds,
      }));
    } else if (strategy === "priority") {
      const weights = families.map(
        (fam) => fam.familySize + (fam.vulnerability || 0)
      );
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      suggestions = families.map((fam, idx) => ({
        familyId: fam._id,
        familyName: fam.name,
        quantity:
          totalWeight > 0
            ? Math.floor(
                (weights[idx] / totalWeight) * material.currentQuantity
              )
            : 0,
        familySize: fam.familySize,
        vulnerability: fam.vulnerability,
        specialNeeds: fam.specialNeeds,
      }));
    } else {
      return res.status(400).json({ error: "Invalid strategy" });
    }
    res.json({ material: material.name, unit: material.unit, suggestions });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.executeDistribution = async (req, res) => {
  try {
    const { materialId, distributions, date } = req.body;
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ error: "Material not found" });
    let totalDistributed = 0;
    for (const dist of distributions) {
      const family = await Family.findById(dist.familyId);
      if (!family) continue;
      const quantity = Number(dist.quantity);
      if (isNaN(quantity) || quantity <= 0) continue;
      // سجل التوزيع
      await Distribution.create({
        material: material._id,
        beneficiary: family._id,
        quantity,
        unit: material.unit,
        date: date || new Date(),
        distributedBy: req.user._id,
        reason: "Smart Distribution",
      });
      totalDistributed += quantity;
    }
    material.currentQuantity -= totalDistributed;
    if (material.currentQuantity < 0) material.currentQuantity = 0;
    await material.save();
    await handleMaterialNotification(material, req);
    res.json({ message: "Distribution executed", totalDistributed });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
