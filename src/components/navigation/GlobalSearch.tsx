import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight, Layers } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { InstrumentType, BackendInstrument } from '../../types';
import { instrumentService } from '../../services/instrumentService';

export const GlobalSearch: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    instruments, 
    navigateToInstrument, 
    openQuickOrder, 
    setCurrentPage,
    getInstrument
  } = useTrading();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'STOCK' | 'INDEX' | 'OPTIONS'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [apiStockResults, setApiStockResults] = useState<BackendInstrument[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch stocks from API on debounced query
  useEffect(() => {
    if (!isSearchOpen) return;

    let isMounted = true;
    setIsLoadingApi(true);

    instrumentService.getStocks({
      search: debouncedQuery.trim() || undefined,
      page_size: 25
    })
      .then(res => {
        if (isMounted) {
          setApiStockResults(res.items || []);
        }
      })
      .catch(err => {
        console.warn('Search API error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingApi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Build unified result items
  const matchedStocks = apiStockResults.map(s => {
    const live = getInstrument(s.symbol);
    return {
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange || 'NSE',
      series: s.series || 'EQ',
      isin: s.isin,
      type: 'STOCK' as InstrumentType,
      indices: s.indices || [],
      price: live?.price || 1000,
      change: live?.change || 0,
      changePercent: live?.changePercent || 0,
      hasLivePrice: !!live
    };
  });

  // Filter instruments (if searching for Indices or Options)
  const otherFiltered = instruments
    .filter(inst => {
      if (inst.type === 'STOCK') return false; // Handled by API stocks
      const matchesQuery = inst.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
                           inst.name.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesQuery;
    })
    .map(inst => ({
      symbol: inst.symbol,
      name: inst.name,
      exchange: inst.exchange,
      series: 'EQ',
      isin: null,
      type: inst.type,
      indices: inst.indices || [],
      price: inst.price,
      change: inst.change,
      changePercent: inst.changePercent,
      hasLivePrice: true
    }));

  const allCombined = [...matchedStocks, ...otherFiltered].filter(item => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'STOCK') return item.type === 'STOCK';
    if (activeCategory === 'INDEX') return item.type === 'INDEX';
    if (activeCategory === 'OPTIONS') return item.type === 'OPTIONS' || item.type === 'FUTURES';
    return true;
  });

  const handleSelect = (symbol: string) => {
    navigateToInstrument(symbol);
    setIsSearchOpen(false);
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allCombined.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (allCombined.length || 1)) % (allCombined.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allCombined[selectedIndex]) {
        handleSelect(allCombined[selectedIndex].symbol);
      }
    }
  };

  return (
    <div 
      onClick={() => setIsSearchOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 20, 18, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '70px',
        zIndex: 120,
        animation: 'fadeIn 120ms ease'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 660,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-default)'
        }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search NSE stocks by Symbol, Company Name, or ISIN (e.g. RELIANCE, TCS, INE002A)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNav}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
          />
          {isLoadingApi && (
            <div className="spinner" style={{ width: 14, height: 14, border: '2px solid var(--border-default)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          )}
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="btn btn-ghost btn-sm"
              style={{ padding: 4, height: 'auto' }}
            >
              <X size={14} />
            </button>
          )}
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 11 }}
          >
            Esc
          </button>
        </div>

        {/* Categories Tab */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '8px 16px',
          backgroundColor: 'var(--bg-sunken)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 11
        }}>
          {(['ALL', 'STOCK', 'INDEX', 'OPTIONS'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: activeCategory === cat ? '1px solid var(--border-strong)' : '1px solid transparent',
                backgroundColor: activeCategory === cat ? 'var(--bg-surface)' : 'transparent',
                color: activeCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeCategory === cat ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? 'All Listed Assets' : cat === 'STOCK' ? 'Equities (Stocks)' : cat === 'INDEX' ? 'Indices' : 'Options & F&O'}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '6px' }}>
          {allCombined.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>No listed instruments matching "{query}"</div>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                Search by stock symbol (e.g. RELIANCE, TCS, INFY), company name, or index name
              </div>
            </div>
          ) : (
            allCombined.map((inst, index) => {
              const isSelected = index === selectedIndex;
              const isPos = inst.change >= 0;

              return (
                <div
                  key={`${inst.symbol}-${index}`}
                  onClick={() => handleSelect(inst.symbol)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 80ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, paddingRight: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Top row: Bold Symbol + Badges + Index Tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 13.5, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {inst.symbol}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: 9 }}>{inst.exchange}</span>
                        {inst.series && (
                          <span className="badge badge-neutral" style={{ fontSize: 9 }}>{inst.series}</span>
                        )}

                        {/* Index Tags */}
                        {inst.indices && inst.indices.slice(0, 2).map(idxTag => (
                          <span 
                            key={idxTag} 
                            className="badge" 
                            style={{ fontSize: 8.5, padding: '1px 4px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}
                          >
                            {idxTag}
                          </span>
                        ))}
                      </div>

                      {/* Subtitle Name & ISIN */}
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {inst.name}
                        {inst.isin && (
                          <span className="mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 8 }}>
                            {inst.isin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    {inst.hasLivePrice && (
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{ fontWeight: 700, fontSize: 12.5 }}>
                          ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                          {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickOrder({
                            symbol: inst.symbol,
                            name: inst.name,
                            side: 'BUY',
                            price: inst.price,
                            initialQty: 1
                          });
                          setIsSearchOpen(false);
                        }}
                        className="btn btn-buy btn-sm"
                        style={{ height: 24, padding: '0 6px', fontSize: 10 }}
                      >
                        B
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickOrder({
                            symbol: inst.symbol,
                            name: inst.name,
                            side: 'SELL',
                            price: inst.price,
                            initialQty: 1
                          });
                          setIsSearchOpen(false);
                        }}
                        className="btn btn-sell btn-sm"
                        style={{ height: 24, padding: '0 6px', fontSize: 10 }}
                      >
                        S
                      </button>
                    </div>

                    <ArrowRight size={14} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Links Footer */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-sunken)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span 
              onClick={() => {
                setCurrentPage('options');
                setIsSearchOpen(false);
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              className="text-accent"
            >
              <Layers size={12} />
              <span>NIFTY Option Chain</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Open Stock Specs</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
