const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  received: {
    type: Number,
    default: 0,
  },
  distributed: {
    type: Number,
    default: 0,
  },
  remaining: {
    type: Number,
    default: 0,
  },
  surplus: {
    type: Number,
    default: 0,
  },
  shortage: {
    type: Number,
    default: 0,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
