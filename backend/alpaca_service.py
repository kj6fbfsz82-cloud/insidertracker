"""
Alpaca Paper Trading Service
"""

import os
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def get_alpaca_credentials():
    """Get Alpaca API credentials from environment."""
    api_key = os.getenv("ALPACA_API_KEY")
    secret_key = os.getenv("ALPACA_SECRET_KEY")
    base_url = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
    
    if not api_key or not secret_key:
        raise ValueError("ALPACA_API_KEY and ALPACA_SECRET_KEY must be set")
    
    return api_key, secret_key, base_url


def get_headers():
    """Get authentication headers for Alpaca API."""
    api_key, secret_key, _ = get_alpaca_credentials()
    return {
        "APCA-API-KEY-ID": api_key,
        "APCA-API-SECRET-KEY": secret_key,
        "Content-Type": "application/json"
    }


def get_account():
    """Get account info including buying power and portfolio value."""
    _, _, base_url = get_alpaca_credentials()
    
    try:
        response = requests.get(
            f"{base_url}/v2/account",
            headers=get_headers(),
            verify=False,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        return {
            "buying_power": float(data.get("buying_power", 0)),
            "cash": float(data.get("cash", 0)),
            "portfolio_value": float(data.get("portfolio_value", 0)),
            "equity": float(data.get("equity", 0)),
            "status": data.get("status", "unknown")
        }
    except Exception as e:
        return {"error": str(e)}


def get_positions():
    """Get all current positions."""
    _, _, base_url = get_alpaca_credentials()
    
    try:
        response = requests.get(
            f"{base_url}/v2/positions",
            headers=get_headers(),
            verify=False,
            timeout=10
        )
        response.raise_for_status()
        positions = response.json()
        
        return [
            {
                "symbol": p.get("symbol"),
                "qty": float(p.get("qty", 0)),
                "avg_entry_price": float(p.get("avg_entry_price", 0)),
                "current_price": float(p.get("current_price", 0)),
                "market_value": float(p.get("market_value", 0)),
                "unrealized_pl": float(p.get("unrealized_pl", 0)),
                "unrealized_plpc": float(p.get("unrealized_plpc", 0)) * 100
            }
            for p in positions
        ]
    except Exception as e:
        return {"error": str(e)}


def place_order(symbol: str, qty: float, side: str, order_type: str = "market"):
    """
    Place a buy or sell order.
    
    Args:
        symbol: Stock symbol (e.g., "NVDA")
        qty: Number of shares (can be fractional)
        side: "buy" or "sell"
        order_type: "market" or "limit"
    """
    _, _, base_url = get_alpaca_credentials()
    
    try:
        order_data = {
            "symbol": symbol.upper(),
            "qty": str(qty),
            "side": side,
            "type": order_type,
            "time_in_force": "day"
        }
        
        response = requests.post(
            f"{base_url}/v2/orders",
            headers=get_headers(),
            json=order_data,
            verify=False,
            timeout=10
        )
        response.raise_for_status()
        order = response.json()
        
        return {
            "success": True,
            "order_id": order.get("id"),
            "symbol": order.get("symbol"),
            "qty": order.get("qty"),
            "side": order.get("side"),
            "status": order.get("status"),
            "message": f"Order placed: {side.upper()} {qty} shares of {symbol.upper()}"
        }
    except requests.exceptions.HTTPError as e:
        error_detail = e.response.json() if e.response else str(e)
        return {"success": False, "error": error_detail}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_orders():
    """Get recent orders."""
    _, _, base_url = get_alpaca_credentials()
    
    try:
        response = requests.get(
            f"{base_url}/v2/orders?status=all&limit=20",
            headers=get_headers(),
            verify=False,
            timeout=10
        )
        response.raise_for_status()
        orders = response.json()
        
        return [
            {
                "id": o.get("id"),
                "symbol": o.get("symbol"),
                "qty": o.get("qty"),
                "side": o.get("side"),
                "type": o.get("type"),
                "status": o.get("status"),
                "filled_at": o.get("filled_at"),
                "created_at": o.get("created_at")
            }
            for o in orders
        ]
    except Exception as e:
        return {"error": str(e)}
