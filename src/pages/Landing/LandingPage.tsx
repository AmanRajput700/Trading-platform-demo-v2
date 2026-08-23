import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Code2, 
  LineChart, 
  Layers, 
  ArrowRight, 
  Server, 
  Building2, 
  User, 
  Database,
  Sun,
  Moon,
  Play
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const LandingPage: React.FC = () => {
  const { 
    indices, 
    openAuthModal, 
    theme, 
    toggleTheme, 
    switchRole,
    isBackendConnected
  } = useTrading();

  const handleLaunchDemo = (role: 'superadmin' | 'admin' | 'user' = 'superadmin') => {
    switchRole(role);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* 1. TOP ANNOUNCEMENT / MARKET TICKER STRIP */}
      <div style={{
        backgroundColor: 'var(--bg-sunken)',
        borderBottom: '1px solid var(--border-default)',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11.5,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--accent-primary)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--positive)', display: 'inline-block' }} />
            <span>NSE/BSE LIVE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {indices.map(idx => {
              const isPos = idx.change >= 0;
              return (
                <div key={idx.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{idx.name}:</span>
                  <span className="mono" style={{ fontWeight: 700 }}>
                    ₹{idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                    {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: isBackendConnected ? 'var(--positive)' : 'var(--text-tertiary)', fontSize: 10.5 }}>
            <Server size={11} />
            <span>{isBackendConnected ? 'API V1 Online (Port 8000)' : 'Backend API V1 Ready'}</span>
          </div>
        </div>
      </div>

      {/* 2. PUBLIC NAVIGATION HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(11, 14, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 16,
            boxShadow: '0 0 20px rgba(0, 208, 156, 0.35)'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Aura<span style={{ color: 'var(--accent-primary)' }}>Trade</span>
              </span>
              <span className="badge badge-accent" style={{ fontSize: 9, padding: '1px 5px' }}>v1.0</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>
              Next-Gen Algorithmic Trading DMA Terminal
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, fontWeight: 600 }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 120ms' }}>Features</a>
          <a href="#strategy-engine" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 120ms' }}>Algo Engine</a>
          <a href="#brokers" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 120ms' }}>Brokers</a>
          <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 120ms' }}>Risk & Security</a>
        </nav>

        {/* Auth CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            style={{ width: 32, height: 32, padding: 0 }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: 'var(--warning)' }} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => openAuthModal('LOGIN')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0 16px', height: 34, fontSize: 12.5, fontWeight: 700 }}
          >
            Sign In
          </button>

          <button
            onClick={() => openAuthModal('REGISTER')}
            className="btn btn-primary btn-sm"
            style={{ padding: '0 18px', height: 34, fontSize: 12.5, fontWeight: 700, gap: 6 }}
          >
            <span>Open Account</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section style={{
        padding: '72px 24px 48px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow backdrop effect */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 350,
          background: 'radial-gradient(circle, rgba(0, 208, 156, 0.12) 0%, rgba(0, 140, 255, 0.05) 50%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Hero Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px',
          borderRadius: 20,
          backgroundColor: 'var(--accent-subtle)',
          border: '1px solid rgba(0, 208, 156, 0.3)',
          color: 'var(--accent-primary)',
          fontSize: 11.5,
          fontWeight: 700,
          marginBottom: 20,
          zIndex: 1
        }}>
          <Zap size={13} />
          <span>Institutional Algorithmic Infrastructure for Indian Markets</span>
        </div>

        {/* Hero Headline */}
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 54px)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: 920,
          margin: '0 0 18px',
          zIndex: 1
        }}>
          Execute Algorithmic Alpha with <span style={{ color: 'var(--accent-primary)' }}>Ultra-Low Latency</span> Direct Market Access
        </h1>

        {/* Hero Description */}
        <p style={{
          fontSize: 16,
          color: 'var(--text-secondary)',
          maxWidth: 720,
          lineHeight: 1.6,
          margin: '0 0 32px',
          zIndex: 1
        }}>
          AuraTrade empowers quantitative traders, proprietary desks, and retail power users with zero-code strategy creation, real-time option Greek analytics, multi-broker routing, and robust multi-tenant risk controls.
        </p>

        {/* Primary CTA Button Group */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', zIndex: 1 }}>
          <button
            onClick={() => openAuthModal('REGISTER')}
            className="btn btn-primary"
            style={{ height: 44, padding: '0 28px', fontSize: 14, fontWeight: 700, gap: 8, boxShadow: '0 0 24px rgba(0, 208, 156, 0.3)' }}
          >
            <span>Start Free Paper & Live Trading</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => handleLaunchDemo('superadmin')}
            className="btn btn-secondary"
            style={{ height: 44, padding: '0 24px', fontSize: 14, fontWeight: 700, gap: 8 }}
          >
            <Play size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Launch 1-Click Interactive Demo</span>
          </button>
        </div>

        {/* 1-Click Quick Testing Roles Bar */}
        <div style={{
          marginTop: 24,
          padding: '12px 18px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          zIndex: 1
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Instant Testing Presets:
          </span>
          <button
            onClick={() => handleLaunchDemo('superadmin')}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, fontSize: 11 }}
          >
            <Code2 size={12} style={{ color: '#FF5722' }} />
            <span>Superadmin (Dev Desk)</span>
          </button>
          <button
            onClick={() => handleLaunchDemo('admin')}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, fontSize: 11 }}
          >
            <Building2 size={12} style={{ color: '#008CFF' }} />
            <span>Admin (Client Desk)</span>
          </button>
          <button
            onClick={() => handleLaunchDemo('user')}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, fontSize: 11 }}
          >
            <User size={12} style={{ color: '#00D09C' }} />
            <span>Standard Trader (User)</span>
          </button>
        </div>

        {/* Interactive Platform Mockup Preview */}
        <div style={{
          marginTop: 48,
          width: '100%',
          maxWidth: 1120,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          textAlign: 'left',
          zIndex: 1
        }}>
          {/* Mockup Header Bar */}
          <div style={{
            padding: '10px 16px',
            backgroundColor: 'var(--bg-sunken)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F', display: 'inline-block' }} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)', marginLeft: 8 }}>
                AuraTrade DMA Terminal — Multi-Strategy Scanner & Order Dispatch
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-positive" style={{ fontSize: 9 }}>DMA Link Active (0.84ms)</span>
              <span className="badge badge-neutral" style={{ fontSize: 9 }}>Paper Trading</span>
            </div>
          </div>

          {/* Mockup Body Content Preview */}
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>RELIANCE INDUSTRIES LTD</span>
                  <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: 10 }}>NSE: RELIANCE</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>₹2,450.50</div>
                  <div className="mono text-positive" style={{ fontSize: 11 }}>+₹24.80 (+1.02%)</div>
                </div>
              </div>

              {/* Mock Candle Chart & Strategy Trigger */}
              <div style={{
                height: 160,
                backgroundColor: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Indicator Overlay: EMA(20) &bull; EMA(50) &bull; RSI(14) = 64.2</span>
                  <span className="text-positive" style={{ fontWeight: 700 }}>Signal Trigger: BUY MATCH (3/3 Conditions Met)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
                  {[45, 52, 48, 60, 58, 65, 72, 70, 85, 80, 92, 98, 105, 110, 108, 120].map((h, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${h}%`,
                      backgroundColor: i % 3 === 0 ? 'var(--negative)' : 'var(--positive)',
                      borderRadius: 2,
                      opacity: 0.85
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Mock Quick Dispatch Panel */}
            <div style={{
              backgroundColor: 'var(--bg-sunken)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Fast DMA Execution Ticket
                </div>
                <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Product:</span>
                    <strong className="mono">MIS (Intraday)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Routing:</span>
                    <strong>Zerodha Kite DMA</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Latency:</span>
                    <strong className="text-positive">0.82ms</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openAuthModal('REGISTER')}
                className="btn btn-buy"
                style={{ width: '100%', height: 32, fontSize: 12, fontWeight: 700 }}
              >
                BUY 100 SHARES &bull; ₹2,45,050
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section id="features" style={{
        padding: '64px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
            Core Platform Capabilities
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 12px' }}>
            Built for Serious Quantitative & Algorithmic Traders
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Everything required to scan, backtest, and route algorithmic strategies across Indian cash and derivative markets.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {/* Card 1 */}
          <div className="surface-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Visual & Code Strategy Builder</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Create multi-condition rules with RSI, MACD, Bollinger Bands, Volume Surge, and Imbalance ratios. No complex programming required.
            </p>
          </div>

          {/* Card 2 */}
          <div className="surface-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0, 140, 255, 0.15)', color: '#008CFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Real-Time Option Chain & Greeks</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Full Nifty, Bank Nifty, and stock option chains with implied volatility (IV), open interest (OI) changes, Delta, and Gamma metrics.
            </p>
          </div>

          {/* Card 3 */}
          <div className="surface-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 87, 34, 0.15)', color: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>3-Tier Multi-Tenant Risk Control</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Role-based access control for Superadmins (Developers), Admins (Client Desks), and Retail Traders with instant account suspension controls.
            </p>
          </div>

          {/* Card 4 */}
          <div className="surface-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(156, 39, 176, 0.15)', color: '#AB47BC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Historical Backtesting Engine</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Test your algorithmic setups over 1M to 5Y historical market tick data with Sharpe Ratio, maximum drawdown, and win-rate expectancy.
            </p>
          </div>

          {/* Card 5 */}
          <div className="surface-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Multi-Broker DMA Gateway</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Connect Zerodha Kite, Angel One SmartAPI, Groww Invest, Motilal Oswal, and Upstox Pro with seamless TOTP authentication.
            </p>
          </div>

          {/* Card 6 */}
          <div className="surface-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0, 140, 255, 0.15)', color: '#008CFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>JWT Token Rotation Security</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Backend architecture with 15-minute access tokens and Redis-backed 7-day refresh token rotation to prevent session hijacking.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BROKER ECOSYSTEM */}
      <section id="brokers" style={{
        padding: '48px 24px',
        backgroundColor: 'var(--bg-sunken)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
            Integrated Broker Ecosystem
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            marginTop: 20,
            flexWrap: 'wrap',
            fontSize: 14,
            fontWeight: 700
          }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              Zerodha Kite Connect
            </div>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              Angel One SmartAPI
            </div>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              Groww Invest
            </div>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              Motilal Oswal DMA
            </div>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              Upstox Pro API
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <footer style={{
        padding: '48px 24px 32px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 14
          }}>
            ⚡
          </div>
          <span style={{ fontSize: 16, fontWeight: 800 }}>AuraTrade Algorithmic Trading</span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
          Algorithmic trading involves substantial risk of loss and is not suitable for all investors. All orders dispatched via AuraTrade adhere to SEBI guidelines and broker API terms.
        </p>

        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          <button
            onClick={() => openAuthModal('REGISTER')}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700 }}
          >
            Create Free Account
          </button>
          <button
            onClick={() => openAuthModal('LOGIN')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700 }}
          >
            Sign In to Terminal
          </button>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-default)', width: '100%', paddingTop: 16, marginTop: 12 }}>
          &copy; {new Date().getFullYear()} AuraTrade Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
