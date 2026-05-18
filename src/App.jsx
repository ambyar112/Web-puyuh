import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initDefaults } from './db';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DailyInputPage from './pages/DailyInputPage';
import StockPage from './pages/StockPage';
import FinancePage from './pages/FinancePage';
import EquipmentPage from './pages/EquipmentPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import MorePage from './pages/MorePage';
import HistoryPage from './pages/HistoryPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="splash-icon">🐣</div>
        <div className="splash-title">Peternakan Puyuh</div>
        <div className="splash-spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/input" element={<DailyInputPage />} />
        <Route path="/stok" element={<StockPage />} />
        <Route path="/keuangan" element={<FinancePage />} />
        <Route path="/inventaris" element={<EquipmentPage />} />
        <Route path="/laporan" element={<ReportsPage />} />
        <Route path="/pengaturan" element={<SettingsPage />} />
        <Route path="/riwayat" element={<HistoryPage />} />
        <Route path="/lainnya" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDefaults().then(() => setDbReady(true)).catch(console.error);
  }, []);

  if (!dbReady) {
    return (
      <div className="splash-screen">
        <div className="splash-icon">🐣</div>
        <div className="splash-title">Memuat database...</div>
        <div className="splash-spinner" />
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
