import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { MarketDepth } from './MarketDepth';

interface MarketDepthModalProps {
  symbol: string | null;
  onClose: () => void;
}

export const MarketDepthModal: React.FC<MarketDepthModalProps> = ({
  symbol,
  onClose
}) => {
  const { getInstrument, navigateToInstrument, openQuickOrder } = useTrading();

  if (!symbol) return null;

  const inst = getInstrument(symbol);
  const isPos = (inst?.change || 0) >= 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(23, 20, 18, 0.4)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 105,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 580,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-sunken)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{symbol}</h3>
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                  {inst?.exchange || 'NSE'}
                </span>
                {inst?.sector && (
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                    {inst.sector}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {inst?.name || 'Stock Instrument'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {inst && (
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
                  ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 10, fontWeight: 600 }}>
                  {isPos ? '+' : ''}₹{inst.change.toFixed(2)} ({isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%)
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{ padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Market Depth Component Container */}
        <div style={{ padding: '16px' }}>
          <MarketDepth
            symbol={symbol}
            showHeader={true}
            onPriceClick={(side, price) => {
              onClose();
              openQuickOrder({
                symbol,
                name: inst?.name || symbol,
                side,
                price,
                initialQty: inst?.lotSize || 10
              });
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-sunken)'
        }}>
          <button
            onClick={() => {
              onClose();
              navigateToInstrument(symbol);
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, fontSize: 11.5 }}
          >
            <ExternalLink size={12} />
            <span>Open Instrument Page</span>
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                onClose();
                openQuickOrder({
                  symbol,
                  name: inst?.name || symbol,
                  side: 'BUY',
                  price: inst?.price || 100,
                  initialQty: inst?.lotSize || 10
                });
              }}
              className="btn btn-buy btn-sm"
              style={{ height: 28, padding: '0 14px', fontWeight: 700 }}
            >
              BUY
            </button>
            <button
              onClick={() => {
                onClose();
                openQuickOrder({
                  symbol,
                  name: inst?.name || symbol,
                  side: 'SELL',
                  price: inst?.price || 100,
                  initialQty: inst?.lotSize || 10
                });
              }}
              className="btn btn-sell btn-sm"
              style={{ height: 28, padding: '0 14px', fontWeight: 700 }}
            >
              SELL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
