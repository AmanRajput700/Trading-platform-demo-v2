import React, { useState, useEffect } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { GlobalSearch } from './components/navigation/GlobalSearch';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickOrderModal } from './components/trading/QuickOrderModal';
import { BrokerConnectModal } from './components/broker/BrokerConnectModal';
import { AuthModal } from './components/auth/AuthModal';
import { LiveModeModal } from './components/common/LiveModeModal';
import { OrderDetailsModal } from './components/trading/OrderDetailsModal';
import { TradeConfirmationModal } from './components/trading/TradeConfirmationModal';
import { CircuitSignalPopup } from './components/circuit/CircuitSignalPopup';
import { CircuitSignalData } from './types/circuit';
import { circuitService } from './services/circuitService';

import { LandingPage } from './pages/Landing/LandingPage';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { CircuitWatchDashboard } from './pages/Strategies/CircuitWatchDashboard';

import { Market } from './pages/Market/Market';
import { ChartPage } from './pages/Chart/ChartPage';
import { InstrumentDetail } from './pages/Instrument/InstrumentDetail';
import { OptionChain } from './pages/Options/OptionChain';
import { OrdersPage } from './pages/Orders/OrdersPage';
import { TradeHistoryPage } from './pages/TradeHistory/TradeHistoryPage';
import { PositionsPage } from './pages/Positions/PositionsPage';
import { HoldingsPage } from './pages/Holdings/HoldingsPage';
import { FundsPage } from './pages/Funds/FundsPage';
import { BrokersPage } from './pages/Brokers/BrokersPage';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { UsersPage } from './pages/Users/UsersPage';

const AppContent: React.FC = () => {
  const { currentPage, isAuthenticated, openQuickOrder } = useTrading();
  const [activeSignalPopup, setActiveSignalPopup] = useState<CircuitSignalData | null>(null);
  const dismissedSignalsRef = React.useRef<Set<number>>(new Set());

  // Poll for active high-confidence S0 signals if none is currently displayed
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSignals = async () => {
      try {
        const signals = await circuitService.getActiveSignals();
        const unviewed = signals.filter((s) => !dismissedSignalsRef.current.has(s.id));
        if (unviewed.length > 0 && !activeSignalPopup) {
          // Surface highest quality score unviewed signal
          setActiveSignalPopup(unviewed[0]);
        }
      } catch {
        // ignore
      }
    };

    checkSignals();
    const interval = setInterval(checkSignals, 6000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeSignalPopup]);

  const handleClosePopup = () => {
    if (activeSignalPopup?.id) {
      dismissedSignalsRef.current.add(activeSignalPopup.id);
    }
    setActiveSignalPopup(null);
  };

  const handleReviewBuy = (signal: CircuitSignalData) => {
    if (signal?.id) {
      dismissedSignalsRef.current.add(signal.id);
    }
    openQuickOrder({
      symbol: signal.symbol,
      name: `${signal.symbol} (NSE EQ)`,
      side: 'BUY',
      price: signal.live_price,
      initialQty: 50,
    });
    setActiveSignalPopup(null);
  };



  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'circuit-strategy':
        return <CircuitWatchDashboard />;
      case 'strategies':
      case 'strategy-builder':
      case 'strategy-results':
      case 'backtester':
        return <Dashboard />;

      case 'market':
        return <Market />;
      case 'chart':
        return <ChartPage />;
      case 'instrument':
        return <InstrumentDetail />;
      case 'options':
        return <OptionChain />;
      case 'orders':
        return <OrdersPage />;
      case 'trade-history':
        return <TradeHistoryPage />;
      case 'positions':
        return <PositionsPage />;
      case 'holdings':
        return <HoldingsPage />;
      case 'funds':
        return <FundsPage />;
      case 'brokers':
        return <BrokersPage />;
      case 'users':
        return <UsersPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  // If user is unauthenticated, show public landing page with accessible login/signup flows
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-base)' }}>
        <LandingPage />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  // Authenticated Trading Terminal Workspace
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-base)' }}>
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden'
      }}>
        {/* Top App Bar */}
        <TopBar />

        {/* Dynamic Page Viewport */}
        <main style={{ flex: 1, minHeight: 'calc(100vh - var(--topbar-height))', paddingBottom: 'var(--space-8)' }}>
          {renderPage()}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <GlobalSearch />
      <QuickOrderModal />
      <BrokerConnectModal />
      <AuthModal />
      <LiveModeModal />
      <OrderDetailsModal />
      <TradeConfirmationModal />
      <CircuitSignalPopup
        signal={activeSignalPopup}
        onClose={handleClosePopup}
        onReviewBuy={handleReviewBuy}
      />
      <ToastContainer />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TradingProvider>
      <AppContent />
    </TradingProvider>
  );
};

export default App;
