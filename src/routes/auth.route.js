import express from 'express';
import { login, logout, onboard, signup } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// define route here 
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding",protectedRoute, onboard);

// checking if user is logged in
router.get("/me", protectedRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});


export default router;  