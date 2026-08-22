import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Sun, 
  Moon, 
  ExternalLink,
  X,
  Maximize2,
  ShieldAlert,
  Sliders,
  UserCheck,
  KeyRound,
  Code2,
  Building2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const TopBar: React.FC = () => {
  const { 
    indices, 
    instruments,
    setIsSearchOpen, 
    navigateToInstrument, 
    openQuickOrder,
    theme, 
    toggleTheme, 
    isKillSwitchActive, 
    setIsKillSwitchModalOpen, 
    notifications, 
    markAllNotificationsRead, 
    setCurrentPage,
    currentUser,
    openAuthModal,
    switchRole
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter instruments for live search dropdown
  const filteredInstruments = searchQuery.trim() === ''
    ? instruments.slice(0, 5)
    : instruments.filter(inst =>
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);

  const handleSelectInstrument = (symbol: string) => {
    navigateToInstrument(symbol);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

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
      zIndex: 30,
      gap: 'var(--space-4)'
    }}>
      {/* Left: Minimal Global Search with Interactive Dropdown */}
      <div 
        ref={searchContainerRef}
        style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          flex: '1 1 320px', 
          maxWidth: 380 
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          backgroundColor: isSearchFocused ? 'var(--bg-surface)' : 'var(--bg-sunken)',
          border: isSearchFocused ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
          boxShadow: isSearchFocused ? '0 0 0 2px var(--accent-light)' : 'none',
          borderRadius: 'var(--radius-md)',
          padding: '5px 10px',
          width: '100%',
          transition: 'all 120ms ease'
        }}>
          <Search size={13} style={{ color: isSearchFocused ? 'var(--accent-primary)' : 'var(--text-tertiary)', flexShrink: 0 }} />
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search symbols or options..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: 12,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              minWidth: 0
            }}
          />

          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-tertiary)'
              }}
              title="Clear search"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd style={{
              fontSize: 9.5,
              fontFamily: 'var(--font-mono)',
              backgroundColor: isSearchFocused ? 'var(--bg-sunken)' : 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 3,
              padding: '1px 5px',
              color: 'var(--text-tertiary)',
              flexShrink: 0
            }}>
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Minimal Search Dropdown Popover */}
        {isSearchFocused && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: 360,
            maxWidth: 440,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-elevation)',
            padding: '6px',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              <span>{searchQuery ? `Instruments (${filteredInstruments.length})` : 'Popular Assets'}</span>
              <button
                onClick={() => {
                  setIsSearchFocused(false);
                  setIsSearchOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  fontSize: 10.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span>Full Modal</span>
                <Maximize2 size={10} />
              </button>
            </div>

            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4 }}>
              {filteredInstruments.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 11 }}>
                  No results found for "{searchQuery}"
                </div>
              ) : (
                filteredInstruments.map(inst => {
                  const isPos = inst.change >= 0;
                  return (
                    <div
                      key={inst.symbol}
                      onClick={() => handleSelectInstrument(inst.symbol)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background-color 80ms ease'
                      }}
                      className="dropdown-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{inst.symbol}</span>
                            <span className="badge badge-neutral" style={{ fontSize: 8.5 }}>{inst.exchange}</span>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{inst.name}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>
                            ₹{inst.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                            {isPos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                            {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 3 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickOrder({
                                symbol: inst.symbol,
                                name: inst.name,
                                side: 'BUY',
                                price: inst.price,
                                initialQty: 10
                              });
                              setIsSearchFocused(false);
                            }}
                            className="btn btn-buy btn-sm"
                            style={{ height: 20, padding: '0 5px', fontSize: 9 }}
                          >
                            B
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickOrder({
                                symbol: inst.symbol,
                                name: inst.name,
                                side: 'SELL',
                                price: inst.price,
                                initialQty: 10
                              });
                              setIsSearchFocused(false);
                            }}
                            className="btn btn-sell btn-sm"
                            style={{ height: 20, padding: '0 5px', fontSize: 9 }}
                          >
                            S
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Center: Clean Indices Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        overflowX: 'auto',
        padding: '0 var(--space-2)'
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
                fontSize: 11.5,
                cursor: 'pointer',
                padding: '3px 6px',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap'
              }}
              className="hover-glow"
              title={`View ${idx.symbol}`}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{idx.symbol}</span>
              <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10.5, fontWeight: 500 }}>
                {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Right: Minimal, Friendly Controls (Market Status, Theme, Notifications, User) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', flexShrink: 0 }}>
        {/* Subtle Market Open Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--positive-bg)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--positive)',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--positive)' }} />
          <span>Market Open</span>
        </div>

        {/* Emergency Kill Switch (Compact / Subtle alert badge only when active) */}
        {isKillSwitchActive && (
          <button
            onClick={() => setIsKillSwitchModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 26,
              padding: '0 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--negative)',
              backgroundColor: 'var(--negative)',
              color: '#FFFFFF',
              animation: 'pulse 1.5s infinite',
              whiteSpace: 'nowrap'
            }}
            title="Trading is Halted! Click to resume"
          >
            <ShieldAlert size={12} />
            <span>HALTED</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ width: 30, height: 30, padding: 0, borderRadius: 'var(--radius-md)' }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={14} style={{ color: 'var(--warning)' }} /> : <Moon size={14} />}
        </button>

        {/* Notifications Bell */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost btn-sm"
            style={{ width: 30, height: 30, padding: 0, position: 'relative', borderRadius: 'var(--radius-md)' }}
            title="Notifications"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 5,
                right: 5,
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
              width: 300,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-elevation)',
              padding: 'var(--space-2)',
              zIndex: 40
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
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 10.5, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0' }}>
                {notifications.slice(0, 4).map(n => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '6px 8px', 
                      fontSize: 11, 
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: n.read ? 'transparent' : 'var(--bg-sunken)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                      <span className="mono text-muted" style={{ fontSize: 9.5 }}>{n.timestamp}</span>
                    </div>
                    <div className="text-secondary" style={{ marginTop: 2, fontSize: 10.5 }}>{n.message}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 6, textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setCurrentPage('notifications');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    width: '100%'
                  }}
                >
                  <span>View All Notifications</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Indicator */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-sunken)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'background-color 100ms ease'
            }}
            title={`Active User: ${currentUser.name} (${currentUser.roleLabel})`}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: currentUser.role === 'superadmin' ? '#FF5722' : currentUser.role === 'admin' ? '#008CFF' : '#00D09C',
              color: '#FFFFFF',
              fontSize: 9.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentUser.avatarText}
            </div>
            <span>{currentUser.name.split(' ')[0]}</span>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 3,
              backgroundColor: currentUser.role === 'superadmin' ? 'rgba(255, 87, 34, 0.15)' : currentUser.role === 'admin' ? 'rgba(0, 140, 255, 0.15)' : 'rgba(0, 208, 156, 0.15)',
              color: currentUser.role === 'superadmin' ? '#FF5722' : currentUser.role === 'admin' ? '#008CFF' : '#00D09C',
            }}>
              {currentUser.role === 'superadmin' ? 'DEV' : currentUser.role === 'admin' ? 'ADMIN' : 'USER'}
            </span>
            <ChevronDown size={11} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              width: 240,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-elevation)',
              padding: 6,
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              {/* Profile Header */}
              <div style={{
                padding: '8px 10px',
                backgroundColor: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: currentUser.role === 'superadmin' ? '#FF5722' : currentUser.role === 'admin' ? '#008CFF' : '#00D09C',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentUser.avatarText}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    {currentUser.roleLabel}
                  </div>
                </div>
              </div>

              {/* Quick Role Switchers */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '4px 6px 2px' }}>
                Switch User Role
              </div>

              <div
                onClick={() => {
                  switchRole('superadmin');
                  setShowUserMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: currentUser.role === 'superadmin' ? 'var(--accent-subtle)' : 'transparent',
                  fontSize: 11.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Code2 size={13} style={{ color: '#FF5722' }} />
                  <span>Superadmin (Dev)</span>
                </div>
                {currentUser.role === 'superadmin' && <span className="badge badge-positive" style={{ fontSize: 8 }}>Active</span>}
              </div>

              <div
                onClick={() => {
                  switchRole('admin');
                  setShowUserMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: currentUser.role === 'admin' ? 'var(--accent-subtle)' : 'transparent',
                  fontSize: 11.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} style={{ color: '#008CFF' }} />
                  <span>Admin (Client Desk)</span>
                </div>
                {currentUser.role === 'admin' && <span className="badge badge-positive" style={{ fontSize: 8 }}>Active</span>}
              </div>

              <div
                onClick={() => {
                  switchRole('user');
                  setShowUserMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: currentUser.role === 'user' ? 'var(--accent-subtle)' : 'transparent',
                  fontSize: 11.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={13} style={{ color: '#00D09C' }} />
                  <span>Standard Trader (User)</span>
                </div>
                {currentUser.role === 'user' && <span className="badge badge-positive" style={{ fontSize: 8 }}>Active</span>}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '2px 0' }} />

              <div 
                onClick={() => {
                  setShowUserMenu(false);
                  openAuthModal();
                }}
                className="dropdown-item"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 11.5, borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--accent-primary)' }}
              >
                <KeyRound size={13} />
                <span>Custom Login / Manage Auth</span>
              </div>

              <div 
                onClick={() => {
                  setShowUserMenu(false);
                  setCurrentPage('settings');
                }}
                className="dropdown-item"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 11.5, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                <Sliders size={13} style={{ color: 'var(--text-secondary)' }} />
                <span>Terminal Settings</span>
              </div>

              <div 
                onClick={() => {
                  setShowUserMenu(false);
                  setIsKillSwitchModalOpen(true);
                }}
                className="dropdown-item"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 11.5, borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--negative)' }}
              >
                <ShieldAlert size={13} />
                <span>Emergency Kill Switch</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
