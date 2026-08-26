import React, { useState } from 'react';
import { 
  Layers, 
  PlusCircle, 
  Search, 
  LineChart, 
  Activity, 
  X, 
  Sparkles,
  TableProperties,
  BarChart3,
  Info
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { SECTOR_PERFORMANCE } from '../../mock/marketData';
import { MarketDepthModal } from '../../components/trading/MarketDepthModal';
import { PageHeader } from '../../components/common/PageHeader';
import { StockUniverseTable } from '../../components/market/StockUniverseTable';
import { StockDetailDrawer } from '../../components/market/StockDetailDrawer';

import { marketMoversService, MarketMoverItem } from '../../services/marketMoversService';

export const Market: React.FC = () => {
  const { 
    indices: mockLiveIndices, 
    instruments, 
    navigateToInstrument, 
    openQuickOrder, 
    setCurrentPage, 
    setCurrentStrategyId,
    canCreateStrategy
  } = useTrading();

  const [activeView, setActiveView] = useState<'universe' | 'screener'>('universe');
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active' | 'all'>('gainers');
  const [filterQuery, setFilterQuery] = useState('');
  const [inspectDepthSymbol, setInspectDepthSymbol] = useState<string | null>(null);
  const [inspectDetailSymbol, setInspectDetailSymbol] = useState<string | null>(null);
  const [realMovers, setRealMovers] = useState<{ gainers: MarketMoverItem[]; losers: MarketMoverItem[]; volume_leaders: MarketMoverItem[] } | null>(null);

  React.useEffect(() => {
    const fetchMovers = async () => {
      const data = await marketMoversService.getMarketMovers();
      if (data) {
        setRealMovers({
          gainers: data.gainers || [],
          losers: data.losers || [],
          volume_leaders: data.volume_leaders || []
        });
      }
    };
    fetchMovers();
  }, []);

  // 1. Filter base list by Selected Index (if any)
  const indexFilteredInstruments = selectedIndex
    ? instruments.filter(i => {
        const query = selectedIndex.toLowerCase().replace(/\s+/g, '');
        const inIndices = i.indices?.some(ind => ind.toLowerCase().replace(/\s+/g, '').includes(query) || query.includes(ind.toLowerCase().replace(/\s+/g, '')));
        const inSector = i.sector && (
          (selectedIndex.includes('BANK') && i.sector.toLowerCase().includes('bank')) ||
          (selectedIndex.includes('IT') && i.sector.toLowerCase().includes('information technology')) ||
          (selectedIndex.includes('AUTO') && i.sector.toLowerCase().includes('auto')) ||
          (selectedIndex.includes('ENERGY') && (i.sector.toLowerCase().includes('energy') || i.sector.toLowerCase().includes('oil'))) ||
          (selectedIndex.includes('FMCG') && i.sector.toLowerCase().includes('fmcg')) ||
          (selectedIndex.includes('PHARMA') && i.sector.toLowerCase().includes('pharma')) ||
          (selectedIndex.includes('METAL') && i.sector.toLowerCase().includes('metal'))
        );
        return inIndices || inSector;
      })
    : instruments;

  // 2. Sort by Tab
  const gainers = (realMovers && realMovers.gainers.length > 0)
    ? realMovers.gainers.map(g => ({
        ...instruments.find(i => i.symbol === g.symbol) || {
          symbol: g.symbol,
          name: g.name,
          exchange: 'NSE' as const,
          type: 'STOCK' as const,
          price: g.price,
          change: g.change,
          changePercent: g.changePercent,
          open: g.open,
          high: g.high,
          low: g.low,
          prevClose: g.price - g.change,
          volume: g.volume,
          avgVolume: g.volume,
          rsi: 55,
          ema20: g.price,
          ema50: g.price,
          ema200: g.price,
          sma20: g.price,
          sma50: g.price,
          vwap: g.price,
          macd: { macd: 0, signal: 0, histogram: 0 },
          bollingerBands: { upper: g.price * 1.05, middle: g.price, lower: g.price * 0.95 },
          atr: 10
        }
      }))
    : [];

  const losers = (realMovers && realMovers.losers.length > 0)
    ? realMovers.losers.map(l => ({
        ...instruments.find(i => i.symbol === l.symbol) || {
          symbol: l.symbol,
          name: l.name,
          exchange: 'NSE' as const,
          type: 'STOCK' as const,
          price: l.price,
          change: l.change,
          changePercent: l.changePercent,
          open: l.open,
          high: l.high,
          low: l.low,
          prevClose: l.price - l.change,
          volume: l.volume,
          avgVolume: l.volume,
          rsi: 45,
          ema20: l.price,
          ema50: l.price,
          ema200: l.price,
          sma20: l.price,
          sma50: l.price,
          vwap: l.price,
          macd: { macd: 0, signal: 0, histogram: 0 },
          bollingerBands: { upper: l.price * 1.05, middle: l.price, lower: l.price * 0.95 },
          atr: 10
        }
      }))
    : [];

  const active = (realMovers && realMovers.volume_leaders.length > 0)
    ? realMovers.volume_leaders.map(v => ({
        ...instruments.find(i => i.symbol === v.symbol) || {
          symbol: v.symbol,
          name: v.name,
          exchange: 'NSE' as const,
          type: 'STOCK' as const,
          price: v.price,
          change: v.change,
          changePercent: v.changePercent,
          open: v.open,
          high: v.high,
          low: v.low,
          prevClose: v.price - v.change,
          volume: v.volume,
          avgVolume: v.volume,
          rsi: 50,
          ema20: v.price,
          ema50: v.price,
          ema200: v.price,
          sma20: v.price,
          sma50: v.price,
          vwap: v.price,
          macd: { macd: 0, signal: 0, histogram: 0 },
          bollingerBands: { upper: v.price * 1.05, middle: v.price, lower: v.price * 0.95 },
          atr: 10
        }
      }))
    : [];

  const displayList = (activeTab === 'gainers' ? gainers : activeTab === 'losers' ? losers : activeTab === 'active' ? active : indexFilteredInstruments)
    .filter(i => i.symbol.toLowerCase().includes(filterQuery.toLowerCase()) || i.name.toLowerCase().includes(filterQuery.toLowerCase()));


  const handleIndexClick = (symbol: string) => {
    if (selectedIndex === symbol) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(symbol);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Market Explorer & Instruments Universe"
        subtitle="Explore official NSE listed equities, indices, real-time screener & market breadth"
        badge={{ text: "NSE / BSE Live", variant: "accent" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('options')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Layers size={13} />
              <span>Options Chain</span>
            </button>
            {canCreateStrategy && (
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
            )}
          </div>
        }
      />

      {/* Main Top Navigation View Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: 10,
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveView('universe')}
            className={`btn btn-sm ${activeView === 'universe' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: 6, fontSize: 12 }}
          >
            <TableProperties size={14} />
            <span>Stock Universe & Indices API</span>
          </button>
          <button
            onClick={() => setActiveView('screener')}
            className={`btn btn-sm ${activeView === 'screener' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: 6, fontSize: 12 }}
          >
            <BarChart3 size={14} />
            <span>Live Screener & Breadth</span>
          </button>
        </div>

        {activeView === 'universe' && (
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
            Integrated with REST API: <code className="mono" style={{ padding: '2px 6px', backgroundColor: 'var(--bg-sunken)', borderRadius: 4 }}>/api/v1/instruments</code>
          </div>
        )}
      </div>

      {activeView === 'universe' ? (
        /* View 1: Stock Universe Table & Categorized Indices (Full API Implementation) */
        <StockUniverseTable
          initialIndex={selectedIndex}
          onIndexSelect={(idx) => setSelectedIndex(idx)}
        />
      ) : (
        /* View 2: Live Screener & Sector Performance */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Indices Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                Benchmark & Sectoral Indices {selectedIndex ? `(Filter Active: ${selectedIndex})` : '(Click to Filter Constituents)'}
              </div>
              {selectedIndex && (
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="btn btn-ghost btn-sm text-accent"
                  style={{ fontSize: 11, height: 22, padding: '0 6px', gap: 4 }}
                >
                  <X size={12} />
                  <span>Clear Filter (Show All)</span>
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {mockLiveIndices.map(idx => {
                const isPos = idx.change >= 0;
                const isSelected = selectedIndex === idx.symbol;

                return (
                  <div
                    key={idx.symbol}
                    onClick={() => handleIndexClick(idx.symbol)}
                    className="surface-card"
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      boxShadow: isSelected ? '0 0 14px rgba(31, 95, 191, 0.25)' : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      transition: 'all 140ms ease'
                    }}
                    title={`Click to view all ${idx.symbol} constituent companies`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {idx.symbol}
                        </span>
                        {isSelected && (
                          <span className="badge badge-accent" style={{ fontSize: 8.5, padding: '1px 4px' }}>
                            Active
                          </span>
                        )}
                      </div>
                      <span className={`badge ${isPos ? 'badge-positive' : 'badge-negative'}`} style={{ fontSize: 9 }}>
                        {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="mono" style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                      <span className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 10, fontWeight: 600 }}>
                        {isPos ? '+' : ''}{idx.change.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 9.5, color: isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)', fontWeight: 500 }}>
                        {isSelected ? 'Viewing Constituents' : 'Click to View'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column: Stock Screener & Sector Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
            {/* Left: Stock Table with Tabs */}
            <div className="surface-card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Active Index Banner if an Index is Selected */}
              {selectedIndex && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--accent-subtle)',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11.5
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>
                      Showing <strong>{selectedIndex}</strong> Constituents (<strong>{indexFilteredInstruments.length}</strong> stocks)
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="btn btn-ghost btn-sm text-accent"
                    style={{ padding: '0 4px', height: 20, fontSize: 11 }}
                  >
                    Show All Stocks ✕
                  </button>
                </div>
              )}

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
                      {tab === 'active' ? 'Most Active' : tab === 'all' ? 'All Stocks' : `Top ${tab}`}
                    </button>
                  ))}
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
                    placeholder={selectedIndex ? `Filter ${selectedIndex}...` : 'Filter symbols...'}
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: 11,
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      width: 140
                    }}
                  />
                  {filterQuery && (
                    <button 
                      onClick={() => setFilterQuery('')} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
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
                      <th>SYMBOL</th>
                      <th className="text-right">LTP (₹)</th>
                      <th className="text-right">CHANGE (%)</th>
                      <th className="text-right">VOLUME</th>
                      <th className="text-right">RSI</th>
                      <th className="text-right" style={{ paddingRight: '12px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)', fontSize: 12.5 }}>
                          {activeTab === 'gainers' 
                            ? 'Waiting for verified top gainers from live broker feed...' 
                            : activeTab === 'losers' 
                              ? 'Waiting for verified top losers from live broker feed...' 
                              : activeTab === 'active' 
                                ? 'Waiting for volume leaders from live broker feed...' 
                                : `No instruments found matching ${selectedIndex ? `${selectedIndex}` : ''} filter.`}
                        </td>
                      </tr>
                    ) : (
                      displayList.map(inst => {
                        const isPos = inst.change >= 0;
                        return (
                          <tr 
                            key={inst.symbol}
                            onClick={() => setInspectDetailSymbol(inst.symbol)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontWeight: 700, fontSize: 12.5 }}>{inst.symbol}</span>
                                  {inst.matchedStrategy && (
                                    <span className="badge badge-positive" style={{ fontSize: 8.5, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Sparkles size={9} />
                                      <span>Signal</span>
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{inst.name}</span>
                              </div>
                            </td>

                            <td className="text-right mono" style={{ fontWeight: 700 }}>
                              ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>

                            <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                              {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                            </td>

                            <td className="text-right mono" style={{ color: 'var(--text-secondary)' }}>
                              {(inst.volume / 100000).toFixed(1)}L
                            </td>

                            <td className="text-right mono" style={{ 
                              fontWeight: (inst.rsi < 35 || inst.rsi > 65) ? 700 : 500,
                              color: inst.rsi < 35 ? 'var(--positive)' : inst.rsi > 65 ? 'var(--negative)' : 'var(--text-secondary)'
                            }}>
                              {inst.rsi.toFixed(1)}
                            </td>

                            <td className="text-right" style={{ paddingRight: '12px' }} onClick={e => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setInspectDetailSymbol(inst.symbol)}
                                  className="btn btn-secondary btn-sm"
                                  title="Instrument Details"
                                  style={{ height: 26, padding: '0 6px' }}
                                >
                                  <Info size={13} />
                                </button>
                                <button
                                  onClick={() => navigateToInstrument(inst.symbol)}
                                  className="btn btn-secondary btn-sm"
                                  title="Chart & Details"
                                  style={{ height: 26, padding: '0 6px' }}
                                >
                                  <LineChart size={13} />
                                </button>
                                <button
                                  onClick={() => setInspectDepthSymbol(inst.symbol)}
                                  className="btn btn-secondary btn-sm"
                                  title="Market Depth"
                                  style={{ height: 26, padding: '0 6px' }}
                                >
                                  <Activity size={13} />
                                </button>
                                <button
                                  onClick={() => openQuickOrder({
                                    symbol: inst.symbol,
                                    name: inst.name,
                                    side: 'BUY',
                                    price: inst.price,
                                    initialQty: inst.lotSize || 25
                                  })}
                                  className="btn btn-buy btn-sm"
                                  style={{ height: 26, padding: '0 10px', fontSize: 11, fontWeight: 700 }}
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
            </div>

            {/* Right: Sector Performance & Breadth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sectoral Breadth</h2>
                  <span className="text-secondary" style={{ fontSize: 10 }}>NSE Indices</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SECTOR_PERFORMANCE.map(sec => {
                    const isPos = sec.changePercent >= 0;
                    const isSectorSelected = selectedIndex === sec.indexKey;

                    return (
                      <div
                        key={sec.sector}
                        onClick={() => handleIndexClick(sec.indexKey || sec.sector.toUpperCase())}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSectorSelected ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                          border: isSectorSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                        title={`Click to filter ${sec.sector} stocks`}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: isSectorSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            {sec.sector}
                          </div>
                          <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>Adv/Dec: {sec.advDec}</div>
                        </div>

                        <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700, fontSize: 12 }}>
                          {isPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Depth Inspect Modal */}
      {inspectDepthSymbol && (
        <MarketDepthModal
          symbol={inspectDepthSymbol}
          onClose={() => setInspectDepthSymbol(null)}
        />
      )}

      {/* Stock Details Drawer */}
      {inspectDetailSymbol && (
        <StockDetailDrawer
          symbol={inspectDetailSymbol}
          onClose={() => setInspectDetailSymbol(null)}
          onSelectIndex={(idx) => {
            setSelectedIndex(idx);
            setActiveView('universe');
          }}
        />
      )}
    </div>
  );
};
