import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  X, 
  ShieldAlert, 
  ArrowLeftRight, 
  AlertTriangle
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { Position, ProductType } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const PositionsPage: React.FC = () => {
  const { 
    positions, 
    exitPosition, 
    convertPositionProduct, 
    navigateToInstrument, 
    openQuickOrder, 
    setCurrentPage, 
    addToast,
    portfolio
  } = useTrading();

  const [positionView, setPositionView] = useState<'DAY' | 'NET'>('NET');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showSquareOffAllModal, setShowSquareOffAllModal] = useState(false);
  const [convertingPosition, setConvertingPosition] = useState<Position | null>(null);
  const [targetProduct, setTargetProduct] = useState<ProductType>('CNC');

  const totalPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalDayPnl = positions.reduce((acc, p) => acc + p.dayPnl, 0);
  const realizedPnl = 4120.00; // Simulated realized PnL from earlier day trades
  const unrealizedPnl = totalPnl;
  const isTotalPos = totalPnl >= 0;

  const filteredPositions = positions.filter(p => {
    if (statusFilter === 'OPEN' && p.quantity === 0) return false;
    if (statusFilter === 'CLOSED' && p.quantity > 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.symbol.toLowerCase().includes(q) && !p.name.toLowerCase().includes(q) && !p.product.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleSquareOffAll = () => {
    positions.forEach(p => {
      if (p.quantity > 0) {
        exitPosition(p.id);
      }
    });
    setShowSquareOffAllModal(false);
    addToast({
      type: 'warning',
      title: 'Square Off Executed',
      message: 'All open positions have been closed at market execution prices.'
    });
  };

  const handleOpenConvert = (pos: Position) => {
    setConvertingPosition(pos);
    setTargetProduct(pos.product === 'MIS' ? 'CNC' : 'MIS');
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (convertingPosition) {
      convertPositionProduct(convertingPosition.id, targetProduct);
      setConvertingPosition(null);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Positions & Mark-to-Market"
        subtitle="Motilal Oswal style Day & Net positions book, real-time MTM valuation & position conversion"
        badge={{ text: `${positions.filter(p => p.quantity > 0).length} Open Positions`, variant: 'accent' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowSquareOffAllModal(true)}
              disabled={positions.filter(p => p.quantity > 0).length === 0}
              className="btn btn-ghost btn-sm text-negative"
              style={{ gap: 6, border: '1px solid var(--negative-border)', fontWeight: 600 }}
            >
              <ShieldAlert size={14} />
              <span>Square Off All</span>
            </button>
            <button
              onClick={() => setCurrentPage('market')}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>New Position</span>
            </button>
          </div>
        }
      />

      {/* Motilal Oswal MTM Dashboard Header Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        borderLeft: `4px solid ${isTotalPos ? 'var(--positive)' : 'var(--negative)'}`
      }}>
        {/* Total MTM */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Net MTM Gain/Loss
          </div>
          <div className={`mono ${isTotalPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 20, fontWeight: 800, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isTotalPos ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span>{isTotalPos ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Overall mark-to-market performance
          </div>
        </div>

        {/* Day's P&L */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Day's MTM P&L
          </div>
          <div className={`mono ${totalDayPnl >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
            {totalDayPnl >= 0 ? '+' : ''}₹{totalDayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Today's change vs Prev Close
          </div>
        </div>

        {/* Realized & Unrealized Split */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Realized / Unrealized Split
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 13 }}>
            <span className="mono text-positive" style={{ fontWeight: 700 }}>+₹{realizedPnl.toFixed(2)} (R)</span>
            <span className="mono" style={{ color: unrealizedPnl >= 0 ? 'var(--positive)' : 'var(--negative)', fontWeight: 700 }}>
              {unrealizedPnl >= 0 ? '+' : ''}₹{unrealizedPnl.toFixed(2)} (UR)
            </span>
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Booked profits vs open exposure
          </div>
        </div>

        {/* Margin Deployed */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Margin Deployed (Exposure)
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>
            ₹{portfolio.usedMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Available Margin: ₹{portfolio.availableMargin.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filter and View Switcher Bar (MO Style) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Left: Position View Switcher (Day vs Net) */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', padding: 2, border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setPositionView('NET')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                fontWeight: positionView === 'NET' ? 700 : 500,
                backgroundColor: positionView === 'NET' ? 'var(--text-primary)' : 'transparent',
                color: positionView === 'NET' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Net Positions
            </button>
            <button
              onClick={() => setPositionView('DAY')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                fontWeight: positionView === 'DAY' ? 700 : 500,
                backgroundColor: positionView === 'DAY' ? 'var(--text-primary)' : 'transparent',
                color: positionView === 'DAY' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Day Positions
            </button>
          </div>

          <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {(['OPEN', 'CLOSED', 'ALL'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontWeight: statusFilter === st ? 600 : 400,
                  backgroundColor: statusFilter === st ? 'var(--bg-sunken)' : 'transparent',
                  color: statusFilter === st ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: statusFilter === st ? '1px solid var(--border-default)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {st === 'OPEN' ? 'Open' : st === 'CLOSED' ? 'Closed' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
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
            placeholder="Search position scrip..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 11,
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              width: 170
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Motilal Oswal Positions Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Instrument / Scrip</th>
              <th>Product</th>
              <th className="text-right">Net Qty</th>
              <th className="text-right">Avg. Cost (₹)</th>
              <th className="text-right">LTP (₹)</th>
              <th className="text-right">Day P&L (₹)</th>
              <th className="text-right">Total P&L (₹)</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPositions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No open positions</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {searchQuery ? `No positions match "${searchQuery}"` : 'Use the Market Explorer or Strategy Scanner to initiate orders.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredPositions.map(pos => {
                const isPosPnl = pos.pnl >= 0;
                const isDayPnlPos = pos.dayPnl >= 0;

                return (
                  <tr key={pos.id}>
                    {/* Scrip */}
                    <td>
                      <div 
                        onClick={() => navigateToInstrument(pos.symbol)}
                        style={{ fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'var(--accent-primary)' }}
                      >
                        {pos.symbol}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{pos.name}</div>
                    </td>

                    {/* Product */}
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>
                        {pos.product === 'CNC' ? 'CNC (Delivery)' : pos.product === 'MIS' ? 'MIS (Intraday)' : 'NRML'}
                      </span>
                    </td>

                    {/* Net Qty */}
                    <td className="text-right mono" style={{ fontWeight: 700, color: pos.quantity > 0 ? 'var(--positive)' : 'var(--text-secondary)' }}>
                      {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                    </td>

                    {/* Avg Cost */}
                    <td className="text-right mono">
                      ₹{pos.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* LTP */}
                    <td className="text-right mono" style={{ fontWeight: 700 }}>
                      ₹{pos.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Day P&L */}
                    <td className={`text-right mono ${isDayPnlPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 600 }}>
                      {isDayPnlPos ? '+' : ''}₹{pos.dayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Total P&L */}
                    <td className={`text-right mono ${isPosPnl ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 800 }}>
                      <div>{isPosPnl ? '+' : ''}₹{pos.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: 10 }}>({isPosPnl ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)</div>
                    </td>

                    {/* Actions */}
                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenConvert(pos)}
                          className="btn btn-secondary btn-sm"
                          style={{ height: 24, padding: '0 6px', fontSize: 10.5, gap: 3 }}
                          title="Convert Product (MIS ↔ CNC)"
                        >
                          <ArrowLeftRight size={11} />
                          <span>Convert</span>
                        </button>

                        <button
                          onClick={() => openQuickOrder({
                            symbol: pos.symbol,
                            name: pos.name,
                            side: 'BUY',
                            price: pos.ltp,
                            initialQty: pos.quantity
                          })}
                          className="btn btn-secondary btn-sm"
                          style={{ height: 24, padding: '0 6px', fontSize: 10.5 }}
                          title="Add Quantity"
                        >
                          <Plus size={11} />
                        </button>

                        <button
                          onClick={() => exitPosition(pos.id)}
                          className="btn btn-ghost btn-sm text-negative"
                          style={{ height: 24, padding: '0 8px', fontSize: 10.5, border: '1px solid var(--negative-border)', fontWeight: 600 }}
                          title="Square off position"
                        >
                          Square Off
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

      {/* Motilal Oswal Product Conversion Modal */}
      {convertingPosition && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 14, 20, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 115,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Convert Position Product</h3>
                <div className="mono text-secondary" style={{ fontSize: 11 }}>
                  {convertingPosition.symbol} ({convertingPosition.quantity} shares)
                </div>
              </div>
              <button
                onClick={() => setConvertingPosition(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmConvert} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Current Product: <strong className="text-primary">{convertingPosition.product}</strong>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  CONVERT TO PRODUCT
                </label>
                <select
                  value={targetProduct}
                  onChange={e => setTargetProduct(e.target.value as ProductType)}
                  className="select"
                  style={{ width: '100%', height: 34, fontSize: 12 }}
                >
                  <option value="CNC">CNC (Cash Delivery - Hold Overnight)</option>
                  <option value="MIS">MIS (Intraday - Square off by 15:20)</option>
                  <option value="NRML">NRML (Derivatives Normal)</option>
                </select>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 11,
                color: 'var(--text-secondary)'
              }}>
                Converting from Intraday to Delivery requires sufficient free cash margin in your Demat account (₹{(convertingPosition.avgPrice * convertingPosition.quantity).toLocaleString('en-IN')}).
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setConvertingPosition(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.2, fontWeight: 700 }}
                >
                  Confirm Conversion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Square Off All Confirmation Modal */}
      {showSquareOffAllModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 14, 20, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--negative)' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Emergency Square Off All</h3>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Are you sure you want to market square off all <strong>{positions.filter(p => p.quantity > 0).length} open positions</strong>? This will submit immediate sell/buy market orders to the exchange.
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setShowSquareOffAllModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSquareOffAll}
                className="btn btn-sell"
                style={{ flex: 1.2, fontWeight: 700 }}
              >
                Yes, Square Off All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
