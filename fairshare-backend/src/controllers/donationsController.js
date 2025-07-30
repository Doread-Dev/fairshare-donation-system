const mongoose = require("mongoose");
const Donation = require("../models/Donation");
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

exports.getAllDonations = async (req, res) => {
  try {
    let filter = {};
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) {
        const fromDate = new Date(req.query.from);
        if (req.query.from.length <= 10) {
          fromDate.setUTCHours(0, 0, 0, 0);
        }
        filter.date.$gte = fromDate;
      }
      if (req.query.to) {
        const toDate = new Date(req.query.to);
        if (req.query.to.length <= 10) {
          toDate.setUTCHours(23, 59, 59, 999);
        }
        filter.date.$lte = toDate;
      }
    }
    let donationsQuery = Donation.find(filter)
      .populate("material")
      .populate("createdBy");
    if (req.query.recent === "true") {
      donationsQuery = donationsQuery.sort({ date: -1 }).limit(5);
    } else {
      donationsQuery = donationsQuery.sort({ date: -1 });
    }
    const donations = await donationsQuery;
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("material")
      .populate("createdBy");
    if (!donation) return res.status(404).json({ error: "Donation not found" });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createDonation = async (req, res) => {
  let materialDoc;
  try {
    let { material, quantity, date, donor } = req.body;
    if (!donor || donor.trim() === "") {
      donor = "Anonymous";
    }
    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }
    materialDoc = await Material.findById(material);
    if (!materialDoc) {
      throw new Error("Material not found");
    }
    const unit = materialDoc.unit;
    const oldQuantity = materialDoc.currentQuantity;
    materialDoc.currentQuantity += quantity;
    await materialDoc.save();
    const createdBy = req.user._id;
    const donation = new Donation({
      material,
      quantity,
      unit,
      date,
      donor,
      createdBy,
    });
    try {
      await donation.save();
      res.status(201).json(donation);
      await handleMaterialNotification(materialDoc, req);
    } catch (err) {
      materialDoc.currentQuantity = oldQuantity;
      await materialDoc.save();
      throw err;
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err.message });
  }
};

exports.updateDonation = async (req, res) => {
  let materialDoc;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new Error("Donation not found");
    materialDoc = await Material.findById(donation.material);
    if (!materialDoc) throw new Error("Material not found");
    const oldQuantity = materialDoc.currentQuantity;
    materialDoc.currentQuantity -= Number(donation.quantity);
    let { quantity, donor } = req.body;
    if (donor === undefined || donor.trim() === "") {
      donor = "Anonymous";
    }
    if (quantity === undefined) quantity = donation.quantity;
    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }
    materialDoc.currentQuantity += quantity;
    if (materialDoc.currentQuantity < 0) materialDoc.currentQuantity = 0;
    await materialDoc.save();
    const updateData = { ...req.body, donor, quantity, unit: materialDoc.unit };
    let updatedDonation;
    try {
      updatedDonation = await Donation.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      res.json(updatedDonation);
      await handleMaterialNotification(materialDoc, req);
    } catch (err) {
      materialDoc.currentQuantity = oldQuantity;
      await materialDoc.save();
      throw err;
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err.message });
  }
};

exports.deleteDonation = async (req, res) => {
  let materialDoc;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new Error("Donation not found");
    materialDoc = await Material.findById(donation.material);
    const oldQuantity = materialDoc ? materialDoc.currentQuantity : null;
    if (materialDoc) {
      materialDoc.currentQuantity -= Number(donation.quantity);
      if (materialDoc.currentQuantity < 0) materialDoc.currentQuantity = 0;
      await materialDoc.save();
    }
    try {
      await Donation.findByIdAndDelete(req.params.id);
      res.json({ message: "Donation deleted" });
      if (materialDoc) await handleMaterialNotification(materialDoc, req);
    } catch (err) {
      if (materialDoc && oldQuantity !== null) {
        materialDoc.currentQuantity = oldQuantity;
        await materialDoc.save();
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
