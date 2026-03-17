const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { generateAIReply } = require("../controllers/ai.controller");

router.post("/reply", auth, generateAIReply);

module.exports = router;
