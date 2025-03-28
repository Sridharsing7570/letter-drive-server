const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Reduce initial connection delay
        });

        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
