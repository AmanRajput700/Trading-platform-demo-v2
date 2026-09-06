import { Strategy } from '../types';

/**
 * Pre-configured Algorithm Strategy Rule Templates.
 * S0 Near-Circuit Strategy and Technical Momentum Rules.
 */
export const DEFAULT_STRATEGY_TEMPLATES: Strategy[] = [
  {
    id: 'strat-1',
    name: 'S0 Near-Circuit Limit Engine',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '1 min',
    status: 'ACTIVE',
    lastRun: 'Continuous',
    matchCount: 0,
    description: 'Monitors stocks moving through 80% distance from previous close to circuit limits with 5% hysteresis.',
    groups: [
      {
        id: 'grp-1',
        logicalOperator: 'AND',
        conditions: [
          {
            id: 'c-1',
            leftIndicator: '% Change',
            operator: '>=',
            rightType: 'VALUE',
            rightValue: '80%'
          }
        ]
      }
    ]
  },
  {
    id: 'strat-2',
    name: 'Momentum Breakout',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '15 min',
    status: 'ACTIVE',
    lastRun: '5 min ago',
    matchCount: 0,
    description: 'Scans for oversold stocks breaking above 20 EMA with 1.5x volume expansion.',
    groups: [
      {
        id: 'grp-2',
        logicalOperator: 'AND',
        conditions: [
          {
            id: 'c-2-1',
            leftIndicator: 'RSI',
            operator: '<',
            rightType: 'VALUE',
            rightValue: '35'
          },
          {
            id: 'c-2-2',
            leftIndicator: 'Close Price',
            operator: '>',
            rightType: 'INDICATOR',
            rightValue: 'EMA 20',
            rightIndicator: 'EMA 20'
          }
        ]
      }
    ]
  }
];
