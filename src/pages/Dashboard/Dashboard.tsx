import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  Layers, 
  ChevronRight, 
  Link2 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

import { PageHeader } from '../../components/common/PageHeader';

export const Dashboard: React.FC = () => {
  const { 
    portfolio, 
    indices, 
    instruments, 
    setCurrentPage, 
    navigateToInstrument, 
    openQuickOrder,
    brokerState,
    openBrokerModal
  } = useTrading();

  // Top Gainers & Losers
  const gainers = [...instruments].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...instruments].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Page Title & Quick Actions */}
      <PageHeader
        title="Dashboard"
        subtitle="Portfolio overview, real-time index pulse & live NSE market depth"
        badge={{ text: "NSE LIVE", variant: "positive" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('market')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <TrendingUp size={14} />
              <span>Market Watch</span>
            </button>
            <button
              onClick={() => setCurrentPage('options')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Layers size={14} />
              <span>Option Chain</span>
            </button>
            <button
              onClick={() => navigateToInstrument('NIFTY 50')}
              className="btn btn-primary btn-sm"
              style={{ gap: 6 }}
            >
              <span>NIFTY 50 Overview</span>
            </button>
          </div>
        }
      />

      {brokerState !== 'Connected' && (
        <div
          style={{
            backgroundColor: 'rgba(31, 95, 191, 0.08)',
            border: '1px solid rgba(31, 95, 191, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(31, 95, 191, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              flexShrink: 0
            }}>
              <Link2 size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                Welcome to AuraTrade — Connect Upstox Pro
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Terminal is in <strong>Live Mode</strong> by default. Link your Upstox Demat account to sync live balances, or convert mode to <strong>Paper Trading Sandbox</strong> anytime from Settings.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => openBrokerModal()}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, gap: 6 }}
            >
              <Link2 size={13} />
              <span>Connect Upstox Pro</span>
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, gap: 4 }}
            >
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Summary Metric Blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)'
      }}>
        <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Portfolio Value
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            ₹{portfolio.portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Invested: ₹{(portfolio.portfolioValue - portfolio.overallPnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Today's P&L
          </div>
          <div className="mono text-positive" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={18} />
            +₹{portfolio.todayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mono text-positive" style={{ fontSize: 11, marginTop: 4 }}>
            +{portfolio.todayPnlPercent.toFixed(2)}% vs yesterday
          </div>
        </div>

        <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overall P&L
          </div>
          <div className="mono text-positive" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={18} />
            +₹{portfolio.overallPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mono text-positive" style={{ fontSize: 11, marginTop: 4 }}>
            +{portfolio.overallPnlPercent.toFixed(2)}% total return
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available Funds
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            ₹{portfolio.availableFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span className="mono text-muted" style={{ fontSize: 11 }}>Used Margin: ₹{portfolio.usedMargin.toLocaleString('en-IN')}</span>
            <span 
              onClick={() => setCurrentPage('funds')}
              style={{ fontSize: 11, color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 500 }}
            >
              Manage →
            </span>
          </div>
        </div>
      </div>

      {/* Major Indices Grid */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          Market Indices (Click to Open Interactive Chart & Depth)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
          {indices.map(idx => {
            const isPos = idx.change >= 0;
            return (
              <div 
                key={idx.symbol}
                className="surface-card"
                style={{ padding: '12px 14px', cursor: 'pointer', transition: 'all 140ms ease' }}
                onClick={() => navigateToInstrument(idx.symbol)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title={`Open interactive ${idx.symbol} view`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{idx.symbol}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{idx.name}</div>
                  </div>
                  <span className={`badge ${isPos ? 'badge-positive' : 'badge-negative'}`} style={{ fontSize: 10 }}>
                    {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                    {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 11 }}>
                    {isPos ? '+' : ''}{idx.change.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Movers & Option Snapshot (2-column layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Column: Top Gainers */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} className="text-positive" />
              <span>Top Gainers</span>
            </h2>
            <button 
              onClick={() => setCurrentPage('market')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--accent-primary)', fontSize: 11 }}
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Price (₹)</th>
                <th className="text-right">Change</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {gainers.map(inst => (
                <tr key={inst.symbol} style={{ cursor: 'pointer' }} onClick={() => navigateToInstrument(inst.symbol)}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{inst.symbol}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{inst.name.split(' ')[0]}</div>
                  </td>
                  <td className="text-right mono" style={{ fontWeight: 600 }}>
                    ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right mono text-positive" style={{ fontWeight: 600 }}>
                    +{inst.changePercent.toFixed(2)}%
                  </td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openQuickOrder({
                          symbol: inst.symbol,
                          name: inst.name,
                          side: 'BUY',
                          price: inst.price,
                          initialQty: 10
                        });
                      }}
                      className="btn btn-buy btn-sm"
                      style={{ height: 22, padding: '0 8px', fontSize: 10 }}
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Top Losers & Option Snapshot */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingDown size={15} className="text-negative" />
              <span>Top Losers & Sector Movers</span>
            </h2>
            <button 
              onClick={() => setCurrentPage('market')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--accent-primary)', fontSize: 11 }}
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Price (₹)</th>
                <th className="text-right">Change</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {losers.map(inst => (
                <tr key={inst.symbol} style={{ cursor: 'pointer' }} onClick={() => navigateToInstrument(inst.symbol)}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{inst.symbol}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{inst.name.split(' ')[0]}</div>
                  </td>
                  <td className="text-right mono" style={{ fontWeight: 600 }}>
                    ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right mono text-negative" style={{ fontWeight: 600 }}>
                    {inst.changePercent.toFixed(2)}%
                  </td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openQuickOrder({
                          symbol: inst.symbol,
                          name: inst.name,
                          side: 'SELL',
                          price: inst.price,
                          initialQty: 10
                        });
                      }}
                      className="btn btn-sell btn-sm"
                      style={{ height: 22, padding: '0 8px', fontSize: 10 }}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quick Option Snapshot */}
          <div style={{
            marginTop: 'var(--space-2)',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-sunken)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>NIFTY 25,400 CE (ATM)</div>
              <div className="mono text-secondary" style={{ fontSize: 11 }}>LTP: ₹132.80 (+57.5%) • OI: 58.2L</div>
            </div>
            <button
              onClick={() => setCurrentPage('options')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, gap: 4 }}
            >
              <span>View Chain</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
