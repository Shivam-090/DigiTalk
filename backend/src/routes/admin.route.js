import express from "express";
import { getAllReports, getAllUsers, updateUserActiveStatus } from "../controllers/adminController.js";
import { protectAdminRoute } from "../lib/middleware/admin.middleware.js";
import { protectRoute } from "../lib/middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute, protectAdminRoute);

router.get("/users", getAllUsers);
router.patch("/users/:id/active", updateUserActiveStatus);
router.get("/reports", getAllReports);

export default router;
