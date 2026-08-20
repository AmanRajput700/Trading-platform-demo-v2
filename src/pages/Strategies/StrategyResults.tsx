import React, { useState } from 'react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  Play, 
  LineChart, 
  Filter
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { MatchExplanation } from '../../components/strategy/MatchExplanation';
import { SignalType } from '../../types';

export const StrategyResults: React.FC = () => {
  const { 
    activeStrategyForResults, 
    instruments, 
    setCurrentPage, 
    navigateToInstrument, 
    openQuickOrder, 
    runStrategy, 
    setCurrentStrategyId 
  } = useTrading();

  const [signalFilter, setSignalFilter] = useState<'ALL' | SignalType>('ALL');
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'PRICE' | 'CHANGE' | 'VOLUME'>('RELEVANCE');
  const [selectedResultSymbol, setSelectedResultSymbol] = useState<string>('RELIANCE');

  const strategy = activeStrategyForResults || {
    id: 'strat-1',
    name: 'Momentum Breakout',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '15 min',
    status: 'ACTIVE',
    lastRun: '10:42:31 AM',
    matchCount: 17,
    description: 'Scans for oversold stocks breaking above 20 EMA with volume expansion.',
    groups: []
  };

  // Filter instruments that have strategy matches
  const matchedInstruments = instruments.filter(i => {
    if (!i.matchedStrategy) return false;
    if (signalFilter !== 'ALL' && i.matchedStrategy.signal !== signalFilter) return false;
    return true;
  });

  // Sort
  const sorted = [...matchedInstruments].sort((a, b) => {
    if (sortBy === 'PRICE') return b.price - a.price;
    if (sortBy === 'CHANGE') return b.changePercent - a.changePercent;
    if (sortBy === 'VOLUME') return b.volume - a.volume;
    return 0; // Default relevance
  });

  const selectedInst = instruments.find(i => i.symbol === selectedResultSymbol) || matchedInstruments[0] || instruments[0];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button
            onClick={() => setCurrentPage('strategies')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0 8px', marginTop: 2 }}
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700 }}>{strategy.name}</h1>
              <span className="badge badge-positive" style={{ fontSize: 10 }}>Active Scan</span>
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>{strategy.market}</span>
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>{strategy.timeframe}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                {matchedInstruments.length} Matching Instruments Found
              </span>
              <span>•</span>
              <span className="mono">Last Run: {strategy.lastRun || '10:42:31 AM'}</span>
              <span>•</span>
              <span>Scanned 2,146 instruments</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setCurrentStrategyId(strategy.id);
              setCurrentPage('strategy-builder');
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <SlidersHorizontal size={13} />
            <span>Edit Conditions</span>
          </button>
          <button
            onClick={() => runStrategy(strategy as any)}
            className="btn btn-primary btn-sm"
            style={{ gap: 6 }}
          >
            <Play size={13} />
            <span>Re-Scan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontSize: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Filter size={13} />
            <span>FILTERS:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="text-secondary">Signal:</span>
            {(['ALL', 'BUY', 'WATCH'] as const).map(sig => (
              <button
                key={sig}
                onClick={() => setSignalFilter(sig)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontWeight: signalFilter === sig ? 600 : 400,
                  backgroundColor: signalFilter === sig ? 'var(--bg-sunken)' : 'transparent',
                  border: signalFilter === sig ? '1px solid var(--border-strong)' : '1px solid transparent',
                  color: signalFilter === sig ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="select"
            style={{ height: 26, fontSize: 11 }}
          >
            <option value="RELEVANCE">Relevance Score</option>
            <option value="CHANGE">% Change</option>
            <option value="PRICE">Price</option>
            <option value="VOLUME">Volume</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Results Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* Left: Results Table */}
        <div className="surface-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Instrument</th>
                <th className="text-right">Price (₹)</th>
                <th className="text-right">Change</th>
                <th>Signal</th>
                <th className="text-right">RSI</th>
                <th className="text-right">Vol Ratio</th>
                <th className="text-right">Match</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    No instruments matched the active filter.
                  </td>
                </tr>
              ) : (
                sorted.map(inst => {
                  const isPos = inst.change >= 0;
                  const isSelected = inst.symbol === selectedResultSymbol;
                  const signal = inst.matchedStrategy?.signal || 'BUY';
                  const volRatio = +(inst.volume / inst.avgVolume).toFixed(1);

                  return (
                    <tr
                      key={inst.symbol}
                      onClick={() => setSelectedResultSymbol(inst.symbol)}
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 80ms ease'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {inst.symbol}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{inst.exchange} • {inst.sector?.split(' ')[0]}</div>
                      </td>

                      <td className="text-right mono" style={{ fontWeight: 600 }}>
                        ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 600 }}>
                        {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                      </td>

                      <td>
                        <span className={`badge ${signal === 'BUY' ? 'badge-positive' : signal === 'WATCH' ? 'badge-warning' : 'badge-negative'}`}>
                          {signal}
                        </span>
                      </td>

                      <td className="text-right mono" style={{ fontWeight: 500 }}>
                        {inst.rsi.toFixed(1)}
                      </td>

                      <td className="text-right mono" style={{ fontWeight: 500 }}>
                        {volRatio}x
                      </td>

                      <td className="text-right mono" style={{ fontWeight: 600, color: 'var(--positive)' }}>
                        {inst.matchedStrategy?.matchScore || '3/3'}
                      </td>

                      <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToInstrument(inst.symbol);
                            }}
                            className="btn btn-secondary btn-sm"
                            title="View Chart"
                            style={{ height: 24, padding: '0 6px' }}
                          >
                            <LineChart size={12} />
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
                            style={{ height: 24, padding: '0 8px', fontSize: 10 }}
                          >
                            Buy
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right: Signature "Why This Matched" Detailed Panel & Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {selectedInst && (
            <>
              <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 16, fontWeight: 700 }}>{selectedInst.symbol}</h2>
                      <span className="badge badge-neutral" style={{ fontSize: 10 }}>{selectedInst.exchange}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {selectedInst.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                      ₹{selectedInst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`mono ${selectedInst.change >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 11 }}>
                      {selectedInst.change >= 0 ? '+' : ''}{selectedInst.changePercent.toFixed(2)}% (+₹{selectedInst.change.toFixed(2)})
                    </div>
                  </div>
                </div>

                {/* Signature Match Explanation Component */}
                <MatchExplanation
                  strategyName={strategy.name}
                  signal={selectedInst.matchedStrategy?.signal || 'BUY'}
                  reasons={selectedInst.matchedStrategy?.reasons || [
                    `RSI at ${selectedInst.rsi.toFixed(1)} showing oversold condition`,
                    `Price (₹${selectedInst.price}) crossed above EMA 20 (₹${selectedInst.ema20})`,
                    `Volume ${(selectedInst.volume / selectedInst.avgVolume).toFixed(1)}x above 20-day average`
                  ]}
                  matchScore={selectedInst.matchedStrategy?.matchScore || '3/3'}
                  matchedTime={selectedInst.matchedStrategy?.matchedTime || '10:31 AM'}
                  rsi={selectedInst.rsi}
                  ema20={selectedInst.ema20}
                  volumeRatio={+(selectedInst.volume / selectedInst.avgVolume).toFixed(1)}
                />

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => navigateToInstrument(selectedInst.symbol)}
                    className="btn btn-secondary"
                    style={{ flex: 1, gap: 6 }}
                  >
                    <LineChart size={14} />
                    <span>Open Chart</span>
                  </button>
                  <button
                    onClick={() => openQuickOrder({
                      symbol: selectedInst.symbol,
                      name: selectedInst.name,
                      side: 'BUY',
                      price: selectedInst.price,
                      initialQty: 10
                    })}
                    className="btn btn-buy"
                    style={{ flex: 1.5, gap: 6, fontWeight: 700 }}
                  >
                    <span>Instant Buy</span>
                  </button>
                </div>
              </div>

              {/* Technical Indicator Quick Grid */}
              <div className="surface-card" style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Technical Snapshot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 11 }}>
                  <div style={{ backgroundColor: 'var(--bg-sunken)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-secondary">EMA 20</div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>₹{selectedInst.ema20.toFixed(2)}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-sunken)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-secondary">SMA 50</div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>₹{selectedInst.sma50.toFixed(2)}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-sunken)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-secondary">VWAP</div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>₹{selectedInst.vwap.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
