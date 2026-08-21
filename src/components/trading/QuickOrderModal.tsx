import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ArrowRight, Layers } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide, OrderType, ProductType } from '../../types';
import { MarketDepth } from './MarketDepth';

export const QuickOrderModal: React.FC = () => {
  const { quickOrder, closeQuickOrder, placeOrder, portfolio } = useTrading();
  const [side, setSide] = useState<OrderSide>(quickOrder.side);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [product, setProduct] = useState<ProductType>('CNC');
  const [quantity, setQuantity] = useState<number>(quickOrder.initialQty || 10);
  const [limitPrice, setLimitPrice] = useState<number>(quickOrder.price);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showDepth, setShowDepth] = useState<boolean>(false);

  useEffect(() => {
    if (quickOrder.isOpen) {
      setSide(quickOrder.side);
      setLimitPrice(quickOrder.price);
      setQuantity(quickOrder.initialQty || (quickOrder.symbol.includes('NIFTY') ? 75 : 10));
      setShowReview(false);
      
      // Auto-set product type for options/futures
      if (quickOrder.symbol.includes('CE') || quickOrder.symbol.includes('PE') || quickOrder.symbol.includes('FUT')) {
        setProduct('MIS');
      } else {
        setProduct('CNC');
      }
    }
  }, [quickOrder]);

  if (!quickOrder.isOpen) return null;

  const executionPrice = orderType === 'MARKET' ? quickOrder.price : limitPrice;
  const estimatedValue = +(executionPrice * quantity).toFixed(2);
  const requiredMargin = product === 'MIS' ? +(estimatedValue * 0.2).toFixed(2) : estimatedValue;
  const hasEnoughMargin = portfolio.availableMargin >= requiredMargin;

  const handlePlaceOrder = () => {
    const res = placeOrder({
      symbol: quickOrder.symbol,
      side,
      orderType,
      product,
      quantity,
      price: executionPrice
    });

    if (res.success) {
      closeQuickOrder();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(23, 20, 18, 0.4)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: side === 'BUY' ? 'var(--positive-bg)' : 'var(--negative-bg)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${side === 'BUY' ? 'badge-positive' : 'badge-negative'}`}>
                {side}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{quickOrder.symbol}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                ₹{quickOrder.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {quickOrder.name}
            </div>
          </div>
          <button onClick={closeQuickOrder} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {!showReview ? (
          /* Order Configuration Form */
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Buy / Sell Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`btn ${side === 'BUY' ? 'btn-buy' : 'btn-secondary'}`}
                style={{ height: 34 }}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`btn ${side === 'SELL' ? 'btn-sell' : 'btn-secondary'}`}
                style={{ height: 34 }}
              >
                SELL
              </button>
            </div>

            {/* Product Type (CNC / MIS / NRML) */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                PRODUCT
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {(['CNC', 'MIS', 'NRML'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProduct(p)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                      fontWeight: product === p ? 600 : 400,
                      backgroundColor: product === p ? 'var(--bg-sunken)' : 'var(--bg-surface)',
                      border: product === p ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      color: product === p ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {p === 'CNC' ? 'CNC (Delivery)' : p === 'MIS' ? 'MIS (Intraday)' : 'NRML (Carry)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Type & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  ORDER TYPE
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as OrderType)}
                  className="select"
                  style={{ width: '100%' }}
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  PRICE (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? quickOrder.price : limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="input input-mono"
                  style={{ width: '100%', opacity: orderType === 'MARKET' ? 0.7 : 1 }}
                />
              </div>
            </div>

            {/* Live Market Depth Toggle & Compact View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowDepth(!showDepth)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '2px 6px',
                    fontSize: 11,
                    gap: 5,
                    color: showDepth ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 600
                  }}
                >
                  <Layers size={12} />
                  <span>{showDepth ? 'Hide Live Depth (L2)' : 'Show Live Depth (L2)'}</span>
                </button>
                {showDepth && (
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                    Click any price to set limit
                  </span>
                )}
              </div>

              {showDepth && (
                <div style={{
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <MarketDepth
                    symbol={quickOrder.symbol}
                    compact={true}
                    showHeader={false}
                    onPriceClick={(clickedSide, price) => {
                      setOrderType('LIMIT');
                      setLimitPrice(price);
                      if (clickedSide !== side) setSide(clickedSide);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  QUANTITY
                </label>
                <span className="mono text-muted" style={{ fontSize: 11 }}>
                  {quickOrder.symbol.includes('NIFTY') ? 'Lot size: 75' : 'Shares'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  min="1"
                  step={quickOrder.symbol.includes('NIFTY') ? 75 : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input input-mono"
                  style={{ flex: 1 }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  {[10, 50, 100].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(quickOrder.symbol.includes('NIFTY') ? q * 75 : q)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11 }}
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Value & Margin Summary */}
            <div style={{
              backgroundColor: 'var(--bg-sunken)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span className="text-secondary">Estimated Value</span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span className="text-secondary">Margin Required ({product})</span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  ₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: '1px solid var(--border-subtle)', paddingTop: 4, marginTop: 2 }}>
                <span className="text-muted">Available Margin</span>
                <span className={`mono ${hasEnoughMargin ? 'text-positive' : 'text-negative'}`}>
                  ₹{portfolio.availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={closeQuickOrder}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowReview(true)}
                disabled={!hasEnoughMargin && side === 'BUY'}
                className={`btn ${side === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
                style={{ flex: 2, gap: 6 }}
              >
                <span>Review {side} Order</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Order Review Step */
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              backgroundColor: 'var(--bg-sunken)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '14px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                ORDER SUMMARY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Side</span>
                  <span className={`badge ${side === 'BUY' ? 'badge-positive' : 'badge-negative'}`}>{side}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Instrument</span>
                  <span style={{ fontWeight: 600 }}>{quickOrder.symbol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Quantity</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{quantity} shares</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Order Type</span>
                  <span>{orderType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Product</span>
                  <span>{product}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: 6, marginTop: 4 }}>
                  <span className="text-secondary" style={{ fontWeight: 600 }}>Total Order Value</span>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 14 }}>
                    ₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              backgroundColor: 'var(--bg-sunken)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              color: 'var(--text-secondary)'
            }}>
              <ShieldAlert size={15} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <span>Simulated demo trade. No real funds or live broker orders are placed.</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className={`btn ${side === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
                style={{ flex: 2, fontWeight: 700 }}
              >
                Confirm {side} Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
