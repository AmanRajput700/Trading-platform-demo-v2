import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  Search, 
  X, 
  Coins
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { Holding } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const HoldingsPage: React.FC = () => {
  const { 
    holdings, 
    navigateToInstrument, 
    openQuickOrder, 
    setCurrentPage, 
    pledgeHolding
  } = useTrading();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PROFIT' | 'LOSS' | 'LARGE_CAP' | 'MID_CAP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pledge Modal State
  const [pledgingHolding, setPledgingHolding] = useState<Holding | null>(null);
  const [pledgeQty, setPledgeQty] = useState<number>(0);

  const totalInvested = holdings.reduce((acc, h) => acc + h.investedValue, 0);
  const totalCurrent = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const totalTodayReturn = holdings.reduce((acc, h) => acc + h.todayReturn, 0);
  const isOverallPos = totalReturn >= 0;

  // Margin collateral valuation (average 70% haircut value)
  const collateralValue = +(totalCurrent * 0.70).toFixed(2);

  const filteredHoldings = holdings.filter(h => {
    if (categoryFilter === 'PROFIT' && h.totalReturn <= 0) return false;
    if (categoryFilter === 'LOSS' && h.totalReturn > 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!h.symbol.toLowerCase().includes(q) && !h.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenPledge = (holding: Holding) => {
    setPledgingHolding(holding);
    setPledgeQty(Math.floor(holding.quantity / 2) || holding.quantity);
  };

  const handleConfirmPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (pledgingHolding) {
      pledgeHolding(pledgingHolding.id, pledgeQty);
      setPledgingHolding(null);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Demat Holdings & Portfolio"
        subtitle="Motilal Oswal Wealth portfolio view, unrealized capital gains, sector allocation & margin pledge"
        badge={{ text: `${holdings.length} Scrips in Demat`, variant: 'accent' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('funds')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <ArrowUpRight size={14} />
              <span>Add Funds</span>
            </button>
            <button
              onClick={() => setCurrentPage('market')}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>Buy Stocks (CNC)</span>
            </button>
          </div>
        }
      />

      {/* Motilal Oswal Wealth Portfolio Dashboard Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        borderLeft: `4px solid ${isOverallPos ? 'var(--positive)' : 'var(--negative)'}`
      }}>
        {/* Current Portfolio Value */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Current Demat Valuation
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>
            ₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Total Invested: ₹{totalInvested.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Overall Returns */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Overall Total Returns
          </div>
          <div className={`mono ${isOverallPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 20, fontWeight: 800, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOverallPos ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span>{isOverallPos ? '+' : ''}₹{totalReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className={`mono ${isOverallPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>
            ({isOverallPos ? '+' : ''}{totalReturnPct.toFixed(2)}% ROI)
          </div>
        </div>

        {/* Today's Change */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Today's Demat Change
          </div>
          <div className={`mono ${totalTodayReturn >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
            {totalTodayReturn >= 0 ? '+' : ''}₹{totalTodayReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            1-Day price movement vs yesterday
          </div>
        </div>

        {/* Margin Against Holdings */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Margin Against Demat (Collateral)
          </div>
          <div className="mono text-positive" style={{ fontSize: 20, fontWeight: 700, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Coins size={18} />
            <span>₹{collateralValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Instant pledging limit (30% haircut applied)
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar (MO Style) */}
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
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {([
            { id: 'ALL', label: `All Holdings (${holdings.length})` },
            { id: 'PROFIT', label: `In Profit (${holdings.filter(h => h.totalReturn > 0).length})` },
            { id: 'LOSS', label: `In Loss (${holdings.filter(h => h.totalReturn <= 0).length})` },
            { id: 'LARGE_CAP', label: 'Large Cap' },
            { id: 'MID_CAP', label: 'Mid Cap' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                fontWeight: categoryFilter === tab.id ? 700 : 500,
                backgroundColor: categoryFilter === tab.id ? 'var(--text-primary)' : 'transparent',
                color: categoryFilter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
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
            placeholder="Search holding scrip..."
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

      {/* Motilal Oswal Holdings Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Instrument / Company</th>
              <th className="text-right">Qty (Demat Breakdown)</th>
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
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No portfolio holdings found</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {searchQuery ? `No holdings matching "${searchQuery}"` : 'Buy equity shares in CNC delivery mode to build your portfolio.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredHoldings.map(h => {
                const isTotalPos = h.totalReturn >= 0;
                const isTodayPos = h.todayReturn >= 0;

                return (
                  <tr key={h.id}>
                    {/* Scrip */}
                    <td>
                      <div 
                        onClick={() => navigateToInstrument(h.symbol)}
                        style={{ fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'var(--accent-primary)' }}
                      >
                        {h.symbol}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{h.name}</div>
                    </td>

                    {/* Qty & Demat breakdown */}
                    <td className="text-right">
                      <div className="mono" style={{ fontWeight: 700 }}>{h.quantity} shares</div>
                      <div className="mono text-muted" style={{ fontSize: 9.5 }}>
                        Free: {Math.floor(h.quantity * 0.8)} · T1: {Math.ceil(h.quantity * 0.2)}
                      </div>
                    </td>

                    {/* Avg Cost */}
                    <td className="text-right mono">
                      ₹{h.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* LTP */}
                    <td className="text-right mono" style={{ fontWeight: 700 }}>
                      ₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Invested Value */}
                    <td className="text-right mono">
                      ₹{h.investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Current Value */}
                    <td className="text-right mono" style={{ fontWeight: 700 }}>
                      ₹{h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Today's Return */}
                    <td className={`text-right mono ${isTodayPos ? 'text-positive' : 'text-negative'}`}>
                      <div style={{ fontWeight: 600 }}>{isTodayPos ? '+' : ''}₹{h.todayReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: 10 }}>({isTodayPos ? '+' : ''}{h.todayReturnPercent.toFixed(2)}%)</div>
                    </td>

                    {/* Total Return */}
                    <td className={`text-right mono ${isTotalPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 800 }}>
                      <div>{isTotalPos ? '+' : ''}₹{h.totalReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: 10 }}>({isTotalPos ? '+' : ''}{h.totalReturnPercent.toFixed(2)}%)</div>
                    </td>

                    {/* Actions */}
                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenPledge(h)}
                          className="btn btn-secondary btn-sm"
                          style={{ height: 24, padding: '0 6px', fontSize: 10.5, gap: 3 }}
                          title="Pledge shares to unlock trading margin"
                        >
                          <Coins size={11} />
                          <span>Pledge</span>
                        </button>

                        <button
                          onClick={() => openQuickOrder({
                            symbol: h.symbol,
                            name: h.name,
                            side: 'BUY',
                            price: h.currentPrice,
                            initialQty: 10
                          })}
                          className="btn btn-buy btn-sm"
                          style={{ height: 24, padding: '0 6px', fontSize: 10.5 }}
                          title="Buy more shares"
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
                          style={{ height: 24, padding: '0 6px', fontSize: 10.5 }}
                          title="Sell holdings (CNC delivery)"
                        >
                          Sell
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

      {/* Motilal Oswal Margin Pledge Modal */}
      {pledgingHolding && (
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
            maxWidth: 440,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Coins size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Pledge Demat Shares for Margin</h3>
              </div>
              <button
                onClick={() => setPledgingHolding(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmPledge} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Holding: <strong>{pledgingHolding.symbol}</strong> ({pledgingHolding.quantity} shares available in Demat)
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                  QUANTITY TO PLEDGE
                </label>
                <input
                  type="number"
                  min="1"
                  max={pledgingHolding.quantity}
                  required
                  value={pledgeQty}
                  onChange={e => setPledgeQty(Number(e.target.value))}
                  className="input mono"
                  style={{ width: '100%', height: 34 }}
                />
              </div>

              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Collateral Value:</span>
                  <strong className="mono text-positive">₹{(pledgeQty * pledgingHolding.currentPrice * 0.70).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Exchange Haircut:</span>
                  <span className="mono">30.0%</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setPledgingHolding(null)}
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
                  Confirm Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
