import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  Clock,
  Flame,
  ShieldAlert,
  X,
  Zap,
} from 'lucide-react';

import { CircuitSignalData } from '../../types/circuit';
import { circuitService } from '../../services/circuitService';
import { useTrading } from '../../context/TradingContext';

interface CircuitSignalPopupProps {
  signal: CircuitSignalData | null;
  onClose: () => void;
  onReviewBuy: (signal: CircuitSignalData) => void;
}

export const CircuitSignalPopup: React.FC<CircuitSignalPopupProps> = ({
  signal,
  onClose,
  onReviewBuy,
}) => {
  const { setSelectedSymbol } = useTrading();
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play sound chime on mount
  useEffect(() => {
    if (!signal) return;

    // Reset countdown based on confidence tier
    const initialSeconds =
      signal.status_label === 'HIGH_CONFIDENCE'
        ? 45
        : signal.status_label === 'MEDIUM_CONFIDENCE'
        ? 30
        : signal.status_label === 'CIRCUIT_LOCK_WARNING'
        ? 0 // Sticky — no auto-dismiss
        : 15;

    setTimeLeft(initialSeconds);

    // Audio chime synthesis via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(signal.status_label === 'CIRCUIT_LOCK_WARNING' ? 440 : 880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay policy fallback
    }

    if (initialSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [signal]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!signal) return null;

  const isLockWarning = signal.status_label === 'CIRCUIT_LOCK_WARNING';
  const isHighConfidence = signal.status_label === 'HIGH_CONFIDENCE';
  const isLowRR = signal.status_label === 'LOW_RR_WARNING';

  // Dynamic Theme Colors
  const borderColor = isLockWarning
    ? 'rgba(239, 68, 68, 0.8)'
    : isHighConfidence
    ? 'rgba(245, 158, 11, 0.9)'
    : isLowRR
    ? 'rgba(148, 163, 184, 0.6)'
    : 'rgba(56, 189, 248, 0.8)';

  const badgeBg = isLockWarning
    ? 'rgba(239, 68, 68, 0.15)'
    : isHighConfidence
    ? 'rgba(245, 158, 11, 0.15)'
    : isLowRR
    ? 'rgba(148, 163, 184, 0.15)'
    : 'rgba(56, 189, 248, 0.15)';

  const badgeColor = isLockWarning
    ? '#EF4444'
    : isHighConfidence
    ? '#F59E0B'
    : isLowRR
    ? '#94A3B8'
    : '#38BDF8';

  const handleSkip = async () => {
    if (signal.id) {
      await circuitService.updateSignalAction(signal.id, 'skipped');
    }
    onClose();
  };

  const handleViewChart = () => {
    setSelectedSymbol(signal.symbol);
    window.location.hash = '#chart';
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 380,
        zIndex: 100,
        backgroundColor: '#0F172A',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 14,
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.65), 0 0 25px rgba(245, 158, 11, 0.15)',
        overflow: 'hidden',
        animation: 'slideUp 240ms ease-out',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.2) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: '2px 8px',
              borderRadius: 6,
              backgroundColor: badgeBg,
              color: badgeColor,
              fontSize: 10.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              letterSpacing: '0.4px',
            }}
          >
            {isLockWarning ? (
              <ShieldAlert size={12} />
            ) : isHighConfidence ? (
              <Flame size={12} />
            ) : (
              <Zap size={12} />
            )}
            {isLockWarning
              ? 'CIRCUIT LOCK WARNING'
              : isHighConfidence
              ? 'S0 HIGH CONFIDENCE'
              : isLowRR
              ? 'LOW R:R ALERT'
              : 'S0 MOMENTUM'}
          </div>
          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
            Score: {signal.quality_score}/100
          </span>
        </div>
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Symbol & Price Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>{signal.symbol}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#94A3B8',
                }}
              >
                NSE EQ
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Prev Close: ₹{signal.previous_close.toFixed(2)} • Band: {signal.price_band_pct}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>
              ₹{signal.live_price.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>
              ▲ +{signal.change_pct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Circuit Progress Bar */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              fontWeight: 600,
              color: '#94A3B8',
              marginBottom: 4,
            }}
          >
            <span>Circuit Progress</span>
            <span style={{ color: '#F59E0B', fontWeight: 800 }}>
              {signal.circuit_progress_pct.toFixed(1)}% / 100%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, signal.circuit_progress_pct))}%`,
                height: '100%',
                background: isLockWarning
                  ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                  : 'linear-gradient(90deg, #10B981, #F59E0B)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {/* Execution Levels Grid */}
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
              Stop Loss
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#EF4444', marginTop: 1 }}>
              ₹{signal.stop_loss_price.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Target (95%)
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981', marginTop: 1 }}>
              ₹{signal.target_price.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              R:R Ratio
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: signal.risk_reward_ratio >= 1.8 ? '#10B981' : '#F59E0B',
                marginTop: 1,
              }}
            >
              {signal.risk_reward_ratio.toFixed(2)}:1
            </div>
          </div>
        </div>

        {/* Warning or Tradable Info */}
        {isLockWarning ? (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: 11,
              color: '#F87171',
              lineHeight: 1.4,
            }}
          >
            ⚠️ Stock is at/near 100% Upper Circuit. No sellers available. Do NOT chase.
          </div>
        ) : (
          <div style={{ fontSize: 10.5, color: '#64748B', lineHeight: 1.4 }}>
            💡 Zero autonomous order routing. Requires your explicit manual authorization.
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <button
            type="button"
            onClick={handleViewChart}
            className="btn btn-secondary"
            style={{ flex: 1, height: 36, fontSize: 11.5, gap: 4 }}
          >
            <ArrowUpRight size={13} /> Chart
          </button>
          {!isLockWarning && (
            <button
              type="button"
              onClick={() => onReviewBuy(signal)}
              className="btn btn-primary"
              style={{
                flex: 2,
                height: 36,
                fontSize: 12.5,
                fontWeight: 700,
                gap: 6,
                backgroundColor: isHighConfidence ? '#F59E0B' : '#00D09C',
                color: '#000000',
              }}
            >
              <Zap size={14} /> Review & Buy
            </button>
          )}
          <button
            type="button"
            onClick={handleSkip}
            className="btn btn-secondary"
            style={{ flex: 1, height: 36, fontSize: 11.5 }}
          >
            Skip
          </button>
        </div>

        {/* Countdown Footer */}
        {timeLeft > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: 10,
              color: '#64748B',
            }}
          >
            <Clock size={10} /> Auto-dismissing in {timeLeft}s
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
