import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";
import {
  getMissingProfileFields,
  validateBio,
  validateEmail,
  validateFullName,
  validateLanguage,
  validateLocation,
  validatePassword,
  validateProfilePic,
  validateUsername,
} from "../lib/validation/auth.validation.js";
import User from "../models/User.js";

const getStreamImage = (image) =>
  typeof image === "string" && /^https?:\/\//i.test(image) ? image : "";
const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
};

const issueAuthCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

  res.cookie("jwt", token, authCookieOptions);
};

const isDeactivatedUser = (user) => user?.isOnboarded && user?.active === false;

export async function signup(req, res) {
  const { email, password, fullName, username } = req.body;

  try {
    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const fullNameValidation = validateFullName(fullName);
    if (!fullNameValidation.valid) {
      return res.status(400).json({ message: fullNameValidation.message });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ message: usernameValidation.message });
    }

    const normalizedEmail = emailValidation.value;
    const normalizedUsername = usernameValidation.value;

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different email" });
    }

    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists in database" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}`;

    const newUser = await User.create({
      email: normalizedEmail,
      fullName: fullNameValidation.value,
      username: normalizedUsername,
      password,
      profilePic: randomAvatar,
      active: false,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: getStreamImage(newUser.profilePic),
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error in creating stream user during signup", error);
    }

    issueAuthCookie(res, newUser._id);
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "Email already exists, please use a different email" });
    }
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({ message: "Username already exists in database" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const user = await User.findOne({ email: emailValidation.value });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (isDeactivatedUser(user)) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    issueAuthCookie(res, user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login Controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password, { confirmPassword });
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const user = await User.findOne({ email: emailValidation.value });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (isDeactivatedUser(user)) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please sign in with your new password.",
    });
  } catch (error) {
    console.log("Error in forgotPassword controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: authCookieOptions.sameSite,
    secure: authCookieOptions.secure,
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, username, bio, nativeLanguage, learningLanguage, location } = req.body;
    const missingFields = getMissingProfileFields(req.body);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "All fields are required for onboarding",
        missingFields,
      });
    }

    const fullNameValidation = validateFullName(fullName);
    if (!fullNameValidation.valid) {
      return res.status(400).json({ message: fullNameValidation.message });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ message: usernameValidation.message });
    }

    const bioValidation = validateBio(bio);
    if (!bioValidation.valid) {
      return res.status(400).json({ message: bioValidation.message });
    }

    const nativeLanguageValidation = validateLanguage(nativeLanguage, "Native language");
    if (!nativeLanguageValidation.valid) {
      return res.status(400).json({ message: nativeLanguageValidation.message });
    }

    const learningLanguageValidation = validateLanguage(learningLanguage, "Learning language");
    if (!learningLanguageValidation.valid) {
      return res.status(400).json({ message: learningLanguageValidation.message });
    }

    const locationValidation = validateLocation(location);
    if (!locationValidation.valid) {
      return res.status(400).json({ message: locationValidation.message });
    }

    const profilePicValidation = validateProfilePic(req.body.profilePic);
    if (!profilePicValidation.valid) {
      return res.status(400).json({ message: profilePicValidation.message });
    }

    const normalizedUsername = usernameValidation.value;

    const existingUsername = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: userId },
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists in database" });
    }

    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    updatedUser.fullName = fullNameValidation.value;
    updatedUser.username = normalizedUsername;
    updatedUser.bio = bioValidation.value;
    updatedUser.nativeLanguage = nativeLanguageValidation.value;
    updatedUser.learningLanguage = learningLanguageValidation.value;
    updatedUser.location = locationValidation.value;
    if (profilePicValidation.value !== undefined) {
      updatedUser.profilePic = profilePicValidation.value;
    }
    updatedUser.isOnboarded = true;
    updatedUser.active = true;
    await updatedUser.save();

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: getStreamImage(updatedUser.profilePic),
      });
      console.log(`Stream user updated for ${updatedUser.fullName} during onboarding`);
    } catch (streamError) {
      console.log("Error in updating stream user during onboarding", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Error in onboarding controller", error);
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "Email already exists, please use a different email" });
    }
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({ message: "Username already exists in database" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}
