const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
    return res.send(`<h1>Letter Drive server is running.</h1>`);
});
router.use("/api/auth", require("./authRoutes"));
router.use("/api/letters", require("./letterRoutes"));

module.exports = router;
