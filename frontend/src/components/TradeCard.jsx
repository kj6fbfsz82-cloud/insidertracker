import React from 'react';

const TradeCard = ({ trade }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    return (
        <div className="glass-card p-6 cursor-pointer group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold gradient-text tracking-tight">
                        {trade.symbol}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{trade.insider}</p>
                </div>
                <span className="buy-badge">{trade.signal}</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-lg font-semibold text-white">${trade.price}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shares</p>
                    <p className="text-lg font-semibold text-white">{formatNumber(trade.shares)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-lg font-semibold text-emerald-400">{formatCurrency(trade.cost)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                    <p className="text-lg font-semibold text-white">{trade.date}</p>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="mt-4 flex items-center text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                View details
            </div>
        </div>
    );
};

export default TradeCard;
