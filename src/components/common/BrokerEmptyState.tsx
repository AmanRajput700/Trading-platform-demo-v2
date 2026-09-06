import React, { useState } from 'react';
import { 
  Link2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Briefcase, 
  ListOrdered, 
  PieChart, 
  Lock,
  Play,
  CheckCircle2,
  RefreshCw,
  Plus,
  Compass
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

interface BrokerEmptyStateProps {
  type: 'holdings' | 'positions' | 'orders' | 'funds' | 'trades';
  title?: string;
  description?: string;
}

export const BrokerEmptyState: React.FC<BrokerEmptyStateProps> = ({
  type,
  title,
  description
}) => {
  const { 
    openBrokerModal, 
    setTradingMode, 
    tradingMode, 
    brokerState, 
    openQuickOrder, 
    setCurrentPage,
    syncBrokerData,
    addToast
  } = useTrading() as any;

  const [isSyncing, setIsSyncing] = useState(false);
  const isConnected = brokerState === 'Connected';

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      if (typeof syncBrokerData === 'function') {
        await syncBrokerData();
      }
      addToast({
        type: 'success',
        title: 'Upstox Pro Synchronized',
        message: 'Refreshed latest Demat portfolio, positions, and orders from Upstox API.'
      });
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Sync Notice',
        message: 'Could not fetch live updates. Check broker network connection.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectedConfig = {
    holdings: {
      icon: PieChart,
      defaultTitle: 'No Demat Holdings Synced',
      defaultDesc: 'Connect your Upstox Pro account to automatically fetch and track your long-term Demat delivery portfolio with real-time valuations.',
      feature: 'Real-time CNC Delivery Sync & P&L Tracker'
    },
    positions: {
      icon: Briefcase,
      defaultTitle: 'No Active Open Positions',
      defaultDesc: 'Connect your broker to monitor active intraday MIS & F&O derivative trades and auto square-off rules in real time.',
      feature: 'Live MTM P&L Streaming with Upstox V3 Feed'
    },
    orders: {
      icon: ListOrdered,
      defaultTitle: 'Order Book Empty',
      defaultDesc: 'Connect your broker account to view today’s order history, execution statuses, and automated algorithmic fills.',
      feature: '1-Click FIX / DMA Direct Exchange Execution'
    },
    funds: {
      icon: Layers,
      defaultTitle: 'No Broker Margin Synced',
      defaultDesc: 'Link your Upstox account to sync live available cash balances, collateral margins, and intraday trading limits.',
      feature: 'Live RMS Margin Validation Engine'
    },
    trades: {
      icon: Zap,
      defaultTitle: 'No Live Trades Executed',
      defaultDesc: 'Trade records will appear here as orders are executed live on Upstox or simulated in paper trading.',
      feature: 'Complete Audit Trail & Trade History'
    }
  }[type];

  const connectedConfig = {
    holdings: {
      icon: PieChart,
      defaultTitle: 'Upstox Demat Synced — Zero Delivery Holdings',
      defaultDesc: 'Your Upstox Demat account is linked. Delivery shares (CNC) purchased on the exchange will automatically appear here with real-time valuations.',
      feature: 'Upstox Demat CNC Delivery Sync Active'
    },
    positions: {
      icon: Briefcase,
      defaultTitle: 'Upstox Pro Active — Zero Open Positions',
      defaultDesc: 'Your Upstox DMA terminal is active. Open intraday (MIS) or F&O positions will appear here with live MTM streaming.',
      feature: 'Live Intraday MTM Tracker & RMS Active'
    },
    orders: {
      icon: ListOrdered,
      defaultTitle: 'Upstox Pro Active — No Orders Placed Today',
      defaultDesc: 'Your Upstox broker gateway is live and listening. New orders placed via manual tickets or strategy triggers will be tracked here.',
      feature: 'Direct Exchange FIX Gateway Active'
    },
    funds: {
      icon: Layers,
      defaultTitle: 'Upstox Margin Available',
      defaultDesc: 'Live available cash balances and collateral margins are synchronized with Upstox RMS.',
      feature: 'RMS Margin Engine Synchronized'
    },
    trades: {
      icon: Zap,
      defaultTitle: 'Upstox Pro Active — No Trades Executed Today',
      defaultDesc: 'Trade fills and executions will appear here automatically with official Upstox exchange trade IDs.',
      feature: 'Exchange Trade Journal Active'
    }
  }[type];

  const currentConfig = isConnected ? connectedConfig : disconnectedConfig;
  const Icon = currentConfig.icon;

  return (
    <div
      className="surface-card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        maxWidth: 620,
        margin: '24px auto',
        borderRadius: 'var(--radius-xl)',
        border: isConnected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px dashed var(--border-default)',
        background: isConnected 
          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, rgba(11, 14, 20, 0.6) 100%)' 
          : undefined,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Status Badge */}
      {isConnected ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '4px 14px',
            borderRadius: 20,
            letterSpacing: '0.04em'
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
          <span>UPSTOX PRO LIVE SESSION ACTIVE (DMA MODE)</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--positive)',
            backgroundColor: 'var(--positive-bg)',
            padding: '4px 12px',
            borderRadius: 20,
          }}
        >
          <ShieldCheck size={13} />
          <span>{currentConfig.feature}</span>
        </div>
      )}

      {/* Icon Badge */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: '50%',
          backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
          color: isConnected ? '#10B981' : '#38BDF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isConnected ? '0 0 28px rgba(16, 185, 129, 0.2)' : '0 0 24px rgba(56, 189, 248, 0.15)',
        }}
      >
        {isConnected ? <CheckCircle2 size={32} /> : <Icon size={30} />}
      </div>

      {/* Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
          {isConnected ? currentConfig.defaultTitle : (title || currentConfig.defaultTitle)}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.5 }}>
          {isConnected ? currentConfig.defaultDesc : (description || currentConfig.defaultDesc)}
        </p>
      </div>

      {/* Action CTA Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        {isConnected ? (
          <>
            <button
              onClick={() => openQuickOrder({
                symbol: 'RELIANCE',
                name: 'Reliance Industries Ltd',
                side: 'BUY',
                price: 2450.50,
                initialQty: 1
              })}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, gap: 7 }}
            >
              <Plus size={15} />
              <span>Place New Order</span>
            </button>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ padding: '8px 18px', fontSize: 13, gap: 7, fontWeight: 600 }}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing with Upstox...' : 'Sync with Upstox Now'}</span>
            </button>

            {type === 'holdings' && (
              <button
                onClick={() => setCurrentPage('market')}
                className="btn btn-ghost"
                style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
              >
                <Compass size={14} />
                <span>Explore Stock Universe</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => openBrokerModal()}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, gap: 8 }}
            >
              <Link2 size={15} />
              <span>Connect Upstox Pro</span>
            </button>

            {tradingMode !== 'PAPER' && (
              <button
                onClick={() => setTradingMode('PAPER')}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: 12, gap: 6 }}
              >
                <Play size={13} />
                <span>Try Paper Sandbox</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Guidance Note */}
      {isConnected ? (
        <div style={{
          fontSize: 11.5,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(16, 185, 129, 0.15)'
        }}>
          <span>⚡ Live Upstox Demat stream is active. All order and portfolio actions sync 1:1 with your broker account.</span>
        </div>
      ) : (
        <div style={{
          fontSize: 11.5,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          backgroundColor: 'rgba(56, 189, 248, 0.06)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(56, 189, 248, 0.15)'
        }}>
          <span>💡 Live Mode is active. You can convert to <strong>Paper Trading Sandbox</strong> (₹2.5L simulated funds) from <strong>Settings</strong>.</span>
        </div>
      )}

      {/* Security Note */}
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Lock size={11} />
        <span>Credentials encrypted at rest with Fernet (AES-128) & direct official Upstox V2 API integration</span>
      </div>
    </div>
  );
};
