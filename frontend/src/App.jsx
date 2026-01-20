import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  LayoutDashboard,
  Bell,
  Settings,
  Menu,
  X,
  Sparkles,
  Loader2,
  Wallet,
} from "lucide-react";
import { cn } from "./lib/utils";
import "./App.css";

// --- Utility Components ---

const Card = ({ className, children }) => (
  <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);

const MetricCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between space-y-0 pb-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex items-center justify-between pt-2">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </div>
      {trend && (
        <div className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </div>
      )}
    </div>
  </Card>
);

// --- Custom Chart Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-lg font-bold text-emerald-500">${payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Insider Volume</p>
      </div>
    );
  }
  return null;
};

// --- Trade Detail Modal ---
const TradeModal = ({ trade, onClose }) => {
  if (!trade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-emerald-500">{trade.symbol}</h2>
            <p className="text-muted-foreground">{trade.insider}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Shares</p>
              <p className="text-xl font-bold">{trade.shares.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Price</p>
              <p className="text-xl font-bold">${trade.price}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Total Value</p>
              <p className="text-xl font-bold text-emerald-500">${trade.cost.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase">Date</p>
              <p className="text-xl font-bold">{trade.date}</p>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg">
            <p className="text-sm font-medium text-emerald-500">
              ✓ Strong Buy Signal - Insider acquired shares at market price
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Trade Table ---
const TradeTable = ({ trades, onRowClick }) => (
  <Card className="overflow-hidden">
    <div className="p-6 border-b border-border">
      <h3 className="text-lg font-medium">Recent Buy Signals</h3>
      <p className="text-sm text-muted-foreground mt-1">Click a row for details</p>
    </div>
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b border-border">
          <tr className="border-b border-border">
            <th className="h-12 px-4 text-left font-medium text-muted-foreground">Symbol</th>
            <th className="h-12 px-4 text-left font-medium text-muted-foreground">Insider</th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground">Shares</th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground">Price</th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground">Total Value</th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground">Date</th>
            <th className="h-12 px-4 text-center font-medium text-muted-foreground">Signal</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => (
            <tr
              key={i}
              className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => onRowClick(trade)}
            >
              <td className="p-4 font-semibold">{trade.symbol}</td>
              <td className="p-4 text-muted-foreground">{trade.insider}</td>
              <td className="p-4 text-right">{trade.shares.toLocaleString()}</td>
              <td className="p-4 text-right">${trade.price}</td>
              <td className="p-4 text-right font-medium text-emerald-500">${trade.cost.toLocaleString()}</td>
              <td className="p-4 text-right text-muted-foreground">{trade.date}</td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                  Buy
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// --- Sidebar ---
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      active
        ? "bg-secondary text-primary"
        : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

// --- Analysis View (OpenAI) ---
const AnalysisView = ({ trades }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades }),
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Analysis</h2>
          <p className="text-muted-foreground">Powered by OpenAI GPT-4</p>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing..." : "Generate Analysis"}
        </button>
      </div>

      {error && (
        <Card className="p-6 border-red-500/50">
          <p className="text-red-400">Error: {error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure OPENAI_API_KEY is set in backend/.env
          </p>
        </Card>
      )}

      {analysis && (
        <Card className="p-6">
          <div className="prose prose-invert max-w-none [&_strong]:text-emerald-400 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_li]:text-foreground [&_p]:text-foreground">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </Card>
      )}

      {!analysis && !loading && !error && (
        <Card className="p-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
          <p className="text-muted-foreground">
            Click "Generate Analysis" to get AI-powered insights on the current insider trades.
          </p>
        </Card>
      )}
    </div>
  );
};

// --- Trading View (Alpaca with $100 Budget) ---
const BUDGET = 100; // Your virtual budget

const TradingView = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeQty, setTradeQty] = useState("");
  const [tradeSide, setTradeSide] = useState("buy");
  const [tradeResult, setTradeResult] = useState(null);
  const [executing, setExecuting] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/portfolio");
      const data = await response.json();
      setPortfolio(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Calculate spent from positions (only count our trades up to $100)
  const positions = portfolio?.positions || [];
  const totalSpent = positions.reduce((sum, p) => sum + (p.avg_entry_price * p.qty), 0);
  const spentCapped = Math.min(totalSpent, BUDGET);
  const remaining = Math.max(BUDGET - spentCapped, 0);
  const currentValue = positions.reduce((sum, p) => sum + p.market_value, 0);
  const cappedValue = Math.min(currentValue, BUDGET + (currentValue - totalSpent));
  const profitLoss = currentValue - totalSpent;

  const executeTrade = async () => {
    if (!tradeSymbol || !tradeQty) return;

    // Check budget before buying
    if (tradeSide === "buy" && remaining <= 0) {
      setTradeResult({ success: false, error: "No budget remaining! You've spent your $100." });
      return;
    }

    setExecuting(true);
    setTradeResult(null);
    try {
      const response = await fetch("http://localhost:8000/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: tradeSymbol.toUpperCase(),
          qty: parseFloat(tradeQty),
          side: tradeSide
        }),
      });
      const data = await response.json();
      setTradeResult(data);
      if (data.success) {
        setTradeSymbol("");
        setTradeQty("");
        fetchPortfolio();
      }
    } catch (e) {
      setTradeResult({ success: false, error: e.message });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paper Trading</h2>
          <p className="text-muted-foreground">$100 Budget Challenge</p>
        </div>
        <button
          onClick={fetchPortfolio}
          className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* $100 Budget Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 border-emerald-500/50">
          <p className="text-sm text-muted-foreground">Your Budget</p>
          <p className="text-3xl font-bold text-emerald-500">${BUDGET}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className="text-3xl font-bold">${spentCapped.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className={`text-3xl font-bold ${remaining > 0 ? "text-emerald-500" : "text-red-500"}`}>
            ${remaining.toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">P/L</p>
          <p className={`text-3xl font-bold ${profitLoss >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {profitLoss >= 0 ? "+" : ""}${profitLoss.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Budget Warning */}
      {remaining < 20 && remaining > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg text-yellow-400">
          ⚠️ Low budget! Only ${remaining.toFixed(2)} remaining.
        </div>
      )}
      {remaining <= 0 && (
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg text-red-400">
          🛑 Budget exhausted! Sell positions to free up funds.
        </div>
      )}

      {/* Trade Form */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Execute Trade</h3>
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Symbol (e.g., NVDA)"
            value={tradeSymbol}
            onChange={(e) => setTradeSymbol(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground w-40"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={tradeQty}
            onChange={(e) => setTradeQty(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground w-32"
          />
          <select
            value={tradeSide}
            onChange={(e) => setTradeSide(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <button
            onClick={executeTrade}
            disabled={executing || !tradeSymbol || !tradeQty}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${tradeSide === "buy"
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-red-500 text-white hover:bg-red-400"
              } disabled:opacity-50`}
          >
            {executing ? "Executing..." : `${tradeSide.toUpperCase()} ${tradeSymbol.toUpperCase() || "..."}`}
          </button>
        </div>
        {tradeResult && (
          <div className={`mt-4 p-4 rounded-lg ${tradeResult.success ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            {tradeResult.success ? tradeResult.message : `Error: ${JSON.stringify(tradeResult.error)}`}
          </div>
        )}
      </Card>

      {/* Positions */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-medium">Open Positions</h3>
        </div>
        {positions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No open positions. Execute a trade to get started!
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Symbol</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">Qty</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">Avg Price</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">Current</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">P/L</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">P/L %</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-4 font-semibold">{p.symbol}</td>
                    <td className="p-4 text-right">{p.qty}</td>
                    <td className="p-4 text-right">${p.avg_entry_price?.toFixed(2)}</td>
                    <td className="p-4 text-right">${p.current_price?.toFixed(2)}</td>
                    <td className={`p-4 text-right font-medium ${p.unrealized_pl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      ${p.unrealized_pl?.toFixed(2)}
                    </td>
                    <td className={`p-4 text-right ${p.unrealized_plpc >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {p.unrealized_plpc?.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Alerts View ---
const AlertsView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Alerts</h2>
    <Card className="p-12 text-center">
      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No Alerts Configured</h3>
      <p className="text-muted-foreground">Set up price alerts and notifications here.</p>
    </Card>
  </div>
);

// --- Settings View ---
const SettingsView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
    <Card className="p-6">
      <h3 className="font-medium mb-4">API Configuration</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Finnhub API Key</label>
          <input type="password" value="••••••••" disabled className="w-full mt-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">OpenAI API Key</label>
          <input type="password" value="••••••••" disabled className="w-full mt-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground" />
        </div>
      </div>
    </Card>
  </div>
);

// --- Dashboard View ---
const DashboardView = ({ trades, loading, chartData, onRowClick }) => (
  <>
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      <div className="flex items-center gap-2">
        <span className="flex items-center text-sm text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Live Market Data
        </span>
      </div>
    </div>

    {/* Metrics */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard title="Total Opportunities" value={trades.length.toString()} subtext="Active buy signals" icon={Activity} trend="+12%" />
      <MetricCard title="Avg. Potential Return" value="15.4%" subtext="Based on historicals" icon={TrendingUp} trend="+2.1%" />
      <MetricCard title="Capital Deployed" value="$0.00" subtext="Awaiting execution" icon={DollarSign} />
      <MetricCard title="Winning Rate" value="68%" subtext="Last 30 days" icon={Activity} />
    </div>

    <div className="grid gap-4 md:grid-cols-7">
      {/* Chart */}
      <Card className="col-span-4 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Market Activity</h3>
          <p className="text-sm text-muted-foreground">Insider volume over last 7 days</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sectors */}
      <Card className="col-span-3 p-6">
        <h3 className="text-lg font-medium mb-4">Top Sectors</h3>
        <div className="space-y-4">
          {["Technology", "Healthcare", "Energy", "Finance"].map((sector, i) => (
            <div key={sector} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-emerald-500" : "bg-gray-500"}`} />
                <span className="text-sm font-medium">{sector}</span>
              </div>
              <span className="text-sm text-muted-foreground">High Activity</span>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-secondary/50 rounded-lg border border-border">
          <h4 className="font-semibold text-sm mb-1">Pro Tip</h4>
          <p className="text-xs text-muted-foreground">
            Cluster buys (3+ insiders buying within 1 week) have a 24% higher probability of profit.
          </p>
        </div>
      </Card>
    </div>

    {/* Table */}
    {loading ? (
      <div className="text-center py-20 text-muted-foreground">Loading market data...</div>
    ) : (
      <TradeTable trades={trades} onRowClick={onRowClick} />
    )}
  </>
);

// --- Main App ---
function App() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/insider-trades")
      .then((res) => res.json())
      .then((data) => setTrades(data.data || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const chartData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 2000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trading", label: "Trading", icon: Wallet },
    { id: "analysis", label: "Analysis", icon: Sparkles },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveView(id);
    setMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case "trading": return <TradingView />;
      case "analysis": return <AnalysisView trades={trades} />;
      case "alerts": return <AlertsView />;
      case "settings": return <SettingsView />;
      default: return <DashboardView trades={trades} loading={loading} chartData={chartData} onRowClick={setSelectedTrade} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-border bg-background flex flex-col transition-transform md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
            InsiderTracker
          </h1>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeView === item.id}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-border bg-background px-4 md:px-6 flex items-center justify-between">
          {/* Mobile menu button */}
          <button className="md:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          {/* Search - hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-md w-96">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search detailed ticker report...</span>
          </div>

          {/* Mobile title */}
          <span className="md:hidden font-semibold text-sm">{navItems.find(n => n.id === activeView)?.label || "Dashboard"}</span>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full" />
            </button>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-medium border border-border text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Main content with responsive padding */}
        <main className="flex-1 overflow-auto p-4 md:p-8 space-y-4 md:space-y-8">
          {renderView()}
        </main>
      </div>

      {/* Trade Detail Modal */}
      <TradeModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </div>
  );
}

export default App;

