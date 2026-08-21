import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Compass
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';

export const PositionsPage: React.FC = () => {
  const { positions, exitPosition, navigateToInstrument, openQuickOrder, setCurrentPage } = useTrading();
  const [searchQuery, setSearchQuery] = useState('');

  const totalPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalDayPnl = positions.reduce((acc, p) => acc + p.dayPnl, 0);
  const isTotalPos = totalPnl >= 0;

  const filteredPositions = positions.filter(p => 
    searchQuery === '' ||
    p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header & Total PnL Bar */}
      <PageHeader
        title="Open Positions"
        subtitle="Live mark-to-market valuations, Day P&L & position management"
        badge={{ text: `${positions.length} Active`, variant: 'accent' }}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search position symbol...',
          count: filteredPositions.length,
          total: positions.length
        }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('market')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Compass size={13} />
              <span>Explore Markets</span>
            </button>
            <button
              onClick={() => openQuickOrder({
                symbol: 'NIFTY 50',
                name: 'NIFTY 50 Index',
                side: 'BUY',
                price: 25420,
                initialQty: 50
              })}
              className="btn btn-primary btn-sm"
              style={{ gap: 6 }}
            >
              <Plus size={13} />
              <span>New Order</span>
            </button>
          </div>
        }
      >
        {/* Real-time MTM Summary Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          width: 'fit-content'
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Open P&L (MTM)
            </div>
            <div className={`mono ${isTotalPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {isTotalPos ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isTotalPos ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Day's P&L
            </div>
            <div className={`mono ${totalDayPnl >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 16, fontWeight: 700 }}>
              {totalDayPnl >= 0 ? '+' : ''}₹{totalDayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Positions Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Product</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Avg. Price (₹)</th>
              <th className="text-right">LTP (₹)</th>
              <th className="text-right">Day P&L (₹)</th>
              <th className="text-right">Total P&L (₹)</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPositions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {searchQuery ? `No open positions matching "${searchQuery}"` : 'No open positions'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {searchQuery ? 'Try searching for a different symbol or product type.' : 'Use the Strategy Scanner or Market Explorer to initiate simulated trades.'}
                  </div>
                  {!searchQuery && (
                    <button
                      onClick={() => setCurrentPage('market')}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 12 }}
                    >
                      Explore Markets
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredPositions.map(pos => {
                const isPosPnl = pos.pnl >= 0;
                const isDayPnlPos = pos.dayPnl >= 0;

                return (
                  <tr key={pos.id}>
                    <td>
                      <div 
                        onClick={() => navigateToInstrument(pos.symbol)}
                        style={{ fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: 'var(--accent-primary)' }}
                      >
                        {pos.symbol}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{pos.name}</div>
                    </td>

                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 9 }}>
                        {pos.product}
                      </span>
                    </td>

                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      {pos.quantity}
                    </td>

                    <td className="text-right mono">
                      ₹{pos.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      ₹{pos.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className={`text-right mono ${isDayPnlPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 500 }}>
                      {isDayPnlPos ? '+' : ''}₹{pos.dayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className={`text-right mono ${isPosPnl ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                      <div>{isPosPnl ? '+' : ''}₹{pos.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: 10 }}>({isPosPnl ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)</div>
                    </td>

                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openQuickOrder({
                            symbol: pos.symbol,
                            name: pos.name,
                            side: 'BUY',
                            price: pos.ltp,
                            initialQty: pos.quantity
                          })}
                          className="btn btn-secondary btn-sm"
                          style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                          title="Add Quantity"
                        >
                          <Plus size={11} />
                        </button>
                        <button
                          onClick={() => exitPosition(pos.id)}
                          className="btn btn-ghost btn-sm text-negative"
                          style={{ height: 22, padding: '0 8px', fontSize: 10, border: '1px solid var(--negative-border)' }}
                          title="Square off position"
                        >
                          Exit
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
  );
};
