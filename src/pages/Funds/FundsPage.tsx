import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

import { PageHeader } from '../../components/common/PageHeader';

export const FundsPage: React.FC = () => {
  const { portfolio, addFunds, withdrawFunds } = useTrading();
  const [payInAmount, setPayInAmount] = useState<number>(50000);
  const [payOutAmount, setPayOutAmount] = useState<number>(25000);
  const [activeModal, setActiveModal] = useState<'ADD' | 'WITHDRAW' | null>(null);

  const handleAdd = () => {
    if (payInAmount > 0) {
      addFunds(payInAmount);
      setActiveModal(null);
    }
  };

  const handleWithdraw = () => {
    if (payOutAmount > 0) {
      withdrawFunds(payOutAmount);
      setActiveModal(null);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1140, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Funds & Margin Utilization"
        subtitle="Real-time equity and F&O margin limits, collateral pledge & fund transfers"
        badge={{ text: "Instant Clearing", variant: "positive" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveModal('WITHDRAW')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <ArrowDownLeft size={14} />
              <span>Withdraw Funds</span>
            </button>
            <button
              onClick={() => setActiveModal('ADD')}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 600 }}
            >
              <ArrowUpRight size={14} />
              <span>Add Funds (Pay-In)</span>
            </button>
          </div>
        }
      />

      {/* Main Margin & Cash Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="surface-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Available Margin (Equity + F&O)
          </div>
          <div className="mono text-positive" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            ₹{portfolio.availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Free for fresh Intraday & Options orders
          </div>
        </div>

        <div className="surface-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Used Margin
          </div>
          <div className="mono text-warning" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            ₹{portfolio.usedMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Allocated across 3 open positions
          </div>
        </div>

        <div className="surface-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Available Cash Balance
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            ₹{portfolio.availableFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Unsettled / Settled liquid bank balance
          </div>
        </div>

        <div className="surface-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Collateral Margin
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            ₹{portfolio.collateral.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Pledged against long-term holdings
          </div>
        </div>
      </div>

      {/* Detailed Margin Breakdown & Segment Availability */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* Left: Margin Breakdown Table */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
            Margin Statement & Limits Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-secondary">Opening Balance (Cash)</span>
              <span className="mono" style={{ fontWeight: 600 }}>₹2,15,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-secondary">Pay-In (Today)</span>
              <span className="mono text-positive" style={{ fontWeight: 600 }}>+₹{portfolio.payIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-secondary">Pay-Out / Withdrawn</span>
              <span className="mono text-negative" style={{ fontWeight: 600 }}>-₹{portfolio.payOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-secondary">Equity CNC Margin</span>
              <span className="mono" style={{ fontWeight: 600 }}>₹35,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-secondary">F&O Span + Exposure Margin</span>
              <span className="mono" style={{ fontWeight: 600 }}>₹30,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-secondary">Option Premium Receivable / (Payable)</span>
              <span className="mono text-positive" style={{ fontWeight: 600 }}>+₹210.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border-default)', marginTop: 4 }}>
              <span style={{ fontWeight: 700 }}>Total Available Margin</span>
              <span className="mono text-positive" style={{ fontWeight: 700, fontSize: 14 }}>
                ₹{portfolio.availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Trading Account Status */}
        <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
            Segment & Broker Status
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>NSE Capital Market (Equity)</div>
                <div className="mono text-muted" style={{ fontSize: 10 }}>Segment: NSE_EQ</div>
              </div>
              <span className="badge badge-positive" style={{ fontSize: 10 }}>Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>NSE Futures & Options</div>
                <div className="mono text-muted" style={{ fontSize: 10 }}>Segment: NSE_FO</div>
              </div>
              <span className="badge badge-positive" style={{ fontSize: 10 }}>Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>BSE Capital Market</div>
                <div className="mono text-muted" style={{ fontSize: 10 }}>Segment: BSE_EQ</div>
              </div>
              <span className="badge badge-positive" style={{ fontSize: 10 }}>Active</span>
            </div>

            <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)' }}>
                <ShieldCheck size={14} style={{ color: 'var(--positive)' }} />
                <span>SEBI Margin Norms Compliant</span>
              </div>
              <div style={{ marginTop: 2 }}>Peak margin requirements are calculated in real-time.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Withdraw Funds Modals */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(23, 20, 18, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-modal)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {activeModal === 'ADD' ? 'Simulate Adding Funds (UPI / NetBanking)' : 'Simulate Funds Withdrawal'}
            </h3>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                AMOUNT (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={activeModal === 'ADD' ? payInAmount : payOutAmount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (activeModal === 'ADD') setPayInAmount(val);
                  else setPayOutAmount(val);
                }}
                className="input input-mono"
                style={{ width: '100%', fontSize: 15, fontWeight: 600 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[10000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => activeModal === 'ADD' ? setPayInAmount(amt) : setPayOutAmount(amt)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: 11 }}
                >
                  +₹{(amt / 1000)}k
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={activeModal === 'ADD' ? handleAdd : handleWithdraw}
                className="btn btn-primary"
                style={{ flex: 1.5, fontWeight: 600 }}
              >
                {activeModal === 'ADD' ? 'Deposit ₹' + payInAmount.toLocaleString('en-IN') : 'Withdraw ₹' + payOutAmount.toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
