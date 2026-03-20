import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { emailRegex, usernameRegex } from "../lib/validation/auth.validation.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: usernameRegex,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: emailRegex,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    profilePic: {
      type: String,
      default: "",
      trim: true,
    },
    nativeLanguage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 40,
    },
    learningLanguage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 40,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    friend: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;
