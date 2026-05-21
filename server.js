const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Enable CORS so your browser extension can talk to this backend
app.use(cors());

// 2. CRITICAL: Increase payload limits so large base64 images don't crash the server
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. The main endpoint your extension is hitting
app.post('/analyze', async (req, res) => {
  try {
    const { image, mimeType, prompt } = req.body;

    // Check if the extension actually sent the image data
    if (!image) {
      return res.status(400).json({ error: "No image data received by the server." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Backend missing GEMINI_API_KEY environment variable." });
    }

    // Google Gemini API connection URL
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    // Structure the data EXACTLY how Google Gemini demands it
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt }, // The system instructions passed from popup.js
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: image // The pure base64 string
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json" // Forces Gemini to reply in JSON
        }
      })
    });

    const data = await response.json();

    // If Google rejects our request, capture their exact reason
    if (!response.ok) {
      console.error("Google Gemini API Error Response:", data);
      return res.status(response.status).json({
        error: "Google Gemini rejected the request.",
        details: data
      });
    }

    // Extract the text output from Gemini's response structure
    const generatedText = data.candidates[0].content.parts[0].text;

    // Send it back to your extension popup.js
    res.json({ text: generatedText });

  } catch (error) {
    console.error("Server Crash Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running perfectly on port ${PORT}`);
});
