import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Wallet,
  MoreHorizontal,
  History
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input', icon: ClipboardList, label: 'Input' },
  { to: '/riwayat', icon: History, label: 'Riwayat' },
  { to: '/keuangan', icon: Wallet, label: 'Keuangan' },
  { to: '/lainnya', icon: MoreHorizontal, label: 'Lainnya' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
