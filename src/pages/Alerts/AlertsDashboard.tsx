import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Bell,
  Download,
  RefreshCw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Search,
  LineChart,
  ShieldCheck,
  Layers,
  X
} from 'lucide-react';
import { PriceAlertData, AlertType } from '../../types/alert';
import { alertService } from '../../services/alertService';
import { AlertFeed } from '../../components/alerts/AlertFeed';
import { useTrading } from '../../context/TradingContext';
import { useAlerts } from '../../hooks/useAlerts';
import { marketFeedService } from '../../services/marketFeedService';
import { PageHeader } from '../../components/common/PageHeader';

export const AlertsDashboard: React.FC = () => {
  const { setSelectedSymbol, setCurrentPage, openQuickOrder, isMarketOpen } = useTrading();

  // ── Consume the shared live-alert hook (WebSocket + polling) ──────────────
  const {
    todayAlerts,
    stats,
    settings,
    setSettings,
    refreshAlerts,
  } = useAlerts();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Track WS connectivity
  useEffect(() => {
    const check = () => setWsConnected(marketFeedService.isFeedActive());
    check();
    const t = setInterval(check, 3000);
    return () => clearInterval(t);
  }, []);

  // Manual refresh wrapper
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAlerts();
    await loadHistory();
    setIsRefreshing(false);
  };

  // ── Sound toggle ──────────────────────────────────────────────────────────
  const toggleSound = () => {
    setSettings((prev) => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      try {
        localStorage.setItem('auratrade-alert-settings', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  // ── History (paginated, filtered) ─────────────────────────────────────────
  const [historyItems, setHistoryItems] = useState<PriceAlertData[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(20);
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const historyTimerRef = useRef<any>(null);

  // ── Rolling Reference Levels (intraday rolling high/low refs per symbol) ──
  interface RollingRef {
    high_ref: number;
    low_ref: number;
    breakout_count: number;
    breakdown_count: number;
    last_high_fired: number;
    last_low_fired: number;
  }
  const [rollingRefs, setRollingRefs] = useState<Record<string, RollingRef>>({});
  const [rollingRefCount, setRollingRefCount] = useState(0);
  const rollingTimerRef = useRef<any>(null);

  const loadRollingRefs = async () => {
    try {
      const res = await fetch('/api/v1/alerts/rolling-refs');
      if (res.ok) {
        const data = await res.json();
        setRollingRefs(data.refs || {});
        setRollingRefCount(data.active_symbols || 0);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadRollingRefs();
    rollingTimerRef.current = setInterval(loadRollingRefs, 10000);
    return () => clearInterval(rollingTimerRef.current);
  }, []);

  const loadHistory = async () => {
    try {
      const offset = (historyPage - 1) * historyLimit;
      const res = await alertService.getAlertHistory(
        undefined, undefined,
        historyTypeFilter === 'ALL' ? undefined : historyTypeFilter,
        historySearch.trim() || undefined,
        historyLimit,
        offset
      );
      setHistoryItems(res.items);
      setHistoryTotal(res.total);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadHistory();
  }, [historyPage, historyTypeFilter, historySearch]);

  // Auto-refresh history every 15s while on this page
  useEffect(() => {
    historyTimerRef.current = setInterval(loadHistory, 15000);
    return () => clearInterval(historyTimerRef.current);
  }, [historyPage, historyTypeFilter, historySearch]);

  // ── Simulate Modal ────────────────────────────────────────────────────────
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simSymbol, setSimSymbol] = useState('RELIANCE');
  const [simType, setSimType] = useState<AlertType>('PREV_HIGH_BREAKOUT');
  const [simPrice, setSimPrice] = useState(1288.0);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTriggerSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      await alertService.simulateAlert({
        symbol: simSymbol.toUpperCase().trim(),
        alert_type: simType,
        trigger_price: Number(simPrice),
      });
      setIsSimModalOpen(false);
      setTimeout(() => { refreshAlerts(); loadHistory(); }, 500);
    } catch { /* ignore */ } finally {
      setIsSimulating(false);
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!historyItems.length) return;
    const headers = ['ID', 'Symbol', 'Exchange', 'Alert Type', 'LTP', 'Reference Price', 'Change %', 'Distance %', 'Time'];
    const rows = historyItems.map((item) => [
      item.id, item.symbol, item.exchange, item.alert_type,
      item.trigger_price, item.reference_price,
      item.change_pct ?? '', item.distance_pct ?? '', item.triggered_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `auratrade_alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
    } catch {
      return iso;
    }
  };

  const totalPages = Math.ceil(historyTotal / historyLimit) || 1;

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: 1320,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      {/* ── 1. Page Header (matches PositionsPage, CircuitWatchDashboard) ── */}
      <PageHeader
        title="Real-Time Market Alerts"
        subtitle="Automated price surveillance engine • Live Upstox tick evaluation against genuine previous-day High/Low and Circuit bands"
        badge={{
          text: wsConnected ? (isMarketOpen ? 'LIVE FEED ACTIVE' : 'UPSTOX CONNECTED') : 'RECONNECTING',
          variant: wsConnected ? 'positive' : 'warning',
        }}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Chime Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
              title={settings.soundEnabled ? 'Mute chimes' : 'Enable chimes'}
            >
              {settings.soundEnabled ? (
                <Volume2 size={13} style={{ color: 'var(--accent-primary)' }} />
              ) : (
                <VolumeX size={13} style={{ color: 'var(--text-tertiary)' }} />
              )}
              <span>{settings.soundEnabled ? 'Audio On' : 'Audio Muted'}</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={historyItems.length === 0}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
              title="Export visible alert records to CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {/* Simulate Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsSimModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
              title="Test surveillance conditions"
            >
              <Zap size={13} style={{ color: 'var(--warning)' }} />
              <span>Simulate Alert</span>
            </button>

            {/* Manual Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 600 }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        }
      />

      {/* ── 2. Information & Surveillance Strip ── */}
      <div
        style={{
          backgroundColor: 'var(--bg-sunken)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <ShieldCheck size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <div style={{ flex: 1, lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Authoritative Surveillance:</strong>{' '}
          Alerts evaluate incoming Upstox ticks against genuine previous-day High/Low daily candles and verified NSE price band limits. All alerts trigger in real-time with sub-millisecond dispatch.
        </div>
      </div>

      {/* ── 3. KPI Metric Summary Cards (AuraTrade Fintech Terminal standard) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Total Today */}
        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Total Triggers Today</span>
            <Bell size={14} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Surveillance condition events
          </div>
        </div>

        {/* High Breakouts */}
        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--positive)' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>High Breakouts</span>
            <TrendingUp size={14} style={{ color: 'var(--positive)' }} />
          </div>
          <div className="mono text-positive" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {stats.breakouts}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Crossed prev-day high
          </div>
        </div>

        {/* Low Breakdowns */}
        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--negative)' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Low Breakdowns</span>
            <TrendingDown size={14} style={{ color: 'var(--negative)' }} />
          </div>
          <div className="mono text-negative" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {stats.breakdowns}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Below prev-day low
          </div>
        </div>

        {/* Circuit Approaching */}
        <div className="surface-card" style={{ padding: '14px 18px', borderLeft: '4px solid #3AA0FF' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Near Circuit Approaching</span>
            <Zap size={14} style={{ color: '#3AA0FF' }} />
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: '#3AA0FF', marginTop: 4 }}>
            {stats.circuit_approaches}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            ≥80% progress to Upper Band
          </div>
        </div>
      </div>

      {/* ── 4. Live Alert Feed Component ── */}
      <AlertFeed alerts={todayAlerts} maxHeight={420} />

      {/* ── 4b. Active Rolling Levels Table ── */}
      {rollingRefCount > 0 && (
        <div
          className="surface-card"
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevation)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--bg-sunken)',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={14} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Active Rolling Reference Levels
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                  Current intraday high/low thresholds — next alert fires above/below these levels • {rollingRefCount} symbols tracked
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={loadRollingRefs}
              className="btn btn-ghost btn-sm"
              style={{ padding: '3px 8px', fontSize: 11 }}
              title="Refresh rolling levels"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-sunken)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '7px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Symbol</th>
                  <th style={{ padding: '7px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Next 🟢 Breakout Above</th>
                  <th style={{ padding: '7px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Breakouts Today</th>
                  <th style={{ padding: '7px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Next 🔴 Breakdown Below</th>
                  <th style={{ padding: '7px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Breakdowns Today</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rollingRefs)
                  .filter(([, ref]) => ref.breakout_count > 0 || ref.breakdown_count > 0)
                  .sort(([, a], [, b]) => (b.breakout_count + b.breakdown_count) - (a.breakout_count + a.breakdown_count))
                  .slice(0, 30)
                  .map(([symbol, ref]) => (
                    <tr
                      key={symbol}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '8px 14px' }}>
                        <strong
                          style={{ color: 'var(--text-primary)', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedSymbol(symbol);
                            setCurrentPage('chart');
                            window.location.hash = '#chart';
                          }}
                        >
                          {symbol}
                        </strong>
                      </td>
                      <td className="mono" style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--positive)' }}>
                        ₹{ref.high_ref.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                        {ref.breakout_count > 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'var(--positive-bg)',
                              color: 'var(--positive)',
                              border: '1px solid var(--positive-border)',
                            }}
                          >
                            {ref.breakout_count}×
                          </span>
                        ) : <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>—</span>}
                      </td>
                      <td className="mono" style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--negative)' }}>
                        ₹{ref.low_ref.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                        {ref.breakdown_count > 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'var(--negative-bg)',
                              color: 'var(--negative)',
                              border: '1px solid var(--negative-border)',
                            }}
                          >
                            {ref.breakdown_count}×
                          </span>
                        ) : <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>—</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {Object.values(rollingRefs).filter(r => r.breakout_count > 0 || r.breakdown_count > 0).length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
                No rolling alerts have fired yet today — levels initialize on first alert trigger
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Historical Alert Records Table ── */}
      <div
        className="surface-card"
        style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-elevation)',
        }}
      >
        {/* Table Header Bar */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-sunken)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Alert Records
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Persisted trigger log • Auto-refreshes every 15s • Total {historyTotal} records
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-surface)',
                padding: 2,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                gap: 2,
              }}
            >
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PREV_HIGH_BREAKOUT', label: 'Breakouts' },
                { id: 'PREV_LOW_BREAKDOWN', label: 'Breakdowns' },
                { id: 'CIRCUIT_APPROACH', label: 'Circuit' },
              ].map((t) => {
                const active = historyTypeFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setHistoryTypeFilter(t.id);
                      setHistoryPage(1);
                    }}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11.5,
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? 'var(--bg-sunken)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={12}
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="text"
                placeholder="Search symbol..."
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                style={{
                  padding: '4px 8px 4px 26px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 11.5,
                  width: 130,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sunken)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Symbol</th>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Alert Type</th>
                <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Trigger LTP</th>
                <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Ref Level</th>
                <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Change %</th>
                <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Distance</th>
                <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No historical alerts matching your criteria
                  </td>
                </tr>
              ) : (
                historyItems.map((item) => {
                  const isBreakdown = item.alert_type === 'PREV_LOW_BREAKDOWN';
                  const isBreakout = item.alert_type === 'PREV_HIGH_BREAKOUT';

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '9px 14px', color: 'var(--text-secondary)' }}>
                        {formatTime(item.triggered_at)}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <strong
                          style={{
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            textDecoration: 'none',
                          }}
                          onClick={() => {
                            setSelectedSymbol(item.symbol);
                            setCurrentPage('chart');
                            window.location.hash = '#chart';
                          }}
                        >
                          {item.symbol}
                        </strong>
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 4 }}>
                          {item.exchange}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isBreakout && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 4,
                              backgroundColor: 'var(--positive-bg)',
                              color: 'var(--positive)',
                              border: '1px solid var(--positive-border)',
                            }}
                          >
                            <TrendingUp size={11} /> BREAKOUT
                          </span>
                        )}
                        {isBreakdown && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 4,
                              backgroundColor: 'var(--negative-bg)',
                              color: 'var(--negative)',
                              border: '1px solid var(--negative-border)',
                            }}
                          >
                            <TrendingDown size={11} /> BREAKDOWN
                          </span>
                        )}
                        {!isBreakout && !isBreakdown && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 4,
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent-primary)',
                              border: '1px solid var(--border-focus)',
                            }}
                          >
                            <Zap size={11} /> CIRCUIT 80%
                          </span>
                        )}
                      </td>
                      <td className="mono" style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: isBreakdown ? 'var(--negative)' : 'var(--positive)' }}>
                        ₹{item.trigger_price.toFixed(2)}
                      </td>
                      <td className="mono" style={{ padding: '9px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        ₹{item.reference_price.toFixed(2)}
                      </td>
                      <td className="mono" style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 600, color: (item.change_pct || 0) >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        {(item.change_pct || 0) >= 0 ? '+' : ''}
                        {(item.change_pct || 0).toFixed(2)}%
                      </td>
                      <td className="mono" style={{ padding: '9px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {item.distance_pct != null ? `${item.distance_pct.toFixed(2)}%` : '—'}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSymbol(item.symbol);
                              setCurrentPage('chart');
                              window.location.hash = '#chart';
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            title="Open chart"
                          >
                            <LineChart size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              openQuickOrder({
                                symbol: item.symbol,
                                name: `${item.symbol} (${item.exchange})`,
                                side: isBreakdown ? 'SELL' : 'BUY',
                                price: item.trigger_price,
                                initialQty: 50,
                              });
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11, gap: 3 }}
                          >
                            <span>Trade</span>
                            <ArrowUpRight size={11} />
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

        {/* Pagination Footer */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--bg-sunken)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Showing {historyItems.length > 0 ? (historyPage - 1) * historyLimit + 1 : 0} to{' '}
            {Math.min(historyPage * historyLimit, historyTotal)} of {historyTotal} records
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px' }}
            >
              <ChevronLeft size={13} />
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 11.5, fontWeight: 600 }}>
              Page {historyPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
              disabled={historyPage >= totalPages}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px' }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 6. Simulate Alert Modal (Fintech Terminal Spec) ── */}
      {isSimModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setIsSimModalOpen(false)}
        >
          <div
            className="surface-card"
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid var(--border-default)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 18px',
                backgroundColor: 'var(--bg-sunken)',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Simulate Surveillance Alert
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSimModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4 }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleTriggerSimulation} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={simSymbol}
                  onChange={(e) => setSimSymbol(e.target.value.toUpperCase())}
                  required
                  className="input"
                  style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                  placeholder="e.g. RELIANCE"
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Alert Condition Type
                </label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value as AlertType)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="PREV_HIGH_BREAKOUT">🟢 Previous High Breakout</option>
                  <option value="PREV_LOW_BREAKDOWN">🔴 Previous Low Breakdown</option>
                  <option value="CIRCUIT_APPROACH">🔵 Circuit Warning (≥80%)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Trigger Execution Price (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={simPrice}
                  onChange={(e) => setSimPrice(parseFloat(e.target.value) || 0)}
                  required
                  className="input mono"
                  style={{ width: '100%' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 6,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsSimModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulating || !simSymbol || simPrice <= 0}
                  className="btn btn-primary btn-sm"
                  style={{ gap: 6 }}
                >
                  <Zap size={13} />
                  <span>{isSimulating ? 'Broadcasting...' : 'Broadcast Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
