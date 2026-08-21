import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Clock
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { TradingChart } from '../../components/trading/TradingChart';
import { MatchExplanation } from '../../components/strategy/MatchExplanation';
import { MarketDepth } from '../../components/trading/MarketDepth';

import { PageHeader } from '../../components/common/PageHeader';

export const InstrumentDetail: React.FC = () => {
  const { 
    selectedSymbol, 
    getInstrument, 
    setCurrentPage, 
    openQuickOrder 
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'overview' | 'depth' | 'fundamentals' | 'technicals'>('depth');
  const [timeframe, setTimeframe] = useState<string>('15m');

  const inst = getInstrument(selectedSymbol) || getInstrument('RELIANCE');
  if (!inst) return null;

  const isPos = inst.change >= 0;
  const timeframes = ['1m', '5m', '15m', '30m', '1H', '1D', '1W'];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Top Breadcrumb & Action Bar */}
      <PageHeader
        title={inst.symbol}
        subtitle={inst.name}
        badge={{ text: inst.exchange, variant: 'neutral' }}
        breadcrumb={{
          parent: 'Market',
          current: inst.symbol,
          onParentClick: () => setCurrentPage('market')
        }}
        onBack={() => setCurrentPage('market')}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('options')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Layers size={13} />
              <span>View Option Chain</span>
            </button>
          </div>
        }
      />

      {/* Main Instrument Header */}
      <div className="surface-card" style={{
        padding: 'var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{inst.symbol}</h1>
            <span className="badge badge-neutral" style={{ fontSize: 10 }}>{inst.exchange}</span>
            {inst.sector && (
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>{inst.sector}</span>
            )}
            {inst.matchedStrategy && (
              <span className="badge badge-positive" style={{ fontSize: 10 }}>
                Matched: {inst.matchedStrategy.strategyName}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {inst.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Price Block */}
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
              ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
              {isPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{isPos ? '+' : ''}₹{inst.change.toFixed(2)} ({isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%)</span>
            </div>
          </div>

          {/* Quick Buy / Sell Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => openQuickOrder({
                symbol: inst.symbol,
                name: inst.name,
                side: 'BUY',
                price: inst.price,
                initialQty: 10
              })}
              className="btn btn-buy"
              style={{ padding: '0 18px', height: 36, fontWeight: 700 }}
            >
              BUY
            </button>
            <button
              onClick={() => openQuickOrder({
                symbol: inst.symbol,
                name: inst.name,
                side: 'SELL',
                price: inst.price,
                initialQty: 10
              })}
              className="btn btn-sell"
              style={{ padding: '0 18px', height: 36, fontWeight: 700 }}
            >
              SELL
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div>
        {/* Timeframe Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: timeframe === tf ? 600 : 400,
                  backgroundColor: timeframe === tf ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: timeframe === tf ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            <span>Candle updates: Real-time</span>
          </div>
        </div>

        {/* Candlestick & Volume Chart */}
        <TradingChart
          symbol={inst.symbol}
          basePrice={inst.price}
          timeframe={timeframe}
          hasSignal={!!inst.matchedStrategy}
          signalName={inst.matchedStrategy?.strategyName}
          signalTime={inst.matchedStrategy?.matchedTime}
        />
      </div>

      {/* Bottom Section: Strategy Signal Rationale & Instrument Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* Left: Strategy Signal & Indicator Checklist */}
        <div>
          {inst.matchedStrategy ? (
            <MatchExplanation
              strategyName={inst.matchedStrategy.strategyName}
              signal={inst.matchedStrategy.signal}
              reasons={inst.matchedStrategy.reasons}
              matchScore={inst.matchedStrategy.matchScore}
              matchedTime={inst.matchedStrategy.matchedTime}
              rsi={inst.rsi}
              ema20={inst.ema20}
              volumeRatio={+(inst.volume / inst.avgVolume).toFixed(1)}
            />
          ) : (
            <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Strategy Status
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                No active strategy matched this instrument during the last scan.
              </div>
              <button
                onClick={() => setCurrentPage('strategy-builder')}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
              >
                Create Strategy for {inst.symbol}
              </button>
            </div>
          )}
        </div>

        {/* Right: Information Tabs (Overview, Market Depth, Fundamentals, Technicals) */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tabs Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', gap: 16 }}>
            {([
              { id: 'depth', label: 'Market Depth' },
              { id: 'overview', label: 'Overview' },
              { id: 'technicals', label: 'Technicals' },
              { id: 'fundamentals', label: 'Fundamentals' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '6px 0 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  fontSize: 12,
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Market Depth */}
          {activeTab === 'depth' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MarketDepth symbol={inst.symbol} showHeader={true} />
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Open</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.open.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Previous Close</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.prevClose.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Day High</span>
                <span className="mono text-positive" style={{ fontWeight: 600 }}>₹{inst.high.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Day Low</span>
                <span className="mono text-negative" style={{ fontWeight: 600 }}>₹{inst.low.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Volume</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.volume.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Avg Volume (20D)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.avgVolume.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="text-secondary">Market Cap</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.marketCap || '₹10,50,000 Cr'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="text-secondary">Lot Size</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.lotSize || 250} shares</span>
              </div>
            </div>
          )}

          {activeTab === 'fundamentals' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">P/E Ratio (TTM)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.pe || 27.8}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">EPS (TTM)</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.eps || 53.30}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Dividend Yield</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.divYield || 0.67}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Book Value</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.bookValue || 680.40}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="text-secondary">ROE</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.roe || 9.4}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="text-secondary">Debt to Equity</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.debtToEquity || 0.38}</span>
              </div>
            </div>
          )}

          {activeTab === 'technicals' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">RSI (14)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inst.rsi.toFixed(1)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">EMA 20</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.ema20.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">EMA 50</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.ema50.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">EMA 200</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.ema200.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="text-secondary">VWAP</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.vwap.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="text-secondary">ATR (14)</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{inst.atr.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
