import express from "express";
import { protectRoute } from "../lib/middleware/auth.middleware.js";
import { getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getOutgoingFriendRequests } from "../controllers/userController.js";

const router = express.Router();

// apply protectRoute middleware to all routes below
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/accept-friend-request/:id", acceptFriendRequest);
router.put("/reject-friend-request/:id", rejectFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;
