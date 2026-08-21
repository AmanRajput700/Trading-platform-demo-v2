import { Strategy } from '../types';

export const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: 'strat-1',
    name: 'Momentum Breakout',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '15 min',
    status: 'ACTIVE',
    lastRun: '2 min ago',
    matchCount: 7,
    description: 'Scans for oversold stocks breaking above the 20-period exponential moving average with volume expansion.',
    groups: [
      {
        id: 'grp-1',
        logicalOperator: 'AND',
        conditions: [
          {
            id: 'c-1',
            leftIndicator: 'RSI',
            operator: '<',
            rightType: 'VALUE',
            rightValue: '35'
          },
          {
            id: 'c-2',
            leftIndicator: 'Close Price',
            operator: '>',
            rightType: 'INDICATOR',
            rightValue: 'EMA 20',
            rightIndicator: 'EMA 20'
          },
          {
            id: 'c-3',
            leftIndicator: 'Volume',
            operator: '>',
            rightType: 'MULTIPLIER',
            rightValue: '1.5',
            rightIndicator: 'Average Volume'
          }
        ]
      }
    ]
  },
  {
    id: 'strat-2',
    name: 'RSI Reversal',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '5 min',
    status: 'ACTIVE',
    lastRun: '5 min ago',
    matchCount: 12,
    description: 'Captures mean-reversion bounces when RSI dips below 30 and MACD histogram turns positive.',
    groups: [
      {
        id: 'grp-2',
        logicalOperator: 'AND',
        conditions: [
          {
            id: 'c-4',
            leftIndicator: 'RSI',
            operator: '<',
            rightType: 'VALUE',
            rightValue: '30'
          },
          {
            id: 'c-5',
            leftIndicator: 'Close Price',
            operator: '>',
            rightType: 'INDICATOR',
            rightValue: 'VWAP',
            rightIndicator: 'VWAP'
          }
        ]
      }
    ]
  },
  {
    id: 'strat-3',
    name: 'Moving Average Cross',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '1 hour',
    status: 'PAUSED',
    lastRun: 'Yesterday',
    matchCount: 0,
    description: 'Golden cross strategy scanning for 20 EMA crossing above 50 SMA with positive momentum.',
    groups: [
      {
        id: 'grp-3',
        logicalOperator: 'AND',
        conditions: [
          {
            id: 'c-6',
            leftIndicator: 'EMA 20',
            operator: 'crosses above',
            rightType: 'INDICATOR',
            rightValue: 'SMA 50',
            rightIndicator: 'SMA 50'
          }
        ]
      }
    ]
  },
  {
    id: 'strat-4',
    name: 'Order Book Depth Scalper',
    market: 'NSE',
    instrumentType: 'Stocks',
    timeframe: '5 min',
    status: 'ACTIVE',
    lastRun: '1 min ago',
    matchCount: 4,
    description: 'High-frequency order book imbalance strategy scanning for >15% bid-heavy pressure with tight spread and VWAP support.',
    groups: [
      {
        id: 'grp-4',
        logicalOperator: 'AND',
        conditions: [
          {
            id: 'c-7',
            leftIndicator: 'Order Book Imbalance',
            operator: '>',
            rightType: 'VALUE',
            rightValue: '15'
          },
          {
            id: 'c-8',
            leftIndicator: 'Buy/Sell Ratio',
            operator: '>',
            rightType: 'VALUE',
            rightValue: '1.2'
          },
          {
            id: 'c-9',
            leftIndicator: 'Close Price',
            operator: '>',
            rightType: 'INDICATOR',
            rightValue: 'VWAP',
            rightIndicator: 'VWAP'
          }
        ]
      }
    ]
  }
];

