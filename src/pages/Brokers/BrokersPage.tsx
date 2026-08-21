import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Zap 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { BrokerState } from '../../types';

import { PageHeader } from '../../components/common/PageHeader';

export const BrokersPage: React.FC = () => {
  const { brokerState, setBrokerState, addToast, strategies } = useTrading();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const activeStrategiesCount = strategies.filter(s => s.status === 'ACTIVE').length;

  const handleConnect = () => {
    setBrokerState('Connected');
    addToast({
      type: 'success',
      title: 'Broker Connected',
      message: 'Zerodha Kite adapter linked. Client session active with Direct DMA execution.'
    });
  };

  const handleDisconnect = () => {
    if (activeStrategiesCount > 0 && !showDisconnectModal) {
      setShowDisconnectModal(true);
      return;
    }
    setShowDisconnectModal(false);
    setBrokerState('Not Connected');
    addToast({
      type: 'info',
      title: 'Broker Disconnected',
      message: 'Broker session terminated. Live order placement is inactive.'
    });
  };

  const handleReconnect = () => {
    setBrokerState('Connected');
    addToast({
      type: 'success',
      title: 'Session Restored',
      message: 'Broker OAuth token refreshed and re-validated for live trading.'
    });
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1040, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Broker Connection & Gateway"
        subtitle="Zerodha Kite Connect & DMA adapter for automated execution and margin synchronization"
        badge={{
          text: brokerState,
          variant: brokerState === 'Connected' ? 'positive' : brokerState === 'Session Expired' ? 'warning' : 'neutral'
        }}
        actions={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'var(--bg-sunken)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)'
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Demo State:</span>
            {(['Connected', 'Not Connected', 'Session Expired'] as BrokerState[]).map(st => (
              <button
                key={st}
                onClick={() => {
                  setBrokerState(st);
                  addToast({
                    type: 'info',
                    title: 'Demo State Changed',
                    message: `Broker status set to: ${st}`
                  });
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  height: 22,
                  fontSize: 10,
                  backgroundColor: brokerState === st ? 'var(--text-primary)' : 'transparent',
                  color: brokerState === st ? '#FFFFFF' : 'var(--text-secondary)',
                  border: brokerState === st ? 'none' : '1px solid var(--border-default)'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        }
      />

      {/* Main Connection State Cards (V1 Concept: 3 Distinct States) */}

      {/* State 1: CONNECTED */}
      {brokerState === 'Connected' && (
        <div className="surface-card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--positive-bg)',
                color: 'var(--positive)',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--positive-border)'
              }}>
                ZK
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Zerodha Kite Connect</h3>
                  <span className="badge badge-positive" style={{ fontSize: 10 }}>Connected · Live</span>
                </div>
                <div className="mono text-secondary" style={{ fontSize: 12, marginTop: 2 }}>
                  Account: ****1234 (Client ID: ZR8942)
                </div>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--negative)', borderColor: 'var(--border-default)' }}
            >
              Disconnect Broker
            </button>
          </div>

          {/* Connection Status Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            backgroundColor: 'var(--bg-sunken)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 12
          }}>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>OAuth Session Token</div>
              <div className="mono text-positive" style={{ fontWeight: 600, marginTop: 2 }}>Active (Valid until 15:30 IST)</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Execution Route</div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>Direct Market Access (DMA)</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Order Latency</div>
              <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>12ms (NSE Co-location)</div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: 10 }}>Last Synchronization</div>
              <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>10:42:18 AM</div>
            </div>
          </div>
        </div>
      )}

      {/* State 2: NOT CONNECTED */}
      {brokerState === 'Not Connected' && (
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            <Lock size={20} />
          </div>

          <div style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Connect Your Broker Account</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>
              Connect your supported Indian trading account (Zerodha Kite, Angel One) to enable automated strategy execution, real-time margin checks, and live order placement.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              onClick={handleConnect}
              className="btn btn-primary"
              style={{ padding: '0 20px', height: 34, fontWeight: 700, gap: 6 }}
            >
              <Zap size={14} />
              <span>Connect Zerodha Kite</span>
            </button>
            <button
              onClick={handleConnect}
              className="btn btn-secondary"
              style={{ padding: '0 16px', height: 34 }}
            >
              Connect Angel One
            </button>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
            Simulated OAuth authentication. No real broker credentials required for demo.
          </div>
        </div>
      )}

      {/* State 3: SESSION EXPIRED */}
      {brokerState === 'Session Expired' && (
        <div className="surface-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, borderColor: 'var(--warning-border)' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--warning)'
          }}>
            <AlertTriangle size={22} />
          </div>

          <div style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)' }}>Broker Session Expired</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>
              Your Zerodha Kite session token has expired per exchange daily compliance rules (15:30 IST rollover). Reconnect your account to continue live trading.
            </p>
          </div>

          <button
            onClick={handleReconnect}
            className="btn btn-primary"
            style={{ padding: '0 22px', height: 36, fontWeight: 700, gap: 6 }}
          >
            <RefreshCw size={14} />
            <span>Reconnect Account</span>
          </button>
        </div>
      )}

      {/* Architecture & Security Note */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          Broker Gateway Security & Risk Controls
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          All orders routed via the AuraTrade bridge adhere to SEBI algo trading mandates. Credentials and tokens are stored in memory only. Pre-trade risk controls enforce daily loss limits, maximum order quantities, and kill switch rules prior to dispatch.
        </p>
      </div>

      {/* High-Risk Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 14, 20, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--negative)' }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Active Strategies Running</span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              You have <strong>{activeStrategiesCount} active strategy(ies)</strong> currently monitoring markets. Disconnecting the broker will stop live order routing for these strategies.
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Keep Connected
              </button>
              <button
                onClick={handleDisconnect}
                className="btn btn-sell"
                style={{ flex: 1.2, fontWeight: 700 }}
              >
                Disconnect Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
