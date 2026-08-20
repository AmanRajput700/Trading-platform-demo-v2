import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, TrendingUp, TrendingDown, ChevronDown, Check } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const TopBar: React.FC = () => {
  const { indices, setIsSearchOpen, toasts, navigateToInstrument } = useTrading();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-4)',
      position: 'sticky',
      top: 0,
      zIndex: 15
    }}>
      {/* Left / Search trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, maxWidth: 520 }}>
        <div 
          onClick={() => setIsSearchOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            width: '100%',
            cursor: 'pointer',
            transition: 'border-color 120ms ease',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
        >
          <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: 12, flex: 1 }}>Search stocks, indices, options... (e.g. RELIANCE, NIFTY)</span>
          <kbd style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 3,
            padding: '1px 5px',
            color: 'var(--text-tertiary)'
          }}>
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Center Indices Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        overflowX: 'auto',
        padding: '0 var(--space-3)'
      }}>
        {indices.slice(0, 3).map(idx => {
          const isPos = idx.change >= 0;
          return (
            <div 
              key={idx.symbol}
              onClick={() => {
                if (idx.symbol === 'NIFTY 50') navigateToInstrument('RELIANCE');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{idx.symbol}</span>
              <span className="mono" style={{ fontWeight: 500 }}>
                {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', position: 'relative' }}>
        {/* Market Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--positive-bg)',
          border: '1px solid var(--positive-border)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--positive)'
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--positive)',
            display: 'inline-block'
          }} />
          <span>NSE: OPEN</span>
        </div>

        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost"
            style={{ width: 32, height: 32, padding: 0, position: 'relative' }}
            title="Notifications"
          >
            <Bell size={16} />
            {toasts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                backgroundColor: 'var(--accent-primary)',
                borderRadius: '50%'
              }} />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              width: 280,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-elevation)',
              padding: 'var(--space-2)',
              zIndex: 30
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 8px 8px',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: 12,
                fontWeight: 600
              }}>
                <span>System Updates</span>
                <span className="text-muted" style={{ fontSize: 10 }}>Live</span>
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0' }}>
                <div style={{ padding: '6px 8px', fontSize: 11, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--positive)' }}>Market Feed Connected</div>
                  <div className="text-secondary" style={{ marginTop: 2 }}>NSE live ticks synchronized.</div>
                </div>
                <div style={{ padding: '6px 8px', fontSize: 11, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Broker Zerodha Active</div>
                  <div className="text-secondary" style={{ marginTop: 2 }}>Account ZR8942 connected.</div>
                </div>
                <div style={{ padding: '6px 8px', fontSize: 11 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Scanner Ready</div>
                  <div className="text-secondary" style={{ marginTop: 2 }}>3 strategies loaded.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill / Menu */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-sunken)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'var(--text-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 600
            }}>
              AR
            </div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Aman R.</div>
            <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }} />
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              width: 200,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-elevation)',
              padding: 'var(--space-2)',
              zIndex: 30
            }}>
              <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>Aman Rajput</div>
                <div className="mono text-muted" style={{ fontSize: 10 }}>Client ID: ZR8942</div>
              </div>
              <div style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12, color: 'var(--positive)' }}>
                  <ShieldCheck size={14} />
                  <span>2FA Authenticated</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Check size={14} />
                  <span>Equity / F&O Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
