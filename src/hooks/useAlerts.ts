import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertStats, AlertType, PriceAlertData, AlertSettingsConfig } from '../types/alert';
import { alertService } from '../services/alertService';
import { marketFeedService } from '../services/marketFeedService';

const DEFAULT_SETTINGS: AlertSettingsConfig = {
  soundEnabled: true,
  autoDismissSeconds: 12,
  enableBreakouts: true,
  enableBreakdowns: true,
  enableCircuitApproaches: true,
};

export function useAlerts() {
  const [activePopups, setActivePopups] = useState<PriceAlertData[]>([]);
  const [todayAlerts, setTodayAlerts] = useState<PriceAlertData[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    breakouts: 0,
    breakdowns: 0,
    circuit_approaches: 0,
  });
  const [settings, setSettings] = useState<AlertSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem('auratrade-alert-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
    try {
      localStorage.setItem('auratrade-alert-settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Web Audio Synthesized Chimes
  const playChime = useCallback((type: AlertType) => {
    if (!settingsRef.current.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'PREV_HIGH_BREAKOUT') {
        // Ascending harmonic chime (Green Breakout)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.18); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'PREV_LOW_BREAKDOWN') {
        // Descending caution tone (Red Breakdown)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440.0, now); // A4
        osc.frequency.exponentialRampToValueAtTime(311.13, now + 0.22); // Eb4
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // Futuristic tri-tone pulse (Blue Circuit Approach)
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Fetch initial alerts & stats on mount
  const refreshAlerts = useCallback(async () => {
    try {
      const [alertsList, statsData] = await Promise.all([
        alertService.getActiveAlerts(),
        alertService.getAlertStats(),
      ]);
      setTodayAlerts(alertsList);
      setStats(statsData);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
    // Periodically sync stats every 20s
    const timer = setInterval(refreshAlerts, 20000);
    return () => clearInterval(timer);
  }, [refreshAlerts]);

  // Handle incoming real-time alert from WebSocket
  const handleIncomingAlert = useCallback((alert: PriceAlertData) => {
    const cfg = settingsRef.current;
    if (alert.alert_type === 'PREV_HIGH_BREAKOUT' && !cfg.enableBreakouts) return;
    if (alert.alert_type === 'PREV_LOW_BREAKDOWN' && !cfg.enableBreakdowns) return;
    if (alert.alert_type === 'CIRCUIT_APPROACH' && !cfg.enableCircuitApproaches) return;

    // Play chime
    playChime(alert.alert_type);

    // Update today's list
    setTodayAlerts((prev) => [alert, ...prev.filter((item) => item.id !== alert.id)]);

    // Update stats
    setStats((prev) => ({
      total: prev.total + 1,
      breakouts: prev.breakouts + (alert.alert_type === 'PREV_HIGH_BREAKOUT' ? 1 : 0),
      breakdowns: prev.breakdowns + (alert.alert_type === 'PREV_LOW_BREAKDOWN' ? 1 : 0),
      circuit_approaches: prev.circuit_approaches + (alert.alert_type === 'CIRCUIT_APPROACH' ? 1 : 0),
    }));

    // Add to active floating popups (keep at most 3 visible, replacing existing for same symbol+type)
    setActivePopups((prev) => {
      const filtered = prev.filter(
        (p) => !(p.symbol === alert.symbol && p.alert_type === alert.alert_type)
      );
      return [alert, ...filtered].slice(0, 3);
    });
  }, [playChime]);

  // Subscribe to market feed WebSocket alerts
  useEffect(() => {
    const unsubscribe = marketFeedService.subscribeAlerts(handleIncomingAlert);
    return () => unsubscribe();
  }, [handleIncomingAlert]);

  // Dismiss a specific popup
  const dismissPopup = useCallback((id: number) => {
    setActivePopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Dismiss all active popups
  const dismissAllPopups = useCallback(() => {
    setActivePopups([]);
  }, []);

  return {
    activePopups,
    todayAlerts,
    stats,
    settings,
    setSettings,
    dismissPopup,
    dismissAllPopups,
    refreshAlerts,
  };
}
