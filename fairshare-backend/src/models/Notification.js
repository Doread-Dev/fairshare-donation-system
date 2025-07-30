const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["surplus", "shortage", "expiration", "alert"],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
