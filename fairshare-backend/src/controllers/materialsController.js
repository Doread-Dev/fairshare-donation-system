const Material = require("../models/Material");
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

exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch materials", error: err.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });
    res.json(material);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch material", error: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { name, sku, category, unit, averageMonthlyNeed } = req.body;
    if (
      !name ||
      !sku ||
      !category ||
      !unit ||
      typeof averageMonthlyNeed === "undefined"
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const exists = await Material.findOne({ sku });
    if (exists) {
      return res.status(409).json({ message: "SKU already exists" });
    }
    const material = await Material.create({
      name,
      sku,
      category,
      unit,
      averageMonthlyNeed,
    });
    res.status(201).json(material);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create material", error: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { name, sku, category, unit, averageMonthlyNeed, currentQuantity } =
      req.body;
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });
    if (name) material.name = name;
    if (sku) material.sku = sku;
    if (category) material.category = category;
    if (unit) material.unit = unit;
    if (typeof averageMonthlyNeed !== "undefined")
      material.averageMonthlyNeed = averageMonthlyNeed;
    if (typeof currentQuantity !== "undefined")
      material.currentQuantity = currentQuantity;
    await material.save();
    await handleMaterialNotification(material, req);
    res.json(material);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update material", error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });
    res.json({ message: "Material deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete material", error: err.message });
  }
};

exports.getCriticalMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    const critical = materials.filter(
      (m) => m.status === "shortage" || m.status === "surplus"
    );
    res.json(critical);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch critical materials",
      error: err.message,
    });
  }
};

exports.getCategories = (req, res) => {
  const categories = [
    "Staple Food",
    "Perishable",
    "Special Items",
    "Relief Supplies",
    "Others",
  ];
  res.json(categories);
};
