const { generateReply } = require("../services/ai.service");

exports.generateAIReply = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt required" });

    const reply = await generateReply(prompt);

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
