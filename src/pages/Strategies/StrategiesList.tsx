import React from 'react';
import { 
  PlusCircle, 
  Play, 
  SlidersHorizontal, 
  Clock 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { Strategy } from '../../types';

export const StrategiesList: React.FC = () => {
  const { 
    strategies, 
    setCurrentPage, 
    setCurrentStrategyId, 
    runStrategy, 
    setActiveStrategyForResults 
  } = useTrading();

  const handleCreate = () => {
    setCurrentStrategyId(null);
    setCurrentPage('strategy-builder');
  };

  const handleEdit = (strategy: Strategy) => {
    setCurrentStrategyId(strategy.id);
    setCurrentPage('strategy-builder');
  };

  const handleRun = (strategy: Strategy) => {
    runStrategy(strategy);
  };

  const handleViewResults = (strategy: Strategy) => {
    setActiveStrategyForResults(strategy);
    setCurrentPage('strategy-results');
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1140, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Trading Strategies</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage algorithmic scanning rules, automated alerts & indicator triggers
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary"
          style={{ gap: 6, fontWeight: 600 }}
        >
          <PlusCircle size={15} />
          <span>Create Strategy</span>
        </button>
      </div>

      {/* Strategies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        {strategies.map(strat => (
          <div
            key={strat.id}
            className="surface-card"
            style={{
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>{strat.name}</h3>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span className="badge badge-neutral" style={{ fontSize: 9 }}>{strat.market}</span>
                    <span className="badge badge-neutral" style={{ fontSize: 9 }}>{strat.instrumentType}</span>
                    <span className="badge badge-neutral" style={{ fontSize: 9 }}>{strat.timeframe}</span>
                  </div>
                </div>

                <span className={`badge ${strat.status === 'ACTIVE' ? 'badge-positive' : 'badge-neutral'}`}>
                  {strat.status}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.4, minHeight: 34 }}>
                {strat.description || 'Scans instruments based on technical indicators and moving average crossovers.'}
              </p>

              {/* Condition Summary */}
              <div style={{
                backgroundColor: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: 11
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 10, textTransform: 'uppercase' }}>
                  Rules ({strat.groups.reduce((acc, g) => acc + g.conditions.length, 0)} conditions)
                </div>
                {strat.groups[0]?.conditions.slice(0, 2).map((c, i) => (
                  <div key={i} className="mono" style={{ color: 'var(--text-primary)', fontSize: 11 }}>
                    • {c.leftIndicator} {c.operator} {c.rightValue}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Meta & Actions */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
                borderTop: '1px solid var(--border-subtle)',
                fontSize: 11,
                color: 'var(--text-secondary)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  <span>{strat.lastRun}</span>
                </span>

                <span 
                  onClick={() => handleViewResults(strat)}
                  style={{ fontWeight: 600, color: 'var(--accent-primary)', cursor: 'pointer' }}
                >
                  {strat.matchCount} Matches Found →
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 6, marginTop: 10 }}>
                <button
                  onClick={() => handleEdit(strat)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 4 }}
                >
                  <SlidersHorizontal size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleRun(strat)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: 4, fontWeight: 600 }}
                >
                  <Play size={13} />
                  <span>Run Scan</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
