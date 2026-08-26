import React, { useState, useEffect } from 'react';
import {
  Flame,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  Zap,
  CheckCircle2,
  X,
} from 'lucide-react';
import { circuitService } from '../../services/circuitService';
import { CircuitLimitItem, CircuitSignalData } from '../../types/circuit';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';

export const CircuitWatchDashboard: React.FC = () => {
  const { setSelectedSymbol, openQuickOrder, setCurrentPage, isMarketOpen } = useTrading();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL' | 'UNIVERSE'>('UNIVERSE');
  const [activeSignals, setActiveSignals] = useState<CircuitSignalData[]>([]);
  const [allSignals, setAllSignals] = useState<CircuitSignalData[]>([]);
  const [universeLimits, setUniverseLimits] = useState<CircuitLimitItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [universePage, setUniversePage] = useState<number>(1);
  const pageSize = 20;

  const loadData = async () => {
    try {
      const [act, all, lims] = await Promise.all([
        circuitService.getActiveSignals(),
        circuitService.getAllSignals(),
        circuitService.getCircuitLimits(10.0, 'EQ'),
      ]);
      setActiveSignals(act);
      setAllSignals(all);
      setUniverseLimits(lims);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSweep = async () => {
    setIsSweeping(true);
    try {
      await circuitService.triggerUniverseSweep();
      await loadData();
    } catch {
      // ignore
    } finally {
      setIsSweeping(false);
    }
  };

  const handleAction = async (signalId: number, action: 'acted_on' | 'skipped') => {
    await circuitService.updateSignalAction(signalId, action);
    await loadData();
  };

  const handleBuy = (s: CircuitSignalData) => {
    openQuickOrder({
      symbol: s.symbol,
      name: `${s.symbol} (NSE EQ)`,
      side: 'BUY',
      price: s.live_price,
      initialQty: 50,
    });
  };

  const navigateToChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentPage('instrument');
  };

  const filteredSignals = (activeTab === 'ACTIVE' ? activeSignals : allSignals).filter((s) =>
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUniverse = universeLimits.filter((l) =>
    l.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUniversePages = Math.ceil(filteredUniverse.length / pageSize) || 1;
  const paginatedUniverse = filteredUniverse.slice(
    (universePage - 1) * pageSize,
    universePage * pageSize
  );

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="S0 Circuit Momentum Scanner"
        subtitle="Intraday Event-Driven Momentum • 10% Price Band NSE EQ Universe • 6 Hard Pre-Filter Gates"
        badge={{
          text: isMarketOpen ? "NSE LIVE FEED" : "MARKET CLOSED",
          variant: isMarketOpen ? "positive" : "neutral"
        }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setCurrentPage('market')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <TrendingUp size={13} />
              <span>Market Watch</span>
            </button>
            <button
              type="button"
              onClick={handleManualSweep}
              disabled={isSweeping}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 600 }}
            >
              <RefreshCw size={13} style={{ animation: isSweeping ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSweeping ? 'Sweeping Universe...' : 'Run Engine 2 Sweep'}</span>
            </button>
          </div>
        }
      />

      {/* KPI Metric Summary Blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Active S0 Alerts</span>
            <Flame size={14} style={{ color: '#F59E0B' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: activeSignals.length > 0 ? '#F59E0B' : 'var(--text-primary)', marginTop: 4 }}>
            {activeSignals.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Awaiting manual user approval
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--positive)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Acted On Today</span>
            <CheckCircle2 size={14} style={{ color: 'var(--positive)' }} />
          </div>
          <div className="mono text-positive" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {allSignals.filter((s) => s.status === 'acted_on').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Executed trades in session
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>10% EQ Universe</span>
            <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {universeLimits.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            NSE EQ Scrips with 80% triggers
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Execution Policy</span>
            <ShieldCheck size={14} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
            100% Semi-Automated
          </div>
          <div style={{ fontSize: 11, color: '#10B981', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Zero auto-order risk • User approval</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Segmented Tabs & Instant Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: 'var(--bg-surface)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)'
      }}>
        {/* Segmented Tab Buttons */}
        <div style={{ display: 'flex', gap: 6, backgroundColor: 'var(--bg-sunken)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('ACTIVE'); setUniversePage(1); }}
            className={`btn btn-sm ${activeTab === 'ACTIVE' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: activeTab === 'ACTIVE' ? 700 : 500 }}
          >
            <span>Active Signals</span>
            <span className={`badge ${activeTab === 'ACTIVE' ? 'badge-neutral' : ''}`} style={{ fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>
              {activeSignals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('ALL'); setUniversePage(1); }}
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: activeTab === 'ALL' ? 700 : 500 }}
          >
            <span>Today's Signals</span>
            <span className={`badge ${activeTab === 'ALL' ? 'badge-neutral' : ''}`} style={{ fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>
              {allSignals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('UNIVERSE'); setUniversePage(1); }}
            className={`btn btn-sm ${activeTab === 'UNIVERSE' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: activeTab === 'UNIVERSE' ? 700 : 500 }}
          >
            <span>10% Band Universe</span>
            <span className={`badge ${activeTab === 'UNIVERSE' ? 'badge-neutral' : ''}`} style={{ fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>
              {universeLimits.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setUniversePage(1); }}
            placeholder="Search stock symbol..."
            style={{ width: '100%', paddingLeft: 30, paddingRight: searchQuery ? 28 : 10, height: 32, fontSize: 12 }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        {activeTab !== 'UNIVERSE' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SYMBOL</th>
                  <th className="text-right">PREV CLOSE (₹)</th>
                  <th className="text-right">LIVE PRICE (₹)</th>
                  <th className="text-right">CHANGE (%)</th>
                  <th style={{ minWidth: 160 }}>CIRCUIT PROGRESS</th>
                  <th>QUALITY SCORE</th>
                  <th className="text-right">R:R RATIO</th>
                  <th className="text-right">TRIGGER / SL / TARGET</th>
                  <th>STATUS</th>
                  <th className="text-right" style={{ paddingRight: 14 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)', fontSize: 12.5 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <Flame size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
                        <div style={{ fontWeight: 600 }}>No circuit momentum signals detected currently.</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Signals trigger automatically when a 10% band stock crosses 80% circuit progress with institutional volume and passes all 6 gates.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSignals.map((s) => {
                    const isHigh = s.status_label === 'HIGH_CONFIDENCE';
                    const isLock = s.status_label === 'CIRCUIT_LOCK_WARNING';
                    const isPos = s.change_pct >= 0;
                    return (
                      <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigateToChart(s.symbol)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>{s.symbol}</span>
                            <span className="badge badge-accent" style={{ fontSize: 9, padding: '0 4px' }}>10% BAND</span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.exchange} • Equity</div>
                        </td>

                        <td className="text-right mono" style={{ color: 'var(--text-secondary)' }}>
                          ₹{s.previous_close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="text-right mono" style={{ fontWeight: 700, fontSize: 13 }}>
                          ₹{s.live_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                          {isPos ? '+' : ''}{s.change_pct.toFixed(2)}%
                        </td>

                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, color: isLock ? '#EF4444' : '#F59E0B' }}>
                              {s.circuit_progress_pct.toFixed(1)}%
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>of Band</span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: 'var(--bg-sunken)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.max(0, s.circuit_progress_pct))}%`,
                              height: '100%',
                              backgroundColor: isLock ? '#EF4444' : '#F59E0B',
                              transition: 'width 250ms ease',
                            }} />
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${isHigh ? 'badge-positive' : isLock ? 'badge-negative' : 'badge-neutral'}`} style={{ fontSize: 10.5, fontWeight: 700 }}>
                            {s.quality_score}/100 {s.status_label.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="text-right mono" style={{ fontWeight: 700, color: s.risk_reward_ratio >= 1.8 ? 'var(--positive)' : '#F59E0B' }}>
                          {s.risk_reward_ratio.toFixed(2)}:1
                        </td>

                        <td className="text-right mono" style={{ fontSize: 11 }}>
                          <span style={{ color: '#F59E0B', fontWeight: 600 }}>₹{s.trigger_price.toFixed(1)}</span> /{' '}
                          <span style={{ color: 'var(--negative)' }}>₹{s.stop_loss_price.toFixed(1)}</span> /{' '}
                          <span style={{ color: 'var(--positive)' }}>₹{s.target_price.toFixed(1)}</span>
                        </td>

                        <td>
                          <span className={`badge ${s.status === 'active' ? 'badge-positive' : s.status === 'acted_on' ? 'badge-accent' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="text-right" style={{ paddingRight: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => navigateToChart(s.symbol)}
                              className="btn btn-secondary btn-sm"
                              title="Open Live Chart"
                              style={{ padding: '0 6px' }}
                            >
                              <BarChart2 size={13} />
                            </button>
                            {s.status === 'active' && !isLock && (
                              <button
                                type="button"
                                onClick={() => handleBuy(s)}
                                className="btn btn-buy btn-sm"
                                style={{ fontWeight: 700 }}
                              >
                                Buy
                              </button>
                            )}
                            {s.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => handleAction(s.id, 'skipped')}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 10.5 }}
                              >
                                Skip
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SYMBOL</th>
                    <th>SERIES</th>
                    <th>PRICE BAND</th>
                    <th className="text-right">PREV CLOSE (₹)</th>
                    <th className="text-right">80% TRIGGER (₹)</th>
                    <th className="text-right">50% STOP LOSS (₹)</th>
                    <th className="text-right">95% TARGET (₹)</th>
                    <th className="text-right" style={{ paddingRight: 14 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUniverse.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                        No stocks found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    paginatedUniverse.map((l) => {
                      const prev = l.previous_close || 100.0;
                      const trigger80 = prev * 1.08;
                      const sl50 = prev * 1.05;
                      const target95 = prev * 1.095;
                      return (
                        <tr
                          key={l.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigateToChart(l.symbol)}
                        >
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{l.symbol}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{l.exchange} Equity</div>
                          </td>

                          <td>
                            <span className="badge badge-neutral" style={{ fontSize: 10, padding: '1px 5px' }}>
                              {l.series}
                            </span>
                          </td>

                          <td>
                            <span className="badge badge-accent" style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px' }}>
                              {l.price_band_pct}% BAND
                            </span>
                          </td>

                          <td className="text-right mono" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                            ₹{prev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right mono" style={{ color: '#F59E0B', fontWeight: 700 }}>
                            ₹{trigger80.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right mono text-negative" style={{ fontWeight: 600 }}>
                            ₹{sl50.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right mono text-positive" style={{ fontWeight: 700 }}>
                            ₹{target95.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right" style={{ paddingRight: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => navigateToChart(l.symbol)}
                                className="btn btn-secondary btn-sm"
                                style={{ gap: 4, padding: '0 8px', fontSize: 11 }}
                              >
                                <BarChart2 size={12} />
                                <span>Chart</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openQuickOrder({
                                  symbol: l.symbol,
                                  name: `${l.symbol} (NSE EQ)`,
                                  side: 'BUY',
                                  price: trigger80,
                                  initialQty: 50,
                                })}
                                className="btn btn-buy btn-sm"
                                style={{ padding: '0 8px', fontSize: 11 }}
                              >
                                Buy
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

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-sunken)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                Showing <strong>{filteredUniverse.length > 0 ? (universePage - 1) * pageSize + 1 : 0}</strong> to{' '}
                <strong>{Math.min(universePage * pageSize, filteredUniverse.length)}</strong> of{' '}
                <strong>{filteredUniverse.length}</strong> real NSE EQ stocks
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setUniversePage((p) => Math.max(1, p - 1))}
                  disabled={universePage <= 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span className="mono" style={{ fontWeight: 700, padding: '0 6px', fontSize: 11.5 }}>
                  Page {universePage} of {totalUniversePages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setUniversePage((p) => Math.min(totalUniversePages, p + 1))}
                  disabled={universePage >= totalUniversePages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
