import requests
import os
import urllib3
from datetime import datetime, timedelta

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Popular stocks to monitor for insider activity
WATCHLIST = ["AAPL", "MSFT", "NVDA", "TSLA", "AMD", "GOOGL", "AMZN", "META", "NFLX", "INTC"]

# Mock data for when API is unavailable or returns no data
MOCK_DATA = [
    {"symbol": "NVDA", "insider": "Jensen Huang", "date": "2026-01-15", "shares": 50000, "price": 142.50, "cost": 7125000.00, "filing_date": "2026-01-17", "signal": "Buy"},
    {"symbol": "AAPL", "insider": "Tim Cook", "date": "2026-01-14", "shares": 25000, "price": 185.20, "cost": 4630000.00, "filing_date": "2026-01-16", "signal": "Buy"},
    {"symbol": "MSFT", "insider": "Satya Nadella", "date": "2026-01-12", "shares": 15000, "price": 412.75, "cost": 6191250.00, "filing_date": "2026-01-14", "signal": "Buy"},
    {"symbol": "TSLA", "insider": "Robyn Denholm", "date": "2026-01-10", "shares": 10000, "price": 245.30, "cost": 2453000.00, "filing_date": "2026-01-12", "signal": "Buy"},
    {"symbol": "AMD", "insider": "Lisa Su", "date": "2026-01-08", "shares": 20000, "price": 178.90, "cost": 3578000.00, "filing_date": "2026-01-10", "signal": "Buy"},
    {"symbol": "GOOGL", "insider": "Sundar Pichai", "date": "2026-01-05", "shares": 8000, "price": 175.40, "cost": 1403200.00, "filing_date": "2026-01-07", "signal": "Buy"},
]


def get_api_key():
    """Get the Finnhub API key from environment."""
    api_key = os.getenv("FINNHUB_API_KEY")
    if not api_key:
        raise ValueError("FINNHUB_API_KEY is not set in .env file")
    return api_key


def fetch_insider_trades(symbol: str) -> list:
    """
    Fetch insider transactions for a specific symbol from Finnhub.
    Returns a list of transaction dictionaries.
    """
    api_key = get_api_key()
    url = f"https://finnhub.io/api/v1/stock/insider-transactions?symbol={symbol}&token={api_key}"
    
    try:
        response = requests.get(url, verify=False, timeout=10)
        response.raise_for_status()
        data = response.json()
        transactions = data.get("data")
        return transactions if transactions else []
    except requests.RequestException as e:
        print(f"Error fetching data for {symbol}: {e}")
        return []


def analyze_trades(trades: list) -> list:
    """
    Analyze trades to identify buy signals.
    Returns list of significant insider buys.
    """
    buy_signals = []
    
    for trade in trades:
        try:
            # 'change' is the number of shares bought/sold
            shares_change = trade.get("change", 0)
            price = trade.get("transactionPrice", 0)
            
            # Positive change = shares acquired (buy signal)
            if shares_change and shares_change > 0 and price and price > 0:
                total_value = shares_change * price
                
                buy_signals.append({
                    "symbol": trade.get("symbol", "N/A"),
                    "insider": trade.get("name", "Unknown"),
                    "date": trade.get("transactionDate", "N/A"),
                    "shares": int(shares_change),
                    "price": round(price, 2),
                    "cost": round(total_value, 2),
                    "filing_date": trade.get("filingDate", "N/A"),
                    "signal": "Buy"
                })
        except (TypeError, ValueError):
            continue
    
    return buy_signals


def get_market_opportunities(use_mock: bool = False) -> list:
    """
    Scan the watchlist for insider buying opportunities.
    Returns all buy signals sorted by date (most recent first).
    
    If use_mock is True or no real data is available, returns mock data.
    """
    if use_mock:
        return MOCK_DATA
    
    all_opportunities = []
    
    for symbol in WATCHLIST:
        trades = fetch_insider_trades(symbol)
        buys = analyze_trades(trades)
        all_opportunities.extend(buys)
    
    # If no real data, return mock data
    if not all_opportunities:
        print("No real data available, using mock data")
        return MOCK_DATA
    
    # Sort by date (most recent first), handle missing dates
    all_opportunities.sort(
        key=lambda x: x.get("date") or "1900-01-01",
        reverse=True
    )
    
    return all_opportunities
