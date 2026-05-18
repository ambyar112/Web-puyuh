import { useEffect, useState } from 'react';
import { db, getStock, getLivestock, getSetting, useFirestoreQuery } from '../db';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { formatRupiah, formatNumber } from '../utils/formatCurrency';
import { getLast7Days, formatDateShort, todayISO } from '../utils/dateUtils';
import {
  Package,
  Trash2,
  Egg,
  Bird,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calculator,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState({ pakan: 0, karungBekas: 0, telur: 0 });
  const [livestock, setLivestock] = useState(0);
  const [settings, setSettings] = useState({ alarmKritis: 10, alarmDarurat: 5 });
  const [monthFinance, setMonthFinance] = useState({ income: 0, expense: 0 });
  const [hpp, setHpp] = useState(null);

  const last7Days = getLast7Days();

  // Get current month transactions
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

  const monthTransactionsQuery = query(
    collection(db, 'transactions'),
    where('date', '>=', monthStart),
    where('date', '<=', monthEnd)
  );
  const monthTransactions = useFirestoreQuery(monthTransactionsQuery);

  const todayQuery = query(
    collection(db, 'dailyRecords'),
    where('date', '==', todayISO())
  );
  const todayRecords = useFirestoreQuery(todayQuery);

  const feedPurchasesQuery = query(
    collection(db, 'feedPurchases'),
    orderBy('date', 'desc')
  );
  const feedPurchases = useFirestoreQuery(feedPurchasesQuery);

  // Reload stocks periodically (simple approach, or could use onSnapshot for stocks too)
  useEffect(() => {
    async function loadData() {
      const [pakan, karungBekas, telur] = await Promise.all([
        getStock('pakan'),
        getStock('karungBekas'),
        getStock('telur'),
      ]);
      setStocks({
        pakan: pakan?.quantity || 0,
        karungBekas: karungBekas?.quantity || 0,
        telur: telur?.quantity || 0,
      });

      const lv = await getLivestock();
      setLivestock(lv.totalPopulation);

      const kritis = await getSetting('alarmPakanKritis');
      const darurat = await getSetting('alarmPakanDarurat');
      setSettings({ alarmKritis: kritis || 10, alarmDarurat: darurat || 5 });
    }
    // Set an interval to refresh stock visually every 5 seconds since we aren't subscribing
    loadData();
    const iv = setInterval(loadData, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    // Calculate HPP
    if (feedPurchases && feedPurchases.length > 0 && todayRecords && todayRecords.length > 0) {
      const lastFeedPurchase = feedPurchases[0];
      const todayRecord = todayRecords[0];
      
      if (todayRecord && todayRecord.eggCount > 0) {
        let eggKg = 0;
        if (todayRecord.eggUnit === 'kg') eggKg = todayRecord.eggCount;
        else if (todayRecord.eggUnit === 'krat') eggKg = todayRecord.eggCount * 10;
        else eggKg = todayRecord.eggCount / 200;

        const feedCostPerKarung = lastFeedPurchase.pricePerKarung || 0;
        const feedUsed = todayRecord.feedUsed || 0;
        const totalFeedCost = feedCostPerKarung * feedUsed;
        if (eggKg > 0) setHpp(totalFeedCost / eggKg);
      }
    }
  }, [feedPurchases, todayRecords]);

  useEffect(() => {
    if (monthTransactions) {
      const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.totalAmount || 0), 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.totalAmount || 0), 0);
      setMonthFinance({ income, expense });
    }
  }, [monthTransactions]);

  // Alarm level for pakan
  const pakanAlarm = stocks.pakan <= settings.alarmDarurat
    ? 'danger'
    : stocks.pakan <= settings.alarmKritis
    ? 'warning'
    : 'safe';

  const netProfit = monthFinance.income - monthFinance.expense;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stock Cards */}
      <div className="section-label">📦 Stok Gudang</div>
      <div className="stock-grid">
        <div className={`stock-card ${pakanAlarm}`} onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon">
            <Package size={22} />
          </div>
          <div className="stock-card-info">
            <div className="stock-card-label">Stok Pakan</div>
            <div className={`stock-card-value ${pakanAlarm}`}>
              {formatNumber(stocks.pakan)} <span className="stock-unit">karung</span>
            </div>
            {pakanAlarm === 'warning' && (
              <div className="stock-alarm warning"><AlertTriangle size={12} /> Segera Beli Pakan!</div>
            )}
            {pakanAlarm === 'danger' && (
              <div className="stock-alarm danger"><AlertTriangle size={12} /> STOK KRITIS!</div>
            )}
          </div>
        </div>

        <div className="stock-card" onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon egg">
            <Egg size={22} />
          </div>
          <div className="stock-card-info">
            <div className="stock-card-label">Stok Telur</div>
            <div className="stock-card-value">
              {formatNumber(stocks.telur)} <span className="stock-unit">kg</span>
            </div>
          </div>
        </div>

        <div className="stock-card" onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon sack">
            <Trash2 size={22} />
          </div>
          <div className="stock-card-info">
            <div className="stock-card-label">Karung Bekas</div>
            <div className="stock-card-value">
              {formatNumber(stocks.karungBekas)} <span className="stock-unit">karung</span>
            </div>
          </div>
        </div>

        <div className="stock-card" onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon bird">
            <Bird size={22} />
          </div>
          <div className="stock-card-info">
            <div className="stock-card-label">Populasi Puyuh</div>
            <div className="stock-card-value">
              {formatNumber(livestock)} <span className="stock-unit">ekor</span>
            </div>
          </div>
        </div>
      </div>

      {/* HPP Banner */}
      {hpp !== null && (
        <div className="hpp-banner" onClick={() => navigate('/keuangan')}>
          <div className="hpp-icon"><Calculator size={20} /></div>
          <div className="hpp-info">
            <div className="hpp-label">HPP / Modal Pakan Hari Ini</div>
            <div className="hpp-value">{formatRupiah(hpp)} <span className="hpp-unit">/ kg telur</span></div>
          </div>
          <ChevronRight size={16} className="hpp-chevron" />
        </div>
      )}



      {/* Finance Summary */}
      <div className="section-label">💰 Kas Bulan Ini</div>
      <div className="finance-summary-card">
        <div className="finance-row">
          <div className="finance-item income">
            <div className="finance-icon"><TrendingUp size={18} /></div>
            <div>
              <div className="finance-label">Pemasukan</div>
              <div className="finance-amount income">{formatRupiah(monthFinance.income)}</div>
            </div>
          </div>
          <div className="finance-divider" />
          <div className="finance-item expense">
            <div className="finance-icon"><TrendingDown size={18} /></div>
            <div>
              <div className="finance-label">Pengeluaran</div>
              <div className="finance-amount expense">{formatRupiah(monthFinance.expense)}</div>
            </div>
          </div>
        </div>
        <div className="finance-net">
          <DollarSign size={16} />
          <span>Laba Bersih: </span>
          <span className={`finance-net-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            {formatRupiah(Math.abs(netProfit))}
            {netProfit < 0 ? ' (Rugi)' : ''}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-label">⚡ Aksi Cepat</div>
      <div className="quick-actions">
        <button className="quick-action-btn primary" onClick={() => navigate('/input')} id="btn-quick-input">
          <ClipboardListIcon />
          <span>Input Harian</span>
        </button>
        <button className="quick-action-btn secondary" onClick={() => navigate('/keuangan?tab=pemasukan')} id="btn-quick-jual">
          <span>💰</span>
          <span>Catat Penjualan</span>
        </button>
        <button className="quick-action-btn secondary" onClick={() => navigate('/stok?action=jual-karung')} id="btn-quick-karung">
          <span>🗑️</span>
          <span>Jual Karung Bekas</span>
        </button>
        <button className="quick-action-btn secondary" onClick={() => navigate('/keuangan?tab=pemasukan&cat=kotoran')} id="btn-quick-kotoran">
          <span>💩</span>
          <span>Jual Kotoran</span>
        </button>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
}

function ClipboardListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
  );
}
