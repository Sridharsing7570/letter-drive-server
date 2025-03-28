const { Router } = require("express");
const router = Router();

router.get("/", require("./home"));
router.use("/api/auth", require("./authRoutes"));
router.use("/api/letters", require("./letterRoutes"));

module.exports = router;
