import React, { useState } from 'react';
import { 
  CheckCheck, 
  Zap, 
  ShieldAlert, 
  Radio, 
  Activity, 
  CheckCircle 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

import { PageHeader } from '../../components/common/PageHeader';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setCurrentPage } = useTrading();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(n => {
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    if (searchQuery && 
        !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !n.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'strategy':
        return <Zap size={14} style={{ color: 'var(--positive)' }} />;
      case 'order':
        return <CheckCircle size={14} style={{ color: 'var(--accent-primary)' }} />;
      case 'broker':
        return <Radio size={14} style={{ color: 'var(--positive)' }} />;
      case 'risk':
        return <ShieldAlert size={14} style={{ color: 'var(--warning)' }} />;
      default:
        return <Activity size={14} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1040, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Real-time feed of strategy signals, order execution reports, risk checks, and broker heartbeats"
        badge={{ text: `${unreadCount} Unread`, variant: unreadCount > 0 ? 'accent' : 'neutral' }}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Filter alerts...',
          count: filteredNotifications.length,
          total: notifications.length
        }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={markAllNotificationsRead}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <CheckCheck size={13} />
              <span>Mark All as Read</span>
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Updates' },
          { id: 'strategy', label: 'Strategy Signals' },
          { id: 'order', label: 'Order Execution' },
          { id: 'broker', label: 'Broker & Session' },
          { id: 'risk', label: 'Risk Guards' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11.5,
              fontWeight: filterType === tab.id ? 600 : 400,
              backgroundColor: filterType === tab.id ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: filterType === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="surface-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
            You're all caught up. No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.actionRoute) setCurrentPage(item.actionRoute as any);
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: item.read ? 'transparent' : 'var(--bg-sunken)',
                cursor: 'pointer',
                transition: 'background-color 100ms ease'
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2
              }}>
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: item.read ? 600 : 700, fontSize: 13 }}>{item.title}</span>
                    {!item.read && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
                    )}
                  </div>
                  <span className="mono text-muted" style={{ fontSize: 10 }}>{item.timestamp}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
