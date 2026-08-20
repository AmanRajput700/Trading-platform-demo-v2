import React, { useState } from 'react';
import { 
  Layers, 
  PlusCircle, 
  Search, 
  LineChart 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { SECTOR_PERFORMANCE } from '../../mock/marketData';

export const Market: React.FC = () => {
  const { 
    indices, 
    instruments, 
    navigateToInstrument, 
    openQuickOrder, 
    setCurrentPage, 
    setCurrentStrategyId 
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active' | 'all'>('gainers');
  const [filterQuery, setFilterQuery] = useState('');

  const gainers = [...instruments].sort((a, b) => b.changePercent - a.changePercent);
  const losers = [...instruments].sort((a, b) => a.changePercent - b.changePercent);
  const active = [...instruments].sort((a, b) => b.volume - a.volume);

  const displayList = (activeTab === 'gainers' ? gainers : activeTab === 'losers' ? losers : activeTab === 'active' ? active : instruments)
    .filter(i => i.symbol.toLowerCase().includes(filterQuery.toLowerCase()) || i.name.toLowerCase().includes(filterQuery.toLowerCase()));

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Market Explorer</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Real-time NSE/BSE stock screener, sector heatmaps & market breadth
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentPage('options')}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Layers size={13} />
            <span>Options Chain</span>
          </button>
          <button
            onClick={() => {
              setCurrentStrategyId(null);
              setCurrentPage('strategy-builder');
            }}
            className="btn btn-primary btn-sm"
            style={{ gap: 6 }}
          >
            <PlusCircle size={14} />
            <span>Create Strategy</span>
          </button>
        </div>
      </div>

      {/* Indices Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {indices.map(idx => {
          const isPos = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="surface-card"
              style={{ padding: '10px 12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 12 }}>{idx.symbol}</span>
                <span className={`badge ${isPos ? 'badge-positive' : 'badge-negative'}`} style={{ fontSize: 9 }}>
                  {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 10, marginTop: 2 }}>
                {isPos ? '+' : ''}{idx.change.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 2-Column: Stock Screener & Sector Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* Left: Stock Table with Tabs */}
        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Filter & Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-default)',
            flexWrap: 'wrap',
            gap: 8
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['gainers', 'losers', 'active', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11,
                    fontWeight: activeTab === tab ? 600 : 500,
                    backgroundColor: activeTab === tab ? 'var(--text-primary)' : 'transparent',
                    color: activeTab === tab ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'active' ? 'Most Active' : `Top ${tab}`}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Filter symbols..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="input input-mono"
                style={{ height: 26, width: 140, fontSize: 11 }}
              />
            </div>
          </div>

          {/* Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">LTP (₹)</th>
                <th className="text-right">Change (%)</th>
                <th className="text-right">Volume</th>
                <th className="text-right">RSI</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(inst => {
                const isPos = inst.change >= 0;
                return (
                  <tr
                    key={inst.symbol}
                    onClick={() => navigateToInstrument(inst.symbol)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{inst.symbol}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{inst.name}</div>
                    </td>

                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 600 }}>
                      {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                    </td>

                    <td className="text-right mono text-muted">
                      {(inst.volume / 100000).toFixed(1)}L
                    </td>

                    <td className="text-right mono" style={{ fontWeight: 500 }}>
                      {inst.rsi.toFixed(1)}
                    </td>

                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToInstrument(inst.symbol);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ height: 22, padding: '0 6px' }}
                          title="View Chart"
                        >
                          <LineChart size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickOrder({
                              symbol: inst.symbol,
                              name: inst.name,
                              side: 'BUY',
                              price: inst.price,
                              initialQty: 10
                            });
                          }}
                          className="btn btn-buy btn-sm"
                          style={{ height: 22, padding: '0 8px', fontSize: 10 }}
                        >
                          Buy
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Sector Performance */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Sectoral Breadth</h2>
            <span className="mono text-muted" style={{ fontSize: 10 }}>NSE Indices</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTOR_PERFORMANCE.map(sec => {
              const isPos = sec.changePercent >= 0;
              return (
                <div
                  key={sec.sector}
                  style={{
                    backgroundColor: 'var(--bg-sunken)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{sec.sector}</div>
                    <div className="mono text-muted" style={{ fontSize: 10 }}>Adv/Dec: {sec.advDec}</div>
                  </div>
                  <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700, fontSize: 12 }}>
                    {isPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Strategy Scan Callout */}
          <div style={{
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginTop: 4
          }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Scan Market by Strategy</div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Run our predefined Momentum Breakout or RSI Reversal scanners across all sectors.
            </p>
            <button
              onClick={() => setCurrentPage('strategies')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 8, width: '100%' }}
            >
              Open Strategy Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
