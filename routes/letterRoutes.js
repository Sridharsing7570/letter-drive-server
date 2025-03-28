const express = require("express");
const { google } = require("googleapis");
const Letter = require("../model/letterSchema");
const User = require("../model/userSchema");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Get Google Drive client
const getDriveClient = (user) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.SERVER_URL}/api/auth/google/callback`
    );

    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
    });

    return google.drive({ version: "v3", auth: oauth2Client });
};

// Create a new letter
router.post("/", authenticate, async (req, res) => {
    try {
        const { title, content } = req.body;

        // Create letter in database
        const letter = new Letter({
            title,
            content,
            user: req.user._id,
        });

        await letter.save();

        res.status(201).json(letter);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get all letters for the current user
router.get("/", authenticate, async (req, res) => {
    try {
        const letters = await Letter.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.status(200).json(letters);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get a specific letter
router.get("/:id", authenticate, async (req, res) => {
    try {
        const letter = await Letter.findOne({ _id: req.params.id, user: req.user._id });

        if (!letter) {
            return res.status(404).json({ message: "Letter not found" });
        }

        res.status(200).json(letter);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update a letter
router.put("/:id", authenticate, async (req, res) => {
    try {
        const { title, content } = req.body;

        const letter = await Letter.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                title,
                content,
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!letter) {
            return res.status(404).json({ message: "Letter not found" });
        }

        res.status(200).json(letter);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Save letter to Google Drive
router.post("/:id/save-to-drive", authenticate, async (req, res) => {
    try {
        const letter = await Letter.findOne({ _id: req.params.id, user: req.user._id });

        if (!letter) {
            return res.status(404).json({ message: "Letter not found" });
        }

        const drive = getDriveClient(req.user);

        // Check if "Letters" folder exists, create if not
        let folderId;
        const folderResponse = await drive.files.list({
            q: "name='Letters' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: "files(id, name)",
        });

        if (folderResponse.data.files.length > 0) {
            folderId = folderResponse.data.files[0].id;
        } else {
            const folderMetadata = {
                name: "Letters",
                mimeType: "application/vnd.google-apps.folder",
            };

            const folder = await drive.files.create({
                resource: folderMetadata,
                fields: "id",
            });

            folderId = folder.data.id;
        }

        // Create or update file in Google Drive
        const fileMetadata = {
            name: `${letter.title}.txt`,
            parents: letter.googleDriveFileId ? undefined : [folderId],
        };

        const media = {
            mimeType: "text/plain",
            body: letter.content,
        };

        let response;

        if (letter.googleDriveFileId) {
            // Update existing file
            response = await drive.files.update({
                fileId: letter.googleDriveFileId,
                resource: fileMetadata,
                media: media,
                fields: "id",
            });
        } else {
            // Create new file
            response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: "id",
            });

            // Update letter with Google Drive file ID
            letter.googleDriveFileId = response.data.id;
            await letter.save();
        }

        // Convert to Google Docs format
        await drive.files.copy({
            fileId: letter.googleDriveFileId,
            resource: {
                name: `${letter.title} (Google Docs version)`,
                parents: [folderId],
            },
        });

        res.status(200).json({
            message: "Letter saved to Google Drive successfully",
            googleDriveFileId: letter.googleDriveFileId,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete a letter
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const letter = await Letter.findOne({ _id: req.params.id, user: req.user._id });

        if (!letter) {
            return res.status(404).json({ message: "Letter not found" });
        }

        // Delete from Google Drive if it exists there
        if (letter.googleDriveFileId) {
            const drive = getDriveClient(req.user);
            await drive.files.delete({ fileId: letter.googleDriveFileId });
        }

        await Letter.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: "Letter deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
