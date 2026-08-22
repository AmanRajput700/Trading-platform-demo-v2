import React from 'react';
import { 
  TrendingUp, 
  Play, 
  SlidersHorizontal, 
  ArrowUpRight, 
  PlusCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

import { PageHeader } from '../../components/common/PageHeader';

export const Dashboard: React.FC = () => {
  const { 
    portfolio, 
    indices, 
    instruments, 
    strategies, 
    setCurrentPage, 
    navigateToInstrument, 
    openQuickOrder, 
    runStrategy, 
    setCurrentStrategyId,
    canCreateStrategy
  } = useTrading();

  // Top Gainers
  const gainers = [...instruments].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);

  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Page Title & Quick Actions */}
      <PageHeader
        title="Dashboard"
        subtitle="Simulated portfolio overview, live NSE market pulse & active strategies"
        badge={{ text: "NSE LIVE", variant: "positive" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('options')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Layers size={14} />
              <span>Option Chain</span>
            </button>
            {canCreateStrategy && (
              <button
                onClick={() => {
                  setCurrentStrategyId(null);
                  setCurrentPage('strategy-builder');
                }}
                className="btn btn-primary btn-sm"
                style={{ gap: 6 }}
              >
                <PlusCircle size={14} />
                <span>New Strategy</span>
              </button>
            )}
            {!canCreateStrategy && (
              <button
                onClick={() => setCurrentPage('strategies')}
                className="btn btn-primary btn-sm"
                style={{ gap: 6 }}
              >
                <span>View Strategies</span>
              </button>
            )}
          </div>
        }
      />

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
          Market Indices
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
          {indices.map(idx => {
            const isPos = idx.change >= 0;
            return (
              <div 
                key={idx.symbol}
                className="surface-card"
                style={{ padding: '12px 14px', cursor: 'pointer', transition: 'border-color 120ms ease' }}
                onClick={() => setCurrentPage('market')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{idx.symbol}</div>
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

      {/* Strategies Overview & Market Tables (2-column layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Column: My Strategies */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>My Strategies</h2>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                Automated condition monitors & scanning triggers
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('strategies')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--accent-primary)', fontSize: 11 }}
            >
              <span>View All ({strategies.length})</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {strategies.map(strat => (
              <div
                key={strat.id}
                style={{
                  backgroundColor: 'var(--bg-sunken)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{strat.name}</span>
                    <span className={`badge ${strat.status === 'ACTIVE' ? 'badge-positive' : 'badge-neutral'}`} style={{ fontSize: 9 }}>
                      {strat.status}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 9 }}>
                      {strat.timeframe}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} />
                      <span>Last run: {strat.lastRun}</span>
                    </span>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: strat.matchCount > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      {strat.matchCount} Matches Found
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {canCreateStrategy && (
                    <button
                      onClick={() => {
                        setCurrentStrategyId(strat.id);
                        setCurrentPage('strategy-builder');
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Edit Strategy"
                      style={{ padding: '0 8px' }}
                    >
                      <SlidersHorizontal size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => runStrategy(strat)}
                    className="btn btn-primary btn-sm"
                    title="Run Scan"
                    style={{ padding: '0 10px', gap: 4 }}
                  >
                    <Play size={12} />
                    <span>Run</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: 'var(--accent-light)',
            border: '1px solid rgba(31, 95, 191, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11
          }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
              Looking for momentum breakouts? Scan 2,146 NSE instruments now.
            </span>
            <button
              onClick={() => runStrategy(strategies[0])}
              className="btn btn-primary btn-sm"
              style={{ height: 24, fontSize: 11 }}
            >
              Scan Momentum
            </button>
          </div>
        </div>

        {/* Right Column: Top Gainers */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Top Gainers & Movers</h2>
            <button 
              onClick={() => setCurrentPage('market')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--accent-primary)', fontSize: 11 }}
            >
              <span>Market Page</span>
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
