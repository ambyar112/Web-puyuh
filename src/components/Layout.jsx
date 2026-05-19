import { LogOut, User, LayoutDashboard, ClipboardList, History, Wallet, Package, Wrench, FileSpreadsheet, Settings, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Toast from './Toast';

const sidebarItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input', icon: ClipboardList, label: 'Input Harian' },
  { to: '/riwayat', icon: History, label: 'Riwayat' },
  { to: '/keuangan', icon: Wallet, label: 'Keuangan' },
  { to: '/stok', icon: Package, label: 'Stok Gudang' },
  { to: '/inventaris', icon: Wrench, label: 'Inventaris' },
  { to: '/laporan', icon: FileSpreadsheet, label: 'Laporan & Export' },
  { to: '/pengaturan', icon: Settings, label: 'Pengaturan' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">🐣</span>
          <div>
            <div className="sidebar-farm-name">Peternakan Puyuh</div>
            <div className="sidebar-farm-sub">Panel Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user?.picture ? (
            <img src={user.picture} alt="avatar" className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-sm"><User size={16} /></div>
          )}
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button className="sidebar-logout-btn" onClick={logout} title="Keluar">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOP HEADER ===== */}
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

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {children}
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <BottomNav />

      {/* ===== TOAST ===== */}
      <Toast />
    </div>
  );
}
