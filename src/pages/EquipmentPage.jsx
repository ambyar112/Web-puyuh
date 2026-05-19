import { useState, useMemo } from 'react';
import { useFirestoreQuery, userCol, userDoc } from '../db';
import { orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { showToast } from '../components/Toast';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Kandang', 'Pakan & Minum', 'Kesehatan', 'Kebersihan', 'Listrik', 'Lainnya'];

export default function EquipmentPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [totalOwned, setTotalOwned] = useState('');
  const [inUse, setInUse] = useState('');
  const [minSpare, setMinSpare] = useState('');
  const [notes, setNotes] = useState('');

  const equipmentQuery = useMemo(() => uid ? query(userCol(uid, 'equipment'), orderBy('category')) : null, [uid]);
  const equipment = useFirestoreQuery(equipmentQuery) || [];

  const resetForm = () => {
    setName(''); setCategory(CATEGORIES[0]); setTotalOwned(''); setInUse(''); setMinSpare(''); setNotes('');
    setEditItem(null);
  };

  const handleSave = async () => {
    if (!name || !totalOwned) { showToast('Isi nama dan jumlah alat', 'warning'); return; }
    const data = {
      name,
      category,
      totalOwned: parseInt(totalOwned),
      inUse: parseInt(inUse) || 0,
      spare: parseInt(totalOwned) - (parseInt(inUse) || 0),
      minSpare: parseInt(minSpare) || 1,
      notes,
      updatedAt: new Date().toISOString(),
    };
    if (editItem) {
      await updateDoc(doc(userCol(uid, 'equipment'), editItem.id), data);
      showToast('Data alat diperbarui! ✅', 'success');
    } else {
      await addDoc(userCol(uid, 'equipment'), { ...data, createdAt: new Date().toISOString() });
      showToast('Alat baru ditambahkan! ✅', 'success');
    }
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setName(item.name);
    setCategory(item.category);
    setTotalOwned(String(item.totalOwned));
    setInUse(String(item.inUse));
    setMinSpare(String(item.minSpare));
    setNotes(item.notes || '');
    setShowAdd(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus data alat ini?')) {
      await deleteDoc(doc(userCol(uid, 'equipment'), id));
      showToast('Data alat dihapus', 'info');
    }
  };

  const grouped = equipment?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  const criticalCount = equipment?.filter(e => e.spare <= e.minSpare).length || 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Inventaris Alat</h1>
        <p className="page-subtitle">Kelola perlengkapan kandang</p>
      </div>

      {criticalCount > 0 && (
        <div className="alert-banner danger">
          <AlertTriangle size={18} />
          <span>{criticalCount} alat perlu dibeli kembali (cadangan kritis)</span>
        </div>
      )}

      <button className="btn btn-primary w-full" onClick={() => { resetForm(); setShowAdd(true); }} id="btn-add-equipment">
        <Plus size={18} /> Tambah Alat / Perlengkapan
      </button>

      {equipment?.length === 0 && (
        <div className="empty-state">
          <Package size={40} />
          <p>Belum ada data inventaris alat</p>
          <p className="empty-sub">Tap tombol di atas untuk menambahkan</p>
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="equipment-group">
          <div className="equipment-group-label">{cat}</div>
          {items.map(item => {
            const isLow = item.spare <= item.minSpare;
            return (
              <div key={item.id} className={`equipment-item ${isLow ? 'critical' : ''}`}>
                <div className="equipment-status-dot">
                  {isLow
                    ? <AlertTriangle size={16} className="text-red" />
                    : <CheckCircle size={16} className="text-green" />
                  }
                </div>
                <div className="equipment-info">
                  <div className="equipment-name">{item.name}</div>
                  <div className="equipment-stats">
                    <span>Total: <strong>{item.totalOwned}</strong></span>
                    <span>Terpakai: <strong>{item.inUse}</strong></span>
                    <span className={`spare-count ${isLow ? 'critical' : ''}`}>
                      Cadangan: <strong>{item.spare}</strong>
                      {isLow && <AlertTriangle size={12} />}
                    </span>
                  </div>
                  {item.notes && <div className="equipment-notes">{item.notes}</div>}
                </div>
                <div className="equipment-actions">
                  <button className="btn-icon-sm" onClick={() => handleEdit(item)} id={`btn-edit-equipment-${item.id}`}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon-sm danger" onClick={() => handleDelete(item.id)} id={`btn-del-equipment-${item.id}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); resetForm(); }}
        title={editItem ? '✏️ Edit Alat' : '➕ Tambah Alat'}
        footer={
          <div className="modal-footer-row">
            <button className="btn btn-ghost" onClick={() => { setShowAdd(false); resetForm(); }}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} id="btn-confirm-equipment">Simpan</button>
          </div>
        }
      >
        <div className="modal-form">
          <label className="form-label">Nama Alat / Perlengkapan</label>
          <input className="form-input" placeholder="cth: Tempat Pakan Gantung, Selang Air" value={name} onChange={e => setName(e.target.value)} id="input-equip-name" />
          <label className="form-label">Kategori</label>
          <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} id="select-equip-cat">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Total Dimiliki</label>
              <input className="form-input" type="number" placeholder="0" value={totalOwned} onChange={e => setTotalOwned(e.target.value)} min="0" id="input-equip-total" />
            </div>
            <div className="form-col">
              <label className="form-label">Sedang Terpakai</label>
              <input className="form-input" type="number" placeholder="0" value={inUse} onChange={e => setInUse(e.target.value)} min="0" id="input-equip-inuse" />
            </div>
          </div>
          <label className="form-label">Minimum Cadangan (alarm merah jika ≤)</label>
          <input className="form-input" type="number" placeholder="1" value={minSpare} onChange={e => setMinSpare(e.target.value)} min="0" id="input-equip-minspare" />
          <label className="form-label">Catatan (opsional)</label>
          <input className="form-input" placeholder="cth: Beli di toko X" value={notes} onChange={e => setNotes(e.target.value)} id="input-equip-notes" />
          {totalOwned && inUse && (
            <div className="modal-calc">
              Cadangan: <strong>{parseInt(totalOwned) - (parseInt(inUse) || 0)}</strong> unit
            </div>
          )}
        </div>
      </Modal>

      <div style={{ height: '20px' }} />
    </div>
  );
}
