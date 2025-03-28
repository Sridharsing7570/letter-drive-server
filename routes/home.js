const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
    return res.send(`<h2>Letter drive backend running..</h2>`);
});

module.exports = router;
