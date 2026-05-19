import { useState, useEffect, useMemo } from 'react';
import { db, useFirestoreQuery } from '../db';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc, limit } from 'firebase/firestore';
import { formatRupiah, formatNumber } from '../utils/formatCurrency';
import { formatDate, todayISO } from '../utils/dateUtils';
import { showToast } from '../components/Toast';
import Modal from '../components/Modal';
import { TrendingUp, TrendingDown, Plus, Trash2, Calculator, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const INCOME_CATEGORIES = ['Penjualan Telur', 'Karung Bekas', 'Kotoran Puyuh', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Pakan', 'Energi (Listrik)', 'Kesehatan (Vitamin/Obat)', 'Pemeliharaan (Kandang)', 'Lainnya'];

export default function FinancePage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('semua');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [showHPP, setShowHPP] = useState(false);
  const [hpp, setHpp] = useState(null);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Income form
  const [incomeCategory, setIncomeCategory] = useState(INCOME_CATEGORIES[0]);
  const [incomeBuyer, setIncomeBuyer] = useState('');
  const [incomeQty, setIncomeQty] = useState('');
  const [incomeUnit, setIncomeUnit] = useState('kg');
  const [incomePricePerUnit, setIncomePricePerUnit] = useState('');
  const [incomeNotes, setIncomeNotes] = useState('');

  // Expense form
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    if (searchParams.get('tab') === 'pemasukan') {
      setActiveTab('pemasukan');
      const cat = searchParams.get('cat');
      if (cat === 'kotoran') {
        setShowAddTransaction(true);
        setTransactionType('income');
        setIncomeCategory('Kotoran Puyuh');
      }
    }
  }, [searchParams]);

  useEffect(() => { loadHPP(); }, []);

  const monthStart = `${filterMonth}-01`;
  const monthEnd = `${filterMonth}-31`;

  const transactionsQuery = useMemo(() => query(
    collection(db, 'transactions'),
    where('date', '>=', monthStart),
    where('date', '<=', monthEnd)
  ), [monthStart, monthEnd]);
  const rawTransactions = useFirestoreQuery(transactionsQuery) || [];
  const transactions = [...rawTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const dailyRecordsQuery = useMemo(() => query(
    collection(db, 'dailyRecords'),
    where('date', '>=', monthStart),
    where('date', '<=', monthEnd)
  ), [monthStart, monthEnd]);
  const monthDailyRecords = useFirestoreQuery(dailyRecordsQuery) || [];

  const filtered = transactions.filter(t => {
    if (activeTab === 'pemasukan') return t.type === 'income';
    if (activeTab === 'pengeluaran') return t.type === 'expense';
    return true;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.totalAmount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.totalAmount || 0), 0);
  const netProfit = totalIncome - totalExpense;

  let monthEggKg = 0;
  if (monthDailyRecords) {
    monthDailyRecords.forEach(r => {
      if (r.eggCount > 0) {
        if (r.eggUnit === 'kg') monthEggKg += r.eggCount;
        else if (r.eggUnit === 'krat') monthEggKg += r.eggCount * 10;
        else monthEggKg += r.eggCount / 200;
      }
    });
  }

  async function loadHPP() {
    const qFeed = query(collection(db, 'feedPurchases'), orderBy('date', 'desc'), limit(1));
    const snapFeed = await getDocs(qFeed);
    if (snapFeed.empty) return;
    const lastFeed = snapFeed.docs[0].data();

    const qDaily = query(collection(db, 'dailyRecords'), where('date', '==', todayISO()), limit(1));
    const snapDaily = await getDocs(qDaily);
    if (snapDaily.empty) return;
    const todayRecord = snapDaily.docs[0].data();

    if (!todayRecord.eggCount) return;

    let eggKg = 0;
    if (todayRecord.eggUnit === 'kg') eggKg = todayRecord.eggCount;
    else if (todayRecord.eggUnit === 'krat') eggKg = todayRecord.eggCount * 10;
    else eggKg = todayRecord.eggCount / 200;

    const feedCost = (lastFeed.pricePerKarung / 50) * (todayRecord.feedUsed || 0) * 50;
    if (eggKg > 0) setHpp({ perKg: feedCost / eggKg, feedPrice: lastFeed.pricePerKarung, feedBrand: lastFeed.brand });
  }

  const handleAddTransaction = async () => {
    if (transactionType === 'income') {
      if (!incomePricePerUnit) { showToast('Isi harga penjualan atau nominal', 'warning'); return; }
      const qty = parseFloat(incomeQty) || 1;
      const price = parseFloat(incomePricePerUnit);
      const total = qty * price;
      await addDoc(collection(db, 'transactions'), {
        date: todayISO(),
        type: 'income',
        category: incomeCategory,
        description: incomeNotes || incomeCategory,
        buyer: incomeBuyer,
        quantity: qty,
        unit: incomeUnit,
        pricePerUnit: price,
        totalAmount: total,
        createdAt: new Date().toISOString(),
      });
      showToast(`Pemasukan ${formatRupiah(total)} berhasil dicatat! 💰`, 'success');
      setIncomeBuyer(''); setIncomeQty(''); setIncomePricePerUnit(''); setIncomeNotes('');
    } else {
      if (!expenseAmount) { showToast('Isi nominal pengeluaran', 'warning'); return; }
      await addDoc(collection(db, 'transactions'), {
        date: todayISO(),
        type: 'expense',
        category: expenseCategory,
        description: expenseDesc || expenseCategory,
        totalAmount: parseFloat(expenseAmount),
        createdAt: new Date().toISOString(),
      });
      showToast(`Pengeluaran ${formatRupiah(parseFloat(expenseAmount))} dicatat`, 'success');
      setExpenseDesc(''); setExpenseAmount('');
    }
    setShowAddTransaction(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      await deleteDoc(doc(db, 'transactions', id));
      showToast('Transaksi dihapus', 'info');
    }
  };

  const categoryColors = {
    'Penjualan Telur': '#22d3ee',
    'Karung Bekas': '#a78bfa',
    'Kotoran Puyuh': '#86efac',
    'Pakan': '#fbbf24',
    'Energi (Listrik)': '#f97316',
    'Kesehatan (Vitamin/Obat)': '#34d399',
    'Pemeliharaan (Kandang)': '#60a5fa',
  };

  const getCatColor = (cat) => categoryColors[cat] || '#94a3b8';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Buku Kas</h1>
        <p className="page-subtitle">Keuangan peternakan</p>
      </div>

      {/* Month Filter */}
      <div className="month-filter">
        <input
          type="month"
          className="form-input"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          id="input-filter-month"
        />
      </div>

      {/* Finance Summary */}
      <div className="finance-cards-row">
        <div className="finance-mini-card income">
          <TrendingUp size={16} />
          <div>
            <div className="finance-mini-label">Masuk</div>
            <div className="finance-mini-value income">{formatRupiah(totalIncome)}</div>
          </div>
        </div>
        <div className="finance-mini-card expense">
          <TrendingDown size={16} />
          <div>
            <div className="finance-mini-label">Keluar</div>
            <div className="finance-mini-value expense">{formatRupiah(totalExpense)}</div>
          </div>
        </div>
        <div className={`finance-mini-card ${netProfit >= 0 ? 'profit' : 'loss'}`}>
          <span>{netProfit >= 0 ? '📈' : '📉'}</span>
          <div>
            <div className="finance-mini-label">Laba Bersih</div>
            <div className={`finance-mini-value ${netProfit >= 0 ? 'income' : 'expense'}`}>{formatRupiah(Math.abs(netProfit))}</div>
          </div>
        </div>
      </div>

      <div className="finance-cards-row" style={{ marginTop: '8px', gridTemplateColumns: '1fr' }}>
        <div className="finance-mini-card" style={{ borderLeft: '3px solid var(--amber)', padding: '12px' }}>
          <span style={{ fontSize: '20px' }}>🥚</span>
          <div>
            <div className="finance-mini-label">Total Panen Bulan Ini</div>
            <div className="finance-mini-value" style={{ color: 'var(--amber)', fontSize: '15px' }}>
              {formatNumber(monthEggKg)} kg
            </div>
          </div>
        </div>
      </div>

      {/* HPP Banner */}
      {hpp && (
        <div className="hpp-banner clickable" onClick={() => setShowHPP(true)} id="btn-show-hpp">
          <div className="hpp-icon"><Calculator size={20} /></div>
          <div className="hpp-info">
            <div className="hpp-label">HPP Hari Ini (Modal Pakan/kg)</div>
            <div className="hpp-value">{formatRupiah(Math.round(hpp.perKg))}<span className="hpp-unit"> / kg telur</span></div>
          </div>
          <ChevronRight size={16} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="finance-actions">
        <button className="btn btn-primary btn-medium flex-1" onClick={() => setShowAddTransaction(true)} id="btn-add-transaction">
          <TrendingUp size={18} /> Catat Transaksi
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['semua', 'pemasukan', 'pengeluaran'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab === 'semua' ? 'Semua' : tab === 'pemasukan' ? '↑ Masuk' : '↓ Keluar'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span>📋</span>
            <p>Belum ada transaksi bulan ini</p>
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} className={`transaction-item ${t.type}`}>
              <div className="transaction-cat-dot" style={{ backgroundColor: getCatColor(t.category) }} />
              <div className="transaction-info">
                <div className="transaction-desc">{t.description}</div>
                <div className="transaction-meta">
                  {formatDate(t.date)}
                  {t.buyer ? ` · ${t.buyer}` : ''}
                  {t.quantity ? ` · ${formatNumber(t.quantity)} ${t.unit || ''}` : ''}
                </div>
                <div className="transaction-category">{t.category}</div>
              </div>
              <div className="transaction-right">
                <div className={`transaction-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}{formatRupiah(t.totalAmount)}
                </div>
                <button className="btn-icon-sm" onClick={() => handleDelete(t.id)} title="Hapus">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Tambah Transaksi */}
      <Modal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        title="Catat Transaksi"
        footer={
          <div className="modal-footer-row">
            <button className="btn btn-ghost" onClick={() => setShowAddTransaction(false)}>Batal</button>
            <button className={`btn ${transactionType === 'income' ? 'btn-primary' : 'btn-danger'}`} onClick={handleAddTransaction} id="btn-confirm-transaction">Simpan</button>
          </div>
        }
      >
        <div className="modal-form">
          <div className="tab-bar mb-4">
            <button
              className={`tab-btn ${transactionType === 'income' ? 'active' : ''}`}
              onClick={() => setTransactionType('income')}
              id="tab-type-income"
              style={{ flex: 1, backgroundColor: transactionType === 'income' ? '#ecfdf5' : 'transparent', color: transactionType === 'income' ? '#059669' : '#64748b' }}
            >
              ↓ Pemasukan
            </button>
            <button
              className={`tab-btn ${transactionType === 'expense' ? 'active' : ''}`}
              onClick={() => setTransactionType('expense')}
              id="tab-type-expense"
              style={{ flex: 1, backgroundColor: transactionType === 'expense' ? '#fef2f2' : 'transparent', color: transactionType === 'expense' ? '#dc2626' : '#64748b' }}
            >
              ↑ Pengeluaran
            </button>
          </div>

          {transactionType === 'income' ? (
            <>
              <label className="form-label">Kategori Pemasukan</label>
              <select className="form-input" value={incomeCategory} onChange={e => setIncomeCategory(e.target.value)} id="select-income-cat">
                {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {incomeCategory === 'Penjualan Telur' && (
                <>
                  <label className="form-label">Nama Pembeli</label>
                  <input className="form-input" placeholder="cth: Tengkulak A, Agen B" value={incomeBuyer} onChange={e => setIncomeBuyer(e.target.value)} id="input-buyer" />
                  <div className="form-row">
                    <div className="form-col">
                      <label className="form-label">Jumlah</label>
                      <input className="form-input" type="number" placeholder="0" value={incomeQty} onChange={e => setIncomeQty(e.target.value)} id="input-income-qty" />
                    </div>
                    <div className="form-col">
                      <label className="form-label">Satuan</label>
                      <select className="form-input" value={incomeUnit} onChange={e => setIncomeUnit(e.target.value)} id="select-income-unit">
                        <option value="kg">kg</option>
                        <option value="krat">krat</option>
                        <option value="butir">butir</option>
                      </select>
                    </div>
                  </div>
                  <label className="form-label">Harga per {incomeUnit} (Rp)</label>
                  <input className="form-input" type="number" placeholder="0" value={incomePricePerUnit} onChange={e => setIncomePricePerUnit(e.target.value)} id="input-income-price" />
                  {incomeQty && incomePricePerUnit && (
                    <div className="modal-calc success">
                      Total: <strong>{formatRupiah(parseFloat(incomeQty) * parseFloat(incomePricePerUnit))}</strong>
                    </div>
                  )}
                </>
              )}
              {incomeCategory !== 'Penjualan Telur' && (
                <>
                  <label className="form-label">Nominal (Rp)</label>
                  <input className="form-input" type="number" placeholder="0" value={incomePricePerUnit} onChange={e => setIncomePricePerUnit(e.target.value)} id="input-income-nominal" />
                </>
              )}
              <label className="form-label">Keterangan (opsional)</label>
              <input className="form-input" placeholder="Catatan tambahan" value={incomeNotes} onChange={e => setIncomeNotes(e.target.value)} id="input-income-notes" />
            </>
          ) : (
            <>
              <label className="form-label">Kategori Pengeluaran</label>
              <select className="form-input" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} id="select-expense-cat">
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="form-label">Keterangan</label>
              <input className="form-input" placeholder="cth: Beli vitamin, bayar listrik..." value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} id="input-expense-desc" />
              <label className="form-label">Nominal (Rp)</label>
              <input className="form-input" type="number" placeholder="0" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} id="input-expense-amount" />
            </>
          )}
        </div>
      </Modal>

      {/* Modal: HPP Detail */}
      <Modal
        isOpen={showHPP}
        onClose={() => setShowHPP(false)}
        title="🧮 Kalkulator HPP"
        footer={<button className="btn btn-primary w-full" onClick={() => setShowHPP(false)}>Tutup</button>}
      >
        {hpp && (
          <div className="hpp-detail">
            <div className="hpp-detail-row">
              <span>Pakan terakhir dibeli:</span>
              <strong>{hpp.feedBrand}</strong>
            </div>
            <div className="hpp-detail-row">
              <span>Harga per karung:</span>
              <strong>{formatRupiah(hpp.feedPrice)}</strong>
            </div>
            <div className="hpp-divider" />
            <div className="hpp-result">
              <div className="hpp-result-label">Modal Pakan / kg Telur:</div>
              <div className="hpp-result-value">{formatRupiah(Math.round(hpp.perKg))}</div>
            </div>
            <div className="hpp-advice">
              💡 Jika tengkulak menawar di bawah angka ini, tolak atau negosiasikan harga lebih tinggi!
            </div>
          </div>
        )}
      </Modal>

      <div style={{ height: '20px' }} />
    </div>
  );
}
