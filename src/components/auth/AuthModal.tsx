import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Code2, 
  Building2, 
  User, 
  ArrowRight, 
  Check, 
  KeyRound
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
    loginWithCredentials 
  } = useTrading();

  const [authTab, setAuthTab] = useState<'SWITCH' | 'CUSTOM'>('SWITCH');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('user');

  if (!isAuthModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithCredentials(email, customName || email.split('@')[0], customRole);
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
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                Authentication & Role Management
              </h2>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                3-tier access control: Superadmin (Dev), Admin (Client), and Standard Trader (User)
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
            onClick={() => setAuthTab('SWITCH')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: authTab === 'SWITCH' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authTab === 'SWITCH' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: authTab === 'SWITCH' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Instant Role Switcher
          </button>

          <button
            onClick={() => setAuthTab('CUSTOM')}
            style={{
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderBottom: authTab === 'CUSTOM' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authTab === 'CUSTOM' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: authTab === 'CUSTOM' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Custom Credentials Login
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* TAB 1: 1-CLICK ROLE SWITCHER */}
          {authTab === 'SWITCH' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select an active profile to test role-specific workflows:
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
                    <span>Control All Platform Stats & User Telemetry</span>
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

          {/* TAB 2: CUSTOM CREDENTIALS LOGIN FORM */}
          {authTab === 'CUSTOM' && (
            <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 11.5,
                color: 'var(--text-secondary)'
              }}>
                Dummy authentication enabled for demo testing. You can type any email, name, and password to sign in.
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Full Name (Display Name)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Aman Rajput"
                  className="input"
                  style={{ width: '100%', height: 34, fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Email Address <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. user@trading.com"
                  className="input"
                  style={{ width: '100%', height: 34, fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Password <span style={{ color: 'var(--negative)' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter any password"
                  className="input"
                  style={{ width: '100%', height: 34, fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Select Account Role / Privilege Level
                </label>
                <select
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value as UserRole)}
                  className="select"
                  style={{ width: '100%', height: 34, fontSize: 12, fontWeight: 600 }}
                >
                  <option value="superadmin">Superadmin (Developer) — Can create strategies & full system control</option>
                  <option value="admin">Admin (Client Desk) — Controls all stats, user monitoring, cannot create strategies</option>
                  <option value="user">Standard Trader (User) — Normal retail trading, strategy creation restricted</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
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
                  className="btn btn-primary"
                  style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, gap: 6 }}
                >
                  <KeyRound size={14} />
                  <span>Sign In as {customRole.toUpperCase()}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
