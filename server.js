// OutfitLens AI - Proxy Server
// Deploy on: Render / Railway / Vercel / any Node host
// Users never see the API key - it lives here only

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allow requests from Chrome extension
app.use(express.json({ limit: '10mb' })); // Images can be large

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Set in hosting dashboard
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

app.post('/analyze', async (req, res) => {
  try {
    const { image, mimeType, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing image or prompt' });
    }

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: image } },
            { text: prompt + '\n\nReturn ONLY valid JSON, no other text.' }
          ]
        }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err?.error?.message || 'Gemini API error' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OutfitLens proxy running on port ${PORT}`));
