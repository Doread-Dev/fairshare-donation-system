const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Staple Food',
        'Perishable',
        'Special Items',
        'Relief Supplies',
        'Others',
      ],
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "L", "units", "boxes"],
    },
    currentQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageMonthlyNeed: {
      type: Number,
      required: true,
      min: 0,
    },
    expiringAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

materialSchema.virtual("status").get(function () {
  if (this.currentQuantity > 1.5 * this.averageMonthlyNeed) return "surplus";
  if (this.currentQuantity < 0.8 * this.averageMonthlyNeed) return "shortage";
  return "normal";
});

const Material = mongoose.model("Material", materialSchema);
module.exports = Material;
