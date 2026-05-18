import { useState } from 'react';
import { db, updateStock, updateLivestock, getStock } from '../db';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { showToast } from '../components/Toast';
import { todayISO } from '../utils/dateUtils';
import { Save, Egg, Package, Bird, FileText, ChevronDown } from 'lucide-react';

const EGG_UNITS = [
  { value: 'butir', label: '🥚 Butir', desc: 'Cocok untuk telur kecil / awal produksi' },
  { value: 'kg', label: '⚖️ Kilogram (kg)', desc: 'Satuan standar penjualan' },
  { value: 'krat', label: '📦 Krat', desc: '1 Krat = ~10 kg' },
];

export default function DailyInputPage() {
  const [date, setDate] = useState(todayISO());
  const [eggCount, setEggCount] = useState('');
  const [eggUnit, setEggUnit] = useState('kg');
  const [feedUsed, setFeedUsed] = useState('');
  const [deaths, setDeaths] = useState('');
  const [afkir, setAfkir] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setSaving] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const selectedUnit = EGG_UNITS.find(u => u.value === eggUnit);

  const handleSave = async () => {
    if (!date) {
      showToast('Tanggal harus diisi!', 'error');
      return;
    }
    setSaving(true);
    try {
      // Check for duplicate entry
      const q = query(collection(db, 'dailyRecords'), where('date', '==', date));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        showToast('Data untuk tanggal ini sudah ada. Hapus dulu di Riwayat jika ingin mengubah.', 'error');
        setSaving(false);
        return;
      }

      const eCount = parseFloat(eggCount) || 0;
      const fUsed = parseInt(feedUsed) || 0;
      const dCount = parseInt(deaths) || 0;
      const aCount = parseInt(afkir) || 0;

      // Update stocks
      if (fUsed > 0) {
        const pakanStock = await getStock('pakan');
        if (pakanStock.quantity < fUsed) {
          showToast(`Stok pakan tidak cukup! Sisa: ${pakanStock.quantity}`, 'error');
          setSaving(false);
          return;
        }
        await updateStock('pakan', -fUsed);
        await updateStock('karungBekas', fUsed);
      }

      if (eCount > 0) {
        // Convert everything to kg for stock
        let kgEquiv = 0;
        if (eggUnit === 'kg') kgEquiv = eCount;
        else if (eggUnit === 'krat') kgEquiv = eCount * 10;
        else kgEquiv = eCount / 200;
        
        await updateStock('telur', kgEquiv);
      }

      if (dCount > 0 || aCount > 0) {
        await updateLivestock(-(dCount + aCount));
      }

      // Save record
      await addDoc(collection(db, 'dailyRecords'), {
        date,
        eggCount: eCount,
        eggUnit,
        feedUsed: fUsed,
        deaths: dCount,
        afkir: aCount,
        notes,
        createdAt: new Date().toISOString()
      });

      showToast('Data harian berhasil disimpan! ✅', 'success');
      
      // Reset form
      setEggCount('');
      setFeedUsed('');
      setDeaths('');
      setAfkir('');
      setNotes('');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data. Coba lagi.', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Input Harian</h1>
        <p className="page-subtitle">Catat aktivitas kandang hari ini</p>
      </div>

      {/* Date Picker */}
      <div className="form-card">
        <label className="form-label">
          <span className="form-label-icon">📅</span> Tanggal
        </label>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={e => setDate(e.target.value)}
          id="input-date"
        />
      </div>

      {/* Egg Harvest */}
      <div className="form-card">
        <div className="form-card-header">
          <Egg size={20} className="form-card-icon egg-color" />
          <h3 className="form-card-title">Hasil Panen Telur</h3>
        </div>

        {/* Unit Picker */}
        <label className="form-label">Satuan Panen</label>
        <div className="unit-picker-btn" onClick={() => setShowUnitPicker(!showUnitPicker)} id="btn-unit-picker">
          <span>{selectedUnit?.label}</span>
          <ChevronDown size={16} className={showUnitPicker ? 'rotate-180' : ''} />
        </div>
        {showUnitPicker && (
          <div className="unit-picker-dropdown">
            {EGG_UNITS.map(u => (
              <div
                key={u.value}
                className={`unit-option ${eggUnit === u.value ? 'selected' : ''}`}
                onClick={() => { setEggUnit(u.value); setShowUnitPicker(false); }}
                id={`unit-option-${u.value}`}
              >
                <div className="unit-option-label">{u.label}</div>
                <div className="unit-option-desc">{u.desc}</div>
              </div>
            ))}
          </div>
        )}

        <label className="form-label mt-3">Jumlah ({selectedUnit?.value})</label>
        <div className="input-big-wrapper">
          <input
            type="number"
            className="input-big"
            placeholder="0"
            value={eggCount}
            onChange={e => setEggCount(e.target.value)}
            min="0"
            step="0.1"
            id="input-egg-count"
          />
          <span className="input-big-unit">{selectedUnit?.value}</span>
        </div>
      </div>

      {/* Feed Used */}
      <div className="form-card">
        <div className="form-card-header">
          <Package size={20} className="form-card-icon feed-color" />
          <h3 className="form-card-title">Pakan Keluar</h3>
        </div>
        <p className="form-hint">Otomatis: Stok pakan berkurang, karung bekas bertambah</p>
        <label className="form-label">Jumlah Karung Dibuka</label>
        <div className="input-big-wrapper">
          <input
            type="number"
            className="input-big"
            placeholder="0"
            value={feedUsed}
            onChange={e => setFeedUsed(e.target.value)}
            min="0"
            step="1"
            id="input-feed-used"
          />
          <span className="input-big-unit">karung</span>
        </div>
      </div>

      {/* Population Loss */}
      <div className="form-card">
        <div className="form-card-header">
          <Bird size={20} className="form-card-icon" />
          <h3 className="form-card-title">Penyusutan Populasi</h3>
        </div>
        <p className="form-hint">Otomatis mengurangi jumlah puyuh hidup</p>
        <div className="form-row">
          <div className="form-col">
            <label className="form-label">Puyuh Mati</label>
            <div className="input-big-wrapper">
              <input
                type="number"
                className="input-big"
                placeholder="0"
                value={deaths}
                onChange={e => setDeaths(e.target.value)}
                min="0"
                id="input-deaths"
              />
              <span className="input-big-unit">ekor</span>
            </div>
          </div>
          <div className="form-col">
            <label className="form-label">Puyuh Afkir</label>
            <div className="input-big-wrapper">
              <input
                type="number"
                className="input-big"
                placeholder="0"
                value={afkir}
                onChange={e => setAfkir(e.target.value)}
                min="0"
                id="input-afkir"
              />
              <span className="input-big-unit">ekor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-card">
        <div className="form-card-header">
          <FileText size={20} className="form-card-icon" />
          <h3 className="form-card-title">Catatan Harian</h3>
        </div>
        <textarea
          className="form-textarea"
          placeholder="Catatan kondisi kandang, cuaca, dll... (opsional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          id="input-notes"
        />
      </div>

      {/* Save Button */}
      <button
        className="btn btn-primary btn-large w-full save-btn"
        onClick={handleSave}
        disabled={loading}
        id="btn-save-daily"
      >
        {loading ? <span className="spinner" /> : <Save size={20} />}
        <span>{loading ? 'Menyimpan...' : 'Simpan Data Harian'}</span>
      </button>

      <div style={{ height: '20px' }} />
    </div>
  );
}
