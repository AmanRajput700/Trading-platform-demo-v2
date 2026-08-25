import React from 'react';
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

import { LandingPage } from './pages/Landing/LandingPage';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { StrategiesList } from './pages/Strategies/StrategiesList';
import { StrategyBuilder } from './pages/StrategyBuilder/StrategyBuilder';
import { StrategyResults } from './pages/Strategies/StrategyResults';
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
  const { currentPage, isAuthenticated } = useTrading();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'strategies':
        return <StrategiesList />;
      case 'strategy-builder':
        return <StrategyBuilder />;
      case 'strategy-results':
        return <StrategyResults />;
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
