import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  RefreshCw, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  X,
  LineChart
} from 'lucide-react';
import { 
  BackendInstrument, 
  MarketIndexSummary, 
  MarketIndexCategory 
} from '../../types';
import { instrumentService } from '../../services/instrumentService';
import { useTrading } from '../../context/TradingContext';
import { StockDetailDrawer } from './StockDetailDrawer';

interface StockUniverseTableProps {
  initialIndex?: string | null;
  onIndexSelect?: (indexSymbol: string | null) => void;
}

const CATEGORY_LABELS: Record<MarketIndexCategory, string> = {
  BROAD_MARKET: 'Broad Market',
  SECTORAL: 'Sectoral Indices',
  THEMATIC: 'Thematic',
  STRATEGY: 'Strategy',
  OTHER: 'Other Indices'
};

export const StockUniverseTable: React.FC<StockUniverseTableProps> = ({
  initialIndex = null,
  onIndexSelect
}) => {
  const { navigateToInstrument, openQuickOrder, addToast } = useTrading();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<string | null>(initialIndex);
  const [selectedSeries, setSelectedSeries] = useState<string>('EQ');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data state
  const [stocks, setStocks] = useState<BackendInstrument[]>([]);
  const [indices, setIndices] = useState<MarketIndexSummary[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState<boolean>(false);
  const [isLoadingIndices, setIsLoadingIndices] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Detail Drawer state
  const [drawerSymbol, setDrawerSymbol] = useState<string | null>(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync initialIndex changes
  useEffect(() => {
    if (initialIndex !== undefined) {
      setSelectedIndex(initialIndex);
      setCurrentPage(1);
    }
  }, [initialIndex]);

  // Fetch indices on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingIndices(true);
    const ALLOWED_INDEX_PATTERNS = ['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'NIFTY BANK', 'NIFTY IT', 'FINNIFTY', 'NIFTY FINANCIAL SERVICES'];
    instrumentService.getIndices()
      .then(res => {
        if (isMounted) {
          const filtered = (res || []).filter(idx => 
            ALLOWED_INDEX_PATTERNS.some(pat => pat.toLowerCase().replace(/\s+/g, '') === idx.symbol.toLowerCase().replace(/\s+/g, ''))
          );
          setIndices(filtered.length > 0 ? filtered : res);
        }
      })
      .catch(err => {
        console.error('Failed to load indices:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingIndices(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch stocks whenever query parameters change
  const fetchStocksData = useCallback(async () => {
    setIsLoadingStocks(true);
    try {
      const res = await instrumentService.getStocks({
        search: debouncedSearch || undefined,
        index: selectedIndex || undefined,
        series: selectedSeries === 'ALL' ? '' : selectedSeries,
        page: currentPage,
        page_size: pageSize
      });

      setStocks(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch stocks universe:', err);
    } finally {
      setIsLoadingStocks(false);
    }
  }, [debouncedSearch, selectedIndex, selectedSeries, currentPage, pageSize]);

  useEffect(() => {
    fetchStocksData();
  }, [fetchStocksData]);

  // Trigger sync
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const res = await instrumentService.triggerSync();
      addToast({
        type: 'success',
        title: 'Exchange Sync Complete',
        message: res.message || `Synchronized ${res.total_stocks_synced} stocks and ${res.total_indices_synced} indices in ${res.duration_seconds}s.`
      });
      // Refresh indices & stocks
      const [newIndices] = await Promise.all([
        instrumentService.getIndices(),
        fetchStocksData()
      ]);
      setIndices(newIndices);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: err?.message || 'Failed to trigger instruments sync'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleIndexClick = (idxSymbol: string) => {
    const nextVal = selectedIndex === idxSymbol ? null : idxSymbol;
    setSelectedIndex(nextVal);
    setCurrentPage(1);
    if (onIndexSelect) {
      onIndexSelect(nextVal);
    }
  };

  // Group indices by category
  const categoriesList = ['ALL', 'BROAD_MARKET', 'SECTORAL', 'THEMATIC', 'STRATEGY'];
  const filteredIndices = activeCategoryTab === 'ALL' 
    ? indices 
    : indices.filter(idx => idx.category === activeCategoryTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Filter & Index Browser Header */}
      <div className="surface-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
                NSE Listed Equities & Market Indices Universe
              </h2>
              <span className="badge badge-accent" style={{ fontSize: 10 }}>
                Live Master Data
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Explore official exchange symbols, ISINs, market lots, and constituent indices.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6, fontSize: 11.5 }}
              title="Synchronize listed equities & indices from NSE"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Exchange Data'}</span>
            </button>
          </div>
        </div>

        {/* Index Category Tabs & Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryTab(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11,
                    fontWeight: activeCategoryTab === cat ? 700 : 500,
                    backgroundColor: activeCategoryTab === cat ? 'var(--accent-subtle)' : 'transparent',
                    color: activeCategoryTab === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: activeCategoryTab === cat ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all 120ms ease'
                  }}
                >
                  {cat === 'ALL' ? 'All Categories' : CATEGORY_LABELS[cat as MarketIndexCategory] || cat}
                </button>
              ))}
            </div>

            {selectedIndex && (
              <button
                onClick={() => handleIndexClick(selectedIndex)}
                className="btn btn-ghost btn-sm text-accent"
                style={{ fontSize: 11, height: 24, padding: '0 8px', gap: 4 }}
              >
                <X size={12} />
                <span>Clear Index Filter ({selectedIndex})</span>
              </button>
            )}
          </div>

          {/* Indices Horizontal Pill Selector */}
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'thin'
          }}>
            {isLoadingIndices ? (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '6px 0' }}>Loading market indices...</div>
            ) : filteredIndices.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '6px 0' }}>No indices found in this category.</div>
            ) : (
              filteredIndices.map(idx => {
                const isSelected = selectedIndex === idx.symbol;
                return (
                  <button
                    key={idx.id || idx.symbol}
                    onClick={() => handleIndexClick(idx.symbol)}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-sunken)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      fontSize: 11.5,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 120ms ease'
                    }}
                    title={`${idx.name} (${idx.constituents_count} stocks)`}
                  >
                    <Layers size={13} style={{ opacity: isSelected ? 1 : 0.7 }} />
                    <span>{idx.symbol}</span>
                    <span style={{
                      fontSize: 9.5,
                      padding: '1px 5px',
                      borderRadius: 10,
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                    }}>
                      {idx.constituents_count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Stock Universe Table Card */}
      <div className="surface-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Table Search & Controls Bar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0 10px',
            height: 32,
            minWidth: 260,
            maxWidth: 380,
            flex: 1
          }}>
            <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder={selectedIndex ? `Search within ${selectedIndex} (e.g. Symbol, Name, ISIN)...` : "Search all listed stocks (e.g. RELIANCE, TATA, INE002A01018)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 12,
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Series & Items Per Page Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Series:</span>
              <select
                value={selectedSeries}
                onChange={(e) => {
                  setSelectedSeries(e.target.value);
                  setCurrentPage(1);
                }}
                className="input"
                style={{ height: 28, padding: '0 6px', fontSize: 11, width: 'auto' }}
              >
                <option value="EQ">EQ (Regular Equity)</option>
                <option value="ALL">All Series</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="input"
                style={{ height: 28, padding: '0 6px', fontSize: 11, width: 'auto' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pill if active */}
        {selectedIndex && (
          <div style={{
            padding: '8px 16px',
            backgroundColor: 'var(--accent-subtle)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>
                Filtering Universe by <strong>{selectedIndex}</strong> ({totalCount} matching stocks)
              </span>
            </div>
            <button
              onClick={() => handleIndexClick(selectedIndex)}
              className="btn btn-ghost btn-sm text-accent"
              style={{ height: 20, padding: '0 6px', fontSize: 11 }}
            >
              Show All Stocks ✕
            </button>
          </div>
        )}

        {/* Table Content */}
        <div style={{ overflowX: 'auto', minHeight: 300 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>SYMBOL</th>
                <th>COMPANY NAME</th>
                <th style={{ width: 120 }}>EXCHANGE / SERIES</th>
                <th style={{ width: 140 }}>ISIN</th>
                <th className="text-right" style={{ width: 110 }}>FACE VALUE</th>
                <th className="text-right" style={{ width: 90 }}>LOT</th>
                <th>INDEX CONSTITUENTS</th>
                <th className="text-right" style={{ width: 150, paddingRight: 16 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStocks ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div className="spinner" style={{ width: 24, height: 24, border: '2.5px solid var(--border-default)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading instruments from API...</span>
                    </div>
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>No listed equities found matching query.</div>
                    <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-tertiary)' }}>
                      Try searching with a different term, clearing the index filter, or syncing exchange data.
                    </div>
                  </td>
                </tr>
              ) : (
                stocks.map(stock => {
                  return (
                    <tr
                      key={stock.id || stock.symbol}
                      onClick={() => setDrawerSymbol(stock.symbol)}
                      style={{ cursor: 'pointer', transition: 'background-color 80ms ease' }}
                    >
                      {/* Symbol */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--accent-primary)' }}>
                            {stock.symbol}
                          </span>
                          {stock.is_active && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--positive)' }} title="Active Equity" />
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td>
                        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {stock.name}
                        </div>
                      </td>

                      {/* Exchange / Series */}
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>{stock.exchange}</span>
                          <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>{stock.series}</span>
                        </div>
                      </td>

                      {/* ISIN */}
                      <td>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {stock.isin || '—'}
                        </span>
                      </td>

                      {/* Face Value */}
                      <td className="text-right mono" style={{ fontSize: 11.5 }}>
                        {stock.face_value !== null ? `₹${stock.face_value.toFixed(2)}` : '—'}
                      </td>

                      {/* Lot */}
                      <td className="text-right mono" style={{ fontSize: 11.5 }}>
                        {stock.market_lot || 1}
                      </td>

                      {/* Indices Tags */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 320 }}>
                          {stock.indices && stock.indices.length > 0 ? (
                            stock.indices.slice(0, 3).map(idxName => (
                              <button
                                key={idxName}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIndexClick(idxName);
                                }}
                                className="badge"
                                style={{
                                  fontSize: 9,
                                  padding: '1px 5px',
                                  backgroundColor: selectedIndex === idxName ? 'var(--accent-primary)' : 'var(--bg-sunken)',
                                  color: selectedIndex === idxName ? '#FFFFFF' : 'var(--accent-primary)',
                                  border: '1px solid var(--border-subtle)',
                                  cursor: 'pointer'
                                }}
                              >
                                {idxName}
                              </button>
                            ))
                          ) : (
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>—</span>
                          )}
                          {stock.indices && stock.indices.length > 3 && (
                            <span style={{ fontSize: 9, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                              +{stock.indices.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-right" style={{ paddingRight: 16 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setDrawerSymbol(stock.symbol)}
                            className="btn btn-secondary btn-sm"
                            title="Inspect Stock Specs"
                            style={{ height: 24, padding: '0 6px', fontSize: 10.5 }}
                          >
                            <Info size={12} />
                          </button>
                          <button
                            onClick={() => navigateToInstrument(stock.symbol)}
                            className="btn btn-secondary btn-sm"
                            title="Open Full Live Chart"
                            style={{ height: 24, padding: '0 6px', fontSize: 10.5 }}
                          >
                            <LineChart size={12} />
                          </button>
                          <button
                            onClick={() => openQuickOrder({
                              symbol: stock.symbol,
                              name: stock.name,
                              side: 'BUY',
                              price: 1000,
                              initialQty: stock.market_lot || 1
                            })}
                            className="btn btn-buy btn-sm"
                            style={{ height: 24, padding: '0 8px', fontSize: 10, fontWeight: 700 }}
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

        {/* Pagination Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-sunken)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 11.5
        }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            Showing <strong>{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> of <strong>{totalCount.toLocaleString('en-IN')}</strong> listed stocks
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || isLoadingStocks}
              className="btn btn-secondary btn-sm"
              style={{ height: 26, padding: '0 8px' }}
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Page</span>
              <span className="mono" style={{ fontWeight: 700 }}>{currentPage}</span>
              <span style={{ color: 'var(--text-secondary)' }}>of</span>
              <span className="mono" style={{ fontWeight: 700 }}>{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoadingStocks}
              className="btn btn-secondary btn-sm"
              style={{ height: 26, padding: '0 8px' }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Details Slide Drawer */}
      {drawerSymbol && (
        <StockDetailDrawer
          symbol={drawerSymbol}
          onClose={() => setDrawerSymbol(null)}
          onSelectIndex={(idx) => {
            handleIndexClick(idx);
          }}
        />
      )}
    </div>
  );
};
