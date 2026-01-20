# InsiderTracker

Insider trading signal tracker with AI analysis and Alpaca paper trading.

## Features
- 📊 Dashboard with insider trading signals
- 🤖 AI-powered analysis (OpenAI GPT-4)
- 💰 Paper trading via Alpaca
- 📈 Portfolio tracking

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create `backend/.env`:
```
FINNHUB_API_KEY=your-key
OPENAI_API_KEY=your-key
ALPACA_API_KEY=your-key
ALPACA_SECRET_KEY=your-secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

## Deploy to Render
1. Push to GitHub
2. Connect repo to Render.com
3. Use "Blueprint" deployment with `render.yaml`
4. Set environment variables in dashboard
