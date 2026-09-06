/**
 * Virtual Paper Trading Sandbox Initialization Configuration.
 * Isolated strictly to Paper Simulation Mode — Never utilized in Live Broker Trading.
 */

import { PortfolioSummary, BrokerConnection } from '../types';

export const PAPER_SANDBOX_PORTFOLIO: PortfolioSummary = {
  portfolioValue: 250000.00,
  todayPnl: 0.00,
  todayPnlPercent: 0.00,
  overallPnl: 0.00,
  overallPnlPercent: 0.00,
  availableFunds: 250000.00,
  usedMargin: 0.00,
  availableMargin: 250000.00,
  collateral: 0.00,
  payIn: 250000.00,
  payOut: 0.00
};

export const PAPER_SANDBOX_BROKERS: BrokerConnection[] = [
  {
    id: 'broker-upstox',
    name: 'Upstox Pro API V3',
    logoText: 'UP',
    brandColor: '#5C2D91',
    status: 'Not Connected',
    connected: false,
    brokerType: 'UPSTOX',
    clientId: '',
    lastSync: 'Not Connected',
  }
];
