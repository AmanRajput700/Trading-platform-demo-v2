import React, { useState } from 'react';
import { 
  Play, 
  Sliders, 
  Loader2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { BacktestResultView } from '../../components/backtest/BacktestResultView';
import { runHistoricalBacktest } from '../../services/backtestEngine';
import { BacktestResult, BacktestConfig } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const BacktesterPage: React.FC = () => {
  const { strategies, instruments, setCurrentPage } = useTrading();

  const [selectedStock, setSelectedStock] = useState('TCS');
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || 'strat-1');
  const [dateRange, setDateRange] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL'>('1Y');
  const [timeframe, setTimeframe] = useState('15m');
  const [capital, setCapital] = useState(500000);
  const [targetPct, setTargetPct] = useState(4.5);
  const [stopLossPct, setStopLossPct] = useState(2.0);

  const [isLoading, setIsLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(() => {
    // Generate initial default backtest for TCS
    return runHistoricalBacktest({
      symbol: 'TCS',
      strategyName: 'Momentum Breakout',
      timeframe: '15m',
      dateRange: '1Y',
      initialCapital: 500000,
      targetPercent: 4.5,
      stopLossPercent: 2.0
    });
  });

  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];

  const handleRunBacktest = async () => {
    setIsLoading(true);
    // Smooth simulation delay
    await new Promise(r => setTimeout(r, 600));

    const config: BacktestConfig = {
      symbol: selectedStock,
      strategyId: selectedStrategy.id,
      strategyName: selectedStrategy.name,
      timeframe,
      dateRange,
      initialCapital: capital,
      targetPercent: targetPct,
      stopLossPercent: stopLossPct
    };

    const res = runHistoricalBacktest(config);
    setBacktestResult(res);
    setIsLoading(false);
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Page Header */}
      <PageHeader
        title="Historical Strategy Backtester"
        subtitle="Simulate and validate rule-based algorithmic strategies across historical Indian stock data from start till now"
        badge={{ text: "Quantitative Engine", variant: "accent" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage('strategy-builder')}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Sliders size={13} />
              <span>Strategy Builder</span>
            </button>
          </div>
        }
      />

      {/* Configuration & Parameters Card */}
      <div className="surface-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            Backtest Simulation Parameters
          </div>
          <span className="mono text-muted" style={{ fontSize: 11 }}>
            Engine: High-Precision Vectorized Simulator
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Stock Selection */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              INSTRUMENT / STOCK
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="select"
              style={{ width: '100%', fontWeight: 600 }}
            >
              {instruments.map(inst => (
                <option key={inst.symbol} value={inst.symbol}>
                  {inst.symbol} — {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Selection */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              STRATEGY LOGIC
            </label>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="select"
              style={{ width: '100%', fontWeight: 600 }}
            >
              {strategies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.timeframe})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range / Historical Period */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              HISTORICAL PERIOD
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="select"
              style={{ width: '100%', fontWeight: 600 }}
            >
              <option value="1M">Last 1 Month</option>
              <option value="3M">Last 3 Months</option>
              <option value="6M">Last 6 Months</option>
              <option value="1Y">Last 1 Year (250 Days)</option>
              <option value="3Y">Last 3 Years</option>
              <option value="5Y">5 Years (Start till Now)</option>
            </select>
          </div>

          {/* Timeframe */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              BAR TIMEFRAME
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="select"
              style={{ width: '100%', fontWeight: 600 }}
            >
              <option value="1m">1 Minute Candles</option>
              <option value="5m">5 Minute Candles</option>
              <option value="15m">15 Minute Candles</option>
              <option value="1h">1 Hour Candles</option>
              <option value="1D">1 Day Daily Bars</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              STARTING CAPITAL (₹)
            </label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(parseFloat(e.target.value) || 100000)}
              className="input input-mono"
              style={{ width: '100%' }}
              step="50000"
            />
          </div>

          {/* Target & Stop Loss */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                TARGET (%)
              </label>
              <input
                type="number"
                value={targetPct}
                onChange={(e) => setTargetPct(parseFloat(e.target.value) || 1)}
                className="input input-mono"
                style={{ width: '100%' }}
                step="0.5"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                STOP LOSS (%)
              </label>
              <input
                type="number"
                value={stopLossPct}
                onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 1)}
                className="input input-mono"
                style={{ width: '100%' }}
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* Strategy Conditions Preview & Action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-sunken)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Evaluated Conditions: </span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-primary)' }}>
              {selectedStrategy.groups.map(g => 
                g.conditions.map(c => `${c.leftIndicator} ${c.operator} ${c.rightValue}`).join(` ${g.logicalOperator} `)
              ).join(' OR ')}
            </span>
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ padding: '0 20px', height: 34, gap: 6, fontWeight: 700 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Simulating History...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Run Historical Backtest</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backtest Results View */}
      {backtestResult && (
        <BacktestResultView result={backtestResult} />
      )}
    </div>
  );
};
