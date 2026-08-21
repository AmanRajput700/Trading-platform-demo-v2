import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight, Layers } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { InstrumentType } from '../../types';

export const GlobalSearch: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, instruments, navigateToInstrument, openQuickOrder, setCurrentPage } = useTrading();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | InstrumentType>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = instruments.filter(inst => {
    const matchesQuery = inst.symbol.toLowerCase().includes(query.toLowerCase()) || 
                         inst.name.toLowerCase().includes(query.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || inst.type === activeCategory;
    return matchesQuery && matchesCat;
  });

  const handleSelect = (symbol: string) => {
    navigateToInstrument(symbol);
    setIsSearchOpen(false);
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].symbol);
      }
    }
  };

  return (
    <div 
      onClick={() => setIsSearchOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 20, 18, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        zIndex: 100
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)'
        }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stocks, indices, options (e.g. RELIANCE, NIFTY)..."
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
                fontWeight: activeCategory === cat ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? 'All Assets' : cat === 'STOCK' ? 'Stocks' : cat === 'INDEX' ? 'Indices' : 'Options'}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>No instruments matching "{query}"</div>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>Try searching for RELIANCE, HDFCBANK, INFY or NIFTY</div>
            </div>
          ) : (
            filtered.map((inst, index) => {
              const isSelected = index === selectedIndex;
              const isPos = inst.change >= 0;

              return (
                <div
                  key={inst.symbol}
                  onClick={() => handleSelect(inst.symbol)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 80ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{inst.symbol}</span>
                        <span className="badge badge-neutral" style={{ fontSize: 9 }}>{inst.exchange}</span>
                        <span className="badge badge-neutral" style={{ fontSize: 9 }}>{inst.type}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {inst.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
                        ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                        {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
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
                            initialQty: 10
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
            <span><kbd>Enter</kbd> Open Chart</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
