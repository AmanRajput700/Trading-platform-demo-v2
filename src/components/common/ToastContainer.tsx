import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useTrading, ToastMessage } from '../../context/TradingContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTrading();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 150,
      maxWidth: 360,
      width: '100%'
    }}>
      {toasts.map((toast: ToastMessage) => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--positive)';
        let borderColor = 'var(--positive-border)';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--negative)';
          borderColor = 'var(--negative-border)';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'var(--warning)';
          borderColor = 'var(--warning-border)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--accent-primary)';
          borderColor = 'rgba(31, 95, 191, 0.3)';
        }

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: `1px solid ${borderColor}`,
              borderLeft: `4px solid ${iconColor}`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              boxShadow: 'var(--shadow-elevation)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              animation: 'fadeIn 180ms ease'
            }}
          >
            <Icon size={16} style={{ color: iconColor, marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
                  {toast.title}
                </div>
                <div className="mono text-muted" style={{ fontSize: 10 }}>
                  {toast.timestamp}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.35 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-ghost"
              style={{ padding: 2, height: 'auto', color: 'var(--text-tertiary)' }}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
