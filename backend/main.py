import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env from the same directory as this file
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

from insider_service import get_market_opportunities, WATCHLIST
from openai_service import analyze_trades
from alpaca_service import get_account, get_positions, place_order, get_orders
from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class AnalyzeRequest(BaseModel):
    trades: List[Dict[str, Any]]


class TradeRequest(BaseModel):
    symbol: str
    qty: float
    side: str  # "buy" or "sell"

app = FastAPI(
    title="Insider Trading Tracker",
    description="Track insider buying activity for stock recommendations",
    version="1.0.0"
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "running", "message": "Insider Trading Tracker API"}


@app.get("/api/insider-trades")
def get_insider_trades():
    """
    Get all insider buying opportunities from the watchlist.
    Returns a list of recent insider purchases with buy signals.
    """
    try:
        opportunities = get_market_opportunities()
        return {
            "success": True,
            "count": len(opportunities),
            "data": opportunities
        }
    except ValueError as e:
        # API key not configured
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")


@app.get("/api/watchlist")
def get_watchlist():
    """Get the current list of stocks being monitored."""
    return {"watchlist": WATCHLIST}


@app.get("/api/health")
def health_check():
    """Check if API key is configured."""
    api_key = os.getenv("FINNHUB_API_KEY")
    return {
        "api_configured": bool(api_key),
        "watchlist_count": len(WATCHLIST)
    }


@app.post("/api/analyze")
def analyze_insider_trades(request: AnalyzeRequest):
    """
    Use OpenAI to analyze insider trades and provide AI insights.
    """
    try:
        analysis = analyze_trades(request.trades)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# --- Alpaca Paper Trading Endpoints ---

@app.get("/api/portfolio")
def get_portfolio():
    """Get Alpaca account info and positions."""
    try:
        account = get_account()
        positions = get_positions()
        return {
            "success": True,
            "account": account,
            "positions": positions if isinstance(positions, list) else []
        }
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio: {str(e)}")


@app.post("/api/trade")
def execute_trade(request: TradeRequest):
    """Execute a buy or sell order."""
    if request.side not in ["buy", "sell"]:
        raise HTTPException(status_code=400, detail="Side must be 'buy' or 'sell'")
    
    try:
        result = place_order(request.symbol, request.qty, request.side)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Trade failed"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trade failed: {str(e)}")


@app.get("/api/orders")
def get_trade_orders():
    """Get recent trade orders."""
    try:
        orders = get_orders()
        return {"success": True, "orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get orders: {str(e)}")
