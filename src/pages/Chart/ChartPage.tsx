import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { TVChart } from '../../components/trading/TVChart';
import { MarketDepth } from '../../components/trading/MarketDepth';
import { ChartTimeframe } from '../../services/ohlcService';

export const ChartPage: React.FC = () => {
  const {
    selectedSymbol,
    setSelectedSymbol,
    getInstrument,
    instruments,
    openQuickOrder,
    theme,
    navigateToInstrument
  } = useTrading();

  const [timeframe, setTimeframe] = useState<ChartTimeframe>('15m');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [rightTab, setRightTab] = useState<'depth' | 'watchlist' | 'stats'>('depth');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentInst = getInstrument(selectedSymbol) || instruments[0] || {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    price: 2950.45,
    change: 24.50,
    changePercent: 0.84,
    high: 2975.00,
    low: 2920.00,
    open: 2930.00,
    prevClose: 2925.95,
    volume: 3824900,
    type: 'STOCK'
  };

  const isPos = currentInst.change >= 0;
  const isDark = theme === 'dark';

  // Toggle Browser Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
      setIsMaximized(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Error attempting to exit fullscreen:', err);
      });
      setIsMaximized(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMaximized(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Quick Watchlist Filter
  const filteredInstruments = instruments.filter(
    inst =>
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isMaximized ? '100vh' : 'calc(100vh - var(--topbar-height) - 16px)',
        width: '100%',
        backgroundColor: isDark ? '#080B11' : '#F8FAFC',
        overflow: 'hidden',
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? 0 : 'auto',
        left: isMaximized ? 0 : 'auto',
        zIndex: isMaximized ? 9999 : 1,
      }}
    >
      {/* Top Professional Trading Terminal Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
          backgroundColor: isDark ? '#0E121B' : '#FFFFFF',
          flexWrap: 'wrap',
          gap: 12,
          zIndex: 20,
        }}
      >
        {/* Left: Symbol Selector & Live Quote Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Symbol Search / Selector Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSearchDropdownOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                borderRadius: 'var(--radius-md)',
                color: isDark ? '#F8FAFC' : '#0F172A',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              <Search size={14} style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
              <span>{currentInst.symbol}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: isDark ? '#94A3B8' : '#64748B' }}>
                {currentInst.exchange}
              </span>
              <ChevronDown size={14} style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
            </button>

            {/* Quick Symbol Dropdown Search Menu */}
            {isSearchDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  left: 0,
                  width: 320,
                  maxHeight: 400,
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Search Input Box */}
                <div style={{ padding: 8, borderBottom: `1px solid ${isDark ? '#1E293B' : '#F1F5F9'}` }}>
                  <input
                    type="text"
                    placeholder="Search stock or index (e.g. RELIANCE, NIFTY)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: 12,
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: isDark ? '#FFFFFF' : '#000000',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Popular Quick Badges */}
                <div style={{ display: 'flex', gap: 4, padding: '6px 8px', flexWrap: 'wrap', backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }}>
                  {['NIFTY 50', 'BANK NIFTY', 'RELIANCE', 'HDFCBANK', 'TCS', 'INFY'].map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        setSelectedSymbol(sym);
                        setIsSearchDropdownOpen(false);
                      }}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        fontWeight: 600,
                        backgroundColor: selectedSymbol === sym ? (isDark ? '#38BDF8' : '#0284C7') : isDark ? '#1E293B' : '#E2E8F0',
                        color: selectedSymbol === sym ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* Filtered Symbol List */}
                <div style={{ overflowY: 'auto', maxHeight: 280 }}>
                  {filteredInstruments.map(inst => {
                    const pos = inst.change >= 0;
                    return (
                      <div
                        key={inst.symbol}
                        onClick={() => {
                          setSelectedSymbol(inst.symbol);
                          setIsSearchDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderBottom: `1px solid ${isDark ? '#1E293B' : '#F1F5F9'}`,
                          cursor: 'pointer',
                          backgroundColor: inst.symbol === selectedSymbol ? (isDark ? '#1E293B' : '#F1F5F9') : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            {inst.symbol}
                          </div>
                          <div style={{ fontSize: 10, color: isDark ? '#64748B' : '#94A3B8', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {inst.name}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: isDark ? '#F1F5F9' : '#1E293B', fontFamily: 'monospace' }}>
                            ₹{inst.price.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: pos ? '#10B981' : '#EF4444', fontFamily: 'monospace' }}>
                            {pos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Current Live Stock Stats Header */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: isDark ? '#FFFFFF' : '#0F172A' }}>
              ₹{currentInst.price.toFixed(2)}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 12,
                fontWeight: 700,
                color: isPos ? '#10B981' : '#EF4444',
                fontFamily: 'monospace',
              }}
            >
              {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{isPos ? '+' : ''}{currentInst.change.toFixed(2)} ({isPos ? '+' : ''}{currentInst.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Trade Action Buttons & Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quick Buy Button */}
          <button
            onClick={() =>
              openQuickOrder({
                symbol: currentInst.symbol,
                name: currentInst.name,
                side: 'BUY',
                price: currentInst.price,
                lotSize: currentInst.lotSize,
              })
            }
            style={{
              padding: '6px 14px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            <span>BUY</span>
            <span style={{ fontSize: 10, opacity: 0.9, fontFamily: 'monospace' }}>₹{currentInst.price.toFixed(2)}</span>
          </button>

          {/* Quick Sell Button */}
          <button
            onClick={() =>
              openQuickOrder({
                symbol: currentInst.symbol,
                name: currentInst.name,
                side: 'SELL',
                price: currentInst.price,
                lotSize: currentInst.lotSize,
              })
            }
            style={{
              padding: '6px 14px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
            }}
          >
            <span>SELL</span>
            <span style={{ fontSize: 10, opacity: 0.9, fontFamily: 'monospace' }}>₹{currentInst.price.toFixed(2)}</span>
          </button>

          <div style={{ width: 1, height: 20, backgroundColor: isDark ? '#334155' : '#CBD5E1', margin: '0 4px' }} />

          {/* Toggle Right Panel (Depth / Watchlist) */}
          <button
            onClick={() => setIsRightSidebarOpen(prev => !prev)}
            title={isRightSidebarOpen ? 'Collapse Side Panel' : 'Expand Side Panel'}
            style={{
              padding: '6px 10px',
              backgroundColor: isRightSidebarOpen ? (isDark ? '#1E293B' : '#E2E8F0') : 'transparent',
              border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
              borderRadius: 'var(--radius-md)',
              color: isDark ? '#94A3B8' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <SlidersHorizontal size={13} />
            <span>Panel</span>
          </button>

          {/* Dedicated Fullscreen / Maximize Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isMaximized ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              padding: '6px 12px',
              backgroundColor: isMaximized ? '#38BDF8' : isDark ? '#1E293B' : '#E2E8F0',
              color: isMaximized ? '#0F172A' : isDark ? '#F8FAFC' : '#0F172A',
              border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isMaximized ? 'Exit Fullscreen' : 'Maximize'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area: TradingView Chart + Collapsible Right Drawer */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
        {/* Central TradingView Lightweight Chart */}
        <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TVChart
            symbol={currentInst.symbol}
            basePrice={currentInst.price}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            height="100%"
            isMaximized={isMaximized}
            onToggleMaximize={toggleFullscreen}
            showControls={true}
            showIndicatorsToggle={true}
            showTimeframeBar={true}
          />
        </div>

        {/* Right Collapsible Auxiliary Panel (Depth / Watchlist / Fundamentals) */}
        {isRightSidebarOpen && (
          <div
            style={{
              width: 330,
              minWidth: 330,
              height: '100%',
              backgroundColor: isDark ? '#0E121B' : '#FFFFFF',
              borderLeft: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 15,
            }}
          >
            {/* Panel Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
              }}
            >
              <button
                onClick={() => setRightTab('depth')}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  fontSize: 11,
                  fontWeight: rightTab === 'depth' ? 700 : 500,
                  border: 'none',
                  borderBottom: rightTab === 'depth' ? '2px solid #38BDF8' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: rightTab === 'depth' ? (isDark ? '#38BDF8' : '#0284C7') : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                Market Depth
              </button>
              <button
                onClick={() => setRightTab('watchlist')}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  fontSize: 11,
                  fontWeight: rightTab === 'watchlist' ? 700 : 500,
                  border: 'none',
                  borderBottom: rightTab === 'watchlist' ? '2px solid #38BDF8' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: rightTab === 'watchlist' ? (isDark ? '#38BDF8' : '#0284C7') : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                Watchlist
              </button>
              <button
                onClick={() => setRightTab('stats')}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  fontSize: 11,
                  fontWeight: rightTab === 'stats' ? 700 : 500,
                  border: 'none',
                  borderBottom: rightTab === 'stats' ? '2px solid #38BDF8' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: rightTab === 'stats' ? (isDark ? '#38BDF8' : '#0284C7') : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                Key Stats
              </button>
            </div>

            {/* Panel Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {rightTab === 'depth' && (
                <div>
                  <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase' }}>
                      Live 5-Depth Order Book
                    </span>
                    <span style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>● REAL-TIME</span>
                  </div>
                  <MarketDepth symbol={currentInst.symbol} />
                </div>
              )}

              {rightTab === 'watchlist' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>
                    Quick Market Watch
                  </div>
                  {instruments.slice(0, 15).map(inst => {
                    const pos = inst.change >= 0;
                    const isSelected = inst.symbol === currentInst.symbol;
                    return (
                      <div
                        key={inst.symbol}
                        onClick={() => setSelectedSymbol(inst.symbol)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? (isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)') : isDark ? '#111827' : '#F8FAFC',
                          border: `1px solid ${isSelected ? (isDark ? '#38BDF8' : '#0284C7') : isDark ? '#1F2937' : '#E2E8F0'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            {inst.symbol}
                          </div>
                          <div style={{ fontSize: 10, color: isDark ? '#64748B' : '#94A3B8' }}>
                            Vol: {(inst.volume / 1000).toFixed(0)}k
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: isDark ? '#F1F5F9' : '#1E293B' }}>
                            ₹{inst.price.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: pos ? '#10B981' : '#EF4444', fontFamily: 'monospace' }}>
                            {pos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {rightTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase' }}>
                    Fundamental & Technical Metrics
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="surface-card" style={{ padding: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Day Range High</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>
                        ₹{currentInst.high.toFixed(2)}
                      </div>
                    </div>
                    <div className="surface-card" style={{ padding: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Day Range Low</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', fontFamily: 'monospace' }}>
                        ₹{currentInst.low.toFixed(2)}
                      </div>
                    </div>
                    <div className="surface-card" style={{ padding: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Prev Close</div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
                        ₹{currentInst.prevClose.toFixed(2)}
                      </div>
                    </div>
                    <div className="surface-card" style={{ padding: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Open Price</div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
                        ₹{currentInst.open.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="surface-card" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Volume</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{currentInst.volume.toLocaleString('en-IN')}</span>
                    </div>
                    {currentInst.marketCap && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Market Cap</span>
                        <span style={{ fontWeight: 700 }}>{currentInst.marketCap}</span>
                      </div>
                    )}
                    {currentInst.pe && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'var(--text-muted)' }}>P/E Ratio</span>
                        <span style={{ fontWeight: 700 }}>{currentInst.pe}</span>
                      </div>
                    )}
                    {currentInst.vwap && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'var(--text-muted)' }}>VWAP</span>
                        <span style={{ fontWeight: 700, color: '#A855F7', fontFamily: 'monospace' }}>₹{currentInst.vwap.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigateToInstrument(currentInst.symbol)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  >
                    <BookOpen size={13} />
                    <span>View Comprehensive Overview</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
