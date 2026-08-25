import React from 'react';
import { 
  Link2, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Layers, 
  Briefcase, 
  ListOrdered, 
  PieChart, 
  Lock,
  Play
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
  const { openBrokerModal, setTradingMode, tradingMode } = useTrading();

  const config = {
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

  const Icon = config.icon;

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
        maxWidth: 580,
        margin: '24px auto',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-default)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          color: '#38BDF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(56, 189, 248, 0.15)',
        }}
      >
        <Icon size={28} />
      </div>

      {/* Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
          {title || config.defaultTitle}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.5 }}>
          {description || config.defaultDesc}
        </p>
      </div>

      {/* Feature Bullet Highlight */}
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
        <span>{config.feature}</span>
      </div>

      {/* Action CTA Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
        <button
          onClick={() => openBrokerModal()}
          className="btn btn-primary"
          style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, gap: 8 }}
        >
          <Link2 size={15} />
          <span>Connect Upstox Pro</span>
          <ArrowRight size={14} />
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
      </div>

      {/* Paper Mode Guidance */}
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
        <span>💡 Live Mode is active by default. You can convert to <strong>Paper Trading Sandbox</strong> (₹2.5L simulated funds) from <strong>Settings</strong>.</span>
      </div>

      {/* Security Note */}
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Lock size={11} />
        <span>Credentials encrypted at rest with Fernet (AES-128) & zero storage of raw MPIN</span>
      </div>
    </div>
  );
};
