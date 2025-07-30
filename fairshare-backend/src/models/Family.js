const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  familySize: {
    type: Number,
    required: true,
    min: 1,
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  specialNeeds: [
    {
      type: String,
      trim: true,
    },
  ],
  vulnerability: {
    type: Number,
    required: false,
  },
  lastDistributionAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

familySchema.pre("save", function (next) {
  let vulnerability = 0;
  if (this.familySize >= 7) vulnerability += 3;
  else if (this.familySize >= 4) vulnerability += 2;
  else if (this.familySize >= 1) vulnerability += 1;
  if (Array.isArray(this.specialNeeds)) {
    vulnerability += this.specialNeeds.length;
  }
  this.vulnerability = vulnerability;
  next();
});

const Family = mongoose.model("Family", familySchema);
module.exports = Family;
