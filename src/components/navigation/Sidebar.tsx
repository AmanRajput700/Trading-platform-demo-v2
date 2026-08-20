import React from 'react';
import { 
  LayoutDashboard, 
  Binary, 
  TrendingUp, 
  ListOrdered, 
  Briefcase, 
  PieChart, 
  Wallet, 
  Link2, 
  Settings, 
  PlusCircle,
  Layers
} from 'lucide-react';
import { useTrading, PageId } from '../../context/TradingContext';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, setCurrentStrategyId } = useTrading();

  const primaryNav: { id: PageId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'strategies', label: 'Strategies', icon: Binary },
    { id: 'market', label: 'Market', icon: TrendingUp },
    { id: 'options', label: 'Option Chain', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ListOrdered },
    { id: 'positions', label: 'Positions', icon: Briefcase },
    { id: 'holdings', label: 'Holdings', icon: PieChart },
  ];

  const secondaryNav: { id: PageId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'funds', label: 'Funds & Margin', icon: Wallet },
    { id: 'brokers', label: 'Broker Accounts', icon: Link2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleCreateStrategy = () => {
    setCurrentStrategyId(null);
    setCurrentPage('strategy-builder');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-sunken)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      position: 'sticky',
      top: 0,
      userSelect: 'none',
      zIndex: 20
    }}>
      <div>
        {/* Brand / Logo */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
          gap: 'var(--space-2)'
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '-0.02em'
          }}>
            A
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              AuraTrade
            </div>
            <div style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: 500
            }}>
              NSE / BSE Terminal
            </div>
          </div>
        </div>

        {/* Action Button: Create Strategy */}
        <div style={{ padding: 'var(--space-3) var(--space-3) var(--space-2)' }}>
          <button
            onClick={handleCreateStrategy}
            className="btn btn-primary"
            style={{
              width: '100%',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              height: 32
            }}
          >
            <PlusCircle size={15} />
            <span>Create Strategy</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <div style={{ padding: 'var(--space-2) var(--space-2)' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '4px 8px 6px'
          }}>
            Trading
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {primaryNav.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || 
                (item.id === 'strategies' && (currentPage === 'strategy-builder' || currentPage === 'strategy-results')) ||
                (item.id === 'market' && currentPage === 'instrument');

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 12.5,
                    border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div style={{ padding: 'var(--space-2) var(--space-2)' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '6px 8px 4px'
          }}>
            Account & System
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {secondaryNav.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 12.5,
                    border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderTop: '1px solid var(--border-default)',
        fontSize: 11,
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Demo Mode</span>
          <span className="badge badge-neutral" style={{ fontSize: 9 }}>Simulated</span>
        </div>
        <div className="mono text-muted" style={{ fontSize: 10 }}>
          NSE Feed: Real-time (Mock)
        </div>
      </div>
    </aside>
  );
};
