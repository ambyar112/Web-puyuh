import { useState, useMemo } from 'react';
import { updateStock, updateLivestock, useFirestoreQuery, userCol, userDoc } from '../db';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { showToast } from '../components/Toast';
import { formatDate } from '../utils/dateUtils';
import { Trash2 } from 'lucide-react';
import { formatRupiah } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [filter, setFilter] = useState('all');

  const dailyRecordsQuery = useMemo(() => uid ? query(userCol(uid, 'dailyRecords'), orderBy('date', 'desc')) : null, [uid]);
  const dailyRecords = useFirestoreQuery(dailyRecordsQuery) || [];

  const feedPurchasesQuery = useMemo(() => uid ? query(userCol(uid, 'feedPurchases'), orderBy('date', 'desc')) : null, [uid]);
  const feedPurchases = useFirestoreQuery(feedPurchasesQuery) || [];

  const transactionsQuery = useMemo(() => uid ? query(userCol(uid, 'transactions'), orderBy('date', 'desc')) : null, [uid]);
  const transactions = useFirestoreQuery(transactionsQuery) || [];

  const handleDelete = async (id, type, data) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;

    try {
      if (type === 'daily') {
        if (data.feedUsed > 0) {
          await updateStock(uid, 'pakan', data.feedUsed);
          await updateStock(uid, 'karungBekas', -data.feedUsed);
        }
        if (data.eggCount > 0) {
          let kgEquiv = 0;
          if (data.eggUnit === 'kg') kgEquiv = data.eggCount;
          else if (data.eggUnit === 'krat') kgEquiv = data.eggCount * 10;
          else kgEquiv = data.eggCount / 200;
          await updateStock(uid, 'telur', -kgEquiv);
        }
        const totalLoss = (data.deaths || 0) + (data.afkir || 0);
        if (totalLoss > 0) { await updateLivestock(uid, totalLoss); }
        await deleteDoc(doc(userCol(uid, 'dailyRecords'), id));
      } else if (type === 'feed') {
        await updateStock(uid, 'pakan', -data.quantity);
        await deleteDoc(doc(userCol(uid, 'feedPurchases'), id));
        const expense = transactions.find(t => t.date === data.date && t.category === 'Pakan' && t.totalAmount === data.totalCost);
        if (expense) await deleteDoc(doc(userCol(uid, 'transactions'), expense.id));
      } else if (type === 'transaction') {
        if (data.category === 'Jual Telur' || data.category === 'Jual Karung' || data.category === 'Beli Pakan') {
          showToast('Transaksi ini tidak bisa dihapus dari sini. Hapus dari riwayat input aslinya.', 'error');
          return;
        }
        await deleteDoc(doc(userCol(uid, 'transactions'), id));
      }
      showToast('Data berhasil dihapus', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data', 'error');
    }
  };

  const allHistory = [];
  dailyRecords.forEach(r => {
    allHistory.push({
      ...r,
      id: r.id,
      type: 'daily',
      timestamp: new Date(r.date).getTime(),
      title: 'Input Harian',
      desc: `Panen: ${r.eggCount} ${r.eggUnit} | Pakan Keluar: ${r.feedUsed} karung`,
      color: '#fbbf24',
    });
  });
  feedPurchases.forEach(fp => {
    allHistory.push({
      ...fp,
      id: fp.id,
      type: 'feed',
      timestamp: new Date(fp.date).getTime(),
      title: 'Beli Pakan',
      desc: `${fp.brand} - ${fp.quantity} karung (${formatRupiah(fp.totalPrice)})`,
      color: '#34d399',
    });
  });
  transactions.forEach(t => {
    allHistory.push({
      ...t,
      id: t.id,
      type: 'transaction',
      timestamp: new Date(t.date).getTime(),
      title: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      desc: `${t.category}: ${t.description} (${formatRupiah(t.totalAmount)})`,
      color: t.type === 'income' ? '#22d3ee' : '#f87171',
    });
  });

  allHistory.sort((a, b) => b.timestamp - a.timestamp);

  const filteredHistory = filter === 'all' ? allHistory : allHistory.filter(h => h.type === filter);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Riwayat Aktivitas</h1>
        <div className="filter-tabs">
          {['all', 'daily', 'feed', 'transaction'].map(f => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="transactions-list" style={{ marginTop: '16px' }}>
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <span>🕰️</span>
            <p>Belum ada riwayat aktivitas</p>
          </div>
        ) : (
          filteredHistory.map((act, idx) => (
            <div key={`${act.type}-${act.id}-${idx}`} className="transaction-item" style={{ borderLeft: `3px solid ${act.color}` }}>
              <div className="transaction-cat-dot" style={{ backgroundColor: act.color }} />
              <div className="transaction-info">
                <div className="transaction-desc">{act.title}</div>
                <div className="transaction-meta">{formatDate(act.date)}</div>
                <div className="transaction-category">{act.desc}</div>
              </div>
              <div className="transaction-right">
                <button className="btn-icon-sm" onClick={() => handleDelete(act.id, act.type, act)} title="Hapus" style={{ color: '#f87171', borderColor: 'transparent' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
}
