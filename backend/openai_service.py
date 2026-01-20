"""
OpenAI Service for generating AI-powered trade analysis.
"""

import os
import requests
import urllib3

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def get_openai_key():
    """Get OpenAI API key from environment."""
    return os.getenv("OPENAI_API_KEY")


def analyze_trades(trades: list) -> str:
    """
    Use OpenAI to analyze insider trades and generate insights.
    """
    api_key = get_openai_key()
    
    if not api_key:
        return """## API Key Not Configured

To enable AI analysis, add your OpenAI API key to `backend/.env`:

```
OPENAI_API_KEY=sk-your-key-here
```

## Mock Analysis (Demo Mode)

Based on the current insider trading data:

**🔥 Top Pick: NVDA (NVIDIA)**
Jensen Huang's $7.1M purchase signals strong confidence in upcoming product launches.

**📈 Strong Signals:**
- MSFT: Satya Nadella bought $6.1M worth - AI infrastructure play
- AAPL: Tim Cook's $4.6M purchase ahead of earnings

**💡 Strategy Recommendation:**
Consider allocating to NVDA and MSFT for AI exposure. Both show cluster buying patterns.

**⚠️ Risk Note:**
Past insider buying doesn't guarantee future returns. Always do your own research.
"""

    # Format trades for the prompt
    trade_summary = "\n".join([
        f"- {t.get('symbol')}: {t.get('insider')} bought {t.get('shares'):,} shares at ${t.get('price')} (Total: ${t.get('cost'):,}) on {t.get('date')}"
        for t in trades[:10]
    ])

    prompt = f"""You are an aggressive wealth-building strategist. Analyze these insider trades and give me a SPECIFIC action plan:

{trade_summary}

I have $100 to invest. Give me:

## 🎯 TOP PICK
Which ONE stock and why (be specific about the insider's trade)

## 💰 EXACT $100 ALLOCATION
Break down exactly how to split $100 across 2-3 stocks max. Include:
- Stock symbol
- Dollar amount
- Entry price target (buy at or below $X)

## 📈 PROFIT TARGETS (When to Sell)
For each stock you recommend:
- **Take Profit #1**: Sell 50% at +X% gain (price target $X)
- **Take Profit #2**: Sell remaining 50% at +X% gain (price target $X)
- **Stop Loss**: Exit if drops below $X (-X%)

## ⏰ TIMING
- Best time to buy (market open, dips, etc.)
- Expected hold period (days/weeks/months)

## ⚠️ RISKS
One key risk for each recommended stock

Be AGGRESSIVE but SMART. Use the actual stock prices from the insider trades above. This is for educational purposes."""

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a helpful financial analyst assistant. Be concise and actionable."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 800,
                "temperature": 0.7
            },
            verify=False,
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
        
    except Exception as e:
        return f"Error generating analysis: {str(e)}\n\nPlease check your OpenAI API key and try again."
