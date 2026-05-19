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
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  const handleInit = (uid) => {
    setDbError(null);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Koneksi ke Firebase Cloud Firestore terputus atau timeout (melebihi 6 detik). Silakan periksa koneksi internet Anda, pastikan aturan (Rules) Firestore Anda diset ke 'true', dan reload halaman.")), 6000)
    );

    Promise.race([
      initDefaults(uid),
      timeoutPromise
    ])
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error("Database initialization failed:", err);
        setDbError(err.message || String(err));
      });
  };

  useEffect(() => {
    if (user) {
      handleInit(user.uid);
    } else {
      setDbReady(false);
      setDbError(null);
    }
  }, [user]);

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

  if (dbError) {
    return (
      <div className="splash-screen" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="splash-icon">⚠️</div>
        <div className="splash-title" style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Gagal Memuat Database</div>
        <p style={{ color: '#ccc', margin: '10px 0 20px 0', maxWidth: '400px', fontSize: '14px', lineHeight: '1.6' }}>
          {dbError}
        </p>
        <button 
          onClick={handleInit}
          style={{
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

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
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
