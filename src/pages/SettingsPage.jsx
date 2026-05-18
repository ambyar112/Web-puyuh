import { useState, useEffect } from 'react';
import { db, getSetting, setSetting, factoryReset } from '../db';
import { showToast } from '../components/Toast';
import { Save, ChevronRight, Shield, Bell, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('');
  const [whitelistEmails, setWhitelistEmails] = useState('');
  const [hargaKarung, setHargaKarung] = useState('');
  const [alarmKritis, setAlarmKritis] = useState('');
  const [alarmDarurat, setAlarmDarurat] = useState('');
  const [populasiAwal, setPopulasiAwal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const [name, emails, harga, kritis, darurat] = await Promise.all([
      getSetting('farmName'),
      getSetting('whitelistEmails'),
      getSetting('hargaKarung'),
      getSetting('alarmPakanKritis'),
      getSetting('alarmPakanDarurat'),
    ]);
    setFarmName(name || 'Peternakan Puyuhku');
    setWhitelistEmails(Array.isArray(emails) ? emails.join('\n') : '');
    setHargaKarung(String(harga || 2000));
    setAlarmKritis(String(kritis || 10));
    setAlarmDarurat(String(darurat || 5));

    const { getLivestock } = await import('../db');
    const lv = await getLivestock();
    setPopulasiAwal(String(lv?.totalPopulation || 0));
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting('farmName', farmName);
      const emailList = whitelistEmails.split('\n').map(e => e.trim()).filter(Boolean);
      await setSetting('whitelistEmails', emailList);
      await setSetting('hargaKarung', parseFloat(hargaKarung) || 2000);
      await setSetting('alarmPakanKritis', parseInt(alarmKritis) || 10);
      await setSetting('alarmPakanDarurat', parseInt(alarmDarurat) || 5);
      showToast('Pengaturan berhasil disimpan! ✅', 'success');
    } catch {
      showToast('Gagal menyimpan pengaturan', 'error');
    }
    setSaving(false);
  };

  const handleClearData = async () => {
    if (window.confirm('PERHATIAN: Tindakan ini akan menghapus semua riwayat, transaksi, dan mereset stok ke 0. Lanjutkan?')) {
      const emailInput = window.prompt(`Ketik email Anda (${user?.email}) untuk konfirmasi reset pabrik:`);
      if (emailInput !== user?.email) {
        showToast('Reset dibatalkan: Email tidak cocok', 'error');
        return;
      }
      
      try {
          await factoryReset();
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
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-subtitle">Konfigurasi sistem peternakan</p>
      </div>

      {/* Farm Identity */}
      <div className="settings-section">
        <div className="settings-section-title">🏡 Identitas Peternakan</div>
        <div className="form-card no-shadow">
          <label className="form-label">Nama Peternakan</label>
          <input
            className="form-input"
            value={farmName}
            onChange={e => setFarmName(e.target.value)}
            placeholder="Nama peternakan kamu"
            id="input-farm-name"
          />
        </div>
      </div>

      {/* Security */}
      <div className="settings-section">
        <div className="settings-section-title">🔒 Keamanan & Akses</div>
        <div className="form-card no-shadow">
          <div className="form-label-row">
            <Shield size={15} />
            <label className="form-label">Email yang Diizinkan (Whitelist)</label>
          </div>
          <p className="form-hint">Satu email per baris. Kosongkan = semua email diizinkan (mode demo)</p>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="admin@gmail.com&#10;pengelola2@gmail.com"
            value={whitelistEmails}
            onChange={e => setWhitelistEmails(e.target.value)}
            id="input-whitelist"
          />
          <div className="info-box">
            <Info size={14} />
            <span>Aktifkan Google OAuth dengan menambahkan <code>VITE_GOOGLE_CLIENT_ID</code> di file <code>.env</code></span>
          </div>
        </div>
      </div>

      {/* Logistics Settings */}
      <div className="settings-section">
        <div className="settings-section-title">📦 Pengaturan Logistik</div>
        <div className="form-card no-shadow">
          <label className="form-label">Harga Jual Karung Bekas (Rp/karung)</label>
          <input
            className="form-input"
            type="number"
            value={hargaKarung}
            onChange={e => setHargaKarung(e.target.value)}
            min="0"
            id="input-harga-karung"
          />
        </div>
      </div>

      {/* Alarm Settings */}
      <div className="settings-section">
        <div className="settings-section-title">🔔 Pengaturan Alarm Stok Pakan</div>
        <div className="form-card no-shadow">
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">
                <span style={{ color: '#fbbf24' }}>⚠️</span> Alarm Kuning (karung)
              </label>
              <input
                className="form-input"
                type="number"
                value={alarmKritis}
                onChange={e => setAlarmKritis(e.target.value)}
                min="0"
                id="input-alarm-kuning"
              />
              <p className="form-hint">Stok ≤ angka ini → warna kuning</p>
            </div>
            <div className="form-col">
              <label className="form-label">
                <span style={{ color: '#f87171' }}>🔴</span> Alarm Merah (karung)
              </label>
              <input
                className="form-input"
                type="number"
                value={alarmDarurat}
                onChange={e => setAlarmDarurat(e.target.value)}
                min="0"
                id="input-alarm-merah"
              />
              <p className="form-hint">Stok ≤ angka ini → warna merah kritis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pupuk Kompos - Coming Soon */}
      <div className="settings-section">
        <div className="settings-section-title">🌿 Pengolahan Pupuk Kompos</div>
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🚧</div>
          <div>
            <div className="coming-soon-title">Fitur Sedang Dinonaktifkan</div>
            <div className="coming-soon-desc">Akan diaktifkan setelah market pupuk ditemukan</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="btn btn-primary btn-large w-full"
        onClick={handleSave}
        disabled={saving}
        id="btn-save-settings"
      >
        {saving ? <span className="spinner" /> : <Save size={20} />}
        <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
      </button>

      {/* Other Links */}
      <div className="settings-section">
        <div className="settings-section-title">📋 Lainnya</div>
        <div className="settings-links">
          <button className="settings-link-item" onClick={() => navigate('/laporan')} id="btn-nav-laporan">
            <span>📊 Laporan & Export Excel</span>
            <ChevronRight size={16} />
          </button>
          <button className="settings-link-item" onClick={() => navigate('/inventaris')} id="btn-nav-inventaris">
            <span>🔧 Inventaris Alat</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="danger-zone">
        <div className="danger-zone-title">⚠️ Zona Berbahaya</div>
        <p className="danger-zone-desc">Tindakan ini akan mengembalikan semua angka ke 0 dan menghapus riwayat.</p>
        <button className="btn btn-danger w-full" onClick={handleClearData} id="btn-clear-data">
          🗑️ Reset Semua Data (Kembali ke 0)
        </button>
        <button className="btn btn-ghost w-full mt-2" onClick={logout} id="btn-logout">
          🚪 Keluar / Logout
        </button>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
}
