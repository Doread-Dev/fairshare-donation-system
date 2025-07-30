const Family = require("../models/Family");
const Distribution = require("../models/Distribution");

// Get all families
exports.getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find();
    res.json(families);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) return res.status(404).json({ error: "Family not found" });
    res.json(family);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createFamily = async (req, res) => {
  try {
    let { name, familySize, area, specialNeeds, lastDistributionAt } = req.body;
    if (Array.isArray(specialNeeds)) {
      specialNeeds = specialNeeds.flatMap((n) =>
        typeof n === "string" && (n.includes(",") || n.includes("،"))
          ? n
              .split(/,|،/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [n]
      );
    }
    const family = new Family({
      name,
      familySize,
      area,
      specialNeeds,
      lastDistributionAt,
    });
    await family.save();
    res.status(201).json(family);
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err.message });
  }
};

exports.updateFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) return res.status(404).json({ error: "Family not found" });
    let { name, familySize, area, specialNeeds, lastDistributionAt } = req.body;
    if (Array.isArray(specialNeeds)) {
      specialNeeds = specialNeeds.flatMap((n) =>
        typeof n === "string" && (n.includes(",") || n.includes("،"))
          ? n
              .split(/,|،/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [n]
      );
    }
    if (name !== undefined) family.name = name;
    if (familySize !== undefined) family.familySize = familySize;
    if (area !== undefined) family.area = area;
    if (specialNeeds !== undefined) family.specialNeeds = specialNeeds;
    if (lastDistributionAt !== undefined)
      family.lastDistributionAt = lastDistributionAt;
    await family.save();
    res.json(family);
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err.message });
  }
};

exports.deleteFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndDelete(req.params.id);
    if (!family) return res.status(404).json({ error: "Family not found" });
    res.json({ message: "Family deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFamilyDistributions = async (req, res) => {
  try {
    const familyId = req.params.id;
    const distributions = await Distribution.find({ beneficiary: familyId })
      .populate("material")
      .populate("distributedBy")
      .sort({ date: -1 });
    res.json(distributions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
