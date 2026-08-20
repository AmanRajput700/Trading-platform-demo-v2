import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  Loader2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { 
  Strategy, 
  ConditionGroup, 
  StrategyCondition, 
  IndicatorName, 
  ComparisonOperator, 
  MarketType 
} from '../../types';

const AVAILABLE_INDICATORS: IndicatorName[] = [
  'RSI',
  'Close Price',
  'Open Price',
  'High Price',
  'Low Price',
  'EMA 20',
  'EMA 50',
  'SMA 20',
  'SMA 50',
  'VWAP',
  'Volume',
  'Average Volume',
  'MACD',
  'Bollinger Upper',
  'Bollinger Lower',
  'ATR',
  '% Change'
];

const OPERATORS: { value: ComparisonOperator; label: string }[] = [
  { value: '<', label: '< (Less than)' },
  { value: '<=', label: '<= (Less than or equal)' },
  { value: '>', label: '> (Greater than)' },
  { value: '>=', label: '>= (Greater than or equal)' },
  { value: '==', label: '== (Equals)' },
  { value: 'crosses above', label: 'Crosses Above' },
  { value: 'crosses below', label: 'Crosses Below' },
];

export const StrategyBuilder: React.FC = () => {
  const { 
    strategies, 
    currentStrategyId, 
    saveStrategy, 
    runStrategy, 
    setCurrentPage,
    isScanning,
    scanProgress
  } = useTrading();

  const existing = strategies.find(s => s.id === currentStrategyId);

  const [name, setName] = useState(existing?.name || 'Momentum Breakout');
  const [market, setMarket] = useState<MarketType>(existing?.market || 'NSE');
  const [instrumentType, setInstrumentType] = useState(existing?.instrumentType || 'Stocks');
  const [timeframe, setTimeframe] = useState(existing?.timeframe || '15 min');
  const [description, setDescription] = useState(existing?.description || 'Oversold stocks breaking above EMA 20 with volume.');

  const [groups, setGroups] = useState<ConditionGroup[]>(
    existing?.groups || [
      {
        id: 'grp-1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c-1', leftIndicator: 'RSI', operator: '<', rightType: 'VALUE', rightValue: '35' },
          { id: 'c-2', leftIndicator: 'Close Price', operator: '>', rightType: 'INDICATOR', rightValue: 'EMA 20', rightIndicator: 'EMA 20' },
          { id: 'c-3', leftIndicator: 'Volume', operator: '>', rightType: 'MULTIPLIER', rightValue: '1.5', rightIndicator: 'Average Volume' }
        ]
      }
    ]
  );

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setMarket(existing.market);
      setInstrumentType(existing.instrumentType);
      setTimeframe(existing.timeframe);
      setDescription(existing.description || '');
      setGroups(existing.groups);
    }
  }, [existing]);

  // Condition Handlers
  const addCondition = (groupId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const newCond: StrategyCondition = {
        id: `c-${Date.now()}`,
        leftIndicator: 'RSI',
        operator: '<',
        rightType: 'VALUE',
        rightValue: '30'
      };
      return { ...g, conditions: [...g.conditions, newCond] };
    }));
  };

  const removeCondition = (groupId: string, condId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, conditions: g.conditions.filter(c => c.id !== condId) };
    }));
  };

  const updateCondition = (groupId: string, condId: string, updates: Partial<StrategyCondition>) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        conditions: g.conditions.map(c => c.id === condId ? { ...c, ...updates } : c)
      };
    }));
  };

  const addGroup = () => {
    const newGroup: ConditionGroup = {
      id: `grp-${Date.now()}`,
      logicalOperator: 'OR',
      conditions: [
        { id: `c-${Date.now()}`, leftIndicator: 'MACD', operator: 'crosses above', rightType: 'INDICATOR', rightValue: 'EMA 20', rightIndicator: 'EMA 20' }
      ]
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length <= 1) return;
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleSave = () => {
    const updatedStrategy: Strategy = {
      id: existing?.id || `strat-${Date.now()}`,
      name,
      market,
      instrumentType,
      timeframe,
      status: 'ACTIVE',
      lastRun: 'Just now',
      matchCount: 17,
      description,
      groups
    };
    saveStrategy(updatedStrategy);
  };

  const handleRun = () => {
    const updatedStrategy: Strategy = {
      id: existing?.id || `strat-${Date.now()}`,
      name,
      market,
      instrumentType,
      timeframe,
      status: 'ACTIVE',
      lastRun: 'Just now',
      matchCount: 17,
      description,
      groups
    };
    saveStrategy(updatedStrategy);
    runStrategy(updatedStrategy);
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1040, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header with Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setCurrentPage('strategies')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0 8px' }}
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>
              {existing ? `Edit Strategy: ${existing.name}` : 'Create No-Code Strategy'}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Define logical rules to scan NSE/BSE stocks and generate high-probability trade signals
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSave}
            className="btn btn-secondary"
            style={{ gap: 6 }}
          >
            <Save size={14} />
            <span>Save Strategy</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isScanning}
            className="btn btn-primary"
            style={{ gap: 6, fontWeight: 600 }}
          >
            {isScanning ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
            <span>{isScanning ? `Scanning (${scanProgress}%)...` : 'Run Strategy'}</span>
          </button>
        </div>
      </div>

      {/* Scanning Modal / Banner */}
      {isScanning && (
        <div style={{
          backgroundColor: 'var(--accent-light)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--accent-primary)', fontSize: 13 }}>
              <Loader2 size={16} className="spin" />
              <span>Scanning NSE / BSE Instruments...</span>
            </div>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{scanProgress}%</span>
          </div>
          <div style={{
            height: 4,
            backgroundColor: 'rgba(31, 95, 191, 0.2)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              width: `${scanProgress}%`,
              transition: 'width 150ms ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
            <span>Evaluating indicators (RSI, EMA 20, Volume)...</span>
            <span>2,146 instruments scanned</span>
          </div>
        </div>
      )}

      {/* Strategy Metadata Card */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Strategy Settings
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              STRATEGY NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Momentum Breakout"
              style={{ width: '100%', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              MARKET
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as MarketType)}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              INSTRUMENT TYPE
            </label>
            <select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value as any)}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="Stocks">Stocks</option>
              <option value="Futures">Futures</option>
              <option value="Options">Options</option>
              <option value="All">All Assets</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              TIMEFRAME
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="1 min">1 min</option>
              <option value="5 min">5 min</option>
              <option value="15 min">15 min</option>
              <option value="1 hour">1 hour</option>
              <option value="1 day">1 day</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
            STRATEGY DESCRIPTION & THESIS
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="Brief explanation of when and why this strategy triggers..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Conditions Builder */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Condition Logic
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              A stock triggers a match when all nested condition groups evaluate to true
            </div>
          </div>
          <button
            onClick={addGroup}
            className="btn btn-secondary btn-sm"
            style={{ gap: 4 }}
          >
            <Plus size={13} />
            <span>Add OR Group</span>
          </button>
        </div>

        {/* Condition Groups List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {groups.map((group, groupIdx) => (
            <div
              key={group.id}
              style={{
                backgroundColor: 'var(--bg-sunken)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                position: 'relative'
              }}
            >
              {/* Group Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-accent" style={{ fontSize: 10 }}>
                    {groupIdx === 0 ? 'PRIMARY RULE (WHEN)' : 'OR GROUP'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Match all conditions below (AND)
                  </span>
                </div>
                {groups.length > 1 && (
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="btn btn-ghost btn-sm text-negative"
                    style={{ padding: '2px 6px', height: 'auto', fontSize: 11 }}
                  >
                    Remove Group
                  </button>
                )}
              </div>

              {/* Conditions with Visual Connecting Vertical Rule */}
              <div style={{
                position: 'relative',
                paddingLeft: 18,
                borderLeft: '2px solid var(--accent-primary)',
                marginLeft: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {group.conditions.map((cond, condIdx) => (
                  <div
                    key={cond.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px'
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 42 }}>
                      {condIdx === 0 ? 'WHEN' : 'AND'}
                    </span>

                    {/* Left Indicator */}
                    <select
                      value={cond.leftIndicator}
                      onChange={(e) => updateCondition(group.id, cond.id, { leftIndicator: e.target.value as IndicatorName })}
                      className="select"
                      style={{ minWidth: 130, height: 28, fontSize: 12 }}
                    >
                      {AVAILABLE_INDICATORS.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>

                    {/* Operator */}
                    <select
                      value={cond.operator}
                      onChange={(e) => updateCondition(group.id, cond.id, { operator: e.target.value as ComparisonOperator })}
                      className="select"
                      style={{ minWidth: 140, height: 28, fontSize: 12 }}
                    >
                      {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>

                    {/* Right Side Mode */}
                    <select
                      value={cond.rightType}
                      onChange={(e) => updateCondition(group.id, cond.id, { rightType: e.target.value as any })}
                      className="select"
                      style={{ minWidth: 100, height: 28, fontSize: 12 }}
                    >
                      <option value="VALUE">Value</option>
                      <option value="INDICATOR">Indicator</option>
                      <option value="MULTIPLIER">Multiplier</option>
                    </select>

                    {/* Right Value / Indicator Input */}
                    {cond.rightType === 'VALUE' ? (
                      <input
                        type="text"
                        value={cond.rightValue}
                        onChange={(e) => updateCondition(group.id, cond.id, { rightValue: e.target.value })}
                        className="input input-mono"
                        placeholder="e.g. 35"
                        style={{ width: 80, height: 28, fontSize: 12 }}
                      />
                    ) : cond.rightType === 'INDICATOR' ? (
                      <select
                        value={cond.rightIndicator || 'EMA 20'}
                        onChange={(e) => updateCondition(group.id, cond.id, { rightIndicator: e.target.value as IndicatorName, rightValue: e.target.value })}
                        className="select"
                        style={{ minWidth: 130, height: 28, fontSize: 12 }}
                      >
                        {AVAILABLE_INDICATORS.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="text"
                          value={cond.rightValue}
                          onChange={(e) => updateCondition(group.id, cond.id, { rightValue: e.target.value })}
                          className="input input-mono"
                          placeholder="1.5"
                          style={{ width: 50, height: 28, fontSize: 12 }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>× Average Volume</span>
                      </div>
                    )}

                    {/* Delete Condition */}
                    {group.conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(group.id, cond.id)}
                        className="btn btn-ghost"
                        style={{ padding: 4, height: 'auto', color: 'var(--text-tertiary)' }}
                        title="Delete Condition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Condition to Group */}
                <button
                  onClick={() => addCondition(group.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start', gap: 4, fontSize: 11, color: 'var(--accent-primary)', padding: '2px 8px' }}
                >
                  <Plus size={12} />
                  <span>Add Condition</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scanning Summary / Action Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Calculated across 2,146 NSE instruments using current 15m candle bar data.</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleRun}
            className="btn btn-primary"
            style={{ gap: 6, fontWeight: 600, padding: '0 16px' }}
          >
            <Play size={14} />
            <span>Scan & View Results</span>
          </button>
        </div>
      </div>
    </div>
  );
};
