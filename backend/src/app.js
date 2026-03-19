import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config({ quiet: true });

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedVercelPreviewSuffixes = (process.env.CLIENT_VERCEL_PREVIEW_SUFFIXES || "vercel.app")
  .split(",")
  .map((suffix) => suffix.trim().toLowerCase())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);

    if (protocol !== "https:") {
      return false;
    }

    return allowedVercelPreviewSuffixes.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
};

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Live Chat API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRoutes);

export default app;
