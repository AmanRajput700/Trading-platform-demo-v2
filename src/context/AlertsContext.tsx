import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AlertStats, AlertType, PriceAlertData, AlertSettingsConfig } from '../types/alert';
import { alertService } from '../services/alertService';
import { marketFeedService } from '../services/marketFeedService';

const DEFAULT_SETTINGS: AlertSettingsConfig = {
  soundEnabled: true,
  autoDismissSeconds: 12,
  enableBreakouts: true,
  enableBreakdowns: true,
  enableCircuitApproaches: true,
  showPopups: true,
};

/** Maximum alerts to keep in live feed to prevent performance degradation */
const MAX_FEED_SIZE = 200;

/** Per-symbol+type cooldown in ms: prevents rapid duplicate popups */
const POPUP_COOLDOWN_MS = 2000;

// ── Web Audio Synthesizer & Autoplay Policy Manager ─────────────────────────
class AudioAlertManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * Plays a pleasant double-tone confirmation when user turns audio ON
   */
  public playTestChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Note 1: 784 Hz (G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2: 1046.5 Hz (C6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.09);
      gain2.gain.setValueAtTime(0.001, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.14, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.26);
    } catch {
      // Audio error fallback
    }
  }

  /**
   * Plays high-clarity synthesized chimes for market surveillance triggers
   */
  public playAlertChime(type: AlertType): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      if (type === 'PREV_HIGH_BREAKOUT') {
        // Bullish ascending dual tone (D5 to A5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.14);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'PREV_LOW_BREAKDOWN') {
        // Bearish descending tone (A4 to Eb4)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440.0, now);
        osc.frequency.exponentialRampToValueAtTime(311.13, now + 0.18);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.13, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.38);
      } else {
        // Circuit approach: 3 fast ascending bright harmonic pips
        const freqs = [659.25, 880.0, 1046.5]; // E5, A5, C6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          const t = now + idx * 0.07;
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.start(t);
          osc.stop(t + 0.18);
        });
      }
    } catch {
      // Audio error fallback
    }
  }
}

export const audioAlertManager = new AudioAlertManager();

export interface AlertsContextType {
  activePopups: PriceAlertData[];
  todayAlerts: PriceAlertData[];
  stats: AlertStats;
  settings: AlertSettingsConfig;
  setSettings: (newSettings: Partial<AlertSettingsConfig> | ((prev: AlertSettingsConfig) => AlertSettingsConfig)) => void;
  dismissPopup: (id: number) => void;
  dismissAllPopups: () => void;
  togglePopups: () => void;
  toggleSound: () => void;
  refreshAlerts: () => Promise<void>;
  resetTodayStats: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePopups, setActivePopups] = useState<PriceAlertData[]>([]);
  const [todayAlerts, setTodayAlerts] = useState<PriceAlertData[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    breakouts: 0,
    breakdowns: 0,
    circuit_approaches: 0,
  });

  const [settings, setSettingsState] = useState<AlertSettingsConfig>(() => {
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

  // Eagerly unlock Web Audio on first user interaction anywhere in the application
  useEffect(() => {
    const handleFirstGesture = () => {
      audioAlertManager.unlock();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Per symbol+type popup cooldown tracker: tracks last popup show time
  const popupCooldownRef = useRef<Map<string, number>>(new Map());

  // Fetch initial alerts & stats on mount
  const refreshAlerts = useCallback(async () => {
    try {
      const [alertsList, statsData] = await Promise.all([
        alertService.getActiveAlerts(),
        alertService.getAlertStats(),
      ]);
      setTodayAlerts(alertsList.slice(0, MAX_FEED_SIZE));
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

    // 1. Play chime if sound is enabled
    if (cfg.soundEnabled) {
      audioAlertManager.playAlertChime(alert.alert_type);
    }

    // 2. Always update today's surveillance list — prepend, cap at MAX_FEED_SIZE
    setTodayAlerts((prev) => {
      const deduped = prev.filter((item) => item.id !== alert.id);
      return [alert, ...deduped].slice(0, MAX_FEED_SIZE);
    });

    // 3. Always update stats
    setStats((prev) => ({
      total: prev.total + 1,
      breakouts: prev.breakouts + (alert.alert_type === 'PREV_HIGH_BREAKOUT' ? 1 : 0),
      breakdowns: prev.breakdowns + (alert.alert_type === 'PREV_LOW_BREAKDOWN' ? 1 : 0),
      circuit_approaches: prev.circuit_approaches + (alert.alert_type === 'CIRCUIT_APPROACH' ? 1 : 0),
    }));

    // 4. Per-symbol+type popup cooldown
    const cooldownKey = `${alert.symbol}:${alert.alert_type}`;
    const lastShown = popupCooldownRef.current.get(cooldownKey) ?? 0;
    const now = Date.now();
    if (now - lastShown < POPUP_COOLDOWN_MS) {
      return; // skip popup — still cooling down
    }
    popupCooldownRef.current.set(cooldownKey, now);

    // 5. Only show floating popup if showPopups is enabled
    if (!settingsRef.current.showPopups) return;

    // Add to active floating popups — keep at most 3 visible
    setActivePopups((prev) => {
      const filtered = prev.filter(
        (p) => !(p.symbol === alert.symbol && p.alert_type === alert.alert_type)
      );
      return [alert, ...filtered].slice(0, 3);
    });
  }, []);

  // Subscribe to market feed WebSocket alerts
  useEffect(() => {
    const unsubscribe = marketFeedService.subscribeAlerts(handleIncomingAlert);
    const unsubscribeReset = marketFeedService.subscribeStatsReset(() => {
      setStats({ total: 0, breakouts: 0, breakdowns: 0, circuit_approaches: 0 });
      setTodayAlerts([]);
      setActivePopups([]);
    });
    return () => {
      unsubscribe();
      unsubscribeReset();
    };
  }, [handleIncomingAlert]);

  // Reset today's stats & alerts
  const resetTodayStats = useCallback(async () => {
    try {
      const res = await alertService.resetTodayAlerts();
      setStats(res);
      setTodayAlerts([]);
      setActivePopups([]);
    } catch {
      // ignore
    }
  }, []);

  // Dismiss a specific popup
  const dismissPopup = useCallback((id: number) => {
    setActivePopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Dismiss all active popups
  const dismissAllPopups = useCallback(() => {
    setActivePopups([]);
  }, []);

  // Update settings with local storage sync
  const updateSettings = useCallback(
    (newSettings: Partial<AlertSettingsConfig> | ((prev: AlertSettingsConfig) => AlertSettingsConfig)) => {
      setSettingsState((prev) => {
        const next = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
        if (!next.showPopups) {
          setActivePopups([]);
        }
        try {
          localStorage.setItem('auratrade-alert-settings', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  // Toggle popup visibility on/off: when turning off, instantly clear all active floating popups
  const togglePopups = useCallback(() => {
    setSettingsState((prev) => {
      const nextShowPopups = !prev.showPopups;
      const next = { ...prev, showPopups: nextShowPopups };
      if (!nextShowPopups) {
        setActivePopups([]);
      }
      try {
        localStorage.setItem('auratrade-alert-settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Toggle audio on/off: when turning on, unlock context and play instant confirmation test tone
  const toggleSound = useCallback(() => {
    setSettingsState((prev) => {
      const nextSoundEnabled = !prev.soundEnabled;
      const next = { ...prev, soundEnabled: nextSoundEnabled };
      try {
        localStorage.setItem('auratrade-alert-settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (nextSoundEnabled) {
        audioAlertManager.playTestChime();
      }
      return next;
    });
  }, []);

  return (
    <AlertsContext.Provider
      value={{
        activePopups,
        todayAlerts,
        stats,
        settings,
        setSettings: updateSettings,
        dismissPopup,
        dismissAllPopups,
        togglePopups,
        toggleSound,
        refreshAlerts,
        resetTodayStats,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export function useAlerts(): AlertsContextType {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
