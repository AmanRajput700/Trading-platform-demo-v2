import React, { useEffect, useState } from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  Tag, 
  Building, 
  Hash, 
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { BackendInstrument } from '../../types';
import { instrumentService } from '../../services/instrumentService';
import { useTrading } from '../../context/TradingContext';

interface StockDetailDrawerProps {
  symbol: string | null;
  onClose: () => void;
  onSelectIndex?: (indexName: string) => void;
}

export const StockDetailDrawer: React.FC<StockDetailDrawerProps> = ({ 
  symbol, 
  onClose,
  onSelectIndex 
}) => {
  const { navigateToChart, openQuickOrder, getInstrument } = useTrading();
  const [stock, setStock] = useState<BackendInstrument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const marketLiveInst = symbol ? getInstrument(symbol) : null;

  useEffect(() => {
    if (!symbol) {
      setStock(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    instrumentService.getStockBySymbol(symbol)
      .then(res => {
        if (isMounted) {
          setStock(res);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err?.message || 'Failed to load stock details');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  if (!symbol) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 25, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 110,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 180ms ease'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--bg-sunken)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{symbol}</h2>
              {stock?.series && (
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>{stock.series}</span>
              )}
              {stock?.exchange && (
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>{stock.exchange}</span>
              )}
              {stock?.is_active !== undefined && (
                <span className={`badge ${stock.is_active ? 'badge-positive' : 'badge-negative'}`} style={{ fontSize: 10 }}>
                  {stock.is_active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {stock?.name || 'Loading company details...'}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, height: 'auto' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 12 }}>
              <div className="spinner" style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fetching instrument specifications...</span>
            </div>
          ) : error ? (
            <div style={{ padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--negative)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <AlertCircle size={18} style={{ color: 'var(--negative)' }} />
              <span style={{ fontSize: 12, color: 'var(--negative)' }}>{error}</span>
            </div>
          ) : stock ? (
            <>
              {/* Live Market Snapshot if available */}
              {(stock.current_price || marketLiveInst) && (
                <div style={{
                  padding: 14,
                  backgroundColor: 'var(--bg-sunken)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Market Live Price
                    </div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                      ₹{(stock.current_price || marketLiveInst?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`mono ${(stock.change ?? marketLiveInst?.change ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <TrendingUp size={14} />
                      {(stock.change ?? marketLiveInst?.change ?? 0) >= 0 ? '+' : ''}{(stock.change_percent ?? marketLiveInst?.changePercent ?? 0).toFixed(2)}%
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      Vol: {(((stock.volume || marketLiveInst?.volume || 0)) / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>
              )}


              {/* Key Specifications Grid */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                  Equity Instrument Metadata
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10
                }}>
                  {/* ISIN */}
                  <div style={{ padding: 10, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Hash size={11} />
                      <span>ISIN NUMBER</span>
                    </div>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                      {stock.isin || 'N/A'}
                    </div>
                  </div>

                  {/* Listing Date */}
                  <div style={{ padding: 10, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      <span>LISTING DATE</span>
                    </div>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                      {stock.listing_date || 'N/A'}
                    </div>
                  </div>

                  {/* Face Value */}
                  <div style={{ padding: 10, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={11} />
                      <span>FACE VALUE (₹)</span>
                    </div>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                      {stock.face_value !== null ? `₹${stock.face_value.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>

                  {/* Paid Up Value */}
                  <div style={{ padding: 10, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={11} />
                      <span>PAID UP VALUE (₹)</span>
                    </div>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                      {stock.paid_up_value !== null ? `₹${stock.paid_up_value.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>

                  {/* Market Lot */}
                  <div style={{ padding: 10, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag size={11} />
                      <span>MARKET LOT</span>
                    </div>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                      {stock.market_lot || 1}
                    </div>
                  </div>

                  {/* Exchange / Series */}
                  <div style={{ padding: 10, backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building size={11} />
                      <span>SERIES / SEGMENT</span>
                    </div>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
                      {stock.exchange} · {stock.series}
                    </div>
                  </div>
                </div>
              </div>

              {/* Index Membership Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                    Index Constituents & Benchmark Tags ({stock.indices?.length || 0})
                  </div>
                </div>

                {stock.indices && stock.indices.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {stock.indices.map((idxName) => (
                      <button
                        key={idxName}
                        onClick={() => {
                          if (onSelectIndex) {
                            onSelectIndex(idxName);
                            onClose();
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--accent-subtle)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--accent-primary)',
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                        title={`Filter universe by ${idxName}`}
                      >
                        <Layers size={13} />
                        <span>{idxName}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    This stock is not indexed in any primary benchmark index.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-sunken)',
          display: 'flex',
          gap: 10
        }}>
          <button
            onClick={() => {
              navigateToChart(symbol);
              onClose();
            }}
            className="btn btn-secondary"
            style={{ flex: 1, gap: 6, fontSize: 12 }}
          >
            <BarChart2 size={14} />
            <span>Open Live Chart</span>
          </button>
          <button
            onClick={() => {
              openQuickOrder({
                symbol: symbol,
                name: stock?.name || symbol,
                side: 'BUY',
                price: marketLiveInst?.price || 1000,
                initialQty: stock?.market_lot || 1
              });
              onClose();
            }}
            className="btn btn-buy"
            style={{ flex: 1, fontSize: 12, fontWeight: 700 }}
          >
            Quick Buy
          </button>
        </div>
      </div>
    </div>
  );
};
