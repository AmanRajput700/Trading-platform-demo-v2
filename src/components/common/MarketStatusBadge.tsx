import React, { useEffect, useState } from 'react';
import { Clock, Info } from 'lucide-react';
import { MarketStatus } from '../../types';
import { instrumentService } from '../../services/instrumentService';

export const MarketStatusBadge: React.FC = () => {
  const [market, setMarket] = useState<MarketStatus | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await instrumentService.getMarketStatus();
      setMarket(data);
    } catch (err) {
      console.warn('Failed to fetch market status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!market) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-sunken)',
        fontSize: 10.5,
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-tertiary)' }} />
        <span>Syncing Hours...</span>
      </div>
    );
  }

  const isOpen = market.is_open || market.status === 'OPEN';
  const isPreOpen = market.status === 'PRE_OPEN';
  const isPostClose = market.status === 'POST_CLOSE';
  const isClosed = market.status === 'CLOSED';

  // Styling based on market status
  let bgColor = 'rgba(239, 68, 68, 0.12)';
  let textColor = 'var(--negative)';
  let borderColor = 'rgba(239, 68, 68, 0.3)';
  let dotColor = 'var(--negative)';
  let label = 'MARKET CLOSED';

  if (isOpen) {
    bgColor = 'rgba(34, 197, 94, 0.12)';
    textColor = 'var(--positive)';
    borderColor = 'rgba(34, 197, 94, 0.3)';
    dotColor = 'var(--positive)';
    label = 'LIVE MARKET OPEN';
  } else if (isPreOpen) {
    bgColor = 'rgba(245, 158, 11, 0.12)';
    textColor = 'var(--warning)';
    borderColor = 'rgba(245, 158, 11, 0.3)';
    dotColor = 'var(--warning)';
    label = 'PRE-MARKET (09:00 - 09:15)';
  } else if (isPostClose) {
    bgColor = 'rgba(245, 158, 11, 0.12)';
    textColor = 'var(--warning)';
    borderColor = 'rgba(245, 158, 11, 0.3)';
    dotColor = 'var(--warning)';
    label = 'POST-CLOSING (15:30 - 16:00)';
  } else if (isClosed) {
    if (market.is_holiday && market.holiday_name) {
      label = `HOLIDAY (${market.holiday_name})`;
    } else {
      label = 'MARKET CLOSED (AMO ACTIVE)';
    }
  }

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 9px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: bgColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          fontSize: 10.5,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 120ms ease'
        }}
      >
        {/* Blinking / Pulse Dot */}
        <span 
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: isOpen ? `0 0 6px ${dotColor}` : 'none',
            animation: isOpen ? 'pulse 1.8s infinite' : 'none'
          }} 
        />
        <span>{label}</span>
      </div>

      {/* Hover Info Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          width: 280,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-elevation)',
          padding: '10px 12px',
          zIndex: 50,
          fontSize: 11,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          animation: 'fadeIn 100ms ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: 'var(--text-primary)' }}>
            <Clock size={12} style={{ color: 'var(--accent-primary)' }} />
            <span>NSE Exchange Session Status</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: 10.5, lineHeight: 1.4, margin: 0 }}>
            {market.status_message}
          </p>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Equity Session:</span>
              <span className="mono" style={{ fontWeight: 600, color: isOpen ? 'var(--positive)' : 'var(--text-secondary)' }}>
                {market.segments?.equity || market.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: 'var(--text-tertiary)' }}>F&O Derivatives:</span>
              <span className="mono" style={{ fontWeight: 600, color: isOpen ? 'var(--positive)' : 'var(--text-secondary)' }}>
                {market.segments?.fno || market.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Trading Hours:</span>
              <span className="mono" style={{ fontWeight: 600 }}>09:15 – 15:30 IST</span>
            </div>
            {!isOpen && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 2, color: 'var(--accent-primary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Info size={10} />
                  <span>After Market Order (AMO):</span>
                </span>
                <span style={{ fontWeight: 700 }}>Queued for 09:15 AM</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
