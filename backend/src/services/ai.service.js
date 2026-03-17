// src/services/ai.service.js
const axios = require("axios");

async function generateReply(prompt) {
  try {
    const useOllama = process.env.USE_OLLAMA === "true";

    // 👉 OPTION 1: USE LOCAL OLLAMA (FREE + UNLIMITED)
    if (useOllama) {
      const model = process.env.OLLAMA_MODEL || "codellama";

      const res = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model,
          prompt,
          stream: false
        }
      );

      return res.data.response.trim();
    }

    // 👉 OPTION 2: fallback — OpenAI (if you ever want)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("No OpenAI API key provided.");

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful WhatsApp assistant." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.log("AI Error → ", err.message);
    return "Sorry, I could not generate a reply.";
  }
}

module.exports = { generateReply };
