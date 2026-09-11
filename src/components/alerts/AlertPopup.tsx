import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Zap,
  X,
  Maximize2
} from 'lucide-react';
import { PriceAlertData } from '../../types/alert';
import { useTrading } from '../../context/TradingContext';

interface AlertPopupItemProps {
  alert: PriceAlertData;
  autoDismissSeconds: number;
  onDismiss: (id: number) => void;
}

const SingleAlertToast: React.FC<AlertPopupItemProps> = ({
  alert,
  autoDismissSeconds,
  onDismiss,
}) => {
  const { setSelectedSymbol, openQuickOrder, setCurrentPage } = useTrading();
  const [timeLeft, setTimeLeft] = useState<number>(autoDismissSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused || autoDismissSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss(alert.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, autoDismissSeconds, alert.id, onDismiss]);

  const isBreakout = alert.alert_type === 'PREV_HIGH_BREAKOUT';
  const isBreakdown = alert.alert_type === 'PREV_LOW_BREAKDOWN';
  const isCircuit = alert.alert_type === 'CIRCUIT_APPROACH';

  // Aesthetic color theme
  const config = isBreakout
    ? {
        primaryColor: '#10B981',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.65)',
        title: 'PREV DAY HIGH BREAKOUT',
        icon: TrendingUp,
        label: 'Bullish Breakout Momentum',
        actionLabel: 'Quick Buy',
        actionSide: 'BUY' as const,
      }
    : isBreakdown
    ? {
        primaryColor: '#EF4444',
        glowColor: 'rgba(239, 68, 68, 0.25)',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.65)',
        title: 'PREV DAY LOW BREAKDOWN',
        icon: TrendingDown,
        label: 'Bearish Breakdown Momentum',
        actionLabel: 'Quick Sell',
        actionSide: 'SELL' as const,
      }
    : {
        primaryColor: '#3B82F6',
        glowColor: 'rgba(59, 130, 246, 0.35)',
        badgeBg: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.75)',
        title: 'UPPER CIRCUIT APPROACH',
        icon: Zap,
        label: `${alert.distance_pct ? alert.distance_pct.toFixed(1) : '80+'}% to Upper Circuit Limit`,
        actionLabel: 'Review Order',
        actionSide: 'BUY' as const,
      };

  const Icon = config.icon;

  const handleQuickTrade = () => {
    openQuickOrder({
      symbol: alert.symbol,
      name: `${alert.symbol} (${alert.exchange})`,
      side: config.actionSide,
      price: alert.trigger_price,
      initialQty: 50,
    });
    onDismiss(alert.id);
  };

  const handleOpenChart = () => {
    setSelectedSymbol(alert.symbol);
    setCurrentPage('chart');
    window.location.hash = '#chart';
    onDismiss(alert.id);
  };

  const progressPct = autoDismissSeconds > 0 ? (timeLeft / autoDismissSeconds) * 100 : 0;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        width: 380,
        backgroundColor: '#0B132B',
        borderRadius: 12,
        border: `1.5px solid ${config.borderColor}`,
        boxShadow: `0 14px 35px rgba(0, 0, 0, 0.7), 0 0 25px ${config.glowColor}`,
        overflow: 'hidden',
        position: 'relative',
        animation: 'slideInAlert 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(16px)',
        userSelect: 'none',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: `linear-gradient(135deg, ${config.badgeBg} 0%, rgba(11, 19, 43, 0.95) 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: config.badgeBg,
              color: config.primaryColor,
              fontSize: 10.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              letterSpacing: '0.4px',
            }}
          >
            <Icon size={12} />
            {config.title}
          </div>
          <span style={{ fontSize: 10.5, color: '#94A3B8' }}>{alert.exchange}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handleOpenChart}
            title="Open Live Chart"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 3,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => onDismiss(alert.id)}
            title="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 3,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Symbol & LTP Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {alert.symbol}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
              {config.label}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: isBreakdown ? '#EF4444' : '#10B981',
                fontFamily: 'monospace',
              }}
            >
              ₹{alert.trigger_price.toFixed(2)}
            </div>
            {alert.change_pct !== undefined && alert.change_pct !== null && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: alert.change_pct >= 0 ? '#10B981' : '#EF4444',
                }}
              >
                {alert.change_pct >= 0 ? '▲ +' : '▼ '}{alert.change_pct.toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* Reference Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              {isBreakout ? 'Prev Day High' : isBreakdown ? 'Prev Day Low' : 'Upper Circuit'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#F1F5F9', marginTop: 1 }}>
              ₹{alert.reference_price.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              {isCircuit ? 'Circuit Progress' : 'Move Distance'}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: config.primaryColor,
                marginTop: 1,
              }}
            >
              {isCircuit
                ? `${alert.distance_pct ? alert.distance_pct.toFixed(1) : '80'}%`
                : `${alert.distance_pct !== undefined ? Math.abs(alert.distance_pct).toFixed(2) : '0.00'}%`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Volume
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#CBD5E1', marginTop: 1 }}>
              {alert.volume ? (alert.volume > 100000 ? `${(alert.volume / 100000).toFixed(1)}L` : alert.volume.toLocaleString('en-IN')) : 'Live'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <button
            type="button"
            onClick={handleOpenChart}
            className="btn btn-secondary"
            style={{
              flex: 1,
              height: 34,
              fontSize: 11.5,
              gap: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F1F5F9',
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={13} /> Chart
          </button>

          <button
            type="button"
            onClick={handleQuickTrade}
            style={{
              flex: 2,
              height: 34,
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: config.primaryColor,
              color: isBreakdown ? '#FFFFFF' : '#000000',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              boxShadow: `0 2px 10px ${config.glowColor}`,
            }}
          >
            <Icon size={13} /> {config.actionLabel}
          </button>

          <button
            type="button"
            onClick={() => onDismiss(alert.id)}
            style={{
              height: 34,
              padding: '0 10px',
              fontSize: 11,
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
        </div>
      </div>

      {/* Auto-dismiss countdown bar */}
      {autoDismissSeconds > 0 && (
        <div
          style={{
            height: 3,
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              backgroundColor: config.primaryColor,
              transition: isPaused ? 'none' : 'width 1000ms linear',
            }}
          />
        </div>
      )}
    </div>
  );
};

export interface AlertPopupProps {
  popups: PriceAlertData[];
  onDismiss: (id: number) => void;
  autoDismissSeconds?: number;
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
  popups,
  onDismiss,
  autoDismissSeconds = 12,
}) => {
  if (!popups || popups.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 12,
        pointerEvents: 'auto',
      }}
    >
      {popups.map((alert) => (
        <SingleAlertToast
          key={alert.id}
          alert={alert}
          autoDismissSeconds={autoDismissSeconds}
          onDismiss={onDismiss}
        />
      ))}

      <style>{`
        @keyframes slideInAlert {
          from {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
