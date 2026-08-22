import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  BarChart3, 
  BookOpen, 
  Sparkles
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { TradingChart } from '../../components/trading/TradingChart';
import { MatchExplanation } from '../../components/strategy/MatchExplanation';
import { MarketDepth } from '../../components/trading/MarketDepth';
import { PageHeader } from '../../components/common/PageHeader';
import { getOptionChainForSymbol } from '../../mock/marketData';

export type InstrumentSectionTab = 'overview' | 'chart' | 'options';

export const InstrumentDetail: React.FC = () => {
  const { 
    selectedSymbol, 
    getInstrument, 
    setCurrentPage, 
    openQuickOrder,
    canCreateStrategy
  } = useTrading();

  const [activeSection, setActiveSection] = useState<InstrumentSectionTab>('overview');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [selectedExpiry, setSelectedExpiry] = useState('28 AUG 2026');

  const inst = getInstrument(selectedSymbol) || getInstrument('RELIANCE');
  if (!inst) return null;

  const isPos = inst.change >= 0;
  const timeframes = ['1m', '5m', '15m', '30m', '1H', '1D', '1W'];
  const hasOptions = inst.type === 'INDEX' || inst.lotSize !== undefined || ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'TATAMOTORS', 'ICICIBANK', 'SBIN', 'NIFTY 50', 'BANK NIFTY', 'NIFTY FUT'].includes(inst.symbol);

  const optionChain = getOptionChainForSymbol(inst.symbol, inst.price, selectedExpiry);
  const atmStrike = optionChain.length > 0 ? optionChain[Math.floor(optionChain.length / 2)].strike : Math.round(inst.price / 50) * 50;

  // Day range calculations
  const dayRangeLow = inst.low;
  const dayRangeHigh = inst.high;
  const dayRangeSpan = Math.max(1, dayRangeHigh - dayRangeLow);
  const dayRangePct = Math.min(100, Math.max(0, ((inst.price - dayRangeLow) / dayRangeSpan) * 100));

  // 52W range calculations
  const year52Low = +(inst.price * 0.78).toFixed(2);
  const year52High = +(inst.price * 1.28).toFixed(2);
  const year52Span = year52High - year52Low;
  const year52Pct = Math.min(100, Math.max(0, ((inst.price - year52Low) / year52Span) * 100));

  const sections: { id: InstrumentSectionTab; label: string; icon: React.FC<{ size?: number }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'chart', label: 'Live Chart', icon: BarChart3 },
    ...(hasOptions ? [{ id: 'options' as InstrumentSectionTab, label: 'Option Chain', icon: Layers, badge: 'F&O' }] : [])
  ];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
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
            {hasOptions && (
              <button
                onClick={() => setActiveSection('options')}
                className={`btn btn-sm ${activeSection === 'options' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ gap: 6 }}
              >
                <Layers size={13} />
                <span>Option Chain</span>
              </button>
            )}
            <button
              onClick={() => setActiveSection('chart')}
              className={`btn btn-sm ${activeSection === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: 6 }}
            >
              <BarChart3 size={13} />
              <span>Full Chart</span>
            </button>
          </div>
        }
      />

      {/* Main Stock Summary Header Card */}
      <div className="surface-card" style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        borderLeft: `4px solid ${isPos ? 'var(--positive)' : 'var(--negative)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: isPos ? 'var(--positive-bg)' : 'var(--negative-bg)',
            color: isPos ? 'var(--positive)' : 'var(--negative)',
            fontWeight: 700,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isPos ? 'var(--positive-border)' : 'var(--negative-border)'}`
          }}>
            {inst.symbol.slice(0, 2)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{inst.symbol}</h1>
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>{inst.exchange}</span>
              {inst.sector && (
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>{inst.sector}</span>
              )}
              {hasOptions && (
                <span className="badge badge-accent" style={{ fontSize: 9.5 }}>F&O Derivative</span>
              )}
              {inst.matchedStrategy && (
                <span className="badge badge-positive" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={11} />
                  <span>Matched: {inst.matchedStrategy.strategyName}</span>
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {inst.name}
            </div>
          </div>
        </div>

        {/* Live Price & Fast BUY / SELL CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
              ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 12 }}>
              <span className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{isPos ? '+' : ''}{inst.change.toFixed(2)} ({isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%)</span>
              </span>
              <span className="text-muted" style={{ fontSize: 11 }}>• Live</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => openQuickOrder({
                symbol: inst.symbol,
                name: inst.name,
                side: 'BUY',
                price: inst.price,
                initialQty: inst.lotSize || 25
              })}
              className="btn btn-buy"
              style={{ padding: '0 20px', height: 38, fontWeight: 800, fontSize: 13 }}
            >
              BUY
            </button>
            <button
              onClick={() => openQuickOrder({
                symbol: inst.symbol,
                name: inst.name,
                side: 'SELL',
                price: inst.price,
                initialQty: inst.lotSize || 25
              })}
              className="btn btn-sell"
              style={{ padding: '0 20px', height: 38, fontWeight: 800, fontSize: 13 }}
            >
              SELL
            </button>
          </div>
        </div>
      </div>

      {/* SECTION-WISE SUB-HEADERS NAVIGATION */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-default)',
        gap: 4,
        overflowX: 'auto',
        position: 'sticky',
        top: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-base)',
        zIndex: 10,
        paddingTop: 4
      }}>
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{sec.label}</span>
              {sec.badge && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-sunken)',
                  color: isActive ? '#FFFFFF' : 'var(--text-tertiary)',
                  padding: '1px 5px',
                  borderRadius: 8
                }}>
                  {sec.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MASTER OVERVIEW SECTION (Includes Depth, Tech, Fund) */}
      {/* ======================================================== */}
      {activeSection === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* 1. Day & 52-Week Price Range Sliders */}
          <div className="surface-card" style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Today's Range */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <span>Today's Low: <strong className="mono text-negative">₹{dayRangeLow.toFixed(2)}</strong></span>
                <span>Today's High: <strong className="mono text-positive">₹{dayRangeHigh.toFixed(2)}</strong></span>
              </div>
              <div style={{
                height: 6,
                backgroundColor: 'var(--bg-sunken)',
                borderRadius: 3,
                marginTop: 8,
                position: 'relative',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  width: `${dayRangePct}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: 3
                }} />
                <div style={{
                  position: 'absolute',
                  left: `${dayRangePct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid var(--accent-primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} title={`LTP: ₹${inst.price}`} />
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'center' }}>
                Current LTP: ₹{inst.price.toFixed(2)} ({dayRangePct.toFixed(0)}% of day range)
              </div>
            </div>

            {/* 52-Week Range */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <span>52W Low: <strong className="mono text-negative">₹{year52Low.toFixed(2)}</strong></span>
                <span>52W High: <strong className="mono text-positive">₹{year52High.toFixed(2)}</strong></span>
              </div>
              <div style={{
                height: 6,
                backgroundColor: 'var(--bg-sunken)',
                borderRadius: 3,
                marginTop: 8,
                position: 'relative',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  width: `${year52Pct}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: 3
                }} />
                <div style={{
                  position: 'absolute',
                  left: `${year52Pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid var(--accent-primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} title={`52W Position: ${year52Pct.toFixed(0)}%`} />
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'center' }}>
                52-Week Range: {year52Pct.toFixed(0)}% from 52W Low
              </div>
            </div>
          </div>

          {/* 2. Key Statistics & Strategy Match Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
            {/* Left: Key Statistics Grid */}
            <div className="surface-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Trading Statistics
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Open Price</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.open.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Previous Close</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.prevClose.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Day High</span>
                  <span className="mono text-positive" style={{ fontWeight: 600 }}>₹{inst.high.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Day Low</span>
                  <span className="mono text-negative" style={{ fontWeight: 600 }}>₹{inst.low.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Traded Volume</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{inst.volume.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Upper Circuit (10%)</span>
                  <span className="mono text-positive" style={{ fontWeight: 600 }}>₹{(inst.prevClose * 1.10).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Lower Circuit (10%)</span>
                  <span className="mono text-negative" style={{ fontWeight: 600 }}>₹{(inst.prevClose * 0.90).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Volume Weighted (VWAP)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.vwap.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right: Strategy Match Card & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                <div className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Strategy Match Status
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    No automated scanner criteria matched this stock in the current cycle.
                  </div>
                  {canCreateStrategy ? (
                    <button
                      onClick={() => setCurrentPage('strategy-builder')}
                      className="btn btn-secondary btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    >
                      Build Custom Strategy for {inst.symbol}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentPage('strategies')}
                      className="btn btn-secondary btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    >
                      View Active Trading Strategies →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. LIVE MARKET DEPTH (Integrated into Overview) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Live Market Depth (5 Best Bids & Asks)
            </div>
            <MarketDepth symbol={inst.symbol} showHeader={false} />
          </div>

          {/* 4. TECHNICALS & FUNDAMENTALS (Integrated into Overview) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'var(--space-5)' }}>
            {/* Technical Overview */}
            <div className="surface-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Technical Indicators
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">RSI (14 Period)</span>
                  <span className="mono text-positive" style={{ fontWeight: 700 }}>{inst.rsi.toFixed(1)} (Bullish Zone)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">20 EMA</span>
                  <span className="mono text-positive" style={{ fontWeight: 600 }}>₹{inst.ema20.toFixed(2)} (Price Above)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">50 EMA</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.ema50.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">200 EMA (Long-term)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.ema200.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span className="text-secondary">ATR (14 Volatility)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.atr.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Fundamentals Overview */}
            <div className="surface-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Fundamental Valuation
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Market Capitalization</span>
                  <span className="mono" style={{ fontWeight: 700 }}>{inst.marketCap || '₹10,50,000 Cr'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">P/E Ratio (TTM)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{inst.pe || 27.8}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">EPS (TTM)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>₹{inst.eps || 53.30}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">Dividend Yield</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{inst.divYield || 0.67}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span className="text-secondary">Return on Equity (ROE)</span>
                  <span className="mono text-positive" style={{ fontWeight: 600 }}>{inst.roe || 9.4}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LIVE CHART SECTION                                */}
      {/* ======================================================== */}
      {activeSection === 'chart' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`btn btn-sm ${timeframe === tf ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ height: 26, padding: '0 10px', fontSize: 11, fontWeight: timeframe === tf ? 700 : 500 }}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-positive" style={{ fontSize: 10 }}>EMA 20</span>
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>EMA 50</span>
              <span className="badge badge-accent" style={{ fontSize: 10 }}>VWAP</span>
            </div>
          </div>

          <TradingChart symbol={inst.symbol} basePrice={inst.price} timeframe={timeframe} />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: OPTION CHAIN (F&O DERIVATIVES) SECTION            */}
      {/* ======================================================== */}
      {activeSection === 'options' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {hasOptions ? (
            <>
              {/* Expiry Selector Bar */}
              <div className="surface-card" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>EXPIRY DATE:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['28 AUG 2026', '04 SEP 2026', '25 SEP 2026'].map(exp => (
                      <button
                        key={exp}
                        onClick={() => setSelectedExpiry(exp)}
                        className={`btn btn-sm ${selectedExpiry === exp ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ height: 26, fontSize: 11, fontWeight: selectedExpiry === exp ? 700 : 500 }}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                  <span>Spot: <strong className="mono">₹{inst.price.toFixed(2)}</strong></span>
                  <span>ATM Strike: <strong className="mono text-primary">₹{atmStrike}</strong></span>
                </div>
              </div>

              {/* Option Chain Table */}
              <div className="surface-card" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th colSpan={6} style={{ textAlign: 'center', backgroundColor: 'var(--positive-bg)', borderRight: '1px solid var(--border-default)', color: 'var(--positive)' }}>
                        CALLS (CE)
                      </th>
                      <th style={{ textAlign: 'center', backgroundColor: 'var(--bg-sunken)' }}>
                        STRIKE
                      </th>
                      <th colSpan={6} style={{ textAlign: 'center', backgroundColor: 'var(--negative-bg)', borderLeft: '1px solid var(--border-default)', color: 'var(--negative)' }}>
                        PUTS (PE)
                      </th>
                    </tr>
                    <tr>
                      <th className="text-right">OI</th>
                      <th className="text-right">Chg OI</th>
                      <th className="text-right">Vol</th>
                      <th className="text-right">IV</th>
                      <th className="text-right">LTP (₹)</th>
                      <th className="text-right" style={{ borderRight: '1px solid var(--border-default)' }}>Trade</th>
                      <th className="text-center" style={{ backgroundColor: 'var(--bg-sunken)' }}>Strike</th>
                      <th style={{ borderLeft: '1px solid var(--border-default)' }}>Trade</th>
                      <th className="text-right">LTP (₹)</th>
                      <th className="text-right">IV</th>
                      <th className="text-right">Vol</th>
                      <th className="text-right">Chg OI</th>
                      <th className="text-right">OI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionChain.map(row => {
                      const isAtm = row.strike === atmStrike;
                      const callOiLakhs = (row.call.oi / 100000).toFixed(1);
                      const putOiLakhs = (row.put.oi / 100000).toFixed(1);

                      return (
                        <tr 
                          key={row.strike}
                          style={{
                            backgroundColor: isAtm ? 'var(--accent-subtle)' : undefined,
                            borderTop: isAtm ? '2px solid var(--warning)' : undefined,
                            borderBottom: isAtm ? '2px solid var(--warning)' : undefined
                          }}
                        >
                          {/* CALLS */}
                          <td className="text-right mono">{callOiLakhs}L</td>
                          <td className={`text-right mono ${row.call.oiChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {row.call.oiChange >= 0 ? '+' : ''}{(row.call.oiChange / 100000).toFixed(1)}L
                          </td>
                          <td className="text-right mono text-muted">{(row.call.volume / 100000).toFixed(1)}L</td>
                          <td className="text-right mono">{row.call.iv.toFixed(1)}</td>
                          <td className="text-right mono" style={{ fontWeight: 700, color: 'var(--positive)' }}>
                            ₹{row.call.ltp.toFixed(2)}
                          </td>
                          <td className="text-right" style={{ borderRight: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => openQuickOrder({
                                symbol: row.call.symbol,
                                name: `${inst.symbol} ${row.strike} CE`,
                                side: 'BUY',
                                price: row.call.ltp,
                                initialQty: inst.lotSize || 250
                              })}
                              className="btn btn-buy btn-sm"
                              style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                            >
                              Buy CE
                            </button>
                          </td>

                          {/* STRIKE */}
                          <td className="text-center mono" style={{
                            backgroundColor: isAtm ? 'var(--warning-bg)' : 'var(--bg-sunken)',
                            fontWeight: 700,
                            fontSize: 13,
                            color: isAtm ? 'var(--warning)' : 'var(--text-primary)'
                          }}>
                            {row.strike} {isAtm && <span style={{ fontSize: 9, fontWeight: 700 }}>(ATM)</span>}
                          </td>

                          {/* PUTS */}
                          <td style={{ borderLeft: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => openQuickOrder({
                                symbol: row.put.symbol,
                                name: `${inst.symbol} ${row.strike} PE`,
                                side: 'BUY',
                                price: row.put.ltp,
                                initialQty: inst.lotSize || 250
                              })}
                              className="btn btn-sell btn-sm"
                              style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                            >
                              Buy PE
                            </button>
                          </td>
                          <td className="text-right mono" style={{ fontWeight: 700, color: 'var(--negative)' }}>
                            ₹{row.put.ltp.toFixed(2)}
                          </td>
                          <td className="text-right mono">{row.put.iv.toFixed(1)}</td>
                          <td className="text-right mono text-muted">{(row.put.volume / 100000).toFixed(1)}L</td>
                          <td className={`text-right mono ${row.put.oiChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {row.put.oiChange >= 0 ? '+' : ''}{(row.put.oiChange / 100000).toFixed(1)}L
                          </td>
                          <td className="text-right mono">{putOiLakhs}L</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="surface-card" style={{ padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>F&O Derivatives Not Available</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 440 }}>
                {inst.symbol} is traded exclusively in the Equity Cash segment (CNC / MIS delivery).
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
