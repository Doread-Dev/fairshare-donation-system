const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    automaticAlerts: { type: Boolean, default: true },
    aiRecommendations: { type: Boolean, default: true },
    donationReminders: { type: Boolean, default: false },
    expirationAlerts: { type: Boolean, default: true },
    materialNeeds: {
      type: mongoose.Schema.Types.Mixed, 
      default: {},
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;
