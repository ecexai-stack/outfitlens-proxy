# OutfitLens AI Proxy

Deploy this once. All extension users share it — no API key needed by users.

## Deploy on Render (FREE)

1. Push this folder to a GitHub repo
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Set environment variable: GEMINI_API_KEY = your key from aistudio.google.com
5. Deploy — you get a URL like https://outfitlens-proxy.onrender.com

## Then update extension

In popup.js, change:
  const PROXY_URL = 'https://outfitlens-proxy.alabayae.com/analyze';
To your Render URL:
  const PROXY_URL = 'https://outfitlens-proxy.onrender.com/analyze';

## Cost

- Render free tier: 750 hrs/month (enough for a hobby project)
- Gemini 1.5 Flash free tier: 1,500 requests/day, 1M tokens/day
- Total cost to run: $0 until you scale big
