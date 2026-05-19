import { useState, useEffect, useMemo } from 'react';
import { getStock, getLivestock, getSetting, useFirestoreQuery, userCol } from '../db';
import { query, where, orderBy } from 'firebase/firestore';
import { formatRupiah, formatNumber } from '../utils/formatCurrency';
import { todayISO } from '../utils/dateUtils';
import { Package, Trash2, Egg, Bird, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calculator, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [stocks, setStocks] = useState({ pakan: 0, karungBekas: 0, telur: 0 });
  const [livestock, setLivestock] = useState(0);
  const [settings, setSettings] = useState({ alarmKritis: 10, alarmDarurat: 5 });
  const [monthFinance, setMonthFinance] = useState({ income: 0, expense: 0 });
  const [hpp, setHpp] = useState(null);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

  const monthTransactionsQuery = useMemo(() => uid ? query(userCol(uid, 'transactions'), where('date', '>=', monthStart), where('date', '<=', monthEnd)) : null, [uid, monthStart, monthEnd]);
  const monthTransactions = useFirestoreQuery(monthTransactionsQuery);

  const todayQuery = useMemo(() => uid ? query(userCol(uid, 'dailyRecords'), where('date', '==', todayISO())) : null, [uid]);
  const todayRecords = useFirestoreQuery(todayQuery);

  const feedPurchasesQuery = useMemo(() => uid ? query(userCol(uid, 'feedPurchases'), orderBy('date', 'desc')) : null, [uid]);
  const feedPurchases = useFirestoreQuery(feedPurchasesQuery);

  useEffect(() => {
    if (!uid) return;
    async function loadData() {
      const [pakan, karungBekas, telur] = await Promise.all([getStock(uid, 'pakan'), getStock(uid, 'karungBekas'), getStock(uid, 'telur')]);
      setStocks({ pakan: pakan?.quantity || 0, karungBekas: karungBekas?.quantity || 0, telur: telur?.quantity || 0 });
      const lv = await getLivestock(uid);
      setLivestock(lv.totalPopulation);
      const kritis = await getSetting(uid, 'alarmPakanKritis');
      const darurat = await getSetting(uid, 'alarmPakanDarurat');
      setSettings({ alarmKritis: kritis || 10, alarmDarurat: darurat || 5 });
    }
    loadData();
    const iv = setInterval(loadData, 5000);
    return () => clearInterval(iv);
  }, [uid]);

  useEffect(() => {
    if (feedPurchases?.length > 0 && todayRecords?.length > 0) {
      const lastFeed = feedPurchases[0];
      const rec = todayRecords[0];
      if (rec?.eggCount > 0) {
        let eggKg = rec.eggUnit === 'kg' ? rec.eggCount : rec.eggUnit === 'krat' ? rec.eggCount * 10 : rec.eggCount / 200;
        const cost = (lastFeed.pricePerKarung || 0) * (rec.feedUsed || 0);
        if (eggKg > 0) setHpp(cost / eggKg);
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

  const pakanAlarm = stocks.pakan <= settings.alarmDarurat ? 'danger' : stocks.pakan <= settings.alarmKritis ? 'warning' : 'safe';
  const netProfit = monthFinance.income - monthFinance.expense;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="section-label">📦 Stok Gudang</div>
      <div className="stock-grid">
        <div className={`stock-card ${pakanAlarm}`} onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon"><Package size={22} /></div>
          <div className="stock-card-info">
            <div className="stock-card-label">Stok Pakan</div>
            <div className={`stock-card-value ${pakanAlarm}`}>{formatNumber(stocks.pakan)} <span className="stock-unit">karung</span></div>
            {pakanAlarm === 'warning' && <div className="stock-alarm warning"><AlertTriangle size={12} /> Segera Beli Pakan!</div>}
            {pakanAlarm === 'danger' && <div className="stock-alarm danger"><AlertTriangle size={12} /> STOK KRITIS!</div>}
          </div>
        </div>
        <div className="stock-card" onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon egg"><Egg size={22} /></div>
          <div className="stock-card-info"><div className="stock-card-label">Stok Telur</div><div className="stock-card-value">{formatNumber(stocks.telur)} <span className="stock-unit">kg</span></div></div>
        </div>
        <div className="stock-card" onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon sack"><Trash2 size={22} /></div>
          <div className="stock-card-info"><div className="stock-card-label">Karung Bekas</div><div className="stock-card-value">{formatNumber(stocks.karungBekas)} <span className="stock-unit">karung</span></div></div>
        </div>
        <div className="stock-card" onClick={() => navigate('/stok')} style={{cursor:'pointer'}}>
          <div className="stock-card-icon bird"><Bird size={22} /></div>
          <div className="stock-card-info"><div className="stock-card-label">Populasi Puyuh</div><div className="stock-card-value">{formatNumber(livestock)} <span className="stock-unit">ekor</span></div></div>
        </div>
      </div>
      {hpp !== null && (
        <div className="hpp-banner" onClick={() => navigate('/keuangan')}>
          <div className="hpp-icon"><Calculator size={20} /></div>
          <div className="hpp-info"><div className="hpp-label">HPP / Modal Pakan Hari Ini</div><div className="hpp-value">{formatRupiah(hpp)} <span className="hpp-unit">/ kg telur</span></div></div>
          <ChevronRight size={16} className="hpp-chevron" />
        </div>
      )}
      <div className="section-label">💰 Kas Bulan Ini</div>
      <div className="finance-summary-card">
        <div className="finance-row">
          <div className="finance-item income"><div className="finance-icon"><TrendingUp size={18} /></div><div><div className="finance-label">Pemasukan</div><div className="finance-amount income">{formatRupiah(monthFinance.income)}</div></div></div>
          <div className="finance-divider" />
          <div className="finance-item expense"><div className="finance-icon"><TrendingDown size={18} /></div><div><div className="finance-label">Pengeluaran</div><div className="finance-amount expense">{formatRupiah(monthFinance.expense)}</div></div></div>
        </div>
        <div className="finance-net"><DollarSign size={16} /><span>Laba Bersih: </span><span className={`finance-net-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>{formatRupiah(Math.abs(netProfit))}{netProfit < 0 ? ' (Rugi)' : ''}</span></div>
      </div>
      <div className="section-label">⚡ Aksi Cepat</div>
      <div className="quick-actions">
        <button className="quick-action-btn primary" onClick={() => navigate('/input')} id="btn-quick-input"><span>📋</span><span>Input Harian</span></button>
        <button className="quick-action-btn secondary" onClick={() => navigate('/keuangan?tab=pemasukan')} id="btn-quick-jual"><span>💰</span><span>Catat Penjualan</span></button>
        <button className="quick-action-btn secondary" onClick={() => navigate('/stok?action=jual-karung')} id="btn-quick-karung"><span>🗑️</span><span>Jual Karung Bekas</span></button>
        <button className="quick-action-btn secondary" onClick={() => navigate('/keuangan?tab=pemasukan&cat=kotoran')} id="btn-quick-kotoran"><span>💩</span><span>Jual Kotoran</span></button>
      </div>
      <div style={{ height: '20px' }} />
    </div>
  );
}
