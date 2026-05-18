import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import Toast from './Toast';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <span className="header-logo">🐣</span>
          <div>
            <div className="header-title">Peternakan Puyuh</div>
            <div className="header-subtitle">Panel Admin</div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-user">
            {user?.picture ? (
              <img src={user.picture} alt="avatar" className="header-avatar" />
            ) : (
              <div className="header-avatar-placeholder">
                <User size={16} />
              </div>
            )}
          </div>
          <button className="header-logout" onClick={logout} title="Keluar">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
