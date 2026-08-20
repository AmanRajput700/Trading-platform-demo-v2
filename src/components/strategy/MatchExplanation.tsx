import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { SignalType } from '../../types';

interface MatchExplanationProps {
  strategyName: string;
  signal: SignalType;
  reasons: string[];
  matchScore: string;
  matchedTime?: string;
  rsi?: number;
  ema20?: number;
  volumeRatio?: number;
}

export const MatchExplanation: React.FC<MatchExplanationProps> = ({
  strategyName,
  signal,
  reasons,
  matchScore,
  matchedTime = '10:31 AM',
  rsi,
  ema20,
  volumeRatio
}) => {
  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';
  const isWatch = signal === 'WATCH';

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            Why This Matched
          </span>
          <span className="badge badge-neutral" style={{ fontSize: 9 }}>{strategyName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="mono text-muted" style={{ fontSize: 10 }}>Score: {matchScore}</span>
          <span className={`badge ${isBuy ? 'badge-positive' : isSell ? 'badge-negative' : 'badge-warning'}`}>
            Signal: {signal}
          </span>
        </div>
      </div>

      {/* Checklist of Reasons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {reasons.map((reason, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: isBuy ? 'var(--positive-bg)' : isWatch ? 'var(--warning-bg)' : 'var(--negative-bg)',
              border: `1px solid ${isBuy ? 'var(--positive-border)' : isWatch ? 'var(--warning-border)' : 'var(--negative-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1
            }}>
              {isWatch ? (
                <AlertCircle size={10} style={{ color: 'var(--warning)' }} />
              ) : (
                <Check size={10} style={{ color: isBuy ? 'var(--positive)' : 'var(--negative)' }} />
              )}
            </div>
            <span style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}>
              {reason}
            </span>
          </div>
        ))}
      </div>

      {/* Live Indicator Snapshot */}
      {(rsi !== undefined || ema20 !== undefined || volumeRatio !== undefined) && (
        <div style={{
          backgroundColor: 'var(--bg-sunken)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          marginTop: 2
        }}>
          {rsi !== undefined && (
            <div>
              <span className="text-secondary">RSI(14): </span>
              <span className="mono" style={{ fontWeight: 600 }}>{rsi.toFixed(1)}</span>
            </div>
          )}
          {ema20 !== undefined && (
            <div>
              <span className="text-secondary">EMA 20: </span>
              <span className="mono" style={{ fontWeight: 600 }}>₹{ema20.toFixed(2)}</span>
            </div>
          )}
          {volumeRatio !== undefined && (
            <div>
              <span className="text-secondary">Vol Ratio: </span>
              <span className="mono" style={{ fontWeight: 600 }}>{volumeRatio.toFixed(1)}x</span>
            </div>
          )}
        </div>
      )}

      {/* Sync Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'var(--text-tertiary)' }}>
        <span>Evaluated against 15m candle bar</span>
        <span className="mono">Last matched: {matchedTime}</span>
      </div>
    </div>
  );
};
