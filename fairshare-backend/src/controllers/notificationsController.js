const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.read === "true") filter.read = true;
    if (req.query.read === "false") filter.read = false;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.material) filter.material = req.query.material;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate("material", "name category")
      .limit(100);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function emitNotification(io, notification) {
  io.emit("notification", notification);
}
