const Report = require("../models/Report");
const Material = require("../models/Material");
const Donation = require("../models/Donation");
const Distribution = require("../models/Distribution");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

function getDateRange(query) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1); 

  let from, to;

  if (query.from && query.to) {
    from = new Date(query.from);
    from.setHours(0, 0, 0, 0);
    to = new Date(query.to);
    to.setHours(23, 59, 59, 999);
  } else {
    const days = Number(query.range) || 30;
    to = todayEnd;
    from = new Date(todayStart);
    from.setDate(from.getDate() - (days - 1));
  }
  return { from, to };
}

exports.getSummary = async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query);
    const materials = await Material.find();
    const donations = await Donation.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$material", totalDonated: { $sum: "$quantity" } } },
    ]);
    const distributions = await Distribution.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$material", totalDistributed: { $sum: "$quantity" } } },
    ]);
    const donatedMap = Object.fromEntries(
      donations.map((d) => [d._id.toString(), d.totalDonated])
    );
    const distributedMap = Object.fromEntries(
      distributions.map((d) => [d._id.toString(), d.totalDistributed])
    );
    const summary = materials.map((mat) => {
      const donated = donatedMap[mat._id.toString()] || 0;
      const distributed = distributedMap[mat._id.toString()] || 0;
      const remaining = mat.currentQuantity;
      let status = "Normal";
      if (remaining > 1.5 * mat.averageMonthlyNeed) status = "Surplus";
      else if (remaining < 0.8 * mat.averageMonthlyNeed) status = "Shortage";
      return {
        material: mat.name,
        category: mat.category,
        donated,
        distributed,
        remaining,
        unit: mat.unit,
        status,
      };
    });
    res.json({
      from,
      to,
      summary,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query);
    const donationsAgg = await Donation.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$material", total: { $sum: "$quantity" } } },
    ]);
    const materials = await Material.find();
    const materialMap = Object.fromEntries(
      materials.map((m) => [m._id.toString(), m])
    );
    const donationsLabels = donationsAgg.map(
      (d) => materialMap[d._id]?.name || "Unknown"
    );
    const donationsData = donationsAgg.map((d) => d.total);

    const durationDays =
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    const timeBuckets = [];
    let progressLabels = [];

    if (durationDays <= 7) {
      let cursor = new Date(from);
      while (cursor <= to) {
        const dayStart = new Date(cursor);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        timeBuckets.push({ start: dayStart, end: dayEnd });
        progressLabels.push(
          dayStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
        cursor.setDate(cursor.getDate() + 1);
      }
    } else {
      let cursor = new Date(from);
      let weekNum = 1;
      while (cursor <= to) {
        const weekStart = new Date(cursor);
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > to) {
          weekEnd.setTime(to.getTime());
        }
        timeBuckets.push({ start: weekStart, end: weekEnd });
        progressLabels.push(`Week ${weekNum++}`);
        cursor.setDate(cursor.getDate() + 7);
      }
    }
    const Family = require("../models/Family");
    const families = await Family.find();
    const familyTypes = [
      { label: "Large Families (5+)", filter: (f) => f.familySize >= 5 },
      {
        label: "Medium Families (3-4)",
        filter: (f) => f.familySize >= 3 && f.familySize <= 4,
      },
      { label: "Small Families (1-2)", filter: (f) => f.familySize <= 2 },
    ];
    const progressDatasets = await Promise.all(
      familyTypes.map(async (ft) => {
        const famIds = families.filter(ft.filter).map((f) => f._id);
        const data = await Promise.all(
          timeBuckets.map(async (bucket) => {
            const count = await Distribution.countDocuments({
              beneficiary: { $in: famIds },
              date: { $gte: bucket.start, $lte: bucket.end },
            });
            return count;
          })
        );
        return {
          label: ft.label,
          data,
          borderColor:
            ft.label === "Large Families (5+)"
              ? "#5A7D57"
              : ft.label === "Medium Families (3-4)"
              ? "#8DB580"
              : "#C1D8B3",
          backgroundColor:
            ft.label === "Large Families (5+)"
              ? "rgba(90, 125, 87, 0.1)"
              : ft.label === "Medium Families (3-4)"
              ? "rgba(141, 181, 128, 0.1)"
              : "rgba(193, 216, 179, 0.1)",
        };
      })
    );

    const surplusShortageLabels = materials.map((m) => m.name);
    const surplusData = materials.map((m) =>
      Math.max(0, m.currentQuantity - m.averageMonthlyNeed * 1.5)
    );
    const shortageData = materials.map((m) =>
      Math.max(0, m.averageMonthlyNeed * 0.8 - m.currentQuantity)
    );

    res.json({
      from,
      to,
      donationsPerMaterial: {
        labels: donationsLabels,
        data: donationsData,
      },
      distributionProgress: {
        labels: progressLabels,
        datasets: progressDatasets,
      },
      surplusShortage: {
        labels: surplusShortageLabels,
        surplusData,
        shortageData,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportReports = async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query);
    const format = (req.query.format || "excel").toLowerCase();
    const materials = await Material.find();
    const donations = await Donation.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$material", totalDonated: { $sum: "$quantity" } } },
    ]);
    const distributions = await Distribution.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$material", totalDistributed: { $sum: "$quantity" } } },
    ]);
    const donatedMap = Object.fromEntries(
      donations.map((d) => [d._id.toString(), d.totalDonated])
    );
    const distributedMap = Object.fromEntries(
      distributions.map((d) => [d._id.toString(), d.totalDistributed])
    );
    const summary = materials.map((mat) => {
      const donated = donatedMap[mat._id.toString()] || 0;
      const distributed = distributedMap[mat._id.toString()] || 0;
      const remaining = mat.currentQuantity;
      let status = "Normal";
      if (remaining > 1.5 * mat.averageMonthlyNeed) status = "Surplus";
      else if (remaining < 0.8 * mat.averageMonthlyNeed) status = "Shortage";
      return {
        Material: mat.name,
        Category: mat.category,
        Donated: donated,
        Distributed: distributed,
        Remaining: remaining,
        Unit: mat.unit,
        Status: status,
      };
    });
    if (format === "excel" || format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Material Summary");
      sheet.columns = Object.keys(
        summary[0] || {
          Material: "",
          Category: "",
          Donated: "",
          Distributed: "",
          Remaining: "",
          Unit: "",
          Status: "",
        }
      ).map((key) => ({ header: key, key }));
      summary.forEach((row) => sheet.addRow(row));
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="material-summary.xlsx"`
      );
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse(summary);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="material-summary.csv"'
      );
      res.send(csv);
    } else if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="material-summary.pdf"'
      );
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      doc.pipe(res);
      doc
        .fontSize(18)
        .text("Material Distribution Summary", { align: "center" });
      doc.moveDown();
      const headers = [
        "Material",
        "Category",
        "Donated",
        "Distributed",
        "Remaining",
        "Unit",
        "Status",
      ];
      doc.fontSize(12);
      headers.forEach((h, i) => {
        doc.text(h, 70 + i * 70, doc.y, { continued: i < headers.length - 1 });
      });
      doc.moveDown(0.5);
      summary.forEach((row) => {
        headers.forEach((h, i) => {
          doc.text(String(row[h] ?? ""), 70 + i * 70, doc.y, {
            continued: i < headers.length - 1,
          });
        });
        doc.moveDown(0.5);
      });
      doc.end();
    } else {
      res
        .status(400)
        .json({ error: "Invalid format. Use excel, csv, or pdf." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
