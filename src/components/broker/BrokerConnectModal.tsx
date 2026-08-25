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
    setBrokerState,
    setPortfolioFunds
  } = useTrading() as any;

  const [step, setStep] = useState<'SELECT' | 'CONNECT'>('SELECT');
  const [method, setMethod] = useState<ConnectionMethod>('OAUTH');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);
  const [oauthStep, setOauthStep] = useState<'INIT' | 'WAITING' | 'DONE'>('INIT');
  const [pollingActive, setPollingActive] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load configured API key and session state from backend on mount
  useEffect(() => {
    if (isBrokerModalOpen) {
      apiClient.get('/brokers/upstox/config')
        .then(res => {
          if (res?.data?.api_key) setApiKey(res.data.api_key);
          if (res?.data?.has_token) setHasExistingSession(true);
        })
        .catch(() => {});

      apiClient.get('/brokers/upstox/session-status')
        .then(res => {
          if (res?.data?.has_token && res.data.is_valid_jwt) {
            setHasExistingSession(true);
          }
        })
        .catch(() => {});

      setStep(selectedBrokerForConnect ? 'CONNECT' : 'SELECT');
      setError(null);
      setApiSecret('');
      setAccessToken('');
      setOauthStep('INIT');
      setOauthUrl(null);
      setPollingActive(false);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isBrokerModalOpen, selectedBrokerForConnect]);

  // Listen for postMessage from OAuth popup (fires instantly when callback completes)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === 'UPSTOX_OAUTH_SUCCESS') {
        if (pollRef.current) clearInterval(pollRef.current);
        setPollingActive(false);
        handleActivateSession();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll backend session-status as fallback (every 2.5s while waiting)
  useEffect(() => {
    if (pollingActive) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await apiClient.get('/brokers/upstox/session-status');
          if (res?.data?.has_token && res.data.is_valid_jwt) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPollingActive(false);
            handleActivateSession();
          }
        } catch { /* ignore */ }
      }, 2500);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollingActive]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isBrokerModalOpen) return null;

  // Activates broker using whatever token is already in Redis — no re-authentication
  const handleActivateSession = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setError(null);
    try {
      const res = await apiClient.post('/brokers/upstox/activate-session');
      if (res?.data?.status === 'CONNECTED') {
        // Update frontend state directly
        if (typeof setBrokerState === 'function') {
          setBrokerState('Connected');
        }
        if (typeof setPortfolioFunds === 'function' && res.data.available_funds > 0) {
          setPortfolioFunds(res.data.available_funds);
        }

        // Persist connection in localStorage
        localStorage.setItem('auratrade-broker-state', 'Connected');
        localStorage.setItem('auratrade-connected-broker-id', 'broker-upstox');

        setOauthStep('DONE');
        setTimeout(() => closeBrokerModal(), 2000);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || '';
      if (err?.response?.status === 404) {
        setError('OAuth callback did not complete yet. Finish logging in on the Upstox popup window, then click "I\'ve Logged In" again.');
      } else if (err?.response?.status === 400) {
        setError(`Invalid token: ${detail}. Please use "Paste Access Token" to enter a fresh token.`);
      } else {
        setError(`Connection failed: ${detail || 'Make sure the backend is running at localhost:8000.'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthLogin = async () => {
    if (!apiKey.trim()) {
      setError('API Key (Client ID) is required.');
      return;
    }
    if (!apiSecret.trim()) {
      setError('API Secret is required for Upstox OAuth exchange.');
      return;
    }
    setError(null);
    setHasExistingSession(false);
    try {
      await apiClient.post('/brokers/upstox/credentials', {
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
    } catch {
      // ignore
    }

    const redirectUri = 'http://localhost:8000/api/v1/brokers/upstox/callback';
    const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(apiKey.trim())}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    setOauthUrl(url);
    setOauthStep('WAITING');
    setPollingActive(true);
    window.open(url, '_blank', 'width=520,height=700,top=80,left=200');
  };

  const handleConnectWithToken = async () => {
    const token = accessToken.trim();
    if (!token) {
      setError('Please paste your Upstox access token.');
      return;
    }
    if (!token.startsWith('eyJ') || token.length < 100) {
      setError('Invalid token. Upstox tokens start with "eyJ" and are 200+ characters long.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      // Store token in Redis via set-token endpoint
      await apiClient.post(`/brokers/upstox/set-token?access_token=${encodeURIComponent(token)}`);
      // Now activate session using the stored token
      await handleActivateSession();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed. Make sure the backend is running.';
      setError(msg);
      setIsConnecting(false);
    }
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
                {oauthStep === 'DONE' ? '🎉 Connected to Live Feed!' : 'Connect Upstox Broker'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {oauthStep === 'DONE' ? 'Real-time NSE/BSE data is now streaming' : 'Authenticate to stream live market prices'}
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
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,208,156,0.2), rgba(0,208,156,0.05))',
                border: '2px solid rgba(0,208,156,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <CheckCircle2 size={38} style={{ color: 'var(--positive)' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upstox Live Connected!</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Nifty 50, Sensex, Bank Nifty and subscribed stocks are streaming real live prices from Upstox V3 feed.
              </div>
            </div>
          )}

          {/* BROKER SELECT */}
          {step === 'SELECT' && oauthStep !== 'DONE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>Select broker:</div>
              {brokers?.map((b: any) => (
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

              {/* Active Session Fast Connect */}
              {hasExistingSession && (
                <div style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: 'rgba(0,208,156,0.08)', border: '1px solid rgba(0,208,156,0.3)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={14} /> Active Upstox Token Available
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      A live authorized session is active on the backend.
                    </div>
                  </div>
                  <button type="button" onClick={handleActivateSession}
                    disabled={isConnecting}
                    className="btn btn-primary"
                    style={{ fontWeight: 700, height: 34, fontSize: 11.5, flexShrink: 0, padding: '0 14px' }}>
                    {isConnecting ? 'Connecting...' : 'Connect Now'}
                  </button>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Upstox Developer Credentials:</strong>
                          <a href="https://developer.upstox.com/apps" target="_blank" rel="noreferrer"
                            style={{ color: 'var(--accent-primary)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                            developer.upstox.com <ExternalLink size={11} />
                          </a>
                        </div>
                        1. Copy your <strong>API Key</strong> & <strong>API Secret</strong> from your Upstox App<br />
                        2. Click <strong style={{ color: 'var(--accent-primary)' }}>"Open Upstox Login"</strong><br />
                        3. Complete login on Upstox (mobile → PIN → OTP)
                      </div>

                      <div>
                        <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                          API Key (Client ID) <span style={{ color: 'var(--negative)' }}>*</span>
                        </label>
                        <input type="text" className="input mono"
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setError(null); }}
                          placeholder="Paste your API Key from developer.upstox.com"
                          style={{ width: '100%', height: 36, fontSize: 12 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                          API Secret <span style={{ color: 'var(--negative)' }}>*</span>
                        </label>
                        <input type="password" className="input mono"
                          value={apiSecret}
                          onChange={e => { setApiSecret(e.target.value); setError(null); }}
                          placeholder="Paste your API Secret from developer.upstox.com"
                          style={{ width: '100%', height: 36, fontSize: 12 }}
                        />
                      </div>

                      <button type="button" onClick={handleOAuthLogin}
                        className="btn btn-primary"
                        disabled={!apiKey.trim() || !apiSecret.trim()}
                        style={{ height: 42, fontSize: 14, fontWeight: 700, gap: 8 }}>
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
                          <strong>Waiting for Upstox login…</strong><br />
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Complete login on the popup. This page auto-detects when done.
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button"
                          onClick={() => oauthUrl && window.open(oauthUrl, '_blank', 'width=520,height=700')}
                          className="btn btn-secondary"
                          style={{ flex: 1, height: 38, fontSize: 12, gap: 6 }}>
                          <ExternalLink size={13} /> Reopen Popup
                        </button>
                        <button type="button" onClick={handleActivateSession}
                          disabled={isConnecting}
                          className="btn btn-primary"
                          style={{ flex: 2, height: 38, fontSize: 12.5, fontWeight: 700, gap: 6 }}>
                          {isConnecting
                            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                            : <><CheckCircle2 size={13} /> I've Logged In</>}
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
                    <strong style={{ color: 'var(--text-primary)' }}>Get your access token:</strong><br />
                    1. Go to <a href="https://developer.upstox.com/login" target="_blank" rel="noreferrer" style={{ color: '#A855F7' }}>developer.upstox.com</a> → login<br />
                    2. Click your app → <strong>Get Token</strong> → copy the <strong>Access Token</strong><br />
                    3. Paste it below (starts with <code style={{ color: '#A855F7' }}>eyJ...</code>)
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <label style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Access Token <span style={{ color: 'var(--negative)' }}>*</span>
                      </label>
                      <a href="https://developer.upstox.com/login" target="_blank" rel="noreferrer"
                        style={{ fontSize: 10.5, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Get Token <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <textarea className="input mono"
                        value={accessToken}
                        onChange={e => { setAccessToken(e.target.value); setError(null); }}
                        placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                        style={{ width: '100%', minHeight: 90, fontSize: 11.5, resize: 'vertical', paddingRight: 40 }}
                      />
                      <button type="button"
                        onClick={async () => { try { const t = await navigator.clipboard.readText(); setAccessToken(t); } catch { } }}
                        title="Paste from clipboard"
                        style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    {accessToken.length > 0 && (
                      <div style={{ fontSize: 10.5, marginTop: 4, color: accessToken.startsWith('eyJ') && accessToken.length > 100 ? 'var(--positive)' : '#F87171' }}>
                        {accessToken.startsWith('eyJ') && accessToken.length > 100
                          ? `✓ Valid token format (${accessToken.length} chars)`
                          : '✗ Should start with "eyJ" and be 200+ characters'}
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={handleConnectWithToken}
                    disabled={isConnecting || !accessToken.trim()}
                    className="btn btn-primary"
                    style={{ height: 42, fontSize: 14, fontWeight: 700, gap: 8 }}>
                    {isConnecting
                      ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Activating Live Feed...</>
                      : <><Zap size={15} /> Activate Live Market Data</>}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                <ShieldCheck size={13} style={{ color: 'var(--positive)', flexShrink: 0 }} />
                <span>Tokens stored encrypted. No orders placed without your manual approval.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {oauthStep !== 'DONE' && (
          <div style={{
            padding: '12px 18px', borderTop: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-sunken)'
          }}>
            <button onClick={closeBrokerModal} className="btn btn-secondary" style={{ height: 32, fontSize: 12 }}>Close</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
