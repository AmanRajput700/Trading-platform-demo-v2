import React, { useState } from 'react';
import { 
  Activity, 
  WifiOff, 
  Play, 
  Pause, 
  RefreshCw, 
  BarChart2, 
  Table, 
  Zap
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { useMarketDepth } from '../../hooks/useMarketDepth';
import { analyzeMarketDepthSignals } from '../../utils/marketDepthSignals';

interface MarketDepthProps {
  symbol: string;
  onPriceClick?: (side: 'BUY' | 'SELL', price: number) => void;
  compact?: boolean;
  showHeader?: boolean;
}

export const MarketDepth: React.FC<MarketDepthProps> = ({
  symbol,
  onPriceClick,
  compact = false,
  showHeader = true
}) => {
  const { openQuickOrder, getInstrument } = useTrading();
  const { depthData, status, isPaused, changedFields, togglePause, reconnect } = useMarketDepth(symbol);

  const [depthLevelsCount, setDepthLevelsCount] = useState<5 | 10 | 20>(5);
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'analytics'>('table');

  const inst = getInstrument(symbol);

  const handleRowClick = (side: 'BUY' | 'SELL', price: number) => {
    if (onPriceClick) {
      onPriceClick(side, price);
      return;
    }

    // Default action: open Quick Order modal with limit price and side
    openQuickOrder({
      symbol: symbol.toUpperCase(),
      name: inst?.name || symbol,
      side,
      price,
      initialQty: inst?.lotSize || 10
    });
  };

  if (!depthData && status === 'connecting') {
    return (
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={14} className="animate-spin text-accent" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Connecting to Live Market Depth...</span>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: 10 }}>Subscribing</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.5 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 28, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!depthData && status === 'disconnected') {
    return (
      <div className="surface-card" style={{ padding: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <WifiOff size={24} style={{ color: 'var(--negative)' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Market Depth Unavailable</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Feed disconnected for {symbol}. Check network or broker streaming status.
          </div>
        </div>
        <button onClick={reconnect} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <RefreshCw size={12} />
          <span>Reconnect Feed</span>
        </button>
      </div>
    );
  }

  if (!depthData) return null;

  const visibleBids = depthData.depth.buy.slice(0, depthLevelsCount);
  const visibleAsks = depthData.depth.sell.slice(0, depthLevelsCount);

  // Compute maximum quantity across visible levels for relative horizontal bar scaling
  const maxBidQty = Math.max(...visibleBids.map(b => b.quantity), 1);
  const maxAskQty = Math.max(...visibleAsks.map(a => a.quantity), 1);
  const maxQty = Math.max(maxBidQty, maxAskQty);

  // Imbalance percentage calculations
  const totalBoth = depthData.totalBuyQuantity + depthData.totalSellQuantity || 1;
  const buyPct = Math.round((depthData.totalBuyQuantity / totalBoth) * 100);
  const sellPct = 100 - buyPct;

  const signals = analyzeMarketDepthSignals(depthData);

  return (
    <div className="surface-card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? 8 : 12,
      padding: compact ? 'var(--space-3)' : 'var(--space-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Header & Toolbar */}
      {showHeader && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 8
        }}>
          {/* Left Title & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em' }}>Market Depth</span>
              <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>L2 Book</span>
            </div>

            {/* Connection Status Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {status === 'connected' && !isPaused && (
                <span className="badge badge-positive" style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--positive)' }} />
                  LIVE
                </span>
              )}
              {status === 'reconnecting' && (
                <span className="badge badge-warning" style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <RefreshCw size={9} className="animate-spin" />
                  RECONNECTING
                </span>
              )}
              {(status === 'stale' || isPaused) && (
                <span className="badge badge-warning" style={{ fontSize: 9 }}>
                  PAUSED
                </span>
              )}
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* View Mode Switcher */}
            {!compact && (
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: viewMode === 'table' ? 600 : 400,
                    fontSize: 10.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Order Book Table"
                >
                  <Table size={11} />
                  <span>Book</span>
                </button>

                <button
                  onClick={() => setViewMode('chart')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: viewMode === 'chart' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'chart' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: viewMode === 'chart' ? 600 : 400,
                    fontSize: 10.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Cumulative Depth Mountain Chart"
                >
                  <BarChart2 size={11} />
                  <span>Depth Chart</span>
                </button>

                <button
                  onClick={() => setViewMode('analytics')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: viewMode === 'analytics' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'analytics' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: viewMode === 'analytics' ? 600 : 400,
                    fontSize: 10.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Imbalance & Order Book Diagnostics"
                >
                  <Zap size={11} />
                  <span>Signals</span>
                </button>
              </div>
            )}

            {/* Depth Level Count Selector (5 / 10 / 20) */}
            {viewMode === 'table' && (
              <div style={{ display: 'flex', gap: 2 }}>
                {([5, 10, 20] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setDepthLevelsCount(lvl)}
                    style={{
                      padding: '2px 5px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: depthLevelsCount === lvl ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color: depthLevelsCount === lvl ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            {/* Pause / Resume Button */}
            <button
              onClick={togglePause}
              className="btn btn-ghost btn-sm"
              style={{ height: 22, width: 22, padding: 0 }}
              title={isPaused ? 'Resume live feed' : 'Pause live feed'}
            >
              {isPaused ? <Play size={11} style={{ color: 'var(--positive)' }} /> : <Pause size={11} />}
            </button>
          </div>
        </div>
      )}

      {/* Summary Strip: Best Bid, Best Ask, Spread, Circuit Limits */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: 8,
        backgroundColor: 'var(--bg-sunken)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11
      }}>
        <div>
          <div className="text-secondary" style={{ fontSize: 10 }}>Best Bid</div>
          <div className="mono text-positive" style={{ fontWeight: 700, fontSize: 12 }}>
            ₹{depthData.bestBid.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="text-secondary" style={{ fontSize: 10 }}>Best Ask</div>
          <div className="mono text-negative" style={{ fontWeight: 700, fontSize: 12 }}>
            ₹{depthData.bestAsk.toFixed(2)}
          </div>
        </div>

        {!compact && (
          <>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Spread</div>
              <div className="mono" style={{ fontWeight: 600, fontSize: 12 }}>
                ₹{depthData.spread.toFixed(2)} <span className="text-secondary" style={{ fontSize: 10 }}>({depthData.spreadPercent}%)</span>
              </div>
            </div>

            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Circuit Limits</div>
              <div className="mono" style={{ fontSize: 10, fontWeight: 500 }}>
                <span className="text-negative">L: ₹{depthData.circuitLimits?.lowerCircuit.toFixed(2)}</span>
                <span className="text-secondary"> / </span>
                <span className="text-positive">U: ₹{depthData.circuitLimits?.upperCircuit.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Viewport Content based on View Mode */}
      {viewMode === 'table' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: compact ? 6 : 12 }}>
          {/* Left Column: Buyers / Bids */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 6px',
              backgroundColor: 'var(--positive-bg)',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              borderBottom: '1px solid var(--positive-border)'
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--positive)' }}>BID / BUY</span>
              <span className="text-secondary mono" style={{ fontSize: 10 }}>{depthData.totalBuyOrders} orders</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 10 }}>
                  <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 600 }}>Orders</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600 }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600 }}>Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {visibleBids.map((bid, idx) => {
                  const barWidth = Math.min(100, Math.max(4, (bid.quantity / maxQty) * 100));
                  const isPriceChanged = changedFields.some(f => f.type === 'buy' && f.index === idx && f.field === 'price');
                  const isQtyChanged = changedFields.some(f => f.type === 'buy' && f.index === idx && f.field === 'quantity');

                  return (
                    <tr
                      key={idx}
                      onClick={() => handleRowClick('BUY', bid.price)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        height: 25,
                        transition: 'background-color 0.15s ease'
                      }}
                      className="depth-row depth-row-bid"
                      title={`Click to place BUY order at ₹${bid.price.toFixed(2)}`}
                    >
                      {/* Relative Depth Volume Bar */}
                      <td style={{
                        position: 'absolute',
                        right: 0,
                        top: 1,
                        bottom: 1,
                        width: `${barWidth}%`,
                        backgroundColor: 'rgba(15, 138, 95, 0.14)',
                        pointerEvents: 'none',
                        zIndex: 0
                      }} />

                      {/* Orders */}
                      <td className="mono text-secondary" style={{ padding: '3px 6px', position: 'relative', zIndex: 1 }}>
                        {bid.orders}
                      </td>

                      {/* Quantity */}
                      <td className={`mono text-right ${isQtyChanged ? 'flash-up' : ''}`} style={{ padding: '3px 6px', position: 'relative', zIndex: 1, fontWeight: 500 }}>
                        {bid.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Price */}
                      <td className={`mono text-right text-positive ${isPriceChanged ? 'flash-up' : ''}`} style={{ padding: '3px 6px', position: 'relative', zIndex: 1, fontWeight: 700 }}>
                        {bid.price.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Column: Sellers / Asks */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 6px',
              backgroundColor: 'var(--negative-bg)',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              borderBottom: '1px solid var(--negative-border)'
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--negative)' }}>ASK / SELL</span>
              <span className="text-secondary mono" style={{ fontSize: 10 }}>{depthData.totalSellOrders} orders</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 10 }}>
                  <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 600 }}>Price (₹)</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600 }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 600 }}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {visibleAsks.map((ask, idx) => {
                  const barWidth = Math.min(100, Math.max(4, (ask.quantity / maxQty) * 100));
                  const isPriceChanged = changedFields.some(f => f.type === 'sell' && f.index === idx && f.field === 'price');
                  const isQtyChanged = changedFields.some(f => f.type === 'sell' && f.index === idx && f.field === 'quantity');

                  return (
                    <tr
                      key={idx}
                      onClick={() => handleRowClick('SELL', ask.price)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        height: 25,
                        transition: 'background-color 0.15s ease'
                      }}
                      className="depth-row depth-row-ask"
                      title={`Click to place SELL order at ₹${ask.price.toFixed(2)}`}
                    >
                      {/* Relative Depth Volume Bar */}
                      <td style={{
                        position: 'absolute',
                        left: 0,
                        top: 1,
                        bottom: 1,
                        width: `${barWidth}%`,
                        backgroundColor: 'rgba(193, 58, 46, 0.14)',
                        pointerEvents: 'none',
                        zIndex: 0
                      }} />

                      {/* Price */}
                      <td className={`mono text-negative ${isPriceChanged ? 'flash-down' : ''}`} style={{ padding: '3px 6px', position: 'relative', zIndex: 1, fontWeight: 700 }}>
                        {ask.price.toFixed(2)}
                      </td>

                      {/* Quantity */}
                      <td className={`mono text-right ${isQtyChanged ? 'flash-down' : ''}`} style={{ padding: '3px 6px', position: 'relative', zIndex: 1, fontWeight: 500 }}>
                        {ask.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Orders */}
                      <td className="mono text-right text-secondary" style={{ padding: '3px 6px', position: 'relative', zIndex: 1 }}>
                        {ask.orders}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Depth Mountain Chart Visualizer */}
      {viewMode === 'chart' && (
        <div style={{ height: 180, position: 'relative', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', padding: 8 }}>
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 400 160" preserveAspectRatio="none">
            {/* Grid line at center (spread/LTP) */}
            <line x1="200" y1="10" x2="200" y2="140" stroke="var(--border-strong)" strokeDasharray="3 3" />
            <text x="200" y="152" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
              LTP ₹{depthData.ltp.toFixed(2)}
            </text>

            {/* Buy Side Mountain (Green) */}
            {(() => {
              const bids = depthData.depth.buy;
              const maxCum = Math.max(depthData.totalBuyQuantity, depthData.totalSellQuantity, 1);
              let points = '200,130 ';
              bids.forEach((b, i) => {
                const x = 200 - ((i + 1) / bids.length) * 190;
                const y = 130 - ((b.total || b.quantity) / maxCum) * 110;
                points += `${x},${y} `;
              });
              points += '10,130';
              return (
                <>
                  <polygon points={points} fill="rgba(15, 138, 95, 0.22)" stroke="var(--positive)" strokeWidth="1.5" />
                  <text x="20" y="24" fill="var(--positive)" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
                    Cumulative Bids: {depthData.totalBuyQuantity.toLocaleString('en-IN')}
                  </text>
                </>
              );
            })()}

            {/* Sell Side Mountain (Red) */}
            {(() => {
              const asks = depthData.depth.sell;
              const maxCum = Math.max(depthData.totalBuyQuantity, depthData.totalSellQuantity, 1);
              let points = '200,130 ';
              asks.forEach((a, i) => {
                const x = 200 + ((i + 1) / asks.length) * 190;
                const y = 130 - ((a.total || a.quantity) / maxCum) * 110;
                points += `${x},${y} `;
              });
              points += '390,130';
              return (
                <>
                  <polygon points={points} fill="rgba(193, 58, 46, 0.22)" stroke="var(--negative)" strokeWidth="1.5" />
                  <text x="380" y="24" fill="var(--negative)" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="end">
                    Cumulative Asks: {depthData.totalSellQuantity.toLocaleString('en-IN')}
                  </text>
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Algo Strategy Signals & Analytics View */}
      {viewMode === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Detected Micro-Structure & Algo Strategy Signals:
          </div>

          {signals.length === 0 ? (
            <div style={{ padding: 12, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Order book is currently balanced. No abnormal liquidity walls or extreme order imbalance detected.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.map((sig, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    backgroundColor: sig.signal === 'BUY' ? 'var(--positive-bg)' : 'var(--negative-bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${sig.signal === 'BUY' ? 'var(--positive-border)' : 'var(--negative-border)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${sig.signal === 'BUY' ? 'badge-positive' : 'badge-negative'}`}>
                      {sig.signal}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{sig.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{sig.description}</div>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 11, fontWeight: 700 }}>
                    {sig.strength}% Signal
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Imbalance Gauge & Totals Summary */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 8
      }}>
        {/* Totals Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="text-secondary">Total Buy Qty:</span>
            <span className="mono text-positive" style={{ fontWeight: 700 }}>
              {depthData.totalBuyQuantity.toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="text-secondary" style={{ fontSize: 11 }}>Ratio:</span>
            <span className="mono" style={{ fontWeight: 700, fontSize: 11.5 }}>
              {depthData.buySellRatio}x
            </span>
            <span className={`badge ${
              depthData.sentiment === 'BUY_PRESSURE' 
                ? 'badge-positive' 
                : depthData.sentiment === 'SELL_PRESSURE' 
                ? 'badge-negative' 
                : 'badge-neutral'
            }`} style={{ fontSize: 9.5 }}>
              {depthData.sentiment === 'BUY_PRESSURE' ? 'BUY PRESSURE' : depthData.sentiment === 'SELL_PRESSURE' ? 'SELL PRESSURE' : 'NEUTRAL'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="text-secondary">Total Sell Qty:</span>
            <span className="mono text-negative" style={{ fontWeight: 700 }}>
              {depthData.totalSellQuantity.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Dual-Color Imbalance Progress Bar */}
        <div style={{
          display: 'flex',
          height: 6,
          width: '100%',
          backgroundColor: 'var(--bg-sunken)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <div style={{ width: `${buyPct}%`, backgroundColor: 'var(--positive)', transition: 'width 0.3s ease' }} title={`Buyers: ${buyPct}%`} />
          <div style={{ width: `${sellPct}%`, backgroundColor: 'var(--negative)', transition: 'width 0.3s ease' }} title={`Sellers: ${sellPct}%`} />
        </div>

        {/* Percentage markers below bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          <span>{buyPct}% Buyers ({depthData.totalBuyOrders} orders)</span>
          <span>{sellPct}% Sellers ({depthData.totalSellOrders} orders)</span>
        </div>
      </div>
    </div>
  );
};
