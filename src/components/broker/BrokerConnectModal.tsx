import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Sparkles,
  Server,
  Activity
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { BrokerConnection } from '../../types';

export const BrokerConnectModal: React.FC = () => {
  const { 
    isBrokerModalOpen, 
    closeBrokerModal, 
    selectedBrokerForConnect, 
    brokers, 
    connectBrokerWithCredentials 
  } = useTrading();

  const [selectedBroker, setSelectedBroker] = useState<BrokerConnection | null>(null);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [password, setPassword] = useState('');
  const [environment, setEnvironment] = useState<'LIVE' | 'SANDBOX'>('LIVE');
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [step, setStep] = useState<'SELECT' | 'CREDENTIALS'>('SELECT');

  // When modal opens, configure based on selectedBrokerForConnect
  useEffect(() => {
    if (selectedBrokerForConnect) {
      setSelectedBroker(selectedBrokerForConnect);
      setClientId(selectedBrokerForConnect.clientId || selectedBrokerForConnect.credentials?.clientId || '');
      setApiKey(selectedBrokerForConnect.credentials?.apiKey || '');
      setApiSecret(selectedBrokerForConnect.credentials?.apiSecret || '');
      setTotpSecret(selectedBrokerForConnect.credentials?.totpSecret || '');
      setStep('CREDENTIALS');
    } else if (brokers.length > 0) {
      const firstBroker = brokers[0];
      setSelectedBroker(firstBroker);
      setClientId(firstBroker.clientId || '');
      setApiKey(firstBroker.credentials?.apiKey || '');
      setApiSecret(firstBroker.credentials?.apiSecret || '');
      setTotpSecret(firstBroker.credentials?.totpSecret || '');
      setStep('SELECT');
    }
    setTestSuccess(null);
    setIsTesting(false);
  }, [selectedBrokerForConnect, isBrokerModalOpen, brokers]);

  if (!isBrokerModalOpen) return null;

  const handleSelectBroker = (b: BrokerConnection) => {
    setSelectedBroker(b);
    setClientId(b.clientId || (b.id === 'broker-zerodha' ? 'ZR8942' : b.id === 'broker-angel' ? 'A128941' : b.id === 'broker-motilal' ? 'MO7891' : b.id === 'broker-groww' ? 'GW4920' : 'UP5810'));
    setApiKey(b.credentials?.apiKey || `${b.id.replace('broker-', '')}_live_key_983f4`);
    setApiSecret(b.credentials?.apiSecret || 'sec_89d3a772b109e44');
    setTotpSecret(b.credentials?.totpSecret || '194820');
    setStep('CREDENTIALS');
  };

  const handleFillDemoCredentials = () => {
    if (!selectedBroker) return;
    const prefix = selectedBroker.id.replace('broker-', '');
    setClientId(prefix === 'zerodha' ? 'ZR8942' : prefix === 'angel' ? 'A128941' : prefix === 'motilal' ? 'MO7891' : prefix === 'groww' ? 'GW4920' : 'UP5810');
    setApiKey(`${prefix}_live_api_884920b7`);
    setApiSecret('sec_auth_99f481c03387b9');
    setTotpSecret('492019');
    setPassword('Tr@der#2026!');
  };

  const handleTestAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBroker) return;

    setIsTesting(true);
    setTestSuccess(null);

    // Simulate API connection verification
    await new Promise(r => setTimeout(r, 700));

    setTestSuccess(true);
    await new Promise(r => setTimeout(r, 400));

    await connectBrokerWithCredentials(selectedBroker.id, {
      clientId: clientId || `${selectedBroker.logoText}${Math.floor(1000 + Math.random() * 9000)}`,
      apiKey,
      apiSecret,
      totpSecret,
      password,
      environment
    });

    setIsTesting(false);
    closeBrokerModal();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 14, 20, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 620,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: '92vh'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-sunken)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'CREDENTIALS' && !selectedBrokerForConnect && (
              <button
                type="button"
                onClick={() => setStep('SELECT')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4
                }}
                title="Back to Broker List"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                {step === 'SELECT' ? 'Connect Indian Broker Gateway' : `Connect ${selectedBroker?.name || 'Broker'}`}
              </h2>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {step === 'SELECT' 
                  ? 'Select your supported Indian demat/trading broker to link API credentials'
                  : 'Enter API credentials & authentications for direct DMA order dispatch'}
              </div>
            </div>
          </div>

          <button
            onClick={closeBrokerModal}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: 4,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* STEP 1: BROKER SELECTION */}
          {step === 'SELECT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select a Broker Gateway to link:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {brokers.map(b => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBroker(b)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-sunken)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-sunken)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: (b.brandColor || '#FF5722') + '1A',
                        color: b.brandColor || '#FF5722',
                        fontWeight: 700,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${(b.brandColor || '#FF5722')}33`
                      }}>
                        {b.logoText}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{b.name}</span>
                          {b.connected ? (
                            <span className="badge badge-positive" style={{ fontSize: 9.5 }}>Connected</span>
                          ) : (
                            <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>Available</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {b.tagline || 'Direct API execution for stocks & derivatives'}
                        </div>
                        {b.features && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            {b.features.slice(0, 3).map((f, i) => (
                              <span key={i} style={{ fontSize: 9.5, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="btn btn-secondary btn-sm" style={{ fontWeight: 600, fontSize: 11 }}>
                      {b.connected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CREDENTIALS FORM */}
          {step === 'CREDENTIALS' && selectedBroker && (
            <form onSubmit={handleTestAndConnect} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Selected Broker Quick Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: (selectedBroker.brandColor || '#FF5722') + '22',
                    color: selectedBroker.brandColor || '#FF5722',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedBroker.logoText}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedBroker.name} Gateway</div>
                    <div className="mono text-secondary" style={{ fontSize: 10.5 }}>
                      Adapter Route: {selectedBroker.executionRoute || 'Direct Market Access'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 4, fontSize: 10.5, height: 26 }}
                >
                  <Sparkles size={11} style={{ color: 'var(--accent-primary)' }} />
                  <span>Fill Demo Keys</span>
                </button>
              </div>

              {/* Environment Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setEnvironment('LIVE')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: environment === 'LIVE' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    backgroundColor: environment === 'LIVE' ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Server size={14} style={{ color: environment === 'LIVE' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: environment === 'LIVE' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>Live Production Gateway</div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>Direct NSE/BSE dispatch</div>
                  </div>
                </div>

                <div
                  onClick={() => setEnvironment('SANDBOX')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: environment === 'SANDBOX' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    backgroundColor: environment === 'SANDBOX' ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Activity size={14} style={{ color: environment === 'SANDBOX' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: environment === 'SANDBOX' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>Sandbox / Testnet</div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>Simulated mock broker API</div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                    {selectedBroker.brokerType === 'ANGEL' ? 'Client Code (UCC)' : selectedBroker.brokerType === 'MOTILAL' ? 'MO Client Code' : 'Client ID / User ID'} <span style={{ color: 'var(--negative)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    placeholder={selectedBroker.brokerType === 'ZERODHA' ? 'e.g. ZR8942' : selectedBroker.brokerType === 'ANGEL' ? 'e.g. A128941' : 'e.g. MO7891'}
                    className="input mono"
                    style={{ width: '100%', height: 32, fontSize: 11.5 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                    API Key / App Key <span style={{ color: 'var(--negative)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="e.g. kite_prod_884920b7"
                    className="input mono"
                    style={{ width: '100%', height: 32, fontSize: 11.5 }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                    API Secret / App Secret <span style={{ color: 'var(--negative)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecret ? 'text' : 'password'}
                      required
                      value={apiSecret}
                      onChange={e => setApiSecret(e.target.value)}
                      placeholder="Enter API Secret from broker developer console"
                      className="input mono"
                      style={{ width: '100%', height: 32, fontSize: 11.5, paddingRight: 32 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                    {selectedBroker.brokerType === 'ANGEL' ? 'TOTP Secret / MPIN' : '2FA TOTP Secret Key (Optional)'}
                  </label>
                  <input
                    type="password"
                    value={totpSecret}
                    onChange={e => setTotpSecret(e.target.value)}
                    placeholder="For automated morning session login"
                    className="input mono"
                    style={{ width: '100%', height: 32, fontSize: 11.5 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                    {selectedBroker.brokerType === 'MOTILAL' ? '2FA PIN / Password' : 'Account Password / PIN (Optional)'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Stored in memory only"
                    className="input mono"
                    style={{ width: '100%', height: 32, fontSize: 11.5 }}
                  />
                </div>
              </div>

              {/* Developer Console Help Link */}
              {selectedBroker.docUrl && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-sunken)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={12} style={{ color: 'var(--positive)' }} />
                    <span>How to get API keys from {selectedBroker.name}?</span>
                  </div>
                  <a
                    href={selectedBroker.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Developer Portal</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}

              {/* Security & Risk Note */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 11,
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                <ShieldCheck size={14} style={{ color: 'var(--positive)', flexShrink: 0, marginTop: 2 }} />
                <span>
                  Credentials are encrypted and kept in volatile session memory. DMA orders adhere to SEBI risk rules and daily loss limits.
                </span>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                borderTop: '1px solid var(--border-default)',
                paddingTop: 12,
                marginTop: 4
              }}>
                <button
                  type="button"
                  onClick={closeBrokerModal}
                  className="btn btn-secondary"
                  style={{ height: 34, padding: '0 16px', fontSize: 12 }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isTesting}
                  className="btn btn-primary"
                  style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, gap: 6 }}
                >
                  {isTesting ? (
                    <span>Validating & Syncing Margin...</span>
                  ) : testSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Connected!</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Verify & Connect Gateway</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
