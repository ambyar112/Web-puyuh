import { useState } from 'react';
import { userCol } from '../db';
import { query, where, getDocs } from 'firebase/firestore';
import { exportMonthly, exportYearly, exportAllTime } from '../utils/exportExcel';
import { showToast } from '../components/Toast';
import { getMonthRange, getYearRange, getMonthName } from '../utils/dateUtils';
import { FileSpreadsheet, Download, Calendar, TrendingUp, Infinity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [exportType, setExportType] = useState('monthly');
  const [monthValue, setMonthValue] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [yearValue, setYearValue] = useState(() => String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);

  const getDocsArray = async (refOrQuery) => {
    const snap = await getDocs(refOrQuery);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      if (exportType === 'monthly') {
        const [year, month] = monthValue.split('-').map(Number);
        const { start, end } = getMonthRange(year, month);
        
        const transactionsQ = query(
          userCol(uid, 'transactions'),
          where('date', '>=', start),
          where('date', '<=', end)
        );
        const dailyRecordsQ = query(
          userCol(uid, 'dailyRecords'),
          where('date', '>=', start),
          where('date', '<=', end)
        );

        const transactions = await getDocsArray(transactionsQ);
        const dailyRecords = await getDocsArray(dailyRecordsQ);
        
        await exportMonthly(transactions, dailyRecords, year, month);
        showToast(`Laporan ${getMonthName(month)} ${year} berhasil diunduh! 📊`, 'success');
      } else if (exportType === 'yearly') {
        const year = parseInt(yearValue);
        const { start, end } = getYearRange(year);

        const transactionsQ = query(
          userCol(uid, 'transactions'),
          where('date', '>=', start),
          where('date', '<=', end)
        );
        const dailyRecordsQ = query(
          userCol(uid, 'dailyRecords'),
          where('date', '>=', start),
          where('date', '<=', end)
        );

        const transactions = await getDocsArray(transactionsQ);
        const dailyRecords = await getDocsArray(dailyRecordsQ);
        
        await exportYearly(transactions, dailyRecords, year);
        showToast(`Laporan Tahunan ${year} berhasil diunduh! 📊`, 'success');
      } else {
        const transactions = await getDocsArray(userCol(uid, 'transactions'));
        const dailyRecords = await getDocsArray(userCol(uid, 'dailyRecords'));
        await exportAllTime(transactions, dailyRecords);
        showToast('Laporan Semua Waktu berhasil diunduh! 📊', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat laporan. Coba lagi.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Laporan & Export</h1>
        <p className="page-subtitle">Download data ke Excel</p>
      </div>

      {/* Export Type */}
      <div className="section-label">📊 Pilih Jenis Laporan</div>

      <div className="report-type-cards">
        <div
          className={`report-type-card ${exportType === 'monthly' ? 'selected' : ''}`}
          onClick={() => setExportType('monthly')}
          id="card-report-monthly"
        >
          <Calendar size={28} />
          <div className="report-type-title">Laporan Bulanan</div>
          <div className="report-type-desc">
            Data kas & produksi 1 bulan (2 sheet Excel)
          </div>
          <div className="report-type-sheets">
            <span className="sheet-badge">📋 Kas Bulanan</span>
            <span className="sheet-badge">🥚 Produksi Harian</span>
          </div>
        </div>

        <div
          className={`report-type-card ${exportType === 'yearly' ? 'selected' : ''}`}
          onClick={() => setExportType('yearly')}
          id="card-report-yearly"
        >
          <TrendingUp size={28} />
          <div className="report-type-title">Laporan Tahunan</div>
          <div className="report-type-desc">
            Ringkasan lengkap 1 tahun (3 sheet Excel)
          </div>
          <div className="report-type-sheets">
            <span className="sheet-badge">📊 Dashboard</span>
            <span className="sheet-badge">📝 Detail</span>
            <span className="sheet-badge">🐣 Produksi</span>
          </div>
        </div>

        <div
          className={`report-type-card ${exportType === 'allTime' ? 'selected' : ''}`}
          onClick={() => setExportType('allTime')}
          id="card-report-alltime"
        >
          <Infinity size={28} />
          <div className="report-type-title">Laporan Semua Waktu</div>
          <div className="report-type-desc">
            Semua data sejak awal hingga sekarang
          </div>
          <div className="report-type-sheets">
            <span className="sheet-badge">📝 Semua Transaksi</span>
            <span className="sheet-badge">🐣 Semua Produksi</span>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      {exportType !== 'allTime' && (
        <div className="form-card">
          <label className="form-label">
            {exportType === 'monthly' ? '📅 Pilih Bulan' : '🗓️ Pilih Tahun'}
          </label>
          {exportType === 'monthly' ? (
            <input
              type="month"
              className="form-input"
              value={monthValue}
              onChange={e => setMonthValue(e.target.value)}
              id="input-report-month"
            />
          ) : (
            <select
              className="form-input"
              value={yearValue}
              onChange={e => setYearValue(e.target.value)}
              id="select-report-year"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* What's in the export info */}
      <div className="export-info-card">
        <FileSpreadsheet size={20} />
        <div>
          {exportType === 'monthly' ? (
            <>
              <div className="export-info-title">File yang akan diunduh:</div>
              <div className="export-info-item">📋 <strong>Tab 1:</strong> Kas Bulanan — semua transaksi masuk/keluar</div>
              <div className="export-info-item">🥚 <strong>Tab 2:</strong> Produksi Harian — panen, pakan, kematian</div>
            </>
          ) : exportType === 'yearly' ? (
            <>
              <div className="export-info-title">File yang akan diunduh (3 Sheet):</div>
              <div className="export-info-item">📊 <strong>Tab 1:</strong> Dashboard Tahunan — total income vs expense per bulan + laba bersih</div>
              <div className="export-info-item">📝 <strong>Tab 2:</strong> Detail Transaksi — semua mutasi Jan–Des</div>
              <div className="export-info-item">🐣 <strong>Tab 3:</strong> Evaluasi Produksi — total tonase telur & riwayat kematian</div>
            </>
          ) : (
            <>
              <div className="export-info-title">File yang akan diunduh (2 Sheet):</div>
              <div className="export-info-item">📝 <strong>Tab 1:</strong> Semua Transaksi — rekap seluruh mutasi sejak awal</div>
              <div className="export-info-item">🐣 <strong>Tab 2:</strong> Semua Produksi — rekap produksi & panen telur keseluruhan</div>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        className="btn btn-primary btn-large w-full"
        onClick={handleExport}
        disabled={loading}
        id="btn-export-excel"
      >
        {loading ? <span className="spinner" /> : <Download size={22} />}
        <span>{loading ? 'Membuat file...' : `Download Laporan ${exportType === 'monthly' ? 'Bulanan' : exportType === 'yearly' ? 'Tahunan' : 'Keseluruhan'} (.xlsx)`}</span>
      </button>

      {/* Tips */}
      <div className="tips-card">
        <div className="tips-title">💡 Tips Penggunaan</div>
        <ul className="tips-list">
          <li>Buka file .xlsx dengan Microsoft Excel atau Google Sheets</li>
          <li>Laporan tahunan memiliki 3 tab yang bisa diklik di bawah spreadsheet</li>
          <li>Data sudah terformat rapi dan siap untuk analisis</li>
          <li>Backup data kamu secara rutin setiap bulan</li>
        </ul>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
}
