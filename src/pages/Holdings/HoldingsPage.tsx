import React from 'react';
import { 
  TrendingUp 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const HoldingsPage: React.FC = () => {
  const { holdings, navigateToInstrument, openQuickOrder } = useTrading();

  const totalInvested = holdings.reduce((acc, h) => acc + h.investedValue, 0);
  const totalCurrent = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = (totalReturn / totalInvested) * 100;
  const totalTodayReturn = holdings.reduce((acc, h) => acc + h.todayReturn, 0);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Long-Term Holdings</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Delivery (CNC) equity portfolio, unrealized capital gains & stock allocations
          </p>
        </div>
      </div>

      {/* Portfolio Value Summary Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)'
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Invested
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Current Value
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            ₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Return
          </div>
          <div className="mono text-positive" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={16} />
            +₹{totalReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalReturnPct.toFixed(2)}%)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Today's Return
          </div>
          <div className="mono text-positive" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            +₹{totalTodayReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Avg. Cost (₹)</th>
              <th className="text-right">LTP (₹)</th>
              <th className="text-right">Invested Value (₹)</th>
              <th className="text-right">Current Value (₹)</th>
              <th className="text-right">Today's Return</th>
              <th className="text-right">Total Return</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map(h => {
              const isTotalPos = h.totalReturn >= 0;
              const isTodayPos = h.todayReturn >= 0;

              return (
                <tr key={h.id}>
                  <td>
                    <div 
                      onClick={() => navigateToInstrument(h.symbol)}
                      style={{ fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: 'var(--accent-primary)' }}
                    >
                      {h.symbol}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{h.name}</div>
                  </td>

                  <td className="text-right mono" style={{ fontWeight: 600 }}>
                    {h.quantity}
                  </td>

                  <td className="text-right mono">
                    ₹{h.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="text-right mono" style={{ fontWeight: 600 }}>
                    ₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="text-right mono">
                    ₹{h.investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="text-right mono" style={{ fontWeight: 600 }}>
                    ₹{h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className={`text-right mono ${isTodayPos ? 'text-positive' : 'text-negative'}`}>
                    <div>{isTodayPos ? '+' : ''}₹{h.todayReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 10 }}>({isTodayPos ? '+' : ''}{h.todayReturnPercent.toFixed(2)}%)</div>
                  </td>

                  <td className={`text-right mono ${isTotalPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                    <div>{isTotalPos ? '+' : ''}₹{h.totalReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 10 }}>({isTotalPos ? '+' : ''}{h.totalReturnPercent.toFixed(2)}%)</div>
                  </td>

                  <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openQuickOrder({
                          symbol: h.symbol,
                          name: h.name,
                          side: 'BUY',
                          price: h.currentPrice,
                          initialQty: 10
                        })}
                        className="btn btn-buy btn-sm"
                        style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => openQuickOrder({
                          symbol: h.symbol,
                          name: h.name,
                          side: 'SELL',
                          price: h.currentPrice,
                          initialQty: h.quantity
                        })}
                        className="btn btn-sell btn-sm"
                        style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
