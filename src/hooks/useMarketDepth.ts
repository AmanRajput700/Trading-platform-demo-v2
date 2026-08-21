import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketDepthData, ConnectionStatus } from '../types';
import { marketDepthService } from '../services/marketDepthService';

export interface ChangedField {
  type: 'buy' | 'sell';
  index: number;
  field: 'price' | 'quantity' | 'orders';
  direction: 'up' | 'down';
}

export function useMarketDepth(symbol: string) {
  const [depthData, setDepthData] = useState<MarketDepthData | null>(() => {
    return marketDepthService.getCurrentDepth(symbol) || null;
  });
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [changedFields, setChangedFields] = useState<ChangedField[]>([]);
  const prevDataRef = useRef<MarketDepthData | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!symbol) return;

    prevDataRef.current = null;
    setDepthData(null);
    setStatus('connecting');
    setIsPaused(marketDepthService.isPaused(symbol));

    const unsubscribe = marketDepthService.subscribe(
      symbol,
      (newData) => {
        // Detect changed levels for micro-animations
        const prev = prevDataRef.current;
        if (prev && prev.symbol === newData.symbol) {
          const changes: ChangedField[] = [];

          // Compare Buy levels
          newData.depth.buy.forEach((lvl, idx) => {
            const prevLvl = prev.depth.buy[idx];
            if (!prevLvl) return;
            if (lvl.price !== prevLvl.price) {
              changes.push({
                type: 'buy',
                index: idx,
                field: 'price',
                direction: lvl.price > prevLvl.price ? 'up' : 'down'
              });
            } else if (lvl.quantity !== prevLvl.quantity) {
              changes.push({
                type: 'buy',
                index: idx,
                field: 'quantity',
                direction: lvl.quantity > prevLvl.quantity ? 'up' : 'down'
              });
            }
          });

          // Compare Sell levels
          newData.depth.sell.forEach((lvl, idx) => {
            const prevLvl = prev.depth.sell[idx];
            if (!prevLvl) return;
            if (lvl.price !== prevLvl.price) {
              changes.push({
                type: 'sell',
                index: idx,
                field: 'price',
                direction: lvl.price > prevLvl.price ? 'up' : 'down'
              });
            } else if (lvl.quantity !== prevLvl.quantity) {
              changes.push({
                type: 'sell',
                index: idx,
                field: 'quantity',
                direction: lvl.quantity > prevLvl.quantity ? 'up' : 'down'
              });
            }
          });

          if (changes.length > 0) {
            setChangedFields(changes);
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
            flashTimeoutRef.current = setTimeout(() => {
              setChangedFields([]);
            }, 450);
          }
        }

        prevDataRef.current = newData;
        setDepthData(newData);
      },
      (newStatus) => {
        setStatus(newStatus);
        setIsPaused(marketDepthService.isPaused(symbol));
      }
    );

    return () => {
      unsubscribe();
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [symbol]);

  const togglePause = useCallback(() => {
    if (!symbol) return;
    const paused = marketDepthService.togglePause(symbol);
    setIsPaused(paused);
  }, [symbol]);

  const reconnect = useCallback(() => {
    if (!symbol) return;
    marketDepthService.reconnect(symbol);
  }, [symbol]);

  return {
    depthData,
    status,
    isPaused,
    changedFields,
    togglePause,
    reconnect
  };
}
