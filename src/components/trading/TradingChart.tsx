import React from 'react';
import { TVChart } from './TVChart';
import { ChartTimeframe } from '../../services/ohlcService';

interface TradingChartProps {
  symbol: string;
  basePrice?: number;
  timeframe?: string;
  hasSignal?: boolean;
  signalName?: string;
  signalTime?: string;
}

/**
 * TradingChart — Re-exports genuine TradingView Lightweight Charts powered by Upstox V3 Market Data.
 * 100% Genuine Data — Zero synthetic/mock candle generators.
 */
export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  basePrice,
  timeframe = '15m',
  hasSignal,
  signalName,
  signalTime
}) => {
  return (
    <TVChart
      symbol={symbol}
      basePrice={basePrice}
      timeframe={timeframe as ChartTimeframe}
      hasSignal={hasSignal}
      signalName={signalName}
      signalTime={signalTime}
    />
  );
};
