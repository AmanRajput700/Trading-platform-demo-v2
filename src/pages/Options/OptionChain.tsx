import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { NIFTY_OPTION_CHAIN } from '../../mock/marketData';

export const OptionChain: React.FC = () => {
  const { indices, openQuickOrder } = useTrading();
  const [selectedExpiry, setSelectedExpiry] = useState('28 AUG 2026');
  const [selectedAsset, setSelectedAsset] = useState<'NIFTY 50' | 'BANK NIFTY'>('NIFTY 50');

  const niftyIndex = indices.find(i => i.symbol === 'NIFTY 50') || {
    symbol: 'NIFTY 50',
    price: 25420.35,
    change: 181.50,
    changePercent: 0.72
  };

  const atmStrike = 25400;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1340, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Options Chain Matrix</h1>
            <span className="badge badge-accent" style={{ fontSize: 10 }}>NSE F&O</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Real-time open interest, implied volatility & instant options order entry
          </p>
        </div>

        {/* Index Selector & Spot Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{niftyIndex.symbol} Spot</span>
              <span className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                {niftyIndex.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`mono ${niftyIndex.change >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 11 }}>
              {niftyIndex.change >= 0 ? '+' : ''}{niftyIndex.change.toFixed(2)} ({niftyIndex.change >= 0 ? '+' : ''}{niftyIndex.changePercent.toFixed(2)}%)
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value as any)}
              className="select"
              style={{ fontWeight: 600 }}
            >
              <option value="NIFTY 50">NIFTY 50</option>
              <option value="BANK NIFTY">BANK NIFTY</option>
            </select>

            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="select"
              style={{ fontWeight: 600 }}
            >
              <option value="28 AUG 2026">28 AUG 2026 (Weekly)</option>
              <option value="04 SEP 2026">04 SEP 2026</option>
              <option value="24 SEP 2026">24 SEP 2026 (Monthly)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Option Chain Table (Section 8 layout: CALLS | STRIKE | PUTS) */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
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
            {NIFTY_OPTION_CHAIN.map(row => {
              const isAtm = row.strike === atmStrike;
              const callOiInLakhs = (row.call.oi / 100000).toFixed(1);
              const putOiInLakhs = (row.put.oi / 100000).toFixed(1);
              const callOiChgInLakhs = (row.call.oiChange / 100000).toFixed(1);
              const putOiChgInLakhs = (row.put.oiChange / 100000).toFixed(1);

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
                  <td className={`text-right mono ${row.call.oiChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {row.call.oiChange >= 0 ? '+' : ''}{callOiChgInLakhs}L
                  </td>
                  <td className="text-right mono text-muted">{(row.call.volume / 100000).toFixed(1)}L</td>
                  <td className="text-right mono">{row.call.iv.toFixed(1)}</td>
                  <td className="text-right mono" style={{ fontWeight: 700, color: 'var(--positive)' }}>
                    ₹{row.call.ltp.toFixed(2)}
                  </td>
                  <td className="text-right" style={{ borderRight: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => openQuickOrder({
                        symbol: row.call.symbol,
                        name: `NIFTY ${row.strike} CE`,
                        side: 'BUY',
                        price: row.call.ltp,
                        initialQty: 75
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
                        symbol: row.put.symbol,
                        name: `NIFTY ${row.strike} PE`,
                        side: 'BUY',
                        price: row.put.ltp,
                        initialQty: 75
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
                  <td className={`text-right mono ${row.put.oiChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {row.put.oiChange >= 0 ? '+' : ''}{putOiChgInLakhs}L
                  </td>
                  <td className="text-right mono">{putOiInLakhs}L</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Option Metrics & Greek Summary Note */}
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
          <span>PCR (OI): <strong className="mono text-primary">1.18 (Bullish)</strong></span>
          <span>Max Pain Strike: <strong className="mono text-primary">25,400</strong></span>
          <span>Lot Size: <strong className="mono text-primary">75</strong></span>
        </div>
        <div className="mono">
          Last refreshed: 10:42:18 AM
        </div>
      </div>
    </div>
  );
};
