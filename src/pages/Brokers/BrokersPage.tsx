import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Zap, 
  Plus, 
  ShieldCheck, 
  ExternalLink, 
  KeyRound, 
  Activity,
  Trash2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { BrokerConnection } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const BrokersPage: React.FC = () => {
  const { 
    brokers, 
    openBrokerModal, 
    disconnectBroker, 
    strategies,
    portfolio
  } = useTrading();

  const [brokerToDisconnect, setBrokerToDisconnect] = useState<BrokerConnection | null>(null);

  const activeStrategiesCount = strategies.filter(s => s.status === 'ACTIVE').length;
  const connectedBrokers = brokers.filter(b => b.connected);

  const handleDisconnectClick = (broker: BrokerConnection) => {
    if (activeStrategiesCount > 0) {
      setBrokerToDisconnect(broker);
    } else {
      disconnectBroker(broker.id);
    }
  };

  const confirmDisconnect = () => {
    if (brokerToDisconnect) {
      disconnectBroker(brokerToDisconnect.id);
      setBrokerToDisconnect(null);
    }
  };

  const handleReconnect = (broker: BrokerConnection) => {
    openBrokerModal(broker);
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1180, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Broker Gateways & Indian Demat Accounts"
        subtitle="Manage Direct Market Access (DMA) adapters for Zerodha, Angel One, Groww, Motilal Oswal & Upstox"
        badge={{
          text: `${connectedBrokers.length} Connected`,
          variant: connectedBrokers.length > 0 ? 'positive' : 'neutral'
        }}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => openBrokerModal(null)}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 600 }}
            >
              <Plus size={14} />
              <span>Connect New Broker</span>
            </button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="surface-card" style={{ padding: '14px 16px' }}>
          <div className="text-secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            Active Broker Adapters
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: connectedBrokers.length > 0 ? 'var(--positive)' : 'var(--text-primary)' }}>
            {connectedBrokers.length} / {brokers.length} Active
          </div>
          <div className="text-muted" style={{ fontSize: 10.5, marginTop: 2 }}>
            Supporting NSE, BSE, MCX & F&O segments
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 16px' }}>
          <div className="text-secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            Synced Trading Margin
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
            ₹{portfolio.availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10.5, marginTop: 2 }}>
            Real-time margin utilization check enabled
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 16px' }}>
          <div className="text-secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            Average Dispatch Latency
          </div>
          <div className="mono text-positive" style={{ fontSize: 20, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={18} />
            <span>12 ms</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10.5, marginTop: 2 }}>
            NSE BKC & BSE Colocation link
          </div>
        </div>

        <div className="surface-card" style={{ padding: '14px 16px' }}>
          <div className="text-secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            Pre-trade RMS Engine
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4, color: 'var(--positive)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} />
            <span>SEBI Compliant</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10.5, marginTop: 2 }}>
            Max daily loss & quantity limits enforced
          </div>
        </div>
      </div>

      {/* Section 1: CONNECTED BROKER ACCOUNTS */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Connected Broker Accounts ({connectedBrokers.length})</span>
          {connectedBrokers.length > 0 && (
            <span className="badge badge-positive" style={{ fontSize: 9.5 }}>Live Order Routing Active</span>
          )}
        </div>

        {connectedBrokers.length === 0 ? (
          <div className="surface-card" style={{
            padding: '32px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
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
            <div style={{ maxWidth: 440 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>No Indian Broker Account Connected</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Connect your Zerodha, Angel One, Groww, Motilal Oswal, or Upstox account to enable automated strategy execution and direct market order placement.
              </div>
            </div>
            <button
              onClick={() => openBrokerModal(null)}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 700, padding: '0 18px', height: 32 }}
            >
              <Zap size={14} />
              <span>Connect a Broker Now</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {connectedBrokers.map(b => (
              <div
                key={b.id}
                className="surface-card"
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  borderLeft: `4px solid ${b.brandColor || 'var(--positive)'}`
                }}
              >
                {/* Top Row: Logo, Name, Status, Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: (b.brandColor || '#FF5722') + '22',
                      color: b.brandColor || '#FF5722',
                      fontWeight: 700,
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${(b.brandColor || '#FF5722')}44`
                    }}>
                      {b.logoText}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{b.name}</h3>
                        <span className="badge badge-positive" style={{ fontSize: 10 }}>Connected · Live DMA</span>
                        <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>Client: {b.clientId || b.accountNumber}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                        {b.tagline || 'Direct API trading adapter'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => openBrokerModal(b)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: 5, fontSize: 11 }}
                      title="Update API Key / Secret"
                    >
                      <KeyRound size={12} />
                      <span>API Keys</span>
                    </button>

                    <button
                      onClick={() => handleReconnect(b)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: 5, fontSize: 11 }}
                      title="Refresh OAuth Session Token"
                    >
                      <RefreshCw size={12} />
                      <span>Refresh Token</span>
                    </button>

                    <button
                      onClick={() => handleDisconnectClick(b)}
                      className="btn btn-ghost btn-sm text-negative"
                      style={{ gap: 4, fontSize: 11, border: '1px solid var(--negative-border)' }}
                      title="Disconnect broker"
                    >
                      <Trash2 size={12} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>

                {/* Status Metric Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 10,
                  backgroundColor: 'var(--bg-sunken)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 11.5
                }}>
                  <div>
                    <div className="text-secondary" style={{ fontSize: 10 }}>OAuth Session Token</div>
                    <div className="mono text-positive" style={{ fontWeight: 600, marginTop: 2 }}>
                      Active (Valid till 15:30 IST)
                    </div>
                  </div>

                  <div>
                    <div className="text-secondary" style={{ fontSize: 10 }}>Execution Routing</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>
                      {b.executionRoute || 'Direct Market Access (DMA)'}
                    </div>
                  </div>

                  <div>
                    <div className="text-secondary" style={{ fontSize: 10 }}>Execution Latency</div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>
                      {b.latencyMs || 12} ms (NSE Co-location)
                    </div>
                  </div>

                  <div>
                    <div className="text-secondary" style={{ fontSize: 10 }}>Last Heartbeat</div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>
                      {b.lastSync || 'Just now'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: SUPPORTED WELL-KNOWN INDIAN BROKERS CATALOG */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Supported Indian Brokers ({brokers.length})</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Zerodha · Angel One · Groww · Motilal Oswal · Upstox
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
          {brokers.map(b => (
            <div
              key={b.id}
              className="surface-card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                opacity: b.connected ? 0.92 : 1
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: (b.brandColor || '#FF5722') + '22',
                      color: b.brandColor || '#FF5722',
                      fontWeight: 700,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${(b.brandColor || '#FF5722')}33`
                    }}>
                      {b.logoText}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{b.name}</div>
                      <div className="mono text-muted" style={{ fontSize: 10 }}>
                        {b.brokerType === 'ZERODHA' ? 'Kite Connect 3.0' : b.brokerType === 'ANGEL' ? 'SmartAPI v2' : b.brokerType === 'MOTILAL' ? 'MO Trader FIX API' : b.brokerType === 'GROWW' ? 'Groww API' : 'Upstox Pro API'}
                      </div>
                    </div>
                  </div>

                  {b.connected ? (
                    <span className="badge badge-positive" style={{ fontSize: 9.5 }}>Linked</span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>Ready to Link</span>
                  )}
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {b.tagline}
                </p>

                {/* Features */}
                {b.features && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {b.features.map((feat, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 9.5,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-sunken)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 10,
                marginTop: 2
              }}>
                {b.docUrl ? (
                  <a
                    href={b.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 10.5,
                      color: 'var(--accent-primary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>API Docs</span>
                    <ExternalLink size={10} />
                  </a>
                ) : <span />}

                {b.connected ? (
                  <button
                    onClick={() => openBrokerModal(b)}
                    className="btn btn-secondary btn-sm"
                    style={{ height: 26, fontSize: 11, fontWeight: 600 }}
                  >
                    Edit Keys
                  </button>
                ) : (
                  <button
                    onClick={() => openBrokerModal(b)}
                    className="btn btn-primary btn-sm"
                    style={{ height: 26, fontSize: 11, fontWeight: 700, gap: 4 }}
                  >
                    <Zap size={11} />
                    <span>Connect</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security and SEBI Regulatory Compliance Banner */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} style={{ color: 'var(--positive)' }} />
          <span>Broker Gateway Security & Risk Controls</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
          All orders routed via AuraTrade adhere to SEBI algorithmic trading guidelines. API Keys and TOTP secrets are stored in volatile session memory. Pre-trade Risk Management System (RMS) checks enforce daily drawdown stops, maximum order quantities, and kill switch rules prior to exchange dispatch.
        </p>
      </div>

      {/* Disconnect Confirmation Modal */}
      {brokerToDisconnect && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 14, 20, 0.7)',
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
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--negative)' }}>
              <AlertTriangle size={20} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Active Strategies Running</span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              You have <strong>{activeStrategiesCount} active strategy(ies)</strong> currently monitoring markets. Disconnecting <strong>{brokerToDisconnect.name}</strong> will stop live order routing for these strategies.
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                onClick={() => setBrokerToDisconnect(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Keep Connected
              </button>
              <button
                onClick={confirmDisconnect}
                className="btn btn-sell"
                style={{ flex: 1.2, fontWeight: 700 }}
              >
                Disconnect Gateway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
