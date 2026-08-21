import React, { useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';

export const HoldingsPage: React.FC = () => {
  const { holdings, navigateToInstrument, openQuickOrder, setCurrentPage } = useTrading();
  const [searchQuery, setSearchQuery] = useState('');

  const totalInvested = holdings.reduce((acc, h) => acc + h.investedValue, 0);
  const totalCurrent = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const totalTodayReturn = holdings.reduce((acc, h) => acc + h.todayReturn, 0);

  const filteredHoldings = holdings.filter(h =>
    searchQuery === '' ||
    h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Long-Term Holdings"
        subtitle="Delivery (CNC) equity portfolio, unrealized capital gains & stock allocations"
        badge={{ text: `${holdings.length} Holdings`, variant: 'accent' }}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search holding symbol...',
          count: filteredHoldings.length,
          total: holdings.length
        }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('funds')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <ArrowUpRight size={13} />
              <span>Add Funds</span>
            </button>
            <button
              onClick={() => setCurrentPage('market')}
              className="btn btn-primary btn-sm"
              style={{ gap: 6 }}
            >
              <Plus size={13} />
              <span>Buy Stocks</span>
            </button>
          </div>
        }
      />

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
          <div className={`mono ${totalReturn >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 18, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            {totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {totalReturn >= 0 ? '+' : ''}₹{totalReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalReturnPct.toFixed(2)}%)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Today's Return
          </div>
          <div className={`mono ${totalTodayReturn >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {totalTodayReturn >= 0 ? '+' : ''}₹{totalTodayReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
            {filteredHoldings.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {searchQuery ? `No holdings matching "${searchQuery}"` : 'No portfolio holdings found'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredHoldings.map(h => {
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
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
