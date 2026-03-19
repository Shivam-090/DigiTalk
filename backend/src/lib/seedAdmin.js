import User from "../models/User.js";

const DEFAULT_ADMIN_FULL_NAME = "Admin";
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_AVATAR = "https://avatar.iran.liara.run/public/999";

export const seedAdminFromEnv = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || DEFAULT_ADMIN_FULL_NAME;
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase() || DEFAULT_ADMIN_USERNAME;

  if (!email || !password) {
    console.log("Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing");
    return;
  }

  const existingAdmin = await User.findOne({ email });

  if (!existingAdmin) {
    await User.create({
      email,
      password,
      fullName,
      username,
      profilePic: DEFAULT_ADMIN_AVATAR,
      bio: "System administrator",
      isOnboarded: true,
      active: true,
      isAdmin: true,
    });

    console.log(`Admin user seeded for ${email}`);
    return;
  }

  existingAdmin.fullName = fullName;
  existingAdmin.username = username;
  existingAdmin.password = password;
  existingAdmin.isOnboarded = true;
  existingAdmin.active = true;
  existingAdmin.isAdmin = true;

  if (!existingAdmin.profilePic) {
    existingAdmin.profilePic = DEFAULT_ADMIN_AVATAR;
  }

  await existingAdmin.save();
  console.log(`Admin user synced from environment for ${email}`);
};
