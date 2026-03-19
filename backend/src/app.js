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

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
