import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Award, 
  Calendar,
  CheckCircle,
  XCircle,
  BarChart2,
  ListFilter
} from 'lucide-react';
import { BacktestResult } from '../../types';

interface BacktestResultViewProps {
  result: BacktestResult;
}

export const BacktestResultView: React.FC<BacktestResultViewProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'trades'>('chart');
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  const isPos = result.totalReturn >= 0;
  const filteredTrades = result.trades.filter(t => {
    if (tradeFilter === 'WIN') return t.status === 'WIN';
    if (tradeFilter === 'LOSS') return t.status === 'LOSS';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Top Banner KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
        {/* Total Return */}
        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Total Return</span>
            <span className={`badge ${isPos ? 'badge-positive' : 'badge-negative'}`} style={{ fontSize: 9.5 }}>
              {isPos ? '+' : ''}{result.totalReturnPercent}%
            </span>
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
            {isPos ? '+' : ''}₹{result.totalReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Benchmark: +{result.benchmarkReturnPercent}%
          </div>
        </div>

        {/* Win Rate */}
        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Win Rate</span>
            <Award size={13} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {result.winRate}%
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            {result.winningTrades} Wins / {result.losingTrades} Losses ({result.totalTrades} Trades)
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Max Drawdown</span>
            <ShieldCheck size={13} style={{ color: 'var(--negative)' }} />
          </div>
          <div className="mono text-negative" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            -{result.maxDrawdownPercent}%
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Peak to trough loss
          </div>
        </div>

        {/* Profit Factor & Sharpe */}
        <div className="surface-card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 11, fontWeight: 600 }}>Profit Factor & Sharpe</span>
            <Target size={13} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {result.profitFactor} <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/ {result.sharpeRatio}</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Expectancy: ₹{result.avgTradePnl.toLocaleString('en-IN')}/trade
          </div>
        </div>
      </div>

      {/* Main Backtest View Card (Tabs: Equity Curve / Trade Journal) */}
      <div className="surface-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar & Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-default)',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setActiveTab('chart')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                fontWeight: activeTab === 'chart' ? 600 : 500,
                backgroundColor: activeTab === 'chart' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'chart' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <BarChart2 size={12} />
              <span>Equity Curve</span>
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                fontWeight: activeTab === 'trades' ? 600 : 500,
                backgroundColor: activeTab === 'trades' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'trades' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <ListFilter size={12} />
              <span>Trade Journal ({result.trades.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
            <Calendar size={12} />
            <span>{result.periodTested}</span>
          </div>
        </div>

        {/* Tab 1: Equity Curve Chart */}
        {activeTab === 'chart' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 3, backgroundColor: 'var(--positive)', display: 'inline-block' }} />
                  <span style={{ fontWeight: 600 }}>Strategy Capital: ₹{result.finalCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 3, backgroundColor: 'var(--text-tertiary)', display: 'inline-block' }} />
                  <span className="text-secondary">Benchmark (Buy & Hold)</span>
                </div>
              </div>

              <div className="mono text-muted">
                Initial: ₹{result.initialCapital.toLocaleString('en-IN')}
              </div>
            </div>

            {/* SVG Equity Curve Chart */}
            <div style={{ height: 220, position: 'relative', backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                {[0, 1, 2, 3, 4].map(grid => (
                  <line
                    key={grid}
                    x1="0"
                    y1={20 + grid * 35}
                    x2="500"
                    y2={20 + grid * 35}
                    stroke="var(--border-subtle)"
                    strokeDasharray="2 2"
                  />
                ))}

                {/* Benchmark Line (Gray dashed) */}
                {(() => {
                  const pts = result.equityCurve;
                  if (pts.length < 2) return null;
                  const maxEq = Math.max(...pts.map(p => Math.max(p.equity, p.benchmark))) * 1.05;
                  const minEq = Math.min(...pts.map(p => Math.min(p.equity, p.benchmark))) * 0.95;
                  const range = maxEq - minEq || 1;

                  let linePath = '';
                  pts.forEach((p, i) => {
                    const x = (i / (pts.length - 1)) * 480 + 10;
                    const y = 160 - ((p.benchmark - minEq) / range) * 140;
                    linePath += `${i === 0 ? 'M' : 'L'}${x},${y} `;
                  });

                  return <path d={linePath} fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeDasharray="3 3" />;
                })()}

                {/* Strategy Equity Curve (Green/Red Line with area fill) */}
                {(() => {
                  const pts = result.equityCurve;
                  if (pts.length < 2) return null;
                  const maxEq = Math.max(...pts.map(p => Math.max(p.equity, p.benchmark))) * 1.05;
                  const minEq = Math.min(...pts.map(p => Math.min(p.equity, p.benchmark))) * 0.95;
                  const range = maxEq - minEq || 1;

                  let linePath = '';
                  let areaPath = 'M10,165 ';
                  pts.forEach((p, i) => {
                    const x = (i / (pts.length - 1)) * 480 + 10;
                    const y = 160 - ((p.equity - minEq) / range) * 140;
                    linePath += `${i === 0 ? 'M' : 'L'}${x},${y} `;
                    areaPath += `L${x},${y} `;
                  });
                  areaPath += 'L490,165 Z';

                  return (
                    <>
                      <path d={areaPath} fill="rgba(22, 199, 132, 0.12)" />
                      <path d={linePath} fill="none" stroke="var(--positive)" strokeWidth="2.5" />
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Performance Insights Pill */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-sunken)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} style={{ color: 'var(--positive)' }} />
                <span>Strategy demonstrated <strong>positive statistical expectancy</strong> with a {result.winRate}% win rate across {result.trades.length} sample trades.</span>
              </div>
              <span className="mono text-muted" style={{ fontSize: 10 }}>Max Streak: {result.maxConsecutiveWins}W / {result.maxConsecutiveLosses}L</span>
            </div>
          </div>
        )}

        {/* Tab 2: Trade Execution Journal */}
        {activeTab === 'trades' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Filter Sub-bar */}
            <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-sunken)' }}>
              {(['ALL', 'WIN', 'LOSS'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTradeFilter(f)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    height: 22,
                    fontSize: 10.5,
                    backgroundColor: tradeFilter === f ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: tradeFilter === f ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  {f === 'ALL' ? `All (${result.trades.length})` : f === 'WIN' ? `Wins (${result.winningTrades})` : `Losses (${result.losingTrades})`}
                </button>
              ))}
            </div>

            {/* Trades Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: 11.5 }}>
                <thead>
                  <tr>
                    <th>Trade #</th>
                    <th>Entry Date</th>
                    <th>Exit Date</th>
                    <th className="text-right">Entry (₹)</th>
                    <th className="text-right">Exit (₹)</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">P&L (₹)</th>
                    <th className="text-right">P&L (%)</th>
                    <th>Trigger & Exit Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map(trade => {
                    const isWin = trade.status === 'WIN';
                    return (
                      <tr key={trade.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isWin ? (
                              <CheckCircle size={12} style={{ color: 'var(--positive)' }} />
                            ) : (
                              <XCircle size={12} style={{ color: 'var(--negative)' }} />
                            )}
                            <span className="mono" style={{ fontWeight: 600 }}>{trade.id}</span>
                          </div>
                        </td>
                        <td className="text-secondary">{trade.entryDate}</td>
                        <td className="text-secondary">{trade.exitDate}</td>
                        <td className="text-right mono">₹{trade.entryPrice.toFixed(2)}</td>
                        <td className="text-right mono">₹{trade.exitPrice.toFixed(2)}</td>
                        <td className="text-right mono">{trade.quantity}</td>
                        <td className={`text-right mono ${isWin ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 700 }}>
                          {isWin ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right mono ${isWin ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 600 }}>
                          {isWin ? '+' : ''}{trade.pnlPercent}%
                        </td>
                        <td className="text-secondary" style={{ fontSize: 11 }}>
                          {trade.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
