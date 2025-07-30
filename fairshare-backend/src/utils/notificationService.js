const Notification = require("../models/Notification");
const User = require("../models/User");

exports.createMaterialStatusNotifications = async (materialDoc, status, io) => {
  const users = await User.find({}, "_id");
  for (const user of users) {
    const exists = await Notification.findOne({
      material: materialDoc._id,
      type: status,
      user: user._id,
      read: false,
    });
    if (exists) continue;
    const notification = await Notification.create({
      type: status,
      message:
        status === "shortage"
          ? `Alert: Shortage in material ${materialDoc.name}`
          : `Alert: Surplus in material ${materialDoc.name}`,
      material: materialDoc._id,
      user: user._id,
    });
    if (io) io.to(user._id.toString()).emit("notification", notification);
  }
};
