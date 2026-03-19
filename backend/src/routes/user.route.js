import express from "express";
import { protectRoute } from "../lib/middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  blockUser,
  getBlockedUsers,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendRequests,
  getRecommendedUsers,
  rejectFriendRequest,
  reportUser,
  sendFriendRequest,
  unblockUser,
} from "../controllers/userController.js";

const router = express.Router();

// apply protectRoute middleware to all routes below
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/blocked-users", getBlockedUsers);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/accept-friend-request/:id", acceptFriendRequest);
router.put("/reject-friend-request/:id", rejectFriendRequest);
router.post("/block/:id", blockUser);
router.post("/unblock/:id", unblockUser);
router.post("/report/:id", reportUser);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;
