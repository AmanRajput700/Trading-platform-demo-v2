import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Layers, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide, OrderType, ProductType } from '../../types';
import { MarketDepth } from './MarketDepth';

export const QuickOrderModal: React.FC = () => {
  const { quickOrder, closeQuickOrder, placeOrder, portfolio, addToast } = useTrading();
  const [side, setSide] = useState<OrderSide>(quickOrder.side);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [product, setProduct] = useState<ProductType>('MIS');
  const [quantity, setQuantity] = useState<number>(quickOrder.initialQty || 10);
  const [limitPrice, setLimitPrice] = useState<number>(quickOrder.price);
  const [triggerPrice, setTriggerPrice] = useState<number>(+(quickOrder.price * 0.98).toFixed(2));
  const [isSlOrder, setIsSlOrder] = useState<boolean>(false);
  const [showDepth, setShowDepth] = useState<boolean>(false);

  useEffect(() => {
    if (quickOrder.isOpen) {
      setSide(quickOrder.side);
      setLimitPrice(quickOrder.price);
      setTriggerPrice(+(quickOrder.price * (quickOrder.side === 'BUY' ? 0.98 : 1.02)).toFixed(2));
      setQuantity(quickOrder.initialQty || (quickOrder.symbol.includes('NIFTY') ? 75 : 10));
      setShowDepth(false);
      setIsSlOrder(false);
      setOrderType('MARKET');
      
      // Auto-set product type for options/futures
      if (quickOrder.symbol.includes('CE') || quickOrder.symbol.includes('PE') || quickOrder.symbol.includes('FUT')) {
        setProduct('MIS');
      } else {
        setProduct('MIS'); // Default to MIS for active intraday / MO feel
      }
    }
  }, [quickOrder]);

  if (!quickOrder.isOpen) return null;

  const executionPrice = orderType === 'MARKET' ? quickOrder.price : limitPrice;
  const estimatedValue = +(executionPrice * quantity).toFixed(2);
  
  // Motilal Oswal leverage margins: MIS = 5x leverage (20%), CNC = 100%, NRML = 100%
  const marginMultiplier = product === 'MIS' ? 0.20 : 1.0;
  const requiredMargin = +(estimatedValue * marginMultiplier).toFixed(2);
  const hasEnoughMargin = portfolio.availableMargin >= requiredMargin;
  const estBrokerage = product === 'CNC' ? 0 : 20.00;

  // Quick quantity shortcuts based on available margin
  const maxQtyPossible = Math.max(1, Math.floor(portfolio.availableMargin / (executionPrice * marginMultiplier)));

  const handlePlaceOrder = () => {
    const res = placeOrder({
      symbol: quickOrder.symbol,
      side,
      orderType: isSlOrder ? 'LIMIT' : orderType,
      product,
      quantity,
      price: executionPrice
    });

    if (res.success) {
      addToast({
        type: 'success',
        title: `${side} Order Submitted to Exchange`,
        message: `${side} ${quantity} ${quickOrder.symbol} (${product}) at ₹${executionPrice.toFixed(2)}`
      });
      closeQuickOrder();
    }
  };

  const handleAdjustQty = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handlePercentQty = (percent: number) => {
    const targetQty = Math.max(1, Math.floor((maxQtyPossible * percent) / 100));
    setQuantity(targetQty);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 14, 20, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: '94vh'
      }}>
        {/* Motilal Oswal Styled Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: side === 'BUY' ? 'rgba(0, 208, 156, 0.10)' : 'rgba(235, 94, 85, 0.10)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: side === 'BUY' ? 'var(--positive)' : 'var(--negative)',
                color: '#FFFFFF'
              }}>
                {side}
              </span>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.02em' }}>
                {quickOrder.symbol}
              </span>
              <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: side === 'BUY' ? 'var(--positive)' : 'var(--negative)' }}>
                ₹{quickOrder.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {quickOrder.name} · NSE
            </div>
          </div>

          <button
            onClick={closeQuickOrder}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: 4,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 1. Motilal Oswal BUY / SELL Master Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => setSide('BUY')}
              style={{
                height: 36,
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: side === 'BUY' ? '#00D09C' : 'var(--bg-sunken)',
                color: side === 'BUY' ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: side === 'BUY' ? '0 2px 8px rgba(0, 208, 156, 0.35)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              style={{
                height: 36,
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: side === 'SELL' ? '#EB5E55' : 'var(--bg-sunken)',
                color: side === 'SELL' ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: side === 'SELL' ? '0 2px 8px rgba(235, 94, 85, 0.35)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              SELL
            </button>
          </div>

          {/* 2. Product Segment Switcher (Motilal Oswal Style) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Product Type
              </label>
              <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 600 }}>
                {product === 'MIS' ? '5x Intraday Leverage' : product === 'CNC' ? 'Cash Delivery' : 'Carry Forward'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { id: 'CNC', label: 'CNC (Delivery)', desc: '100% Cash' },
                { id: 'MIS', label: 'MIS (Intraday)', desc: '5x Leverage' },
                { id: 'NRML', label: 'NRML (Carry)', desc: 'Standard' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProduct(p.id as ProductType)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: product === p.id ? 'var(--bg-sunken)' : 'var(--bg-surface)',
                    border: product === p.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    color: product === p.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: product === p.id ? 700 : 500 }}>{p.label}</span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Order Type & Price Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Order Type
              </label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as OrderType)}
                className="select"
                style={{ width: '100%', height: 34, fontSize: 12, fontWeight: 600 }}
              >
                <option value="MARKET">Market (Instant LTP)</option>
                <option value="LIMIT">Limit (Desired Price)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? quickOrder.price : limitPrice}
                onChange={e => setLimitPrice(Number(e.target.value))}
                className="input mono"
                style={{
                  width: '100%',
                  height: 34,
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: orderType === 'MARKET' ? 'var(--bg-sunken)' : 'var(--bg-surface)',
                  color: orderType === 'MARKET' ? 'var(--text-secondary)' : 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* 4. Stop Loss / Trigger Option Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
            <input
              type="checkbox"
              id="sl-toggle"
              checked={isSlOrder}
              onChange={e => setIsSlOrder(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="sl-toggle" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Set Stop Loss / Trigger Price (SL-Order)
            </label>
          </div>

          {isSlOrder && (
            <div style={{ backgroundColor: 'var(--bg-sunken)', padding: '8px 10px', borderRadius: 'var(--radius-md)' }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Trigger Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={triggerPrice}
                onChange={e => setTriggerPrice(Number(e.target.value))}
                className="input mono"
                style={{ width: '100%', height: 32, fontSize: 12, fontWeight: 600 }}
              />
            </div>
          )}

          {/* 5. Quantity Input & Quick Quantity Pills (Motilal Oswal) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Quantity
              </label>
              <span className="text-secondary" style={{ fontSize: 10.5 }}>
                Max Qty: <strong className="mono text-primary">{maxQtyPossible}</strong> shares
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {/* Stepper Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => handleAdjustQty(-1)}
                  style={{
                    width: 32,
                    height: 34,
                    background: 'none',
                    border: 'none',
                    borderRight: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="mono"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAdjustQty(1)}
                  style={{
                    width: 32,
                    height: 34,
                    background: 'none',
                    border: 'none',
                    borderLeft: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Quick Increment Pills */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[10, 50, 100].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleAdjustQty(inc)}
                    style={{
                      padding: '0 8px',
                      height: 34,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-sunken)',
                      border: '1px solid var(--border-default)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin Percentage Helpers (25%, 50%, 100%) */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[25, 50, 100].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentQty(pct)}
                  style={{
                    flex: 1,
                    padding: '3px 0',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-sunken)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  {pct}% Margin
                </button>
              ))}
            </div>
          </div>

          {/* 6. Collapsible Market Depth (L2 Bids / Asks) Peek */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
            <button
              type="button"
              onClick={() => setShowDepth(!showDepth)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--accent-primary)'
              }}
            >
              <Layers size={13} />
              <span>{showDepth ? 'Hide Live Market Depth (L2)' : 'Show Live Market Depth (L2)'}</span>
              {showDepth ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showDepth && (
              <div style={{ marginTop: 8 }}>
                <MarketDepth symbol={quickOrder.symbol} />
              </div>
            )}
          </div>

          {/* 7. Motilal Oswal Margin & Valuation Summary Banner */}
          <div style={{
            backgroundColor: 'var(--bg-sunken)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: 11.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Estimated Order Value:</span>
              <strong className="mono">₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">
                Margin Required {product === 'MIS' ? '(5x Leverage)' : ''}:
              </span>
              <strong className={`mono ${hasEnoughMargin ? 'text-primary' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                ₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 4 }}>
              <span className="text-secondary">Available Trading Margin:</span>
              <span className="mono text-positive" style={{ fontWeight: 600 }}>
                ₹{portfolio.availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)' }}>
              <span>Est. Brokerage & Taxes:</span>
              <span className="mono">₹{estBrokerage.toFixed(2)}</span>
            </div>
          </div>

          {!hasEnoughMargin && (
            <div style={{
              backgroundColor: 'rgba(235, 94, 85, 0.1)',
              border: '1px solid var(--negative-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              fontSize: 11,
              color: 'var(--negative)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <ShieldAlert size={14} />
              <span>Insufficient margin available. Reduce quantity or add funds.</span>
            </div>
          )}

          {/* 8. Action Footer */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={closeQuickOrder}
              className="btn btn-secondary"
              style={{ flex: 1, height: 38, fontSize: 12 }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!hasEnoughMargin}
              onClick={handlePlaceOrder}
              style={{
                flex: 2,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: side === 'BUY' ? '#00D09C' : '#EB5E55',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 800,
                border: 'none',
                cursor: hasEnoughMargin ? 'pointer' : 'not-allowed',
                opacity: hasEnoughMargin ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: side === 'BUY' ? '0 2px 10px rgba(0, 208, 156, 0.35)' : '0 2px 10px rgba(235, 94, 85, 0.35)'
              }}
            >
              <span>{side} {quantity} {quickOrder.symbol}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
