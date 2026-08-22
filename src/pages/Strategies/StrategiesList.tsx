import React, { useState } from 'react';
import { 
  PlusCircle, 
  Play, 
  SlidersHorizontal, 
  Clock
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { Strategy } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const StrategiesList: React.FC = () => {
  const { 
    strategies, 
    setCurrentPage, 
    setCurrentStrategyId, 
    runStrategy, 
    setActiveStrategyForResults,
    canCreateStrategy
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filteredStrategies = strategies.filter(strat => {
    if (statusFilter !== 'ALL' && strat.status !== statusFilter) return false;
    if (searchQuery && 
        !strat.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !strat.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !strat.market.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

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

  const activeCount = strategies.filter(s => s.status === 'ACTIVE').length;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1140, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Trading Strategies"
        subtitle="Manage algorithmic scanning rules, automated alerts & indicator triggers"
        badge={{ text: `${activeCount} Active Rules`, variant: 'positive' }}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search strategy name...',
          count: filteredStrategies.length,
          total: strategies.length
        }}
        actions={
          canCreateStrategy ? (
            <button
              onClick={handleCreate}
              className="btn btn-primary"
              style={{ gap: 6, fontWeight: 600 }}
            >
              <PlusCircle size={15} />
              <span>Create Strategy</span>
            </button>
          ) : undefined
        }
      >
        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                fontWeight: statusFilter === status ? 600 : 500,
                backgroundColor: statusFilter === status ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: statusFilter === status ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer'
              }}
            >
              {status === 'ALL' ? `All (${strategies.length})` : status === 'ACTIVE' ? `Active (${activeCount})` : `Inactive (${strategies.length - activeCount})`}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Strategies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {filteredStrategies.length === 0 ? (
          <div className="surface-card" style={{ gridColumn: '1 / -1', padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
              No strategies found matching your filter criteria.
            </div>
          </div>
        ) : (
          filteredStrategies.map(strat => (
          <div
            key={strat.id}
            className="surface-card"
            style={{
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
              borderLeft: strat.status === 'ACTIVE' ? '3px solid var(--positive)' : '3px solid var(--border-default)'
            }}
          >
            {/* Top Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{strat.name}</h3>
                <span className={`badge ${strat.status === 'ACTIVE' ? 'badge-positive' : 'badge-neutral'}`} style={{ fontSize: 9.5 }}>
                  {strat.status}
                </span>
              </div>

              {strat.description && (
                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {strat.description}
                </p>
              )}

              {/* Badges / Metrics */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>{strat.market}</span>
                <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>{strat.instrumentType}</span>
                <span className="badge badge-accent" style={{ fontSize: 9.5 }}>{strat.timeframe}</span>
              </div>

              {/* Condition Summary Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {strat.groups.flatMap(g => g.conditions).map((c, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      backgroundColor: 'var(--bg-sunken)',
                      color: 'var(--text-secondary)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {c.leftIndicator} {c.operator} {c.rightValue}
                  </span>
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

              <div style={{ display: 'grid', gridTemplateColumns: canCreateStrategy ? '1fr 1.4fr' : '1fr', gap: 6, marginTop: 10 }}>
                {canCreateStrategy && (
                  <button
                    onClick={() => handleEdit(strat)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 4 }}
                  >
                    <SlidersHorizontal size={13} />
                    <span>Edit</span>
                  </button>
                )}
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
        )))}
      </div>
    </div>
  );
};
