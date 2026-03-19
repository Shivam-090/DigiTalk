import express from "express";
import { signup, login, logout, onboard, forgotPassword } from "../controllers/authController.js";
import { protectRoute } from "../lib/middleware/auth.middleware.js";

const router = express.Router()

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/onboarding", protectRoute, onboard);


// Check current authenticated user
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});


export default router 
