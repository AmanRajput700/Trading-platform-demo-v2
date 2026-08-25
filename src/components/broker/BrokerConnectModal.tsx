import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowLeft,
  AlertCircle,
  Copy,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { apiClient } from '../../services/apiClient';

type ConnectionMethod = 'OAUTH' | 'TOKEN';

export const BrokerConnectModal: React.FC = () => {
  const {
    isBrokerModalOpen,
    closeBrokerModal,
    selectedBrokerForConnect,
    brokers,
    connectBrokerWithCredentials
  } = useTrading();

  const [step, setStep] = useState<'SELECT' | 'CONNECT'>('SELECT');
  const [method, setMethod] = useState<ConnectionMethod>('OAUTH');
  const [apiKey, setApiKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);
  const [oauthStep, setOauthStep] = useState<'INIT' | 'WAITING' | 'DONE'>('INIT');
  const upstoxBroker = brokers.find(b => b.brokerType === 'UPSTOX');

  useEffect(() => {
    if (isBrokerModalOpen) {
      if (selectedBrokerForConnect) {
        setStep('CONNECT');
        setApiKey(selectedBrokerForConnect.credentials?.apiKey || '');
      } else {
        setStep('SELECT');
      }
      setError(null);
      setAccessToken('');
      setOauthStep('INIT');
      setOauthUrl(null);
      setIsConnecting(false);
    }
  }, [isBrokerModalOpen, selectedBrokerForConnect]);

  if (!isBrokerModalOpen) return null;

  const handleGenerateOAuthUrl = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Upstox API Key first.');
      return;
    }
    setError(null);
    try {
      const res = await apiClient.get(`/brokers/upstox/auth-url?api_key=${encodeURIComponent(apiKey.trim())}`);
      const url = res?.data?.auth_url;
      if (url) {
        setOauthUrl(url);
        setOauthStep('WAITING');
        window.open(url, '_blank', 'width=600,height=700');
      }
    } catch {
      // Build URL manually if backend is unreachable
      const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(apiKey.trim())}&redirect_uri=${encodeURIComponent('http://localhost:8000/api/v1/brokers/upstox/callback')}`;
      setOauthUrl(url);
      setOauthStep('WAITING');
      window.open(url, '_blank', 'width=600,height=700');
    }
  };

  const handleConnectWithToken = async () => {
    const token = accessToken.trim();
    if (!token) {
      setError('Please enter your Upstox Access Token.');
      return;
    }
    if (!token.startsWith('eyJ') && token.length < 50) {
      setError('This does not look like a valid Upstox access token. It should be a long JWT string starting with "eyJ...".');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Use the set-token endpoint to register the token with the backend
      await apiClient.post(`/brokers/upstox/set-token?access_token=${encodeURIComponent(token)}`);

      // Now connect the broker in our system
      const brokerId = upstoxBroker?.id || 'broker-upstox';
      const success = await connectBrokerWithCredentials(brokerId, {
        clientId: 'UPSTOX_LIVE',
        apiKey: apiKey || 'upstox_live',
        apiSecret: '',
        totpSecret: '',
        environment: 'LIVE'
      });

      if (success) {
        setOauthStep('DONE');
        setTimeout(() => {
          closeBrokerModal();
        }, 1500);
      } else {
        setError('Connection completed but broker sync failed. Please try again or restart the backend.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to connect. Please ensure the backend is running and the token is valid.';
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthTokenCallback = async () => {
    // Check if callback happened (backend should have stored the token)
    setIsConnecting(true);
    setError(null);
    try {
      const brokerId = upstoxBroker?.id || 'broker-upstox';
      const success = await connectBrokerWithCredentials(brokerId, {
        clientId: 'UPSTOX_LIVE',
        apiKey: apiKey || 'upstox_live',
        apiSecret: '',
        totpSecret: '',
        environment: 'LIVE'
      });
      if (success) {
        setOauthStep('DONE');
        setTimeout(() => {
          closeBrokerModal();
        }, 1500);
      } else {
        setError('OAuth callback may not have completed. Please finish logging in via the Upstox popup window, then click "I\'ve Logged In".');
      }
    } catch {
      setError('Could not verify OAuth session. Please ensure the backend is running at localhost:8000.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 14, 20, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 540,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: '92vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-sunken)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'CONNECT' && !selectedBrokerForConnect && (
              <button type="button" onClick={() => { setStep('SELECT'); setError(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, display: 'flex' }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(0, 208, 156, 0.15)', color: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                {step === 'SELECT' ? 'Connect Broker' : 'Upstox Live Market Data'}
              </h2>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {step === 'SELECT' ? 'Link your Upstox account for real-time NSE/BSE market data' : 'Authenticate to stream live Nifty, Sensex and stock prices'}
              </div>
            </div>
          </div>
          <button onClick={closeBrokerModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Success State */}
          {oauthStep === 'DONE' && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              padding: 32, textAlign: 'center'
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: 'rgba(0, 208, 156, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle2 size={32} style={{ color: 'var(--positive)' }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Upstox Connected!</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Real-time market data feed is now active. Nifty, Sensex and all subscribed symbols will stream live.
                </div>
              </div>
            </div>
          )}

          {/* Broker Select Step */}
          {step === 'SELECT' && oauthStep !== 'DONE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Select broker to connect:</div>
              {brokers.map(b => (
                <div
                  key={b.id}
                  onClick={() => { if (!b.disabled) setStep('CONNECT'); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-sunken)',
                    border: b.disabled ? '1px solid var(--border-default)' : '1px solid var(--accent-primary)',
                    cursor: b.disabled ? 'not-allowed' : 'pointer',
                    opacity: b.disabled ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      backgroundColor: (b.brandColor || '#00D09C') + '22',
                      color: b.brandColor || '#00D09C',
                      fontWeight: 700, fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{b.logoText}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {b.name}
                        {b.connected && <span className="badge badge-positive" style={{ fontSize: 9 }}>Connected</span>}
                        {b.disabled && <span className="badge badge-neutral" style={{ fontSize: 9 }}>Coming Soon</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{b.tagline || 'Live market data & order execution'}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" disabled={b.disabled} style={{ fontSize: 11 }}>
                    {b.connected ? 'Reconnect' : b.disabled ? 'Soon' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Connect Step */}
          {step === 'CONNECT' && oauthStep !== 'DONE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Error Banner */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12, color: '#F87171', lineHeight: 1.5
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Method Toggle */}
              <div style={{ display: 'flex', gap: 8 }}>
                {(['OAUTH', 'TOKEN'] as ConnectionMethod[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); setError(null); setOauthStep('INIT'); setOauthUrl(null); }}
                    style={{
                      flex: 1, padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: method === m ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      backgroundColor: method === m ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                      cursor: 'pointer', fontWeight: 700, fontSize: 11.5,
                      color: method === m ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {m === 'OAUTH' ? '🔐 OAuth Login (Recommended)' : '🔑 Paste Access Token'}
                  </button>
                ))}
              </div>

              {/* OAuth Method */}
              {method === 'OAUTH' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'rgba(0, 208, 156, 0.06)',
                    border: '1px solid rgba(0, 208, 156, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong><br />
                    1. Enter your Upstox App's API Key below<br />
                    2. Click <strong>"Open Upstox Login"</strong> → A browser window opens<br />
                    3. Log in with your mobile number, PIN, and TOTP in Upstox<br />
                    4. Upstox redirects back to the backend automatically<br />
                    5. Click <strong>"I've Logged In"</strong> to complete
                  </div>

                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                      Upstox API Key <span style={{ color: 'var(--negative)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input mono"
                      value={apiKey}
                      onChange={e => { setApiKey(e.target.value); setError(null); }}
                      placeholder="e.g. 56865775-126e-4fa7-a90e-fb0dc35ba7e7"
                      style={{ width: '100%', height: 34, fontSize: 12 }}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Find in: <a href="https://developer.upstox.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>developer.upstox.com</a> → My Apps → Your App → API Key
                    </div>
                  </div>

                  {oauthStep === 'INIT' && (
                    <button
                      type="button"
                      onClick={handleGenerateOAuthUrl}
                      className="btn btn-primary"
                      style={{ height: 38, fontSize: 13, fontWeight: 700, gap: 8 }}
                      disabled={!apiKey.trim()}
                    >
                      <ExternalLink size={15} />
                      Open Upstox Login
                    </button>
                  )}

                  {oauthStep === 'WAITING' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(251, 191, 36, 0.08)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12, color: '#FCD34D',
                        display: 'flex', alignItems: 'center', gap: 8
                      }}>
                        <RefreshCw size={13} style={{ animation: 'spin 2s linear infinite' }} />
                        Waiting for you to log in on the Upstox popup window…
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => oauthUrl && window.open(oauthUrl, '_blank', 'width=600,height=700')}
                          className="btn btn-secondary"
                          style={{ flex: 1, height: 34, fontSize: 12, gap: 6 }}
                        >
                          <ExternalLink size={13} />
                          Reopen Login Window
                        </button>
                        <button
                          type="button"
                          onClick={handleOAuthTokenCallback}
                          disabled={isConnecting}
                          className="btn btn-primary"
                          style={{ flex: 2, height: 34, fontSize: 12, fontWeight: 700, gap: 6 }}
                        >
                          {isConnecting ? (
                            <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                          ) : (
                            <><CheckCircle2 size={13} /> I've Logged In</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Token Method */}
              {method === 'TOKEN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'rgba(168, 85, 247, 0.07)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>How to get your access token:</strong><br />
                    1. Log in to <a href="https://developer.upstox.com/" target="_blank" rel="noreferrer" style={{ color: '#A855F7' }}>developer.upstox.com</a><br />
                    2. Go to <strong>My Apps → Your App → Get Token</strong><br />
                    3. Copy the <strong>Access Token</strong> (starts with "eyJ...")<br />
                    4. Paste it below — it's valid till 3:30 AM next day
                  </div>

                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                      Upstox Access Token <span style={{ color: 'var(--negative)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        className="input mono"
                        value={accessToken}
                        onChange={e => { setAccessToken(e.target.value); setError(null); }}
                        placeholder="Paste your Upstox access token here (eyJhbGciOiJSU...)"
                        style={{ width: '100%', minHeight: 80, fontSize: 11, resize: 'vertical', paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            setAccessToken(text);
                          } catch { /* ignore */ }
                        }}
                        title="Paste from clipboard"
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-tertiary)', padding: 2
                        }}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Token is stored encrypted in Redis. Never shared or logged anywhere.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectWithToken}
                    disabled={isConnecting || !accessToken.trim()}
                    className="btn btn-primary"
                    style={{ height: 38, fontSize: 13, fontWeight: 700, gap: 8 }}
                  >
                    {isConnecting ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Connecting & Verifying...</>
                    ) : (
                      <><Zap size={14} /> Connect with Token</>
                    )}
                  </button>
                </div>
              )}

              {/* Security note */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, color: 'var(--text-tertiary)'
              }}>
                <ShieldCheck size={13} style={{ color: 'var(--positive)', flexShrink: 0 }} />
                <span>Tokens are encrypted with AES-128 and stored only for your session. No orders are placed without your approval.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {oauthStep !== 'DONE' && (
          <div style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-sunken)'
          }}>
            <button onClick={closeBrokerModal} className="btn btn-secondary" style={{ height: 32, padding: '0 16px', fontSize: 12 }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
