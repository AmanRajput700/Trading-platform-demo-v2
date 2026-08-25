import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
  UTCTimestamp,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  HistogramSeries,
  createSeriesMarkers,
  SeriesMarker,
} from 'lightweight-charts';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw
} from 'lucide-react';
import { 
  generateHistoricalCandles, 
  fetchRealMarketCandles,
  ChartTimeframe, 
  TIMEFRAME_LABELS, 
  IndicatorSeriesData 
} from '../../services/ohlcService';
import { RealtimeChartDatafeed } from '../../services/chartDatafeed';
import { useTrading } from '../../context/TradingContext';

export interface TVChartProps {
  symbol: string;
  basePrice?: number;
  timeframe?: ChartTimeframe;
  onTimeframeChange?: (tf: ChartTimeframe) => void;
  height?: number | string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  showControls?: boolean;
  showIndicatorsToggle?: boolean;
  showTimeframeBar?: boolean;
  hasSignal?: boolean;
  signalName?: string;
  signalTime?: string;
}

export const TVChart: React.FC<TVChartProps> = ({
  symbol,
  basePrice,
  timeframe: externalTimeframe,
  onTimeframeChange,
  height = 500,
  isMaximized = false,
  onToggleMaximize,
  showControls = true,
  showIndicatorsToggle = true,
  showTimeframeBar = true,
  hasSignal = true,
  signalName = 'Momentum Breakout',
}) => {
  const { theme, getInstrument } = useTrading();
  const inst = getInstrument(symbol);
  const currentPrice = basePrice || inst?.price || 1000;

  const [internalTimeframe, setInternalTimeframe] = useState<ChartTimeframe>(externalTimeframe || '15m');
  const activeTimeframe = externalTimeframe || internalTimeframe;

  const [chartType, setChartType] = useState<'candles' | 'area' | 'line'>('candles');
  const [showEMA20, setShowEMA20] = useState<boolean>(true);
  const [showEMA50, setShowEMA50] = useState<boolean>(true);
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showVolume] = useState<boolean>(true);

  // Live Legend State
  const [legendData, setLegendData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    ema20?: number;
    ema50?: number;
    vwap?: number;
    time?: string;
  } | null>(null);

  const [livePulse, setLivePulse] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const datafeedRef = useRef<RealtimeChartDatafeed | null>(null);

  const isDark = theme === 'dark';

  const handleTimeframeSelect = (tf: ChartTimeframe) => {
    setInternalTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  // Initialize & rebuild chart on symbol, timeframe, chartType, or theme change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    if (datafeedRef.current) {
      datafeedRef.current.stop();
      datafeedRef.current = null;
    }

    const isDarkMode = theme === 'dark';
    const bgColor = isDarkMode ? '#0E121B' : '#FFFFFF';
    const textColor = isDarkMode ? '#94A3B8' : '#475569';
    const gridColor = isDarkMode ? 'rgba(30, 41, 59, 0.65)' : 'rgba(241, 245, 249, 0.9)';
    const borderColor = isDarkMode ? '#1E293B' : '#E2E8F0';

    const chart = createChart(container, {
      width: container.clientWidth,
      height: typeof height === 'number' ? height : container.clientHeight || 500,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
        fontSize: 12,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      grid: {
        vertLines: { color: gridColor, style: 1 },
        horzLines: { color: gridColor, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDarkMode ? '#38BDF8' : '#0284C7',
          width: 1,
          style: 3,
          labelBackgroundColor: isDarkMode ? '#0F172A' : '#0284C7',
        },
        horzLine: {
          color: isDarkMode ? '#38BDF8' : '#0284C7',
          width: 1,
          style: 3,
          labelBackgroundColor: isDarkMode ? '#0F172A' : '#0284C7',
        },
      },
      rightPriceScale: {
        borderColor: borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.22,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 8,
        minBarSpacing: 3,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // 1. Generate Historical Data
    const data: IndicatorSeriesData = generateHistoricalCandles(symbol, currentPrice, activeTimeframe, 220);

    // 2. Add Main Price Series based on chartType
    if (chartType === 'candles') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
      candleSeries.setData(data.candles);
      candleSeriesRef.current = candleSeries;

      // Add Signal Markers if enabled
      if (hasSignal && data.candles.length > 15) {
        const signalBar = data.candles[data.candles.length - 8];
        const markers: SeriesMarker<UTCTimestamp>[] = [
          {
            time: signalBar.time,
            position: 'belowBar',
            color: '#10B981',
            shape: 'arrowUp',
            text: `▲ BUY SIGNAL (${signalName})`,
            size: 2,
          }
        ];
        try {
          createSeriesMarkers(candleSeries, markers);
        } catch {
          // ignore markers fallback
        }
      }
    } else if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: isDarkMode ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.35)',
        bottomColor: isDarkMode ? 'rgba(56, 189, 248, 0.01)' : 'rgba(14, 165, 233, 0.01)',
        lineColor: '#38BDF8',
        lineWidth: 2,
      });
      const areaData: LineData<UTCTimestamp>[] = data.candles.map(c => ({ time: c.time, value: c.close }));
      areaSeries.setData(areaData);
      areaSeriesRef.current = areaSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#38BDF8',
        lineWidth: 2,
      });
      const lineData: LineData<UTCTimestamp>[] = data.candles.map(c => ({ time: c.time, value: c.close }));
      lineSeries.setData(lineData);
      lineSeriesRef.current = lineSeries;
    }

    // 3. Add Volume Series in separate sub-pane scale
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeries.setData(data.volumes);
    volumeSeriesRef.current = volumeSeries;

    // 4. Add Technical Indicator Series
    // EMA 20
    const ema20Series = chart.addSeries(LineSeries, {
      color: '#38BDF8', // Cyan
      lineWidth: 2,
      title: 'EMA 20',
      priceScaleId: 'right',
    });
    ema20Series.setData(data.ema20);
    ema20SeriesRef.current = ema20Series;

    // EMA 50
    const ema50Series = chart.addSeries(LineSeries, {
      color: '#F59E0B', // Amber
      lineWidth: 2,
      title: 'EMA 50',
      priceScaleId: 'right',
    });
    ema50Series.setData(data.ema50);
    ema50SeriesRef.current = ema50Series;

    // VWAP
    const vwapSeries = chart.addSeries(LineSeries, {
      color: '#A855F7', // Purple
      lineWidth: 2,
      title: 'VWAP',
      priceScaleId: 'right',
    });
    vwapSeries.setData(data.vwap);
    vwapSeriesRef.current = vwapSeries;

    // Apply visibility states
    ema20Series.applyOptions({ visible: showEMA20 });
    ema50Series.applyOptions({ visible: showEMA50 });
    vwapSeries.applyOptions({ visible: showVWAP });
    volumeSeries.applyOptions({ visible: showVolume });

    // Initial Legend Values from last candle
    if (data.candles.length > 0) {
      const last = data.candles[data.candles.length - 1];
      const prev = data.candles.length > 1 ? data.candles[data.candles.length - 2] : last;
      const lastVol = data.volumes[data.volumes.length - 1]?.value || 0;
      const change = +(last.close - prev.close).toFixed(2);
      const changePct = +((change / prev.close) * 100).toFixed(2);

      const lastEma20 = data.ema20.length > 0 ? data.ema20[data.ema20.length - 1].value : undefined;
      const lastEma50 = data.ema50.length > 0 ? data.ema50[data.ema50.length - 1].value : undefined;
      const lastVwap = data.vwap.length > 0 ? data.vwap[data.vwap.length - 1].value : undefined;

      const dateStr = new Date((last.time as number) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setLegendData({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        volume: lastVol,
        change,
        changePercent: changePct,
        ema20: lastEma20,
        ema50: lastEma50,
        vwap: lastVwap,
        time: dateStr,
      });
    }

    // 5. Crosshair Move Handler for dynamic Legend
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        if (data.candles.length > 0) {
          const last = data.candles[data.candles.length - 1];
          const prev = data.candles.length > 1 ? data.candles[data.candles.length - 2] : last;
          const lastVol = data.volumes[data.volumes.length - 1]?.value || 0;
          const change = +(last.close - prev.close).toFixed(2);
          const changePct = +((change / prev.close) * 100).toFixed(2);

          const lastEma20 = data.ema20.length > 0 ? data.ema20[data.ema20.length - 1].value : undefined;
          const lastEma50 = data.ema50.length > 0 ? data.ema50[data.ema50.length - 1].value : undefined;
          const lastVwap = data.vwap.length > 0 ? data.vwap[data.vwap.length - 1].value : undefined;

          setLegendData({
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            volume: lastVol,
            change,
            changePercent: changePct,
            ema20: lastEma20,
            ema50: lastEma50,
            vwap: lastVwap,
            time: new Date((last.time as number) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
        return;
      }

      let cData: CandlestickData<UTCTimestamp> | null = null;
      if (candleSeriesRef.current && param.seriesData.get(candleSeriesRef.current)) {
        cData = param.seriesData.get(candleSeriesRef.current) as CandlestickData<UTCTimestamp>;
      } else if (areaSeriesRef.current && param.seriesData.get(areaSeriesRef.current)) {
        const aVal = param.seriesData.get(areaSeriesRef.current) as LineData<UTCTimestamp>;
        cData = { time: aVal.time, open: aVal.value, high: aVal.value, low: aVal.value, close: aVal.value };
      } else if (lineSeriesRef.current && param.seriesData.get(lineSeriesRef.current)) {
        const lVal = param.seriesData.get(lineSeriesRef.current) as LineData<UTCTimestamp>;
        cData = { time: lVal.time, open: lVal.value, high: lVal.value, low: lVal.value, close: lVal.value };
      }

      if (cData) {
        const volVal = volumeSeriesRef.current && param.seriesData.get(volumeSeriesRef.current)
          ? (param.seriesData.get(volumeSeriesRef.current) as HistogramData<UTCTimestamp>).value
          : 0;

        const e20Val = ema20SeriesRef.current && param.seriesData.get(ema20SeriesRef.current)
          ? (param.seriesData.get(ema20SeriesRef.current) as LineData<UTCTimestamp>).value
          : undefined;

        const e50Val = ema50SeriesRef.current && param.seriesData.get(ema50SeriesRef.current)
          ? (param.seriesData.get(ema50SeriesRef.current) as LineData<UTCTimestamp>).value
          : undefined;

        const vVal = vwapSeriesRef.current && param.seriesData.get(vwapSeriesRef.current)
          ? (param.seriesData.get(vwapSeriesRef.current) as LineData<UTCTimestamp>).value
          : undefined;

        const change = +(cData.close - cData.open).toFixed(2);
        const changePct = +((change / cData.open) * 100).toFixed(2);

        setLegendData({
          open: cData.open,
          high: cData.high,
          low: cData.low,
          close: cData.close,
          volume: volVal,
          change,
          changePercent: changePct,
          ema20: e20Val,
          ema50: e50Val,
          vwap: vVal,
          time: new Date((cData.time as number) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    // 6. Connect Real-time WebSocket Datafeed
    const lastBar = data.candles[data.candles.length - 1];
    const datafeed = new RealtimeChartDatafeed(symbol, activeTimeframe, lastBar);
    datafeedRef.current = datafeed;

    // 6b. Asynchronously fetch 100% real historical & intraday market candles from Upstox API
    let isSubscribed = true;
    fetchRealMarketCandles(symbol, activeTimeframe, 250).then(realData => {
      if (!isSubscribed || !realData || !realData.candles || realData.candles.length === 0) return;

      if (chartType === 'candles' && candleSeriesRef.current) {
        candleSeriesRef.current.setData(realData.candles);
      } else if (chartType === 'area' && areaSeriesRef.current) {
        areaSeriesRef.current.setData(realData.candles.map(c => ({ time: c.time, value: c.close })));
      } else if (lineSeriesRef.current) {
        lineSeriesRef.current.setData(realData.candles.map(c => ({ time: c.time, value: c.close })));
      }

      if (volumeSeriesRef.current && realData.volumes.length > 0) {
        volumeSeriesRef.current.setData(realData.volumes);
      }
      if (ema20SeriesRef.current && realData.ema20.length > 0) {
        ema20SeriesRef.current.setData(realData.ema20);
      }
      if (ema50SeriesRef.current && realData.ema50.length > 0) {
        ema50SeriesRef.current.setData(realData.ema50);
      }
      if (vwapSeriesRef.current && realData.vwap.length > 0) {
        vwapSeriesRef.current.setData(realData.vwap);
      }

      const realLast = realData.candles[realData.candles.length - 1];
      const realVol = realData.volumes[realData.volumes.length - 1]?.value || 0;
      datafeed.setLastBar(realLast, realVol);

      // Update initial legend with real candle
      const realPrev = realData.candles.length > 1 ? realData.candles[realData.candles.length - 2] : realLast;
      const chg = +(realLast.close - realPrev.close).toFixed(2);
      const chgPct = +((chg / realPrev.close) * 100).toFixed(2);
      setLegendData({
        open: realLast.open,
        high: realLast.high,
        low: realLast.low,
        close: realLast.close,
        volume: realVol,
        change: chg,
        changePercent: chgPct,
        ema20: realData.ema20.length > 0 ? realData.ema20[realData.ema20.length - 1].value : undefined,
        ema50: realData.ema50.length > 0 ? realData.ema50[realData.ema50.length - 1].value : undefined,
        vwap: realData.vwap.length > 0 ? realData.vwap[realData.vwap.length - 1].value : undefined,
        time: new Date((realLast.time as number) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    const unsubscribeFeed = datafeed.subscribe((payload) => {
      // Update price series
      if (candleSeriesRef.current) {
        candleSeriesRef.current.update(payload.candle);
      }
      if (areaSeriesRef.current) {
        areaSeriesRef.current.update({ time: payload.candle.time, value: payload.candle.close });
      }
      if (lineSeriesRef.current) {
        lineSeriesRef.current.update({ time: payload.candle.time, value: payload.candle.close });
      }
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update(payload.volume);
      }

      // Pulse live badge
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 300);

      // Update active legend
      setLegendData(prev => {
        if (!prev) return prev;
        const change = +(payload.candle.close - payload.candle.open).toFixed(2);
        const changePct = +((change / payload.candle.open) * 100).toFixed(2);
        return {
          ...prev,
          open: payload.candle.open,
          high: payload.candle.high,
          low: payload.candle.low,
          close: payload.candle.close,
          volume: payload.volume.value,
          change,
          changePercent: changePct,
          time: new Date((payload.candle.time as number) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
    });

    // 7. Auto-Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width, height: observedHeight } = entries[0].contentRect;
      chartRef.current.applyOptions({
        width: Math.max(width, 200),
        height: typeof height === 'number' ? height : Math.max(observedHeight, 350),
      });
    });

    resizeObserver.observe(container);

    return () => {
      isSubscribed = false;
      resizeObserver.disconnect();
      unsubscribeFeed();
      if (datafeedRef.current) {
        datafeedRef.current.stop();
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, activeTimeframe, chartType, theme, height, hasSignal, signalName]);

  // Synchronize in-place real-time price updates directly to the existing chart without destroying it
  useEffect(() => {
    if (inst && inst.price && datafeedRef.current) {
      datafeedRef.current.handleIncomingTick({
        instrument_key: inst.symbol,
        symbol: inst.symbol,
        type: 'STOCK',
        price: inst.price,
        close_price: inst.prevClose || inst.price,
        change: inst.change,
        change_percent: inst.changePercent,
        open: inst.open,
        high: inst.high,
        low: inst.low,
        volume: inst.volume,
        timestamp: Date.now()
      });
    }
  }, [inst?.price, inst?.change, inst?.volume]);

  // Toggle indicators visibility dynamically without re-creating chart
  useEffect(() => {
    if (ema20SeriesRef.current) ema20SeriesRef.current.applyOptions({ visible: showEMA20 });
  }, [showEMA20]);

  useEffect(() => {
    if (ema50SeriesRef.current) ema50SeriesRef.current.applyOptions({ visible: showEMA50 });
  }, [showEMA50]);

  useEffect(() => {
    if (vwapSeriesRef.current) vwapSeriesRef.current.applyOptions({ visible: showVWAP });
  }, [showVWAP]);

  useEffect(() => {
    if (volumeSeriesRef.current) volumeSeriesRef.current.applyOptions({ visible: showVolume });
  }, [showVolume]);

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const isPos = (legendData?.change || 0) >= 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: isMaximized ? '100%' : typeof height === 'number' ? `${height}px` : height,
        backgroundColor: isDark ? '#0E121B' : '#FFFFFF',
        borderRadius: isMaximized ? 0 : 'var(--radius-lg)',
        border: isMaximized ? 'none' : `1px solid ${isDark ? 'var(--border-subtle)' : 'var(--border-base)'}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Chart Toolbar */}
      {showControls && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderBottom: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(248, 250, 252, 0.9)',
            backdropFilter: 'blur(8px)',
            flexWrap: 'wrap',
            gap: 8,
            zIndex: 10,
          }}
        >
          {/* Left: Timeframe Switcher & Chart Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {showTimeframeBar && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1E293B' : '#EDF2F7',
                  borderRadius: 'var(--radius-md)',
                  padding: 2,
                }}
              >
                {TIMEFRAME_LABELS.map((tf) => {
                  const isSelected = activeTimeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      onClick={() => handleTimeframeSelect(tf.id)}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: isSelected ? 600 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: isSelected ? (isDark ? '#38BDF8' : '#0284C7') : 'transparent',
                        color: isSelected ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chart Type Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDark ? '#1E293B' : '#EDF2F7',
                borderRadius: 'var(--radius-md)',
                padding: 2,
              }}
            >
              <button
                onClick={() => setChartType('candles')}
                title="Candlestick Chart"
                style={{
                  padding: '3px 7px',
                  fontSize: 11,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: chartType === 'candles' ? (isDark ? '#334155' : '#FFFFFF') : 'transparent',
                  color: chartType === 'candles' ? (isDark ? '#F8FAFC' : '#0F172A') : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  fontWeight: chartType === 'candles' ? 600 : 400,
                }}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType('area')}
                title="Area Chart"
                style={{
                  padding: '3px 7px',
                  fontSize: 11,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: chartType === 'area' ? (isDark ? '#334155' : '#FFFFFF') : 'transparent',
                  color: chartType === 'area' ? (isDark ? '#F8FAFC' : '#0F172A') : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  fontWeight: chartType === 'area' ? 600 : 400,
                }}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('line')}
                title="Line Chart"
                style={{
                  padding: '3px 7px',
                  fontSize: 11,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: chartType === 'line' ? (isDark ? '#334155' : '#FFFFFF') : 'transparent',
                  color: chartType === 'line' ? (isDark ? '#F8FAFC' : '#0F172A') : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  fontWeight: chartType === 'line' ? 600 : 400,
                }}
              >
                Line
              </button>
            </div>
          </div>

          {/* Right: Indicators Toggle & Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {showIndicatorsToggle && (
              <>
                <button
                  onClick={() => setShowEMA20(prev => !prev)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${showEMA20 ? '#38BDF8' : isDark ? '#334155' : '#CBD5E1'}`,
                    backgroundColor: showEMA20 ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: showEMA20 ? '#38BDF8' : isDark ? '#64748B' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#38BDF8' }} />
                  EMA 20
                </button>

                <button
                  onClick={() => setShowEMA50(prev => !prev)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${showEMA50 ? '#F59E0B' : isDark ? '#334155' : '#CBD5E1'}`,
                    backgroundColor: showEMA50 ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: showEMA50 ? '#F59E0B' : isDark ? '#64748B' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                  EMA 50
                </button>

                <button
                  onClick={() => setShowVWAP(prev => !prev)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${showVWAP ? '#A855F7' : isDark ? '#334155' : '#CBD5E1'}`,
                    backgroundColor: showVWAP ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                    color: showVWAP ? '#A855F7' : isDark ? '#64748B' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#A855F7' }} />
                  VWAP
                </button>
              </>
            )}

            {/* Reset Zoom Button */}
            <button
              onClick={handleResetZoom}
              title="Reset View / Fit Content"
              style={{
                padding: '4px 6px',
                border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                backgroundColor: 'transparent',
                borderRadius: 'var(--radius-sm)',
                color: isDark ? '#94A3B8' : '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RotateCcw size={12} />
            </button>

            {/* Fullscreen / Maximize Toggle */}
            {onToggleMaximize && (
              <button
                onClick={onToggleMaximize}
                title={isMaximized ? 'Restore Standard Size' : 'Maximize Chart to Full Screen'}
                style={{
                  padding: '4px 8px',
                  border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                  backgroundColor: isMaximized ? (isDark ? '#38BDF8' : '#0284C7') : 'transparent',
                  color: isMaximized ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isMaximized ? 'Exit Max' : 'Maximize'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Dynamic OHLCV & Indicators Legend Bar */}
      <div
        style={{
          position: 'absolute',
          top: showControls ? 46 : 8,
          left: 14,
          zIndex: 5,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)'}`,
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Symbol & Price Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {symbol}
            </span>
            <span style={{ fontSize: 11, color: isDark ? '#64748B' : '#94A3B8' }}>
              ({activeTimeframe})
            </span>
          </div>

          {/* Live Feed Pulse Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 600,
              color: '#10B981',
              backgroundColor: livePulse ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.12)',
              padding: '1px 6px',
              borderRadius: 10,
              transition: 'background-color 0.2s ease',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: livePulse ? '0 0 8px #10B981' : 'none',
              }}
            />
            <span>LIVE</span>
          </div>
        </div>

        {/* OHLCV Values Row */}
        {legendData && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontFamily: 'monospace',
              color: isDark ? '#94A3B8' : '#64748B',
              flexWrap: 'wrap',
            }}
          >
            <span>
              O: <strong style={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>₹{legendData.open.toFixed(2)}</strong>
            </span>
            <span>
              H: <strong style={{ color: '#10B981' }}>₹{legendData.high.toFixed(2)}</strong>
            </span>
            <span>
              L: <strong style={{ color: '#EF4444' }}>₹{legendData.low.toFixed(2)}</strong>
            </span>
            <span>
              C: <strong style={{ color: isPos ? '#10B981' : '#EF4444' }}>₹{legendData.close.toFixed(2)}</strong>
            </span>
            <span>
              Chg:{' '}
              <strong style={{ color: isPos ? '#10B981' : '#EF4444' }}>
                {isPos ? '+' : ''}{legendData.change.toFixed(2)} ({legendData.changePercent > 0 ? '+' : ''}{legendData.changePercent.toFixed(2)}%)
              </strong>
            </span>
            <span>
              Vol: <strong style={{ color: isDark ? '#CBD5E1' : '#475569' }}>{legendData.volume.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        )}

        {/* Indicator Stats Row */}
        {legendData && (showEMA20 || showEMA50 || showVWAP) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, fontFamily: 'monospace', marginTop: 1 }}>
            {showEMA20 && legendData.ema20 !== undefined && (
              <span style={{ color: '#38BDF8' }}>
                EMA20: <strong>₹{legendData.ema20.toFixed(2)}</strong>
              </span>
            )}
            {showEMA50 && legendData.ema50 !== undefined && (
              <span style={{ color: '#F59E0B' }}>
                EMA50: <strong>₹{legendData.ema50.toFixed(2)}</strong>
              </span>
            )}
            {showVWAP && legendData.vwap !== undefined && (
              <span style={{ color: '#A855F7' }}>
                VWAP: <strong>₹{legendData.vwap.toFixed(2)}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lightweight Charts Canvas Host Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          position: 'relative',
        }}
      />
    </div>
  );
};
