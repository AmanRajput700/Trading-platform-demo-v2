import React from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { GlobalSearch } from './components/navigation/GlobalSearch';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickOrderModal } from './components/trading/QuickOrderModal';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { StrategiesList } from './pages/Strategies/StrategiesList';
import { StrategyBuilder } from './pages/StrategyBuilder/StrategyBuilder';
import { StrategyResults } from './pages/Strategies/StrategyResults';
import { Market } from './pages/Market/Market';
import { InstrumentDetail } from './pages/Instrument/InstrumentDetail';
import { OptionChain } from './pages/Options/OptionChain';
import { OrdersPage } from './pages/Orders/OrdersPage';
import { PositionsPage } from './pages/Positions/PositionsPage';
import { HoldingsPage } from './pages/Holdings/HoldingsPage';
import { FundsPage } from './pages/Funds/FundsPage';
import { BrokersPage } from './pages/Brokers/BrokersPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const AppContent: React.FC = () => {
  const { currentPage } = useTrading();

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
      case 'market':
        return <Market />;
      case 'instrument':
        return <InstrumentDetail />;
      case 'options':
        return <OptionChain />;
      case 'orders':
        return <OrdersPage />;
      case 'positions':
        return <PositionsPage />;
      case 'holdings':
        return <HoldingsPage />;
      case 'funds':
        return <FundsPage />;
      case 'brokers':
        return <BrokersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

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
