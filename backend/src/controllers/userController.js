import FriendRequest from "../models/FriendRequest.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const publicUserFields = "fullName username profilePic nativeLanguage learningLanguage location bio active";

const isBlockedEitherWay = (currentUser, targetUser) => {
  const currentBlocked = (currentUser.blockedUsers || []).some(
    (blockedId) => blockedId.toString() === targetUser._id.toString(),
  );
  const targetBlocked = (targetUser.blockedUsers || []).some(
    (blockedId) => blockedId.toString() === currentUser._id.toString(),
  );

  return currentBlocked || targetBlocked;
};

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const search = req.query.search?.trim();

    const filters = [
      { _id: { $ne: currentUserId } },
      { _id: { $nin: req.user.friend || [] } },
      { _id: { $nin: req.user.blockedUsers || [] } },
      { blockedUsers: { $nin: [currentUserId] } },
      { isOnboarded: true },
    ];

    if (search) {
      filters.push({
        username: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
      });
    }

    const recommendedUsers = await User.find({ $and: filters }).select(publicUserFields);
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const friends = await User.find({
      _id: { $in: req.user.friend || [], $nin: req.user.blockedUsers || [] },
      blockedUsers: { $nin: [req.user.id] },
    })
      .select(publicUserFields)
      .sort({ fullName: 1 });

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error in getMyFriends Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getBlockedUsers(req, res) {
  try {
    const blockedUsers = await User.find({
      _id: { $in: req.user.blockedUsers || [] },
    })
      .select(publicUserFields)
      .sort({ fullName: 1 });

    res.status(200).json(blockedUsers);
  } catch (error) {
    console.error("Error in getBlockedUsers Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    if (isBlockedEitherWay(req.user, recipient)) {
      return res.status(400).json({ message: "This user is unavailable." });
    }

    if (recipient.friend.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId, status: "pending" },
        { sender: recipientId, recipient: myId, status: "pending" },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friend: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friend: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function blockUser(req, res) {
  try {
    const { id: targetUserId } = req.params;

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    const targetUser = await User.findById(targetUserId).select("_id");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { blockedUsers: targetUserId },
      $pull: { friend: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { friend: req.user.id },
    });

    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user.id, recipient: targetUserId },
        { sender: targetUserId, recipient: req.user.id },
      ],
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function unblockUser(req, res) {
  try {
    const { id: targetUserId } = req.params;

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You cannot unblock yourself." });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { blockedUsers: targetUserId },
    });

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error in unblockUser Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function reportUser(req, res) {
  try {
    const { id: targetUserId } = req.params;
    const reason = req.body.reason?.trim();

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You cannot report yourself." });
    }

    const targetUser = await User.findById(targetUserId).select("_id");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: targetUserId,
      reason,
    });

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error in reportUser Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingFriendRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", publicUserFields);

    const acceptedFriendRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", publicUserFields);

    res.status(200).json({ incomingFriendRequests, acceptedFriendRequests });
  } catch (error) {
    console.error("Error in getFriendRequests Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", publicUserFields);

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendRequests Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
