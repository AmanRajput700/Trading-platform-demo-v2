import React, { useState, useEffect, useRef } from 'react';
import { generateCandles, Candle } from '../../mock/marketData';

interface TradingChartProps {
  symbol: string;
  basePrice: number;
  timeframe: string;
  hasSignal?: boolean;
  signalName?: string;
  signalTime?: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  basePrice,
  timeframe,
  hasSignal = true,
  signalName = 'Momentum Breakout',
  signalTime = '10:31 AM'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Generate candles on symbol or timeframe change
  useEffect(() => {
    const data = generateCandles(basePrice, 55, timeframe);
    setCandles(data);
  }, [symbol, basePrice, timeframe]);

  // Render canvas chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, right: 60, bottom: 40, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = (height - padding.top - padding.bottom) * 0.75;
    const volumeHeight = (height - padding.top - padding.bottom) * 0.22;
    const volumeTop = padding.top + chartHeight + 10;

    // Price Bounds
    const allLows = candles.map(c => c.low);
    const allHighs = candles.map(c => c.high);
    const minPrice = Math.min(...allLows) * 0.998;
    const maxPrice = Math.max(...allHighs) * 1.002;
    const priceRange = maxPrice - minPrice || 1;

    // Volume Bounds
    const maxVolume = Math.max(...candles.map(c => c.volume)) * 1.1 || 1;

    const candleWidth = Math.max(3, (chartWidth / candles.length) * 0.65);
    const candleGap = chartWidth / candles.length;

    // 1. Draw Grid Lines
    ctx.strokeStyle = '#F2F1EF';
    ctx.lineWidth = 1;

    // Horizontal Price Grids
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartHeight / gridSteps) * i;
      const priceVal = maxPrice - (priceRange / gridSteps) * i;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price Label on Right
      ctx.fillStyle = '#6B6560';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`₹${priceVal.toFixed(2)}`, width - padding.right + 6, y);
    }

    // 2. Draw Volume Bars
    candles.forEach((c, i) => {
      const x = padding.left + i * candleGap + candleGap / 2;
      const barHeight = (c.volume / maxVolume) * volumeHeight;
      const y = volumeTop + volumeHeight - barHeight;
      const isUp = c.close >= c.open;

      ctx.fillStyle = isUp ? 'rgba(15, 138, 95, 0.25)' : 'rgba(193, 58, 46, 0.25)';
      ctx.fillRect(x - candleWidth / 2, y, candleWidth, barHeight);
    });

    // 3. Draw Indicator Lines
    const drawLine = (key: 'ema20' | 'sma50' | 'vwap', color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      let first = true;
      candles.forEach((c, i) => {
        const val = c[key];
        if (val !== undefined) {
          const x = padding.left + i * candleGap + candleGap / 2;
          const y = padding.top + chartHeight - ((val - minPrice) / priceRange) * chartHeight;
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    if (showEMA20) drawLine('ema20', '#1F5FBF'); // Blue
    if (showSMA50) drawLine('sma50', '#B5790A'); // Gold/Warning
    if (showVWAP) drawLine('vwap', '#8B5CF6');  // Purple

    // 4. Draw Candlesticks
    candles.forEach((c, i) => {
      const x = padding.left + i * candleGap + candleGap / 2;
      const isUp = c.close >= c.open;

      const openY = padding.top + chartHeight - ((c.open - minPrice) / priceRange) * chartHeight;
      const closeY = padding.top + chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
      const highY = padding.top + chartHeight - ((c.high - minPrice) / priceRange) * chartHeight;
      const lowY = padding.top + chartHeight - ((c.low - minPrice) / priceRange) * chartHeight;

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

      const color = isUp ? '#0F8A5F' : '#C13A2E';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Time labels on bottom axis (every 10 candles)
      if (i % 10 === 0) {
        ctx.fillStyle = '#9B948E';
        ctx.font = '10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.time, x, height - 12);
      }
    });

    // 5. Draw Strategy Match Signal Marker Pin (if active)
    if (hasSignal && candles.length > 12) {
      const signalIdx = candles.length - 8;
      const signalCandle = candles[signalIdx];
      const sigX = padding.left + signalIdx * candleGap + candleGap / 2;
      const sigY = padding.top + chartHeight - ((signalCandle.low - minPrice) / priceRange) * chartHeight + 14;

      // Draw Marker Pin
      ctx.fillStyle = '#1F5FBF';
      ctx.beginPath();
      ctx.arc(sigX, sigY + 6, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1F5FBF';
      ctx.fillRect(sigX - 34, sigY + 12, 68, 18);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(signalName.slice(0, 10).toUpperCase(), sigX, sigY + 24);
    }

    // 6. Crosshair & Hover Tooltip
    if (hoverPos && hoveredCandle) {
      ctx.strokeStyle = '#6B6560';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoverPos.x, padding.top);
      ctx.lineTo(hoverPos.x, height - padding.bottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding.left, hoverPos.y);
      ctx.lineTo(width - padding.right, hoverPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [candles, showEMA20, showSMA50, showVWAP, hoverPos, hoveredCandle, hasSignal, signalName, signalTime]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingLeft = 10;
    const paddingRight = 60;
    const chartWidth = canvas.clientWidth - paddingLeft - paddingRight;
    const candleGap = chartWidth / candles.length;

    const index = Math.floor((x - paddingLeft) / candleGap);
    if (index >= 0 && index < candles.length) {
      setHoveredCandle(candles[index]);
      setHoverPos({ x, y });
    } else {
      setHoveredCandle(null);
      setHoverPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setHoverPos(null);
  };

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }}>
      {/* Chart Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-sunken)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: 11
      }}>
        {/* Indicator Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>INDICATORS:</span>
          
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: showEMA20 ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              fontWeight: showEMA20 ? 600 : 400,
              background: 'none',
              border: 'none'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1F5FBF' }} />
            <span>EMA 20</span>
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: showSMA50 ? 'var(--warning)' : 'var(--text-tertiary)',
              fontWeight: showSMA50 ? 600 : 400,
              background: 'none',
              border: 'none'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B5790A' }} />
            <span>SMA 50</span>
          </button>

          <button
            onClick={() => setShowVWAP(!showVWAP)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: showVWAP ? '#8B5CF6' : 'var(--text-tertiary)',
              fontWeight: showVWAP ? 600 : 400,
              background: 'none',
              border: 'none'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
            <span>VWAP</span>
          </button>
        </div>

        {/* OHLC Bar Display */}
        {activeCandle && (
          <div className="mono" style={{ display: 'flex', gap: 10, fontSize: 11 }}>
            <span>O: <strong style={{ color: 'var(--text-primary)' }}>₹{activeCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong style={{ color: 'var(--positive)' }}>₹{activeCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong style={{ color: 'var(--negative)' }}>₹{activeCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong style={{ color: activeCandle.close >= activeCandle.open ? 'var(--positive)' : 'var(--negative)' }}>₹{activeCandle.close.toFixed(2)}</strong></span>
            <span>Vol: <strong style={{ color: 'var(--text-secondary)' }}>{activeCandle.volume.toLocaleString('en-IN')}</strong></span>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div style={{ position: 'relative', height: 420, width: '100%' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />
      </div>
    </div>
  );
};
