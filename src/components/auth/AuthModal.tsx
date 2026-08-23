import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Code2, 
  Building2, 
  User, 
  ArrowRight, 
  Check, 
  KeyRound,
  UserPlus,
  LogIn,
  AlertCircle,
  Loader2,
  Server
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { UserRole } from '../../types';
import { MOCK_USERS } from '../../mock/accountData';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    currentUser, 
    switchRole, 
    loginApi,
    registerApi,
    isAuthLoading,
    isBackendConnected,
    authModalTab,
    setAuthModalTab
  } = useTrading();

  const authTab = authModalTab;
  const setAuthTab = setAuthModalTab;
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('aman.rajput@example.com');
  const [loginPassword, setLoginPassword] = useState('StrongPassword123!');
  
  // Register form state
  const [regName, setRegName] = useState('Aman Rajput');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // UI feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  // Password validation checks for register
  const hasMinLength = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasDigit = /[0-9]/.test(regPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await loginApi(loginEmail, loginPassword);
    if (!result.success) {
      setErrorMessage(result.error || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Password does not meet the security criteria.');
      return;
    }

    const result = await registerApi(regName, regEmail, regPassword);
    if (result.success) {
      setSuccessMessage('Registration successful! You can now log in with your credentials.');
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
      setAuthTab('LOGIN');
    } else {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return Code2;
      case 'admin':
        return Building2;
      case 'user':
        return User;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return { bg: 'rgba(255, 87, 34, 0.15)', text: '#FF5722', border: 'rgba(255, 87, 34, 0.3)' };
      case 'admin':
        return { bg: 'rgba(0, 140, 255, 0.15)', text: '#008CFF', border: 'rgba(0, 140, 255, 0.3)' };
      case 'user':
        return { bg: 'rgba(0, 208, 156, 0.15)', text: '#00D09C', border: 'rgba(0, 208, 156, 0.3)' };
    }
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
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  AuraTrade Authentication & Access
                </h2>
                <span className={`badge ${isBackendConnected ? 'badge-positive' : 'badge-accent'}`} style={{ fontSize: 9.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Server size={10} />
                  <span>{isBackendConnected ? 'Backend Live (8000)' : 'API V1 Ready'}</span>
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                JWT Access (15m) + Refresh Token Rotation (7d) Architecture
              </div>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
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

        {/* Modal Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0 18px'
        }}>
          <button
            onClick={() => { setAuthTab('LOGIN'); setErrorMessage(null); }}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: authTab === 'LOGIN' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authTab === 'LOGIN' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: authTab === 'LOGIN' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <LogIn size={13} />
            <span>Login (API)</span>
          </button>

          <button
            onClick={() => { setAuthTab('REGISTER'); setErrorMessage(null); }}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: authTab === 'REGISTER' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authTab === 'REGISTER' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: authTab === 'REGISTER' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <UserPlus size={13} />
            <span>Register (API)</span>
          </button>

          <button
            onClick={() => { setAuthTab('SWITCH'); setErrorMessage(null); }}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: authTab === 'SWITCH' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authTab === 'SWITCH' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: authTab === 'SWITCH' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <KeyRound size={13} />
            <span>Instant Role Switch</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              backgroundColor: 'var(--negative-bg)',
              border: '1px solid var(--negative-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--negative)'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div style={{
              backgroundColor: 'var(--positive-bg)',
              border: '1px solid var(--positive-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--positive)'
            }}>
              <Check size={15} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN (POST /api/v1/auth/login) */}
          {authTab === 'LOGIN' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Server size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <span>
                  Authenticates with <code>POST /api/v1/auth/login</code> and stores JWT Access + Refresh token rotation keys in session storage.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Email Address <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="aman.rajput@example.com"
                  className="input"
                  style={{ width: '100%', height: 36, fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Password <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input"
                  style={{ width: '100%', height: 36, fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setAuthTab('REGISTER')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 11.5, cursor: 'pointer', fontWeight: 600 }}
                >
                  Need an account? Register here
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="btn btn-secondary"
                    style={{ height: 34, padding: '0 16px', fontSize: 12 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="btn btn-primary"
                    style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, gap: 6 }}
                  >
                    {isAuthLoading ? <Loader2 size={14} className="spin" /> : <LogIn size={14} />}
                    <span>{isAuthLoading ? 'Authenticating...' : 'Sign In'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER (POST /api/v1/auth/register) */}
          {authTab === 'REGISTER' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 11.5,
                color: 'var(--text-secondary)'
              }}>
                Registers a new trader account with <code>POST /api/v1/auth/register</code>.
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Full Name <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Aman Rajput"
                  className="input"
                  style={{ width: '100%', height: 36, fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Email Address <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="aman.rajput@example.com"
                  className="input"
                  style={{ width: '100%', height: 36, fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Password <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="StrongPassword123!"
                  className="input"
                  style={{ width: '100%', height: 36, fontSize: 12.5 }}
                />

                {/* Password Rule Validation Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, fontSize: 10.5 }}>
                  <div style={{ color: hasMinLength ? 'var(--positive)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={11} style={{ opacity: hasMinLength ? 1 : 0.4 }} />
                    <span>Minimum 8 characters</span>
                  </div>
                  <div style={{ color: hasUpper ? 'var(--positive)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={11} style={{ opacity: hasUpper ? 1 : 0.4 }} />
                    <span>At least 1 uppercase letter</span>
                  </div>
                  <div style={{ color: hasLower ? 'var(--positive)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={11} style={{ opacity: hasLower ? 1 : 0.4 }} />
                    <span>At least 1 lowercase letter</span>
                  </div>
                  <div style={{ color: hasDigit ? 'var(--positive)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={11} style={{ opacity: hasDigit ? 1 : 0.4 }} />
                    <span>At least 1 digit (0-9)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setAuthTab('LOGIN')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 11.5, cursor: 'pointer', fontWeight: 600 }}
                >
                  Already have an account? Sign In
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="btn btn-secondary"
                    style={{ height: 34, padding: '0 16px', fontSize: 12 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="btn btn-primary"
                    style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, gap: 6 }}
                  >
                    {isAuthLoading ? <Loader2 size={14} className="spin" /> : <UserPlus size={14} />}
                    <span>{isAuthLoading ? 'Creating Account...' : 'Create Account'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: 1-CLICK INSTANT ROLE SWITCHER */}
          {authTab === 'SWITCH' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select an active profile to test role-specific frontend permissions:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MOCK_USERS.map(user => {
                  const Icon = getRoleIcon(user.role);
                  const colors = getRoleBadgeColor(user.role);
                  const isActive = currentUser.role === user.role;

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        switchRole(user.role);
                        closeAuthModal();
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isActive ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                        border: isActive ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 120ms ease'
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.borderColor = 'var(--border-strong)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-sunken)';
                          e.currentTarget.style.borderColor = 'var(--border-default)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          <Icon size={20} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{user.name}</span>
                            <span style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              backgroundColor: colors.bg,
                              color: colors.text,
                              padding: '1px 6px',
                              borderRadius: 4,
                              border: `1px solid ${colors.border}`
                            }}>
                              {user.roleLabel}
                            </span>
                            {isActive && (
                              <span className="badge badge-positive" style={{ fontSize: 9 }}>Active Profile</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {user.email}
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.35 }}>
                            {user.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                        {isActive ? (
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Check size={14} />
                          </div>
                        ) : (
                          <ArrowRight size={16} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Role Permissions Comparison Matrix */}
              <div className="surface-card" style={{ padding: '12px 14px', marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Role Permission Matrix
                </div>
                <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Create & Edit Algorithmic Strategies</span>
                    <span style={{ fontWeight: 600 }}>Superadmin Dev Only (Client Admin & Users ❌)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Client User Account Suspension & API Telemetry</span>
                    <span style={{ fontWeight: 600 }}>Superadmin & Client Admin Only (Users ❌)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Trade Markets, Orders, Holdings & Option Chain</span>
                    <span style={{ fontWeight: 600, color: 'var(--positive)' }}>All Roles (Superadmin, Admin, User ✅)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
