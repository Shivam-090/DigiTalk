import Report from "../models/Report.js";
import User from "../models/User.js";

const adminUserFields =
  "fullName username email profilePic nativeLanguage learningLanguage location isOnboarded active isAdmin createdAt";

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({})
      .select(adminUserFields)
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateUserActiveStatus(req, res) {
  try {
    const { id: userId } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({ message: "Active status must be a boolean value" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own active status." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: "Admin accounts cannot be changed here." });
    }

    user.active = active;
    await user.save();

    res.status(200).json({ message: `User ${active ? "activated" : "deactivated"} successfully`, user });
  } catch (error) {
    console.error("Error in updateUserActiveStatus Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllReports(req, res) {
  try {
    const reports = await Report.find({})
      .populate("reporter", "fullName username email profilePic")
      .populate("reportedUser", "fullName username email profilePic active")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getAllReports Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
