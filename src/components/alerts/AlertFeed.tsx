import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Search,
  ArrowUpRight,
  Clock,
  Activity
} from 'lucide-react';
import { PriceAlertData, AlertType } from '../../types/alert';
import { useTrading } from '../../context/TradingContext';

interface AlertFeedProps {
  alerts: PriceAlertData[];
  onSelectAlert?: (alert: PriceAlertData) => void;
  maxHeight?: string | number;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onSelectAlert,
  maxHeight = 520,
}) => {
  const { setSelectedSymbol, setCurrentPage, openQuickOrder } = useTrading();
  const [filterType, setFilterType] = useState<'ALL' | AlertType>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [newAlertIds, setNewAlertIds] = useState<Set<number>>(new Set());
  const prevAlertCountRef = useRef(alerts.length);

  // Mark newly arrived alerts
  useEffect(() => {
    if (alerts.length > prevAlertCountRef.current) {
      const added = alerts.slice(0, alerts.length - prevAlertCountRef.current);
      const ids = new Set(added.map((a) => a.id));
      setNewAlertIds(ids);
      const timer = setTimeout(() => setNewAlertIds(new Set()), 3500);
      prevAlertCountRef.current = alerts.length;
      return () => clearTimeout(timer);
    }
    prevAlertCountRef.current = alerts.length;
  }, [alerts]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType !== 'ALL' && alert.alert_type !== filterType) return false;
    if (searchFilter && !alert.symbol.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getAlertBadgeConfig = (type: AlertType, isRepeat?: boolean) => {
    switch (type) {
      case 'PREV_HIGH_BREAKOUT':
        return {
          label: isRepeat ? 'NEW HIGH' : 'HIGH BREAKOUT',
          icon: <TrendingUp size={13} />,
          borderLeft: '4px solid var(--positive)',
          badgeBg: 'var(--positive-bg)',
          badgeColor: 'var(--positive)',
          badgeBorder: 'var(--positive-border)',
          priceColor: 'var(--positive)',
          refLabel: isRepeat ? 'Prev High Ref' : 'Prev Day High',
        };
      case 'PREV_LOW_BREAKDOWN':
        return {
          label: isRepeat ? 'NEW LOW' : 'LOW BREAKDOWN',
          icon: <TrendingDown size={13} />,
          borderLeft: '4px solid var(--negative)',
          badgeBg: 'var(--negative-bg)',
          badgeColor: 'var(--negative)',
          badgeBorder: 'var(--negative-border)',
          priceColor: 'var(--negative)',
          refLabel: isRepeat ? 'Prev Low Ref' : 'Prev Day Low',
        };
      case 'CIRCUIT_APPROACH':
        return {
          label: 'CIRCUIT 80%',
          icon: <Zap size={13} />,
          borderLeft: '4px solid var(--accent-primary)',
          badgeBg: 'var(--accent-light)',
          badgeColor: 'var(--accent-primary)',
          badgeBorder: 'var(--border-focus)',
          priceColor: 'var(--accent-primary)',
          refLabel: 'Circuit Band',
        };
      default:
        return {
          label: type,
          icon: <Activity size={13} />,
          borderLeft: '4px solid var(--border-default)',
          badgeBg: 'var(--bg-sunken)',
          badgeColor: 'var(--text-secondary)',
          badgeBorder: 'var(--border-default)',
          priceColor: 'var(--text-primary)',
          refLabel: 'Ref Level',
        };
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const formatVolume = (v: number) => {
    if (!v) return '—';
    if (v >= 10000000) return `${(v / 10000000).toFixed(2)}Cr`;
    if (v >= 100000) return `${(v / 100000).toFixed(2)}L`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  const handleRowClick = (alert: PriceAlertData) => {
    if (onSelectAlert) {
      onSelectAlert(alert);
      return;
    }
    setSelectedSymbol(alert.symbol);
    setCurrentPage('chart');
    window.location.hash = '#chart';
  };

  const tabs = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'PREV_HIGH_BREAKOUT', label: 'Breakouts' },
    { id: 'PREV_LOW_BREAKDOWN', label: 'Breakdowns' },
    { id: 'CIRCUIT_APPROACH', label: 'Circuit' },
  ] as const;

  return (
    <div
      className="surface-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-elevation)',
      }}
    >
      {/* Feed Header */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-sunken)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--positive)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--positive)',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Real-Time Surveillance Feed
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {filteredAlerts.length}
          </span>
        </div>

        {/* Filter Tabs & Search */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
            {tabs.map((tab) => {
              const active = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id as any)}
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
                  {tab.label}
                </button>
              );
            })}
          </div>

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
              placeholder="Search stock..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '4px 8px 4px 26px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 11.5,
                width: 120,
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div
        style={{
          maxHeight,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        {filteredAlerts.length === 0 ? (
          <EmptyFeedState />
        ) : (
          filteredAlerts.map((alert) => {
            const cfg = getAlertBadgeConfig(alert.alert_type, alert.is_repeat);
            const isNew = newAlertIds.has(alert.id);

            return (
              <div
                key={alert.id}
                onClick={() => handleRowClick(alert)}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  borderLeft: cfg.borderLeft,
                  backgroundColor: isNew ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: 12,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isNew ? 'var(--bg-hover)' : 'var(--bg-surface)';
                }}
              >
                {/* Left info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: cfg.badgeBg,
                      border: `1px solid ${cfg.badgeBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cfg.badgeColor,
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {alert.symbol}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 3,
                          backgroundColor: cfg.badgeBg,
                          color: cfg.badgeColor,
                          border: `1px solid ${cfg.badgeBorder}`,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {cfg.label}
                      </span>
                      {/* Rolling repeat badge — shows #2, #3 etc for subsequent intraday breakouts */}
                      {alert.is_repeat && alert.rolling_count && alert.rolling_count > 1 && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 3,
                            backgroundColor: cfg.badgeBg,
                            color: cfg.badgeColor,
                            border: `1px solid ${cfg.badgeBorder}`,
                            opacity: 0.85,
                          }}
                        >
                          #{alert.rolling_count}
                        </span>
                      )}
                      {isNew && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: 3,
                            backgroundColor: 'var(--accent-light)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--border-focus)',
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <Clock size={10} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{formatTime(alert.triggered_at)}</span>
                      <span>·</span>
                      <span>
                        {cfg.refLabel}:{' '}
                        <strong className="mono" style={{ color: 'var(--text-primary)' }}>
                          ₹{alert.reference_price.toFixed(2)}
                        </strong>
                      </span>
                      {(alert.volume ?? 0) > 0 && (
                        <>
                          <span>·</span>
                          <span>
                            Vol: <span className="mono">{formatVolume(alert.volume ?? 0)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: price & action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'right' }}>
                  <div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: alert.alert_type === 'PREV_LOW_BREAKDOWN' ? 'var(--negative)' : 'var(--positive)',
                      }}
                    >
                      ₹{alert.trigger_price.toFixed(2)}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: (alert.change_pct || 0) >= 0 ? 'var(--positive)' : 'var(--negative)',
                      }}
                    >
                      {(alert.change_pct || 0) >= 0 ? '+' : ''}
                      {(alert.change_pct || 0).toFixed(2)}%
                      {alert.distance_pct != null && (
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: 3 }}>
                          ({alert.distance_pct.toFixed(1)}% {alert.alert_type === 'CIRCUIT_APPROACH' ? 'bound' : 'dist'})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openQuickOrder({
                        symbol: alert.symbol,
                        name: `${alert.symbol} (${alert.exchange})`,
                        side: alert.alert_type === 'PREV_LOW_BREAKDOWN' ? 'SELL' : 'BUY',
                        price: alert.trigger_price,
                        initialQty: 50,
                      });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 4, padding: '4px 10px', fontSize: 11.5, fontWeight: 600 }}
                  >
                    <span>Trade</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ── Empty state matching project aesthetic ─────────────────────────────────── */
const EmptyFeedState: React.FC = () => (
  <div
    style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'var(--bg-surface)',
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        backgroundColor: 'var(--bg-sunken)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-primary)',
      }}
    >
      <Activity size={20} />
    </div>
    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
      Surveillance Engine Scanning Live Market Ticks
    </div>
    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.5 }}>
      Monitoring all circuit-eligible NSE equities against genuine previous-day High/Low levels and price bands. Triggers display here immediately as conditions fire.
    </div>
  </div>
);
