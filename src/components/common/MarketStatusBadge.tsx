import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { marketSessionService, MarketSessionInfo } from '../../services/marketSessionService';


export const MarketStatusBadge: React.FC = () => {
  const [session, setSession] = useState<MarketSessionInfo | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await marketSessionService.getSessionStatus();
      setSession(data);
    } catch (err) {
      console.warn('Failed to fetch market status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!session) {
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
        <span>Checking Hours (IST)...</span>
      </div>
    );
  }

  const isOpen = session.is_open || session.session_type === 'OPEN';
  const isPreOpen = session.session_type === 'PRE_OPEN';
  const isPostClose = session.session_type === 'POST_CLOSE';
  const isWeekend = session.session_type === 'WEEKEND';
  const isHoliday = session.session_type === 'HOLIDAY';

  // Styling based on authoritative market session status
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
    label = 'POST-CLOSING (15:30 - 15:40)';
  } else if (isWeekend) {
    label = 'CLOSED (WEEKEND)';
  } else if (isHoliday) {
    label = 'CLOSED (NSE HOLIDAY)';
  } else {
    label = 'MARKET CLOSED';
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

      {/* Tooltip Overlay */}
      {showTooltip && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            padding: '10px 12px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            fontSize: 11,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700, color: 'var(--text-primary)' }}>
            <Clock size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>NSE/BSE Trading Schedule (IST)</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pre-Open:</span>
              <strong style={{ color: 'var(--text-primary)' }}>09:00 - 09:15</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Regular Trading:</span>
              <strong style={{ color: 'var(--positive)' }}>09:15 - 15:30</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Post-Close Auction:</span>
              <strong style={{ color: 'var(--text-primary)' }}>15:30 - 15:40</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Data Pipeline State:</span>
              <strong style={{ color: isOpen ? 'var(--positive)' : 'var(--negative)' }}>
                {isOpen ? 'STREAMING LIVE' : 'FROZEN AT CLOSE'}
              </strong>
            </div>
          </div>

          <div style={{
            marginTop: 8,
            paddingTop: 6,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 10,
            color: 'var(--text-tertiary)'
          }}>
            {isOpen 
              ? '● Sub-second live prices streaming from Upstox feed.' 
              : '● Market closed. Prices, OHLC, and indicators are frozen at last valid close snapshot.'}
          </div>
        </div>
      )}
    </div>
  );
};
