import React from 'react';
import { useTrading } from '../../context/TradingContext';

export const BrokersPage: React.FC = () => {
  const { brokers, toggleBrokerConnection, addToast } = useTrading();

  const handleToggle = (id: string, name: string, isConnected: boolean) => {
    toggleBrokerConnection(id);
    addToast({
      type: isConnected ? 'info' : 'success',
      title: isConnected ? 'Broker Disconnected' : 'Broker Connected',
      message: isConnected 
        ? `${name} session terminated.` 
        : `Successfully linked ${name} trading adapter with full simulated order routing.`
    });
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1040, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Broker Integrations & Adapters</h1>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          Connect real or simulated Indian broker accounts for automated order routing and live margin sync
        </p>
      </div>

      {/* Broker List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {brokers.map(broker => (
          <div
            key={broker.id}
            className="surface-card"
            style={{
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: broker.connected ? 'var(--accent-light)' : 'var(--bg-sunken)',
                    color: broker.connected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-default)'
                  }}>
                    {broker.logoText}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>{broker.name}</h3>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {broker.connected ? `Client ID: ${broker.accountNumber}` : 'REST & WebSocket API'}
                    </div>
                  </div>
                </div>

                <span className={`badge ${broker.connected ? 'badge-positive' : 'badge-neutral'}`}>
                  {broker.status}
                </span>
              </div>

              {broker.connected ? (
                <div style={{
                  backgroundColor: 'var(--bg-sunken)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  fontSize: 11
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Token Validity:</span>
                    <span className="mono text-positive">Active (Valid until 15:30)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Last Sync:</span>
                    <span className="mono">{broker.lastSync || '10:42:18 AM'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Order Routing:</span>
                    <span>Direct DMA</span>
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'var(--bg-sunken)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  marginTop: 12,
                  fontSize: 11,
                  color: 'var(--text-secondary)'
                }}>
                  API keys not configured. Click Connect to link via simulated OAuth.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <button
                onClick={() => handleToggle(broker.id, broker.name, broker.connected)}
                className={`btn ${broker.connected ? 'btn-secondary' : 'btn-primary'}`}
                style={{ flex: 1, fontSize: 12 }}
              >
                {broker.connected ? 'Disconnect' : 'Connect Account'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Note (Section 16 Mandate) */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          System Architecture — Broker Adapter Layer
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          The AuraTrade frontend communicates with a unified Trading Backend adapter. Broker-specific APIs (Zerodha Kite Connect, Groww, Angel One SmartAPI, Upstox API) are abstracted behind standardized order execution and market data contracts.
        </p>
        <div className="mono" style={{
          backgroundColor: 'var(--bg-sunken)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 11,
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)'
        }}>
          Frontend (React) ➔ Trading Backend Adapter ➔ Normalized Broker API ➔ Exchange (NSE/BSE)
        </div>
      </div>
    </div>
  );
};
