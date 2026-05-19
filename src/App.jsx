import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initDefaults, hasRegistered, factoryReset } from './db';
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
import { showToast } from './components/Toast';

function AppRoutes() {
  const { user, loading, logout } = useAuth();
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  const handleInit = async (uid) => {
    setDbError(null);
    try {
      const actionType = localStorage.getItem('auth_action') || 'login';
      const isRegistered = await hasRegistered(uid);

      if (isRegistered) {
        // Akun sudah pernah daftar -> Teruskan data eksis
        await initDefaults(uid);
        showToast("Selamat datang kembali! Seluruh data peternakan Anda telah berhasil dipulihkan. 🏡👋", "success");
      } else {
        // Akun baru -> Buat peternakan baru (mulai dari 0)
        await initDefaults(uid);
        showToast("Selamat datang di Puyuh Dashboard! Peternakan baru Anda berhasil didaftarkan. Selamat mengelola! 🐣🎉", "success");
      }

      setDbReady(true);
      // Clean up storage flag
      localStorage.removeItem('auth_action');
    } catch (err) {
      console.error("Database initialization failed:", err);
      setDbError(err.message || String(err));
    }
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
          onClick={() => user && handleInit(user.uid)}
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
