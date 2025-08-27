import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getFriendsList, getRecommendedUsers, sendFriendRequest, acceptFriendRequest, getFriendRequest, getOutgoingFriendRequest } from '../controllers/user.controller.js';

const router = express.Router();

// apply all routes 
router.use(protectedRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getFriendsList);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequest);
router.get("/outgoing-friend-requests", getOutgoingFriendRequest);

export default router;