import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Flame,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { circuitService } from '../../services/circuitService';
import { CircuitLimitItem, CircuitSignalData } from '../../types/circuit';
import { useTrading } from '../../context/TradingContext';

export const CircuitWatchDashboard: React.FC = () => {
  const { setSelectedSymbol, openQuickOrder } = useTrading();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL' | 'UNIVERSE'>('ACTIVE');
  const [activeSignals, setActiveSignals] = useState<CircuitSignalData[]>([]);
  const [allSignals, setAllSignals] = useState<CircuitSignalData[]>([]);
  const [universeLimits, setUniverseLimits] = useState<CircuitLimitItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);

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


  const [universePage, setUniversePage] = useState<number>(1);
  const pageSize = 25;

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
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
              }}
            >
              <Flame size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                S0: Near Upper Circuit Momentum Scanner
              </h1>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Intraday Event-Driven Momentum • 10% Price Band Universe • 100% Manual Execution
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleManualSweep}
            disabled={isSweeping}
            className="btn btn-secondary"
            style={{ height: 38, fontSize: 12.5, gap: 6 }}
          >
            <RefreshCw size={14} style={{ animation: isSweeping ? 'spin 1s linear infinite' : 'none' }} />
            {isSweeping ? 'Sweeping Universe...' : 'Run Engine 2 Sweep'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Active S0 Alerts
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
            {activeSignals.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Pending your manual confirmation
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Acted On Today
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
            {allSignals.filter((s) => s.status === 'acted_on').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Executed trades
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
            10% Band Universe
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#38BDF8', marginTop: 4 }}>
            {universeLimits.length > 0 ? universeLimits.length : 248}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            NSE EQ Scrips Tracked
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Execution Policy
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>
            100% Manual Review
          </div>
          <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={12} /> Zero auto-order risk
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['ACTIVE', 'ALL', 'UNIVERSE'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: activeTab === tab ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: activeTab === tab ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              {tab === 'ACTIVE'
                ? `Active Signals (${activeSignals.length})`
                : tab === 'ALL'
                ? `Today's History (${allSignals.length})`
                : `10% Universe (${universeLimits.length})`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 260 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol..."
            style={{ paddingLeft: 32, height: 36, fontSize: 12 }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab !== 'UNIVERSE' ? (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Prev Close</th>
                <th>Live Price</th>
                <th>Change %</th>
                <th>Circuit Progress</th>
                <th>Quality Score</th>
                <th>R:R</th>
                <th>Trigger / Stop / Target</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                    No circuit momentum signals detected matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredSignals.map((s) => {
                  const isHigh = s.status_label === 'HIGH_CONFIDENCE';
                  const isLock = s.status_label === 'CIRCUIT_LOCK_WARNING';
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13.5 }}>{s.symbol}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{s.exchange} • 10% Band</div>
                      </td>
                      <td className="mono">₹{s.previous_close.toFixed(2)}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>
                        ₹{s.live_price.toFixed(2)}
                      </td>
                      <td className="mono" style={{ color: s.change_pct >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        ▲ +{s.change_pct.toFixed(2)}%
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, color: '#F59E0B' }}>{s.circuit_progress_pct.toFixed(1)}%</span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(0, s.circuit_progress_pct))}%`,
                              height: '100%',
                              backgroundColor: isLock ? '#EF4444' : '#F59E0B',
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${isHigh ? 'badge-positive' : 'badge-neutral'}`}
                          style={{ fontSize: 11, fontWeight: 700 }}
                        >
                          {s.quality_score}/100
                        </span>
                      </td>
                      <td className="mono" style={{ fontWeight: 700, color: s.risk_reward_ratio >= 1.8 ? '#10B981' : '#F59E0B' }}>
                        {s.risk_reward_ratio.toFixed(2)}:1
                      </td>
                      <td className="mono" style={{ fontSize: 11 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>₹{s.trigger_price.toFixed(1)}</span> /{' '}
                        <span style={{ color: '#EF4444' }}>₹{s.stop_loss_price.toFixed(1)}</span> /{' '}
                        <span style={{ color: '#10B981' }}>₹{s.target_price.toFixed(1)}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.status === 'active'
                              ? 'badge-positive'
                              : s.status === 'acted_on'
                              ? 'badge-primary'
                              : 'badge-neutral'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSymbol(s.symbol);
                              window.location.hash = '#chart';
                            }}
                            className="btn btn-secondary btn-sm"
                            title="View Live Chart"
                          >
                            <ArrowUpRight size={12} />
                          </button>
                          {s.status === 'active' && !isLock && (
                            <button
                              type="button"
                              onClick={() => handleBuy(s)}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 700 }}
                            >
                              Buy
                            </button>
                          )}
                          {s.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleAction(s.id, 'skipped')}
                              className="btn btn-secondary btn-sm"
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
        ) : (
          <div>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Series</th>
                  <th>Price Band</th>
                  <th>Prev Close</th>
                  <th>Trigger Price (80%)</th>
                  <th>Stop Loss (50%)</th>
                  <th>Profit Target (95%)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUniverse.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-tertiary)' }}>
                      No stocks found matching search.
                    </td>
                  </tr>
                ) : (
                  paginatedUniverse.map((l) => {
                    const prev = l.previous_close || 100.0;
                    return (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 700 }}>{l.symbol}</td>
                        <td>{l.series}</td>
                        <td className="mono" style={{ color: '#38BDF8' }}>
                          {l.price_band_pct}%
                        </td>
                        <td className="mono">₹{prev.toFixed(2)}</td>
                        <td className="mono" style={{ color: '#F59E0B', fontWeight: 700 }}>
                          ₹{(prev * 1.08).toFixed(2)}
                        </td>
                        <td className="mono" style={{ color: '#EF4444' }}>
                          ₹{(prev * 1.05).toFixed(2)}
                        </td>
                        <td className="mono" style={{ color: '#10B981' }}>
                          ₹{(prev * 1.095).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderTop: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-sunken)',
                fontSize: 12,
                color: 'var(--text-secondary)',
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
                <span className="mono" style={{ fontWeight: 700, padding: '0 6px' }}>
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

