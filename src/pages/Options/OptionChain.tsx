import React, { useState, useEffect, useCallback } from 'react';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';
import { optionChainService, OptionChainResponse, OptionChainContract } from '../../services/optionChainService';
import { marketFeedService, LiveMarketTick } from '../../services/marketFeedService';
import { RefreshCw, AlertCircle, Zap, Radio } from 'lucide-react';

const POPULAR_ASSETS = [
  { label: 'NIFTY 50', value: 'NIFTY 50', type: 'INDEX' },
  { label: 'BANK NIFTY', value: 'BANK NIFTY', type: 'INDEX' },
  { label: 'FINNIFTY', value: 'FINNIFTY', type: 'INDEX' },
  { label: 'SENSEX', value: 'SENSEX', type: 'INDEX' },
  { label: 'RELIANCE', value: 'RELIANCE', type: 'STOCK' },
  { label: 'TCS', value: 'TCS', type: 'STOCK' },
  { label: 'INFY', value: 'INFY', type: 'STOCK' },
  { label: 'HDFCBANK', value: 'HDFCBANK', type: 'STOCK' },
  { label: 'ICICIBANK', value: 'ICICIBANK', type: 'STOCK' },
  { label: 'TATAMOTORS', value: 'TATAMOTORS', type: 'STOCK' },
  { label: 'SBIN', value: 'SBIN', type: 'STOCK' },
];

export const OptionChain: React.FC = () => {
  const { indices, instruments, getInstrument, openQuickOrder, setCurrentPage } = useTrading();
  
  const [selectedAsset, setSelectedAsset] = useState<string>('NIFTY 50');
  const [availableExpiries, setAvailableExpiries] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [chainData, setChainData] = useState<OptionChainResponse | null>(null);
  const [contracts, setContracts] = useState<OptionChainContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingExpiries, setIsLoadingExpiries] = useState<boolean>(false);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [liveSpotPrice, setLiveSpotPrice] = useState<number>(0);
  const [liveSpotChange, setLiveSpotChange] = useState<number>(0);
  const [liveSpotChangePct, setLiveSpotChangePct] = useState<number>(0);

  // Dynamically resolve target asset from context
  const targetInstrument = getInstrument(selectedAsset) || 
    indices.find((i: any) => i.symbol === selectedAsset) || 
    instruments.find(i => i.symbol === selectedAsset);

  // 1. Fetch available expiries when selectedAsset changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingExpiries(true);
    optionChainService.getOptionExpiries(selectedAsset)
      .then(exps => {
        if (!isMounted) return;
        setAvailableExpiries(exps);
        if (exps && exps.length > 0) {
          setSelectedExpiry(prev => (exps.includes(prev) ? prev : exps[0]));
        } else {
          setSelectedExpiry('');
        }
      })
      .catch(err => {
        console.warn('Error fetching expiries:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingExpiries(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAsset]);

  // 2. Fetch Option Chain when selectedAsset or selectedExpiry changes
  const loadOptionChain = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await optionChainService.getOptionChain(selectedAsset, selectedExpiry || undefined);
      setChainData(data);
      if (data?.contracts) {
        setContracts(data.contracts);
      } else {
        setContracts([]);
      }
      if (data?.spotPrice) {
        setLiveSpotPrice(data.spotPrice);
      }
    } catch (err) {
      console.warn('Failed to load option chain:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAsset, selectedExpiry]);

  useEffect(() => {
    if (selectedAsset) {
      loadOptionChain();
    }
  }, [selectedAsset, selectedExpiry, loadOptionChain]);

  // 3. Keep Spot Price updated from context if available
  useEffect(() => {
    if (targetInstrument && targetInstrument.price > 0) {
      setLiveSpotPrice(targetInstrument.price);
      setLiveSpotChange(targetInstrument.change || 0);
      setLiveSpotChangePct(targetInstrument.changePercent || 0);
    }
  }, [targetInstrument]);

  // 4. WebSocket Live Streaming for option strikes and underlying spot
  useEffect(() => {
    if (!contracts || contracts.length === 0) return;

    // Build map of contract keys -> strike + type
    const keyMap = new Map<string, { strike: number; type: 'call' | 'put' }>();
    contracts.forEach(c => {
      if (c.call.instrumentKey) keyMap.set(c.call.instrumentKey, { strike: c.strike, type: 'call' });
      if (c.put.instrumentKey) keyMap.set(c.put.instrumentKey, { strike: c.strike, type: 'put' });
    });

    const unsubscribe = marketFeedService.subscribeGlobal((tick: LiveMarketTick) => {
      // Check if tick matches underlying spot
      const cleanSym = selectedAsset.replace(' 50', '').replace(' ', '').toUpperCase();
      const tickSym = (tick.symbol || '').replace(' 50', '').replace(' ', '').toUpperCase();

      if (tickSym === cleanSym || tick.instrument_key?.includes(cleanSym)) {
        if (tick.price > 0) {
          setLiveSpotPrice(tick.price);
          setLiveSpotChange(tick.change || 0);
          setLiveSpotChangePct(tick.change_percent || 0);
        }
      }

      // Check if tick matches any option contract
      const match = keyMap.get(tick.instrument_key) || keyMap.get(tick.symbol);
      if (match && tick.price > 0) {
        const { strike, type } = match;
        setContracts(prev => prev.map(row => {
          if (row.strike !== strike) return row;
          const currentLtp = type === 'call' ? row.call.ltp : row.put.ltp;
          const flash = tick.price >= currentLtp ? 'up' : 'down';
          
          // Flash animation trigger
          setPriceFlashes(f => ({ ...f, [`${strike}_${type}`]: flash }));
          setTimeout(() => {
            setPriceFlashes(f => {
              const copy = { ...f };
              delete copy[`${strike}_${type}`];
              return copy;
            });
          }, 450);

          if (type === 'call') {
            return {
              ...row,
              call: {
                ...row.call,
                ltp: tick.price,
                change: tick.change || row.call.change,
                volume: tick.volume || row.call.volume,
                oi: tick.oi || row.call.oi,
              }
            };
          } else {
            return {
              ...row,
              put: {
                ...row.put,
                ltp: tick.price,
                change: tick.change || row.put.change,
                volume: tick.volume || row.put.volume,
                oi: tick.oi || row.put.oi,
              }
            };
          }
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [contracts, selectedAsset]);

  const displaySpotPrice = liveSpotPrice || chainData?.spotPrice || targetInstrument?.price || 24850.0;
  const displaySpotChange = liveSpotChange ?? targetInstrument?.change ?? 0;
  const displaySpotChangePct = liveSpotChangePct ?? targetInstrument?.changePercent ?? 0;

  const strikeStep = selectedAsset.includes('NIFTY') ? 50 : selectedAsset.includes('SENSEX') ? 100 : 20;
  const atmStrike = Math.round(displaySpotPrice / strikeStep) * strikeStep;

  const lotSize = selectedAsset.includes('BANK') ? 15 : selectedAsset.includes('NIFTY') ? 75 : 50;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1380, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header */}
      <PageHeader
        title="Live Options Chain Matrix"
        subtitle="Real-time multi-strike streaming, implied volatility & instant options order entry"
        badge={{ text: "NSE F&O STREAMING", variant: "accent" }}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{selectedAsset} Spot</span>
                <span className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                  ₹{displaySpotPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="badge badge-sm badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, padding: '2px 6px' }}>
                  <Radio size={10} className="animate-pulse" /> LIVE
                </span>
              </div>
              <div className={`mono ${displaySpotChange >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 11, fontWeight: 600 }}>
                {displaySpotChange >= 0 ? '+' : ''}{displaySpotChange.toFixed(2)} ({displaySpotChange >= 0 ? '+' : ''}{displaySpotChangePct.toFixed(2)}%)
              </div>
            </div>

            {/* Asset Selector */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="select"
                style={{ fontWeight: 600, height: 32, fontSize: 12, minWidth: 130 }}
              >
                {POPULAR_ASSETS.map(asset => (
                  <option key={asset.value} value={asset.value}>
                    {asset.label} ({asset.type})
                  </option>
                ))}
              </select>

              {/* Dynamic Expiry Selector */}
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="select"
                disabled={isLoadingExpiries || availableExpiries.length === 0}
                style={{ fontWeight: 600, height: 32, fontSize: 12, minWidth: 150 }}
              >
                {availableExpiries.length === 0 ? (
                  <option value="">{isLoadingExpiries ? 'Loading expiries...' : 'No active expiries'}</option>
                ) : (
                  availableExpiries.map((exp, idx) => (
                    <option key={exp} value={exp}>
                      {exp} {idx === 0 ? '(Current)' : idx === 1 ? '(Next)' : '(Far)'}
                    </option>
                  ))
                )}
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadOptionChain}
                className="btn btn-secondary btn-sm"
                title="Refresh Option Chain"
                style={{ height: 32, width: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        }
      />

      {/* Broker Notice Banner if broker authentication is needed for real-time Greeks / OI */}
      {chainData?.requiresBrokerAuth && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          gap: 12,
          flexWrap: 'wrap',
          fontSize: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Streaming Official Exchange Strikes:</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>
                Live prices and genuine contracts are connected. Connect your Upstox broker account to unlock real-time Greeks (Delta, Theta, Vega) & dynamic Open Interest.
              </span>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('connect-broker' as any)}
            className="btn btn-primary btn-sm"
            style={{ fontSize: 11, height: 28, padding: '0 12px', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            Connect Upstox Broker
          </button>
        </div>
      )}

      {/* Main Option Chain Matrix */}
      <div className="surface-card" style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
        {contracts.length === 0 && !isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 10px', color: 'var(--warning)' }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>No F&O Contracts Found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              No active options contracts returned from the exchange for {selectedAsset} on {selectedExpiry || 'selected expiry'}.
            </div>
          </div>
        ) : (
          <table className="data-table" style={{ fontSize: 11.5, width: '100%', minWidth: 1050 }}>
            <thead>
              <tr>
                <th colSpan={6} style={{ textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--positive)', borderRight: '2px solid var(--border-default)', fontWeight: 700 }}>
                  CALLS (CE)
                </th>
                <th style={{ textAlign: 'center', backgroundColor: 'var(--bg-sunken)', width: 110, fontWeight: 700 }}>
                  STRIKE
                </th>
                <th colSpan={6} style={{ textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--negative)', borderLeft: '2px solid var(--border-default)', fontWeight: 700 }}>
                  PUTS (PE)
                </th>
              </tr>
              <tr>
                {/* Call Columns */}
                <th className="text-right">OI (Lakhs)</th>
                <th className="text-right">Delta</th>
                <th className="text-right">IV (%)</th>
                <th className="text-right">Volume</th>
                <th className="text-right" style={{ minWidth: 90 }}>LTP (₹)</th>
                <th className="text-right" style={{ borderRight: '2px solid var(--border-default)', width: 80 }}>Trade</th>

                {/* Strike Column */}
                <th className="text-center" style={{ backgroundColor: 'var(--bg-sunken)' }}>Strike</th>

                {/* Put Columns */}
                <th style={{ borderLeft: '2px solid var(--border-default)', width: 80 }}>Trade</th>
                <th className="text-right" style={{ minWidth: 90 }}>LTP (₹)</th>
                <th className="text-right">Volume</th>
                <th className="text-right">IV (%)</th>
                <th className="text-right">Delta</th>
                <th className="text-right">OI (Lakhs)</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(row => {
                const isAtm = row.strike === atmStrike;
                const callFlash = priceFlashes[`${row.strike}_call`];
                const putFlash = priceFlashes[`${row.strike}_put`];
                
                const callOiDisplay = row.call.oi > 0 ? `${(row.call.oi / 100000).toFixed(2)}L` : '--';
                const putOiDisplay = row.put.oi > 0 ? `${(row.put.oi / 100000).toFixed(2)}L` : '--';
                const callVolDisplay = row.call.volume > 0 ? `${(row.call.volume / 1000).toFixed(1)}k` : '--';
                const putVolDisplay = row.put.volume > 0 ? `${(row.put.volume / 1000).toFixed(1)}k` : '--';

                return (
                  <tr
                    key={row.strike}
                    style={{
                      backgroundColor: isAtm 
                        ? 'rgba(245, 158, 11, 0.12)' 
                        : (row.strike < atmStrike ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'),
                      borderTop: isAtm ? '2px solid var(--warning)' : undefined,
                      borderBottom: isAtm ? '2px solid var(--warning)' : undefined
                    }}
                  >
                    {/* CALLS (CE) */}
                    <td className="text-right mono text-muted">{callOiDisplay}</td>
                    <td className="text-right mono text-muted">{row.call.delta !== 0 ? row.call.delta.toFixed(2) : '--'}</td>
                    <td className="text-right mono">{row.call.iv > 0 ? `${row.call.iv.toFixed(1)}%` : '--'}</td>
                    <td className="text-right mono text-muted">{callVolDisplay}</td>
                    <td 
                      className="text-right mono" 
                      style={{ 
                        fontWeight: 700, 
                        color: 'var(--positive)',
                        backgroundColor: callFlash === 'up' ? 'rgba(16, 185, 129, 0.3)' : callFlash === 'down' ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                        transition: 'background-color 250ms ease'
                      }}
                    >
                      ₹{row.call.ltp.toFixed(2)}
                    </td>
                    <td className="text-right" style={{ borderRight: '2px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openQuickOrder({
                          symbol: `${selectedAsset} ${row.strike} CE`,
                          name: `${selectedAsset} ${row.strike} CALL`,
                          side: 'BUY',
                          price: row.call.ltp > 0 ? row.call.ltp : 10,
                          initialQty: lotSize
                        })}
                        className="btn btn-buy btn-sm"
                        style={{ height: 22, padding: '0 8px', fontSize: 10.5, fontWeight: 700 }}
                      >
                        Buy CE
                      </button>
                    </td>

                    {/* STRIKE (CENTER) */}
                    <td className="text-center mono" style={{
                      backgroundColor: isAtm ? 'rgba(245, 158, 11, 0.25)' : 'var(--bg-sunken)',
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: isAtm ? 'var(--warning)' : 'var(--text-primary)',
                      borderLeft: '1px solid var(--border-default)',
                      borderRight: '1px solid var(--border-default)'
                    }}>
                      {row.strike.toLocaleString('en-IN')}
                      {isAtm && (
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--warning)', letterSpacing: '0.5px' }}>
                          ATM
                        </div>
                      )}
                    </td>

                    {/* PUTS (PE) */}
                    <td style={{ borderLeft: '2px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openQuickOrder({
                          symbol: `${selectedAsset} ${row.strike} PE`,
                          name: `${selectedAsset} ${row.strike} PUT`,
                          side: 'BUY',
                          price: row.put.ltp > 0 ? row.put.ltp : 10,
                          initialQty: lotSize
                        })}
                        className="btn btn-sell btn-sm"
                        style={{ height: 22, padding: '0 8px', fontSize: 10.5, fontWeight: 700 }}
                      >
                        Buy PE
                      </button>
                    </td>
                    <td 
                      className="text-right mono" 
                      style={{ 
                        fontWeight: 700, 
                        color: 'var(--negative)',
                        backgroundColor: putFlash === 'up' ? 'rgba(16, 185, 129, 0.3)' : putFlash === 'down' ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                        transition: 'background-color 250ms ease'
                      }}
                    >
                      ₹{row.put.ltp.toFixed(2)}
                    </td>
                    <td className="text-right mono text-muted">{putVolDisplay}</td>
                    <td className="text-right mono">{row.put.iv > 0 ? `${row.put.iv.toFixed(1)}%` : '--'}</td>
                    <td className="text-right mono text-muted">{row.put.delta !== 0 ? row.put.delta.toFixed(2) : '--'}</td>
                    <td className="text-right mono text-muted">{putOiDisplay}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Option Metrics Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-sunken)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        fontSize: 11.5,
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span>PCR: <strong className="mono text-primary">{chainData?.pcr ? chainData.pcr.toFixed(2) : '1.00'}</strong></span>
          <span>Max Pain: <strong className="mono text-primary">₹{chainData?.maxPain ? chainData.maxPain.toLocaleString('en-IN') : atmStrike.toLocaleString('en-IN')}</strong></span>
          <span>Strikes Rendered: <strong className="mono text-primary">{contracts.length}</strong></span>
          <span>Expiry: <strong className="mono text-primary">{selectedExpiry || 'Active'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--positive)', display: 'inline-block' }} />
          <span>Feed: Upstox V3 Market Data Feed</span>
        </div>
      </div>
    </div>
  );
};
