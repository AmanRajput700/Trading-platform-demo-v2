import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ExternalLink
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

import { PageHeader } from '../../components/common/PageHeader';
import { X } from 'lucide-react';

export const TradeHistoryPage: React.FC = () => {
  const { trades, navigateToInstrument } = useTrading();
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [pnlFilter, setPnlFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrades = trades.filter(t => {
    if (sideFilter !== 'ALL' && t.side !== sideFilter) return false;
    if (pnlFilter === 'PROFIT' && t.pnl <= 0) return false;
    if (pnlFilter === 'LOSS' && t.pnl > 0) return false;
    if (searchQuery && !t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && !t.strategyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const winCount = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length > 0 ? ((winCount / trades.length) * 100).toFixed(1) : '0';

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Trade History & Executions"
        subtitle="Complete historical log of all automated strategy executions and manual order fills"
        badge={{ text: "Audit Journal", variant: "neutral" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Total Realized P&L</span>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: totalPnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Across {trades.length} recorded trades
          </div>
        </div>

        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Win Rate</span>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {winRate}%
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            {winCount} Profitable Trades
          </div>
        </div>

        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Execution Protocol</span>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Direct Market Access (DMA)
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Zerodha FIX Gateway
          </div>
        </div>
      </div>

      {/* Table & Filters Card */}
      <div className="surface-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Filters Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-default)',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Filters:</span>
            
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as any)}
              className="select"
              style={{ height: 28, fontSize: 11, padding: '0 24px 0 8px' }}
            >
              <option value="ALL">All Sides</option>
              <option value="BUY">Buy Only</option>
              <option value="SELL">Sell Only</option>
            </select>

            <select
              value={pnlFilter}
              onChange={(e) => setPnlFilter(e.target.value as any)}
              className="select"
              style={{ height: 28, fontSize: 11, padding: '0 24px 0 8px' }}
            >
              <option value="ALL">All Outcomes</option>
              <option value="PROFIT">Profits Only</option>
              <option value="LOSS">Losses Only</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0 8px',
            height: 28
          }}>
            <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search symbol or strategy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 11,
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                width: 170
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-tertiary)'
                }}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Date & Time</th>
                <th>Strategy</th>
                <th>Instrument</th>
                <th>Side</th>
                <th className="text-right">Entry (₹)</th>
                <th className="text-right">Exit (₹)</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Realized P&L</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => {
                const isPos = trade.pnl >= 0;
                return (
                  <tr key={trade.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{trade.id}</td>
                    <td className="text-secondary" style={{ fontSize: 11 }}>
                      {trade.date}, {trade.time}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>
                        {trade.strategyName}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{trade.symbol}</div>
                    </td>
                    <td>
                      <span className={`badge ${trade.side === 'BUY' ? 'badge-positive' : 'badge-negative'}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="text-right mono">₹{trade.entryPrice.toFixed(2)}</td>
                    <td className="text-right mono">₹{trade.exitPrice.toFixed(2)}</td>
                    <td className="text-right mono">{trade.quantity}</td>
                    <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                      {isPos ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({isPos ? '+' : ''}{trade.pnlPercent}%)
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => navigateToInstrument(trade.symbol)}
                        className="btn btn-secondary btn-sm"
                        style={{ height: 22, padding: '0 6px' }}
                        title="View Instrument"
                      >
                        <ExternalLink size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
