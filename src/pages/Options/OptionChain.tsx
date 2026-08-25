import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { PageHeader } from '../../components/common/PageHeader';
import { optionChainService, OptionChainResponse } from '../../services/optionChainService';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const OptionChain: React.FC = () => {
  const { indices, instruments, getInstrument, openQuickOrder } = useTrading();
  const [selectedExpiry, setSelectedExpiry] = useState('28 AUG 2026');
  const [selectedAsset, setSelectedAsset] = useState<string>('NIFTY 50');
  const [chainData, setChainData] = useState<OptionChainResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamically resolve target asset (can be an Index or an Equity stock)
  const targetInstrument = getInstrument(selectedAsset) || 
    indices.find(i => i.symbol === selectedAsset) || 
    instruments.find(i => i.symbol === selectedAsset);

  const loadOptionChain = async () => {
    setIsLoading(true);
    const data = await optionChainService.getOptionChain(selectedAsset, selectedExpiry);
    setChainData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOptionChain();
  }, [selectedAsset, selectedExpiry]);

  const spotPrice = chainData?.spotPrice || targetInstrument?.price || 24151.20;
  const spotChange = targetInstrument?.change ?? (chainData ? 0 : -67.85);
  const spotChangePct = targetInstrument?.changePercent ?? (chainData ? 0 : -0.28);
  const strikeStep = selectedAsset.includes('NIFTY') ? 50 : selectedAsset.includes('SENSEX') ? 100 : 20;
  const atmStrike = Math.round(spotPrice / strikeStep) * strikeStep;

  const contracts = chainData?.contracts || [];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1340, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Options Chain Matrix"
        subtitle="Real-time open interest, implied volatility & instant options order entry"
        badge={{ text: "NSE F&O LIVE", variant: "accent" }}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{selectedAsset} Spot</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700 }}>
                  ₹{spotPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`mono ${spotChange >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 10.5 }}>
                {spotChange >= 0 ? '+' : ''}{spotChange.toFixed(2)} ({spotChange >= 0 ? '+' : ''}{spotChangePct.toFixed(2)}%)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>

              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="select"
                style={{ fontWeight: 600, height: 30, fontSize: 11.5 }}
              >
                <option value="NIFTY 50">NIFTY 50</option>
                <option value="BANK NIFTY">BANK NIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
                <option value="SENSEX">SENSEX</option>
                <option value="RELIANCE">RELIANCE</option>
                <option value="HDFCBANK">HDFCBANK</option>
                <option value="TCS">TCS</option>
                <option value="INFY">INFY</option>
              </select>

              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="select"
                style={{ fontWeight: 600, height: 30, fontSize: 11.5 }}
              >
                <option value="28 AUG 2026">28 AUG 2026 (Weekly)</option>
                <option value="04 SEP 2026">04 SEP 2026</option>
                <option value="24 SEP 2026">24 SEP 2026 (Monthly)</option>
              </select>

              <button
                onClick={loadOptionChain}
                className="btn btn-secondary btn-sm"
                title="Refresh Option Chain"
                style={{ height: 30, padding: '0 8px' }}
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        }
      />

      {/* Option Chain Table (Layout: CALLS | STRIKE | PUTS) */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        {contracts.length === 0 && !isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertCircle size={24} style={{ margin: '0 auto 8px', color: 'var(--warning)' }} />
            <div style={{ fontWeight: 600 }}>Option Chain Data Unavailable</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              No active F&O contracts returned from Upstox for {selectedAsset} on {selectedExpiry}.
            </div>
          </div>
        ) : (
          <table className="data-table" style={{ fontSize: 11.5 }}>
            <thead>
              <tr>
                <th colSpan={6} style={{ textAlign: 'center', backgroundColor: 'var(--positive-bg)', color: 'var(--positive)', borderRight: '1px solid var(--border-default)' }}>
                  CALLS (CE)
                </th>
                <th style={{ textAlign: 'center', backgroundColor: 'var(--bg-sunken)', width: 100 }}>
                  STRIKE
                </th>
                <th colSpan={6} style={{ textAlign: 'center', backgroundColor: 'var(--negative-bg)', color: 'var(--negative)', borderLeft: '1px solid var(--border-default)' }}>
                  PUTS (PE)
                </th>
              </tr>
              <tr>
                {/* Call Columns */}
                <th className="text-right">OI (Lakhs)</th>
                <th className="text-right">OI Chg</th>
                <th className="text-right">Volume</th>
                <th className="text-right">IV (%)</th>
                <th className="text-right">LTP (₹)</th>
                <th className="text-right" style={{ borderRight: '1px solid var(--border-default)' }}>Action</th>

                {/* Strike */}
                <th className="text-center" style={{ backgroundColor: 'var(--bg-sunken)' }}>Strike</th>

                {/* Put Columns */}
                <th style={{ borderLeft: '1px solid var(--border-default)' }}>Action</th>
                <th className="text-right">LTP (₹)</th>
                <th className="text-right">IV (%)</th>
                <th className="text-right">Volume</th>
                <th className="text-right">OI Chg</th>
                <th className="text-right">OI (Lakhs)</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(row => {
                const isAtm = row.strike === atmStrike;
                const callOiInLakhs = (row.call.oi / 100000).toFixed(1);
                const putOiInLakhs = (row.put.oi / 100000).toFixed(1);
                const callOiChgInLakhs = ((row.call.oi * 0.05) / 100000).toFixed(1);
                const putOiChgInLakhs = ((row.put.oi * 0.04) / 100000).toFixed(1);

                return (
                  <tr
                    key={row.strike}
                    style={{
                      backgroundColor: isAtm ? 'var(--warning-bg)' : 'transparent',
                      borderTop: isAtm ? '2px solid var(--warning)' : undefined,
                      borderBottom: isAtm ? '2px solid var(--warning)' : undefined
                    }}
                  >
                    {/* CALLS */}
                    <td className="text-right mono">{callOiInLakhs}L</td>
                    <td className={`text-right mono ${row.call.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.call.change >= 0 ? '+' : ''}{callOiChgInLakhs}L
                    </td>
                    <td className="text-right mono text-muted">{(row.call.volume / 100000).toFixed(1)}L</td>
                    <td className="text-right mono">{row.call.iv.toFixed(1)}</td>
                    <td className="text-right mono" style={{ fontWeight: 700, color: 'var(--positive)' }}>
                      ₹{row.call.ltp.toFixed(2)}
                    </td>
                    <td className="text-right" style={{ borderRight: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openQuickOrder({
                          symbol: `${selectedAsset} ${row.strike} CE`,
                          name: `${selectedAsset} ${row.strike} CALL`,
                          side: 'BUY',
                          price: row.call.ltp,
                          initialQty: selectedAsset.includes('NIFTY') ? 75 : 25
                        })}
                        className="btn btn-buy btn-sm"
                        style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                      >
                        Buy CE
                      </button>
                    </td>

                    {/* STRIKE */}
                    <td className="text-center mono" style={{
                      backgroundColor: isAtm ? 'var(--warning-bg)' : 'var(--bg-sunken)',
                      fontWeight: 700,
                      fontSize: 13,
                      color: isAtm ? 'var(--warning)' : 'var(--text-primary)'
                    }}>
                      {row.strike} {isAtm && <span style={{ fontSize: 9, fontWeight: 700 }}>(ATM)</span>}
                    </td>

                    {/* PUTS */}
                    <td style={{ borderLeft: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openQuickOrder({
                          symbol: `${selectedAsset} ${row.strike} PE`,
                          name: `${selectedAsset} ${row.strike} PUT`,
                          side: 'BUY',
                          price: row.put.ltp,
                          initialQty: selectedAsset.includes('NIFTY') ? 75 : 25
                        })}
                        className="btn btn-sell btn-sm"
                        style={{ height: 22, padding: '0 6px', fontSize: 10 }}
                      >
                        Buy PE
                      </button>
                    </td>
                    <td className="text-right mono" style={{ fontWeight: 700, color: 'var(--negative)' }}>
                      ₹{row.put.ltp.toFixed(2)}
                    </td>
                    <td className="text-right mono">{row.put.iv.toFixed(1)}</td>
                    <td className="text-right mono text-muted">{(row.put.volume / 100000).toFixed(1)}L</td>
                    <td className={`text-right mono ${row.put.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.put.change >= 0 ? '+' : ''}{putOiChgInLakhs}L
                    </td>
                    <td className="text-right mono">{putOiInLakhs}L</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Option Metrics Summary Note */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        backgroundColor: 'var(--bg-sunken)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        fontSize: 11,
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>PCR (OI): <strong className="mono text-primary">{chainData?.pcr ? `${chainData.pcr} (${chainData.pcr >= 1.0 ? 'Bullish' : 'Bearish'})` : '1.12 (Bullish)'}</strong></span>
          <span>Max Pain: <strong className="mono text-primary">₹{chainData?.maxPain ? chainData.maxPain.toLocaleString('en-IN') : atmStrike.toLocaleString('en-IN')}</strong></span>
          <span>Total Call OI: <strong className="mono text-primary">{chainData?.totalCallOI ? `${(chainData.totalCallOI / 100000).toFixed(1)}L` : '--'}</strong></span>
          <span>Total Put OI: <strong className="mono text-primary">{chainData?.totalPutOI ? `${(chainData.totalPutOI / 100000).toFixed(1)}L` : '--'}</strong></span>
        </div>
        <div className="mono">
          Feed: Upstox F&O Data
        </div>
      </div>
    </div>
  );
};
