import express from "express";
import { protectRoute } from "../lib/middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chatController.js";

const router = express.Router()

router.use(protectRoute);

router.get("/token", getStreamToken)

export default router