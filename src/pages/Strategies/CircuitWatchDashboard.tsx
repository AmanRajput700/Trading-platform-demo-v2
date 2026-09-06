import React, { useState, useEffect } from 'react';
import {
  Flame,
  RefreshCw,
  Search,
  TrendingUp,
  BarChart2,
  Zap,
  X,
  Sliders,
  FileText,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { circuitService } from '../../services/circuitService';
import { CircuitAuditItem, CircuitLimitItem, CircuitSignalData, CircuitStrategyConfigData } from '../../types/circuit';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';

export const CircuitWatchDashboard: React.FC = () => {
  const { setSelectedSymbol, openQuickOrder, setCurrentPage, isMarketOpen } = useTrading();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL' | 'UNIVERSE' | 'AUDIT'>('ACTIVE');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'UPPER' | 'LOWER'>('ALL');
  const [bandFilter, setBandFilter] = useState<number | null>(null);

  const [activeSignals, setActiveSignals] = useState<CircuitSignalData[]>([]);
  const [allSignals, setAllSignals] = useState<CircuitSignalData[]>([]);
  const [universeLimits, setUniverseLimits] = useState<CircuitLimitItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<CircuitAuditItem[]>([]);
  const [strategyConfig, setStrategyConfig] = useState<CircuitStrategyConfigData | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Config Tuning Form
  const [configThreshold, setConfigThreshold] = useState<number>(80);
  const [configHysteresis, setConfigHysteresis] = useState<number>(5);
  const [configMinVol, setConfigMinVol] = useState<number>(50000);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  const [universePage, setUniversePage] = useState<number>(1);
  const pageSize = 20;

  const loadData = async () => {
    try {
      const dirParam = directionFilter === 'ALL' ? undefined : directionFilter;
      const [act, all, lims, audits, cfg] = await Promise.all([
        circuitService.getActiveSignals(dirParam),
        circuitService.getAllSignals(undefined, undefined, dirParam),
        circuitService.getCircuitLimits(bandFilter ?? undefined, 'EQ'),
        circuitService.getRecommendationAudits(undefined, undefined, dirParam, 100),
        circuitService.getStrategyConfig(),
      ]);
      setActiveSignals(act);
      setAllSignals(all);
      setUniverseLimits(lims);
      setAuditLogs(audits);
      if (cfg) {
        setStrategyConfig(cfg);
        setConfigThreshold(cfg.default_threshold_pct || 80);
        setConfigHysteresis(cfg.default_hysteresis_pct || 5);
        setConfigMinVol(cfg.min_volume_shares || 50000);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [directionFilter, bandFilter]);

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

  const handleOrder = (s: CircuitSignalData) => {
    const isLower = s.direction === 'LOWER' || (s.alert_state && s.alert_state.includes('LOWER'));
    openQuickOrder({
      symbol: s.symbol,
      name: `${s.symbol} (NSE EQ)`,
      side: isLower ? 'SELL' : 'BUY',
      price: s.live_price,
      initialQty: 50,
    });
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await circuitService.updateStrategyConfig(configThreshold, configHysteresis, configMinVol);
      setShowConfigModal(false);
      await loadData();
    } catch {
      // ignore
    } finally {
      setIsSavingConfig(false);
    }
  };

  const navigateToChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentPage('instrument');
  };

  // Filter signals by search query
  const targetSignals = activeTab === 'ACTIVE' ? activeSignals : allSignals;
  const filteredSignals = targetSignals.filter((s) => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDir = directionFilter === 'ALL' || s.direction === directionFilter;
    return matchesSearch && matchesDir;
  });

  const filteredUniverse = universeLimits.filter((l) => {
    const matchesSearch = l.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBand = bandFilter === null || Number(l.price_band_pct) === bandFilter;
    return matchesSearch && matchesBand;
  });

  const filteredAudits = auditLogs.filter((a) => {
    const matchesSearch = a.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDir = directionFilter === 'ALL' || a.direction === (directionFilter === 'UPPER' ? 'BUY' : 'SELL_CAUTION');
    return matchesSearch && matchesDir;
  });

  const totalUniversePages = Math.ceil(filteredUniverse.length / pageSize) || 1;
  const paginatedUniverse = filteredUniverse.slice(
    (universePage - 1) * pageSize,
    universePage * pageSize
  );

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1320, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Near-Circuit Recommendation Engine"
        subtitle="Bidirectional Event-Driven Triggers • Upper (Buy) & Lower (Sell/Caution) • Finite State Machine with Hysteresis"
        badge={{
          text: isMarketOpen ? "NSE LIVE FEED" : "MARKET CLOSED",
          variant: isMarketOpen ? "positive" : "neutral"
        }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Sliders size={13} />
              <span>Parameters ({strategyConfig?.default_threshold_pct || 80}%)</span>
            </button>
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
              <span>{isSweeping ? 'Sweeping Universe...' : 'Run Engine Sweep'}</span>
            </button>
          </div>
        }
      />

      {/* Regulatory Compliance Notice Banner */}
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 11.5,
        color: '#CBD5E1',
      }}>
        <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
        <div style={{ flex: 1, lineHeight: 1.4 }}>
          <strong>SEBI Regulatory & Execution Notice:</strong> This module generates algorithmic price-pattern candidate alerts for informational and backtesting purposes. It does <em>not</em> provide investment advice. All orders require explicit manual user confirmation; zero autonomous routing occurs.
        </div>
      </div>

      {/* KPI Metric Summary Blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Active Buy Candidates</span>
            <ArrowUpRight size={14} style={{ color: '#10B981' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
            {activeSignals.filter((s) => s.direction === 'UPPER').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Near Upper Circuit triggers
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Active Sell / Caution</span>
            <ArrowDownRight size={14} style={{ color: '#EF4444' }} />
          </div>
          <div className="mono text-negative" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {activeSignals.filter((s) => s.direction === 'LOWER').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Near Lower Circuit triggers
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Circuit Scrips Master</span>
            <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {universeLimits.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Equities with Upper/Lower limits
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Compliance Audit Trail</span>
            <FileText size={14} style={{ color: '#10B981' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {auditLogs.length}
          </div>
          <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>
            Logged state transitions today
          </div>
        </div>
      </div>

      {/* Control Bar: Segmented Tabs & Direction Filter & Instant Search */}
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
            <span>Circuit Universe</span>
            <span className={`badge ${activeTab === 'UNIVERSE' ? 'badge-neutral' : ''}`} style={{ fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>
              {universeLimits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('AUDIT'); setUniversePage(1); }}
            className={`btn btn-sm ${activeTab === 'AUDIT' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: activeTab === 'AUDIT' ? 700 : 500 }}
          >
            <span>Audit Trail</span>
            <span className={`badge ${activeTab === 'AUDIT' ? 'badge-neutral' : ''}`} style={{ fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Direction Sub-filter */}
        {activeTab !== 'UNIVERSE' && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', backgroundColor: 'var(--bg-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => setDirectionFilter('ALL')}
              className={`btn btn-sm ${directionFilter === 'ALL' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '2px 8px' }}
            >
              All Sides
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('UPPER')}
              className={`btn btn-sm ${directionFilter === 'UPPER' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '2px 8px', color: '#10B981', fontWeight: 600 }}
            >
              ▲ Buy (Upper)
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('LOWER')}
              className={`btn btn-sm ${directionFilter === 'LOWER' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '2px 8px', color: '#EF4444', fontWeight: 600 }}
            >
              ▼ Sell (Lower)
            </button>
          </div>
        )}

        {/* Band Sub-filter for Universe */}
        {activeTab === 'UNIVERSE' && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', backgroundColor: 'var(--bg-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => { setBandFilter(null); setUniversePage(1); }}
              className={`btn btn-sm ${bandFilter === null ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '2px 8px' }}
            >
              All Bands
            </button>
            {[2, 5, 10, 20].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => { setBandFilter(b); setUniversePage(1); }}
                className={`btn btn-sm ${bandFilter === b ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '2px 8px' }}
              >
                {b}%
              </button>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ position: 'relative', width: 240 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setUniversePage(1); }}
            placeholder="Search symbol..."
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

      {/* Main Data View */}
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        {activeTab === 'ACTIVE' || activeTab === 'ALL' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SYMBOL & DIRECTION</th>
                  <th className="text-right">PREV CLOSE (₹)</th>
                  <th className="text-right">LIVE PRICE (₹)</th>
                  <th className="text-right">CHANGE (%)</th>
                  <th style={{ minWidth: 160 }}>CIRCUIT PROGRESS</th>
                  <th>SCORE & STATE</th>
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
                        <div style={{ fontWeight: 600 }}>No near-circuit signals matching filters.</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Signals fire automatically when a stock crosses {strategyConfig?.default_threshold_pct || 80}% of the circuit distance.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSignals.map((s) => {
                    const isLower = s.direction === 'LOWER' || (s.alert_state && s.alert_state.includes('LOWER'));
                    const isLock = s.status_label === 'CIRCUIT_LOCK_WARNING' || s.alert_state === 'AT_UPPER_CIRCUIT' || s.alert_state === 'AT_LOWER_CIRCUIT';
                    const isHigh = s.status_label === 'HIGH_CONFIDENCE';
                    const isPos = s.change_pct >= 0;

                    return (
                      <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigateToChart(s.symbol)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>{s.symbol}</span>
                            <span
                              className="badge"
                              style={{
                                fontSize: 9.5,
                                padding: '1px 5px',
                                backgroundColor: isLower ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isLower ? '#EF4444' : '#10B981',
                                fontWeight: 700,
                              }}
                            >
                              {isLower ? '▼ SELL / CAUTION' : '▲ BUY'}
                            </span>
                            <span className="badge badge-accent" style={{ fontSize: 9, padding: '0 4px' }}>
                              {s.price_band_pct}% BAND
                            </span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                            {s.exchange} • Equity
                          </div>
                        </td>

                        <td className="text-right mono" style={{ color: 'var(--text-secondary)' }}>
                          ₹{s.previous_close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="text-right mono" style={{ fontWeight: 700, fontSize: 13, color: isLower ? '#EF4444' : '#10B981' }}>
                          ₹{s.live_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                          {isPos ? '+' : ''}{s.change_pct.toFixed(2)}%
                        </td>

                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, color: isLock ? '#EF4444' : isLower ? '#EF4444' : '#F59E0B' }}>
                              {s.circuit_progress_pct.toFixed(1)}%
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>of Band</span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: 'var(--bg-sunken)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, Math.max(0, s.circuit_progress_pct))}%`,
                              height: '100%',
                              backgroundColor: isLock ? '#EF4444' : isLower ? '#EF4444' : '#F59E0B',
                              transition: 'width 250ms ease',
                            }} />
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span className={`badge ${isHigh ? 'badge-positive' : isLock ? 'badge-negative' : 'badge-neutral'}`} style={{ fontSize: 10, fontWeight: 700 }}>
                              {s.quality_score}/100 • {s.alert_state || s.status_label.replace(/_/g, ' ')}
                            </span>
                          </div>
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
                            {s.status === 'active' && !isLock ? (
                              <button
                                type="button"
                                onClick={() => handleOrder(s)}
                                className={`btn btn-sm ${isLower ? 'btn-danger' : 'btn-buy'}`}
                                style={{
                                  fontWeight: 700,
                                  backgroundColor: isLower ? '#EF4444' : undefined,
                                  color: isLower ? '#FFFFFF' : undefined,
                                }}
                              >
                                {isLower ? 'Sell' : 'Buy'}
                              </button>
                            ) : isLock ? (
                              <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, padding: '2px 6px', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 4 }}>
                                Locked
                              </span>
                            ) : null}
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
        ) : activeTab === 'UNIVERSE' ? (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SYMBOL</th>
                    <th>SERIES</th>
                    <th>PRICE BAND</th>
                    <th className="text-right">PREV CLOSE (₹)</th>
                    <th className="text-right">LOWER LIMIT (₹)</th>
                    <th className="text-right">UPPER LIMIT (₹)</th>
                    <th className="text-right">80% LOWER TRIG (₹)</th>
                    <th className="text-right">80% UPPER TRIG (₹)</th>
                    <th className="text-right" style={{ paddingRight: 14 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUniverse.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                        No scrips found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    paginatedUniverse.map((l) => {
                      const prev = l.previous_close || 100.0;
                      const band = Number(l.price_band_pct) || 10.0;
                      const upperLim = l.upper_limit || (prev * (1 + band / 100));
                      const lowerLim = l.lower_limit || (prev * (1 - band / 100));
                      const upperTrig = prev + 0.8 * (upperLim - prev);
                      const lowerTrig = prev - 0.8 * (prev - lowerLim);

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

                          <td className="text-right mono text-negative" style={{ fontWeight: 600 }}>
                            ₹{lowerLim.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right mono text-positive" style={{ fontWeight: 600 }}>
                            ₹{upperLim.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right mono text-negative" style={{ color: '#F87171', fontWeight: 700 }}>
                            ₹{lowerTrig.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="text-right mono text-positive" style={{ color: '#F59E0B', fontWeight: 700 }}>
                            ₹{upperTrig.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        ) : (
          /* Audit Trail Tab */
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>TIMESTAMP (UTC)</th>
                  <th>SYMBOL</th>
                  <th>DIRECTION</th>
                  <th>STATE TRANSITION</th>
                  <th className="text-right">LTP (₹)</th>
                  <th className="text-right">TRIGGER (₹)</th>
                  <th>REASON / ACTION LABEL</th>
                  <th>SCORE</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
                      No regulatory recommendation audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((a) => (
                    <tr key={a.id}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>{a.symbol}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            fontSize: 9.5,
                            backgroundColor: a.direction === 'BUY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: a.direction === 'BUY' ? '#10B981' : '#EF4444',
                            fontWeight: 700,
                          }}
                        >
                          {a.direction}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontSize: 11 }}>
                          {a.state_from} → <strong>{a.state_to}</strong>
                        </span>
                      </td>
                      <td className="text-right mono" style={{ fontWeight: 700 }}>
                        ₹{a.ltp.toFixed(2)}
                      </td>
                      <td className="text-right mono" style={{ color: '#F59E0B' }}>
                        ₹{a.trigger_price.toFixed(2)}
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {a.reason || 'State transition'}
                      </td>
                      <td className="mono" style={{ fontWeight: 700 }}>
                        {a.quality_score}/100
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configuration Tuning Modal */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0F172A',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 12,
              width: '100%',
              maxWidth: 440,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>Strategy Parameters</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                  Trigger Threshold % (Default: 80.0%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  step="1"
                  value={configThreshold}
                  onChange={(e) => setConfigThreshold(Number(e.target.value))}
                  className="input"
                  style={{ width: '100%', height: 36 }}
                />
                <span style={{ fontSize: 10.5, color: '#64748B' }}>
                  Signals fire when price travels through {configThreshold}% of the circuit band distance.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                  Hysteresis Buffer % (Default: 5.0%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={configHysteresis}
                  onChange={(e) => setConfigHysteresis(Number(e.target.value))}
                  className="input"
                  style={{ width: '100%', height: 36 }}
                />
                <span style={{ fontSize: 10.5, color: '#64748B' }}>
                  Price must pull back {configHysteresis}% below trigger before state resets to NORMAL (prevents alert flapping).
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                  Minimum Volume Filter (Default: 50,000 shares)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={configMinVol}
                  onChange={(e) => setConfigMinVol(Number(e.target.value))}
                  className="input"
                  style={{ width: '100%', height: 36 }}
                />
                <span style={{ fontSize: 10.5, color: '#64748B' }}>
                  Ignores illiquid ghost moves with thin volume.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                {isSavingConfig ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
