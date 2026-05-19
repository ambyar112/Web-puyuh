import { Link } from 'react-router-dom';
import { BarChart3, Wrench, Settings, FileSpreadsheet, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { db, factoryReset } from '../db';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const moreItems = [
  {
    to: '/laporan',
    icon: FileSpreadsheet,
    label: 'Laporan & Export Excel',
    desc: 'Download data ke file .xlsx',
    color: '#22d3ee',
    id: 'link-laporan',
  },
  {
    to: '/inventaris',
    icon: Wrench,
    label: 'Inventaris Alat',
    desc: 'Kelola perlengkapan kandang',
    color: '#a78bfa',
    id: 'link-inventaris',
  },
  {
    to: '/pengaturan',
    icon: Settings,
    label: 'Pengaturan',
    desc: 'Konfigurasi sistem & akses',
    color: '#94a3b8',
    id: 'link-pengaturan',
  },
];

export default function MorePage() {
  const { user } = useAuth();

  const handleFactoryReset = async () => {
    if (window.confirm('PERHATIAN: Tindakan ini akan menghapus semua riwayat, transaksi, dan mereset stok ke 0. Lanjutkan?')) {
      const emailInput = window.prompt(`Ketik email Anda (${user?.email}) untuk konfirmasi reset pabrik:`);
      if (emailInput !== user?.email) {
        showToast('Reset dibatalkan: Email tidak cocok', 'error');
        return;
      }
      
      try {
          await factoryReset(user?.uid);
          showToast('Sistem berhasil direset ke 0', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          console.error(err);
          showToast('Gagal mereset sistem', 'error');
        }
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Menu Lainnya</h1>
        <p className="page-subtitle">Fitur tambahan & pengaturan</p>
      </div>

      <div className="more-menu-list">
        {moreItems.map(({ to, icon: Icon, label, desc, color, id }) => (
          <Link key={to} to={to} className="more-menu-item" id={id}>
            <div className="more-menu-icon" style={{ backgroundColor: `${color}20`, color }}>
              <Icon size={24} />
            </div>
            <div className="more-menu-info">
              <div className="more-menu-label">{label}</div>
              <div className="more-menu-desc">{desc}</div>
            </div>
            <ChevronRight size={18} className="more-menu-chevron" />
          </Link>
        ))}
      </div>

      <div className="app-info-card">
        <div className="app-info-title">🐣 Dashboard Peternakan Puyuh</div>
        <div className="app-info-version">Versi 1.0.0</div>
        <div className="app-info-desc">
          Sistem manajemen internal privat untuk peternakan puyuh.<br/>
          Data tersimpan aman di perangkat ini.
        </div>
        <div className="app-info-badge">🔒 100% Privat & Offline</div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="danger-zone" style={{ marginTop: '16px' }}>
        <div className="danger-zone-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} /> Zona Berbahaya
        </div>
        <p className="danger-zone-desc">Tindakan ini akan mengembalikan semua angka ke 0 dan menghapus riwayat.</p>
        <button className="btn btn-danger w-full" onClick={handleFactoryReset} id="btn-factory-reset">
          🗑️ Reset Semua Data (Kembali ke 0)
        </button>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
}
