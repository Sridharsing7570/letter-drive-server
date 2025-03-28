const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("./config/passport");
const connectDb = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(passport.initialize());

// Routes

app.use("/", require("./routes/index"));

// Connect to MongoDB
connectDb();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
