import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertCircle,
  Copy,
  RefreshCw,
  Loader2,
  ArrowRight
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
  const [pollingActive, setPollingActive] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const upstoxBroker = brokers.find(b => b.brokerType === 'UPSTOX');

  // Load configured API key from backend on mount
  useEffect(() => {
    if (isBrokerModalOpen) {
      apiClient.get('/brokers/upstox/config')
        .then(res => {
          if (res?.data?.api_key) setApiKey(res.data.api_key);
        })
        .catch(() => {});

      if (selectedBrokerForConnect) {
        setStep('CONNECT');
      } else {
        setStep('SELECT');
      }
      setError(null);
      setAccessToken('');
      setOauthStep('INIT');
      setOauthUrl(null);
      setPollingActive(false);
    } else {
      // Cleanup polling when modal closes
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [isBrokerModalOpen, selectedBrokerForConnect]);

  // Poll backend session status during OAuth waiting step
  useEffect(() => {
    if (pollingActive) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await apiClient.get('/brokers/upstox/session-status');
          if (res?.data?.has_token && res.data.is_valid_jwt) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPollingActive(false);
            await handleFinalizeConnection();
          }
        } catch { /* ignore */ }
      }, 2500);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollingActive]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isBrokerModalOpen) return null;

  const handleFinalizeConnection = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const brokerId = upstoxBroker?.id || 'broker-upstox';
      const success = await connectBrokerWithCredentials(brokerId, {
        clientId: 'UPSTOX_LIVE',
        apiKey: apiKey || 'upstox',
        apiSecret: '',
        totpSecret: '',
        environment: 'LIVE'
      });
      if (success) {
        setOauthStep('DONE');
        setTimeout(() => closeBrokerModal(), 2000);
      } else {
        setError('Broker sync failed — the token may have expired. Please try again or paste a fresh access token.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Connection failed. Ensure backend is running at localhost:8000.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthLogin = async () => {
    if (!apiKey.trim()) {
      setError('API Key is required. Check backend logs or your Upstox developer console.');
      return;
    }
    setError(null);

    const redirectUri = 'http://localhost:8000/api/v1/brokers/upstox/callback';
    const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(apiKey.trim())}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    setOauthUrl(url);
    setOauthStep('WAITING');
    setPollingActive(true);
    window.open(url, '_blank', 'width=520,height=680,top=100,left=200');
  };

  const handleConnectWithToken = async () => {
    const token = accessToken.trim();
    if (!token) {
      setError('Please paste your Upstox access token.');
      return;
    }
    if (!token.startsWith('eyJ') || token.length < 100) {
      setError('Invalid token format. Upstox access tokens start with "eyJ" and are very long (200+ chars). Make sure you copied the full token.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Register the real access token on the backend
      await apiClient.post(`/brokers/upstox/set-token?access_token=${encodeURIComponent(token)}`);
      // Now sync broker state
      await handleFinalizeConnection();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to set token. Make sure the backend is running.';
      setError(msg);
      setIsConnecting(false);
    }
  };

  const handleManualOAuthDone = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPollingActive(false);
    await handleFinalizeConnection();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(11, 14, 20, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 110, padding: 16
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', maxHeight: '94vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(0,208,156,0.08) 0%, rgba(11,14,20,0) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(0,208,156,0.2), rgba(0,208,156,0.05))',
              border: '1px solid rgba(0,208,156,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {oauthStep === 'DONE' ? '🎉 Connected!' : 'Connect Upstox Broker'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {oauthStep === 'DONE'
                  ? 'Live market data feed is now active'
                  : 'Authenticate to stream real NSE/BSE market data'}
              </div>
            </div>
          </div>
          <button onClick={closeBrokerModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* SUCCESS */}
          {oauthStep === 'DONE' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,208,156,0.2), rgba(0,208,156,0.05))',
                border: '2px solid rgba(0,208,156,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={36} style={{ color: 'var(--positive)' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upstox Live Connected!</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Real-time Nifty 50, Sensex, Bank Nifty and stock ticks are now streaming live from Upstox V3 feed.
              </div>
            </div>
          )}

          {/* BROKER SELECT */}
          {step === 'SELECT' && oauthStep !== 'DONE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>Select broker:</div>
              {brokers.map(b => (
                <div key={b.id} onClick={() => { if (!b.disabled) setStep('CONNECT'); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 16px', borderRadius: 10,
                    backgroundColor: 'var(--bg-sunken)',
                    border: b.disabled ? '1px solid var(--border-default)' : '1px solid rgba(0,208,156,0.4)',
                    cursor: b.disabled ? 'not-allowed' : 'pointer',
                    opacity: b.disabled ? 0.5 : 1, transition: 'all 120ms'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      backgroundColor: (b.brandColor || '#00D09C') + '22',
                      color: b.brandColor || '#00D09C',
                      fontWeight: 800, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{b.logoText}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {b.name}
                        {b.connected && <span className="badge badge-positive" style={{ fontSize: 9 }}>Connected</span>}
                        {b.disabled && <span className="badge badge-neutral" style={{ fontSize: 9 }}>Coming Soon</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {b.disabled ? 'Available in future release' : 'Live NSE/BSE market data & order routing'}
                      </div>
                    </div>
                  </div>
                  {!b.disabled && <ArrowRight size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          )}

          {/* CONNECT STEP */}
          {step === 'CONNECT' && oauthStep !== 'DONE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', gap: 10, padding: '10px 14px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: 8, fontSize: 12, color: '#F87171', lineHeight: 1.5
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Method Tabs */}
              <div style={{ display: 'flex', gap: 8 }}>
                {(['OAUTH', 'TOKEN'] as ConnectionMethod[]).map(m => (
                  <button key={m} type="button"
                    onClick={() => { setMethod(m); setError(null); setOauthStep('INIT'); setOauthUrl(null); setPollingActive(false); }}
                    style={{
                      flex: 1, padding: '9px 10px', borderRadius: 8,
                      border: method === m ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      backgroundColor: method === m ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                      cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      color: method === m ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}>
                    {m === 'OAUTH' ? '🔐 Login via Upstox' : '🔑 Paste Access Token'}
                  </button>
                ))}
              </div>

              {/* OAUTH METHOD */}
              {method === 'OAUTH' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {oauthStep === 'INIT' && (
                    <>
                      <div style={{
                        padding: '12px 14px', borderRadius: 8,
                        background: 'rgba(0,208,156,0.06)', border: '1px solid rgba(0,208,156,0.2)',
                        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7
                      }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Steps:</strong><br />
                        1. Your API Key is pre-filled below from <code>.env</code> config<br />
                        2. Click <strong style={{ color: 'var(--accent-primary)' }}>"Open Upstox Login"</strong><br />
                        3. Log in on the Upstox page (mobile → PIN → TOTP)<br />
                        4. Come back here — connection completes automatically ✅
                      </div>

                      <div>
                        <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                          API Key <span style={{ fontSize: 9, fontStyle: 'italic', textTransform: 'none', fontWeight: 400 }}>(pre-filled from backend config)</span>
                        </label>
                        <input type="text" className="input mono"
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setError(null); }}
                          placeholder="e.g. 56865775-126e-4fa7-a90e-fb0dc35ba7e7"
                          style={{ width: '100%', height: 36, fontSize: 12 }}
                        />
                      </div>

                      <button type="button" onClick={handleOAuthLogin}
                        className="btn btn-primary"
                        style={{ height: 42, fontSize: 14, fontWeight: 700, gap: 8 }}
                        disabled={!apiKey.trim()}>
                        <ExternalLink size={16} />
                        Open Upstox Login
                      </button>
                    </>
                  )}

                  {oauthStep === 'WAITING' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{
                        padding: '12px 14px', borderRadius: 8,
                        background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)',
                        fontSize: 12, color: '#FCD34D', lineHeight: 1.6,
                        display: 'flex', gap: 10, alignItems: 'flex-start'
                      }}>
                        <RefreshCw size={14} style={{ flexShrink: 0, marginTop: 2, animation: 'spin 2s linear infinite' }} />
                        <div>
                          <strong>Waiting for Upstox login to complete…</strong><br />
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Log in on the popup window. This page will auto-detect when you're done.
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button"
                          onClick={() => oauthUrl && window.open(oauthUrl, '_blank', 'width=520,height=680')}
                          className="btn btn-secondary"
                          style={{ flex: 1, height: 38, fontSize: 12, gap: 6 }}>
                          <ExternalLink size={13} />
                          Reopen Popup
                        </button>
                        <button type="button"
                          onClick={handleManualOAuthDone}
                          disabled={isConnecting}
                          className="btn btn-primary"
                          style={{ flex: 2, height: 38, fontSize: 12.5, fontWeight: 700, gap: 6 }}>
                          {isConnecting ? (
                            <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                          ) : (
                            <><CheckCircle2 size={13} /> I've Logged In Successfully</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TOKEN METHOD */}
              {method === 'TOKEN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.25)',
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Get your access token in 30 seconds:</strong><br />
                    1. Go to <a href="https://developer.upstox.com/login" target="_blank" rel="noreferrer" style={{ color: '#A855F7' }}>developer.upstox.com/login</a><br />
                    2. Login → click <strong>My Apps</strong> → select your app<br />
                    3. Click <strong>Get Token</strong> → copy the <strong>Access Token</strong><br />
                    4. Paste below (it starts with <code style={{ color: '#A855F7' }}>eyJ...</code>)
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Access Token <span style={{ color: 'var(--negative)' }}>*</span>
                      </label>
                      <a href="https://developer.upstox.com/login" target="_blank" rel="noreferrer"
                        style={{ fontSize: 10.5, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Get Token <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        className="input mono"
                        value={accessToken}
                        onChange={e => { setAccessToken(e.target.value); setError(null); }}
                        placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                        style={{ width: '100%', minHeight: 90, fontSize: 11.5, resize: 'vertical', paddingRight: 40 }}
                      />
                      <button type="button"
                        onClick={async () => {
                          try { const t = await navigator.clipboard.readText(); setAccessToken(t); } catch { /* ignore */ }
                        }}
                        title="Paste from clipboard"
                        style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    {accessToken.length > 0 && (
                      <div style={{ fontSize: 10.5, marginTop: 4, color: accessToken.startsWith('eyJ') && accessToken.length > 100 ? 'var(--positive)' : '#F87171' }}>
                        {accessToken.startsWith('eyJ') && accessToken.length > 100
                          ? `✓ Valid token format (${accessToken.length} chars)`
                          : '✗ Does not look like a valid Upstox token — should start with "eyJ" and be 200+ chars'}
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={handleConnectWithToken}
                    disabled={isConnecting || !accessToken.trim()}
                    className="btn btn-primary"
                    style={{ height: 42, fontSize: 14, fontWeight: 700, gap: 8 }}>
                    {isConnecting ? (
                      <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Connecting to Live Feed...</>
                    ) : (
                      <><Zap size={15} /> Activate Live Market Data</>
                    )}
                  </button>
                </div>
              )}

              {/* Security note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                <ShieldCheck size={13} style={{ color: 'var(--positive)', flexShrink: 0 }} />
                <span>Tokens are encrypted at rest. No orders are placed without your manual approval.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {oauthStep !== 'DONE' && (
          <div style={{
            padding: '12px 18px', borderTop: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-sunken)'
          }}>
            <button onClick={closeBrokerModal} className="btn btn-secondary" style={{ height: 32, fontSize: 12 }}>
              Close
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
