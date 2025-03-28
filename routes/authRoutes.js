const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

// Google OAuth login route
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
        accessType: "offline",
        prompt: "consent",
    })
);

// Google OAuth callback route
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        // Create JWT token
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set token as HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Required for HTTPS
            sameSite: "None", // Required for cross-origin
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect to frontend
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

// Logout route
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
});

// Get current user
router.get("/current-user", (req, res) => {
    const token = req.cookies.token;

    console.log("token", token);

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ user: decoded });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

module.exports = router;
