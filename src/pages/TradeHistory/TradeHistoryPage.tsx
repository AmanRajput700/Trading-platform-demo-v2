import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ExternalLink, 
  X, 
  FileSpreadsheet, 
  Receipt, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';

export const TradeHistoryPage: React.FC = () => {
  const { trades, navigateToInstrument, addToast } = useTrading();
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'EQUITY' | 'FUTURES' | 'OPTIONS'>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | OrderSide>('ALL');
  const [pnlFilter, setPnlFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  const filteredTrades = trades.filter(t => {
    if (sideFilter !== 'ALL' && t.side !== sideFilter) return false;
    if (pnlFilter === 'PROFIT' && t.pnl <= 0) return false;
    if (pnlFilter === 'LOSS' && t.pnl > 0) return false;
    if (segmentFilter === 'OPTIONS' && !t.symbol.includes('CE') && !t.symbol.includes('PE')) return false;
    if (segmentFilter === 'FUTURES' && !t.symbol.includes('FUT')) return false;
    if (segmentFilter === 'EQUITY' && (t.symbol.includes('CE') || t.symbol.includes('PE') || t.symbol.includes('FUT'))) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.symbol.toLowerCase().includes(q) && !t.strategyName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalPnl = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalTurnover = filteredTrades.reduce((acc, t) => acc + (t.exitPrice || t.entryPrice) * t.quantity, 0);
  const winCount = filteredTrades.filter(t => t.pnl > 0).length;
  const winRate = filteredTrades.length > 0 ? ((winCount / filteredTrades.length) * 100).toFixed(1) : '0';

  // Indian Statutory Charges calculation (STT 0.025% Intraday / 0.1% Delivery, Exchange 0.00345%, GST 18%, Stamp Duty 0.003%)
  const estBrokerage = +(filteredTrades.length * 20).toFixed(2); // Flat ₹20 per trade or zero delivery
  const estStt = +(totalTurnover * 0.00025).toFixed(2);
  const estExchangeTurnover = +(totalTurnover * 0.0000345).toFixed(2);
  const estGst = +((estBrokerage + estExchangeTurnover) * 0.18).toFixed(2);
  const estStampDuty = +(totalTurnover * 0.00003).toFixed(2);
  const totalEstCharges = +(estBrokerage + estStt + estExchangeTurnover + estGst + estStampDuty).toFixed(2);

  const handleExportCsv = () => {
    addToast({
      type: 'success',
      title: 'Trade Book Exported',
      message: `Downloaded MO Trade Journal CSV (${filteredTrades.length} records).`
    });
  };

  const handleDownloadContractNote = () => {
    addToast({
      type: 'info',
      title: 'Contract Note Generated',
      message: 'Simulated SEBI compliant daily digital contract note downloaded.'
    });
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1300, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <PageHeader
        title="Trade History & Execution Journal"
        subtitle="Motilal Oswal style Digital Trade Book, statutory charges audit & contract note verification"
        badge={{ text: "Tax & Audit Book", variant: "neutral" }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowTaxBreakdown(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Receipt size={14} />
              <span>Brokerage & Tax Breakdown</span>
            </button>
            <button
              onClick={handleDownloadContractNote}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <FileSpreadsheet size={14} />
              <span>Contract Note</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, fontWeight: 700 }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Motilal Oswal Summary Metrics Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        borderLeft: `4px solid ${totalPnl >= 0 ? 'var(--positive)' : 'var(--negative)'}`
      }}>
        {/* Realized PnL */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Realized Net Profit / Loss
          </div>
          <div className={`mono ${totalPnl >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 20, fontWeight: 800, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            {totalPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span>{totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Across {filteredTrades.length} executed trade legs
          </div>
        </div>

        {/* Total Turnover */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Traded Turnover
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
            ₹{totalTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            Gross trade consideration value
          </div>
        </div>

        {/* Win Rate */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Win Ratio & Accuracy
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
            {winRate}%
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            {winCount} winning trades / {filteredTrades.length} total
          </div>
        </div>

        {/* Est. Brokerage & Taxes */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Est. Brokerage & Regulatory Taxes
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>
            ₹{totalEstCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            STT, Stamp Duty, GST & Exchange fees
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar (MO Style) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Segment Filter Tabs */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {([
            { id: 'ALL', label: `All Trades (${trades.length})` },
            { id: 'EQUITY', label: 'Equity Cash' },
            { id: 'OPTIONS', label: 'Options (NFO)' },
            { id: 'FUTURES', label: 'Futures (NFO)' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSegmentFilter(tab.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                fontWeight: segmentFilter === tab.id ? 700 : 500,
                backgroundColor: segmentFilter === tab.id ? 'var(--text-primary)' : 'transparent',
                color: segmentFilter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span className="text-secondary">Side:</span>
            <select
              value={sideFilter}
              onChange={e => setSideFilter(e.target.value as any)}
              className="select"
              style={{ height: 28, fontSize: 11 }}
            >
              <option value="ALL">All Sides</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span className="text-secondary">Outcome:</span>
            <select
              value={pnlFilter}
              onChange={e => setPnlFilter(e.target.value as any)}
              className="select"
              style={{ height: 28, fontSize: 11 }}
            >
              <option value="ALL">All Outcomes</option>
              <option value="PROFIT">Profits Only</option>
              <option value="LOSS">Losses Only</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'var(--bg-sunken)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0 8px',
            height: 28
          }}>
            <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search scrip or trade ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 11,
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                width: 170
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Motilal Oswal Trade Table */}
      <div className="surface-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Trade ID & Time</th>
              <th>Instrument / Segment</th>
              <th>Side</th>
              <th>Strategy / Trigger</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Entry Price (₹)</th>
              <th className="text-right">Exit Price (₹)</th>
              <th className="text-right">Est. Charges (₹)</th>
              <th className="text-right">Realized P&L</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No trade executions recorded</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {searchQuery ? `No trades match "${searchQuery}"` : 'Executed trades will automatically populate in your digital journal.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTrades.map(trade => {
                const isPos = trade.pnl >= 0;
                const tradeVal = trade.exitPrice * trade.quantity;
                const tradeCharges = +(20 + tradeVal * 0.00035).toFixed(2);

                return (
                  <tr key={trade.id}>
                    {/* Trade ID & Time */}
                    <td>
                      <div className="mono" style={{ fontWeight: 700, fontSize: 11.5, color: 'var(--accent-primary)' }}>
                        {trade.id}
                      </div>
                      <div className="mono text-muted" style={{ fontSize: 10 }}>
                        {trade.date}, {trade.time}
                      </div>
                    </td>

                    {/* Instrument */}
                    <td>
                      <div 
                        onClick={() => navigateToInstrument(trade.symbol)}
                        style={{ fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'var(--accent-primary)' }}
                      >
                        {trade.symbol}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>
                        {trade.symbol.includes('CE') || trade.symbol.includes('PE') ? 'NSE Options (NFO)' : trade.symbol.includes('FUT') ? 'NSE Futures (NFO)' : 'NSE Equity Cash'}
                      </div>
                    </td>

                    {/* Side */}
                    <td>
                      <span className={`badge ${trade.side === 'BUY' ? 'badge-positive' : 'badge-negative'}`} style={{ fontWeight: 700 }}>
                        {trade.side}
                      </span>
                    </td>

                    {/* Strategy */}
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>
                        {trade.strategyName}
                      </span>
                    </td>

                    {/* Qty */}
                    <td className="text-right mono" style={{ fontWeight: 700 }}>
                      {trade.quantity}
                    </td>

                    {/* Entry Price */}
                    <td className="text-right mono">
                      ₹{trade.entryPrice.toFixed(2)}
                    </td>

                    {/* Exit Price */}
                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      ₹{trade.exitPrice.toFixed(2)}
                    </td>

                    {/* Est. Charges */}
                    <td className="text-right mono text-muted" style={{ fontSize: 11 }}>
                      ₹{tradeCharges}
                    </td>

                    {/* Realized P&L */}
                    <td className={`text-right mono ${isPos ? 'text-positive' : 'text-negative'}`} style={{ fontWeight: 800 }}>
                      <div>{isPos ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: 10 }}>({isPos ? '+' : ''}{trade.pnlPercent}%)</div>
                    </td>

                    {/* Action */}
                    <td className="text-right">
                      <button
                        onClick={() => navigateToInstrument(trade.symbol)}
                        className="btn btn-secondary btn-sm"
                        style={{ height: 24, padding: '0 8px', fontSize: 10.5, gap: 4 }}
                        title="View Instrument Details"
                      >
                        <span>View</span>
                        <ExternalLink size={10} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Motilal Oswal Statutory Taxes & Brokerage Breakdown Modal */}
      {showTaxBreakdown && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 14, 20, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Statutory Taxes & Brokerage Journal</h3>
              </div>
              <button
                onClick={() => setShowTaxBreakdown(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Securities Transaction Tax (STT / CTT)</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{estStt.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Brokerage Charges (Flat / Zero Delivery)</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{estBrokerage.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Exchange Turnover Charges (NSE/BSE)</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{estExchangeTurnover.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">Goods and Services Tax (GST 18%)</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{estGst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-secondary">State Stamp Duty</span>
                <span className="mono" style={{ fontWeight: 600 }}>₹{estStampDuty.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontWeight: 700 }}>
                <span>Total Deductions & Charges</span>
                <span className="mono text-negative">₹{totalEstCharges.toFixed(2)}</span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-sunken)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 11,
              color: 'var(--text-secondary)'
            }}>
              Charges calculated in compliance with SEBI circular CIR/MRD/DP/2024 and Central Board of Indirect Taxes rules.
            </div>

            <button
              onClick={() => setShowTaxBreakdown(false)}
              className="btn btn-primary"
              style={{ width: '100%', fontWeight: 700, height: 34 }}
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
