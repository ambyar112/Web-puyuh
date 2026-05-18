import { useState, useEffect } from 'react';
import { db, getStock, updateStock, getLivestock, getSetting } from '../db';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { formatRupiah, formatNumber } from '../utils/formatCurrency';
import { formatDate, todayISO } from '../utils/dateUtils';
import { showToast } from '../components/Toast';
import Modal from '../components/Modal';
import { Package, Trash2, Egg, Bird, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function StockPage() {
  const [searchParams] = useSearchParams();
  const [stocks, setStocks] = useState({ pakan: 0, karungBekas: 0, telur: 0 });
  const [livestock, setLivestock] = useState(0);
  const [settings, setSettings] = useState({ alarmKritis: 10, alarmDarurat: 5, hargaKarung: 2000 });
  const [showBuyFeed, setShowBuyFeed] = useState(false);
  const [showSellSack, setShowSellSack] = useState(false);
  const [showAddEgg, setShowAddEgg] = useState(false);
  const [showSetLivestock, setShowSetLivestock] = useState(false);

  // Form states
  const [feedBrand, setFeedBrand] = useState('');
  const [feedQty, setFeedQty] = useState('');
  const [feedPricePerKarung, setFeedPricePerKarung] = useState('');
  const [sackQty, setSackQty] = useState('');
  const [addEggQty, setAddEggQty] = useState('');
  const [newLivestock, setNewLivestock] = useState('');

  useEffect(() => {
    loadData();
    // Auto-open modal if navigated with action
    if (searchParams.get('action') === 'jual-karung') {
      setShowSellSack(true);
    }
  }, [searchParams]);

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
    setLivestock(lv.totalPopulation || 0);

    const kritis = await getSetting('alarmPakanKritis');
    const darurat = await getSetting('alarmPakanDarurat');
    const hargaKarung = await getSetting('hargaKarung');
    setSettings({ alarmKritis: kritis || 10, alarmDarurat: darurat || 5, hargaKarung: hargaKarung || 2000 });
  }

  const pakanAlarm = stocks.pakan <= settings.alarmDarurat ? 'danger' : stocks.pakan <= settings.alarmKritis ? 'warning' : 'safe';

  // Buy Feed
  const handleBuyFeed = async () => {
    if (!feedQty || !feedPricePerKarung) {
      showToast('Isi jumlah dan harga pakan', 'warning');
      return;
    }
    const qty = parseFloat(feedQty);
    const price = parseFloat(feedPricePerKarung);
    const brand = feedBrand || 'Pakan Standar';
    const total = qty * price;

    await addDoc(collection(db, 'feedPurchases'), {
      date: todayISO(),
      brand: brand,
      quantity: qty,
      pricePerKarung: price,
      totalPrice: total,
      createdAt: new Date().toISOString(),
    });
    
    await updateStock('pakan', qty);

    await addDoc(collection(db, 'transactions'), {
      date: todayISO(),
      type: 'expense',
      category: 'Pakan',
      description: `Beli pakan ${brand} (${qty} karung)`,
      totalAmount: total,
      createdAt: new Date().toISOString(),
    });

    showToast(`Stok pakan +${qty} karung ditambahkan dan pengeluaran dicatat! 📦`, 'success');
    setShowBuyFeed(false);
    setFeedBrand(''); setFeedQty(''); setFeedPricePerKarung('');
    loadData();
  };

  // Sell Sack
  const handleSellSack = async () => {
    if (!sackQty || parseFloat(sackQty) <= 0) {
      showToast('Masukkan jumlah karung yang dijual', 'warning');
      return;
    }
    const qty = parseFloat(sackQty);
    if (qty > stocks.karungBekas) {
      showToast(`Stok karung bekas hanya ${stocks.karungBekas} karung`, 'warning');
      return;
    }
    const total = qty * settings.hargaKarung;
    await updateStock('karungBekas', -qty);

    await addDoc(collection(db, 'transactions'), {
      date: todayISO(),
      type: 'income',
      category: 'Karung Bekas',
      description: `Penjualan ${qty} karung bekas`,
      buyer: 'Pengepul Karung',
      quantity: qty,
      unit: 'karung',
      pricePerUnit: settings.hargaKarung,
      totalAmount: total,
      createdAt: new Date().toISOString(),
    });
    showToast(`${qty} karung terjual! ${formatRupiah(total)} masuk kas 💰`, 'success');
    setShowSellSack(false);
    setSackQty('');
    loadData();
  };

  // Set Livestock
  const handleSetLivestock = async () => {
    if (!newLivestock) { showToast('Masukkan jumlah populasi', 'warning'); return; }
    
    await setDoc(doc(db, 'livestock', 'main'), {
      totalPopulation: parseInt(newLivestock),
      dateUpdated: new Date().toISOString()
    });

    showToast('Populasi puyuh diperbarui! 🐦', 'success');
    setShowSetLivestock(false);
    setNewLivestock('');
    loadData();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Stok & Logistik</h1>
        <p className="page-subtitle">Kelola stok gudang dan logistik</p>
      </div>

      {/* Pakan Card */}
      <div className={`stock-detail-card ${pakanAlarm}`}>
        <div className="stock-detail-header">
          <div className="stock-detail-icon-wrap">
            <Package size={24} />
          </div>
          <div className="stock-detail-info">
            <div className="stock-detail-label">Stok Pakan Utama</div>
            <div className={`stock-detail-value ${pakanAlarm}`}>
              {formatNumber(stocks.pakan)} <span>karung</span>
            </div>
            {pakanAlarm !== 'safe' && (
              <div className={`stock-alarm ${pakanAlarm}`}>
                <AlertTriangle size={13} />
                {pakanAlarm === 'danger' ? 'STOK KRITIS! Segera beli!' : 'Stok menipis, segera beli!'}
              </div>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowBuyFeed(true)} id="btn-beli-pakan">
            <Plus size={16} /> Beli
          </button>
        </div>
      </div>



      {/* Karung Bekas Card */}
      <div className="stock-detail-card">
        <div className="stock-detail-header">
          <div className="stock-detail-icon-wrap sack">
            <Trash2 size={24} />
          </div>
          <div className="stock-detail-info">
            <div className="stock-detail-label">Karung Bekas</div>
            <div className="stock-detail-value">
              {formatNumber(stocks.karungBekas)} <span>karung</span>
            </div>
            <div className="stock-detail-sub">
              Estimasi nilai: {formatRupiah(stocks.karungBekas * settings.hargaKarung)}
            </div>
          </div>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => setShowSellSack(true)}
            disabled={stocks.karungBekas === 0}
            id="btn-jual-karung"
          >
            Jual
          </button>
        </div>
      </div>

      {/* Telur Card */}
      <div className="stock-detail-card">
        <div className="stock-detail-header">
          <div className="stock-detail-icon-wrap egg">
            <Egg size={24} />
          </div>
          <div className="stock-detail-info">
            <div className="stock-detail-label">Stok Telur di Gudang</div>
            <div className="stock-detail-value">
              {formatNumber(stocks.telur)} <span>kg</span>
            </div>
            <div className="stock-detail-sub">Akumulasi dari input harian</div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowAddEgg(true)} id="btn-add-egg">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Livestock Card */}
      <div className="stock-detail-card">
        <div className="stock-detail-header">
          <div className="stock-detail-icon-wrap bird">
            <Bird size={24} />
          </div>
          <div className="stock-detail-info">
            <div className="stock-detail-label">Populasi Puyuh Hidup</div>
            <div className="stock-detail-value">
              {formatNumber(livestock)} <span>ekor</span>
            </div>
            <div className="stock-detail-sub">Diperbarui dari input harian</div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowSetLivestock(true)} id="btn-set-livestock">
            Edit
          </button>
        </div>
      </div>

      {/* Modal: Beli Pakan */}
      <Modal
        isOpen={showBuyFeed}
        onClose={() => setShowBuyFeed(false)}
        title="📦 Beli Stok Pakan"
        footer={
          <div className="modal-footer-row">
            <button className="btn btn-ghost" onClick={() => setShowBuyFeed(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleBuyFeed} id="btn-confirm-beli-pakan">Simpan</button>
          </div>
        }
      >
        <div className="modal-form">
          <label className="form-label">Merek / Jenis Pakan</label>
          <input className="form-input" placeholder="cth: Pakan B11" value={feedBrand} onChange={e => setFeedBrand(e.target.value)} id="input-feed-brand" />
          <label className="form-label">Jumlah Karung Dibeli</label>
          <input className="form-input" type="number" placeholder="0" value={feedQty} onChange={e => setFeedQty(e.target.value)} min="1" id="input-feed-qty" />
          <label className="form-label">Harga per Karung (Rp)</label>
          <input className="form-input" type="number" placeholder="0" value={feedPricePerKarung} onChange={e => setFeedPricePerKarung(e.target.value)} min="0" id="input-feed-price" />
          {feedQty && feedPricePerKarung && (
            <div className="modal-calc">
              Total: <strong>{formatRupiah(parseFloat(feedQty) * parseFloat(feedPricePerKarung))}</strong>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Jual Karung Bekas */}
      <Modal
        isOpen={showSellSack}
        onClose={() => setShowSellSack(false)}
        title="🗑️ Jual Karung Bekas"
        footer={
          <div className="modal-footer-row">
            <button className="btn btn-ghost" onClick={() => setShowSellSack(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSellSack} id="btn-confirm-jual-karung">Jual & Catat</button>
          </div>
        }
      >
        <div className="modal-form">
          <div className="modal-info-row">
            <span>Stok tersedia:</span>
            <strong>{formatNumber(stocks.karungBekas)} karung</strong>
          </div>
          <div className="modal-info-row">
            <span>Harga per karung:</span>
            <strong>{formatRupiah(settings.hargaKarung)}</strong>
          </div>
          <label className="form-label">Jumlah Dijual</label>
          <input className="form-input" type="number" placeholder="0" value={sackQty} onChange={e => setSackQty(e.target.value)} min="1" max={stocks.karungBekas} id="input-sack-qty" />
          {sackQty && (
            <div className="modal-calc success">
              💰 Uang Masuk: <strong>{formatRupiah(parseFloat(sackQty) * settings.hargaKarung)}</strong>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Tambah Stok Telur */}
      <Modal
        isOpen={showAddEgg}
        onClose={() => setShowAddEgg(false)}
        title="🥚 Sesuaikan Stok Telur"
        footer={
          <div className="modal-footer-row">
            <button className="btn btn-ghost" onClick={() => setShowAddEgg(false)}>Batal</button>
            <button className="btn btn-primary" onClick={async () => {
              if (!addEggQty) return;
              await updateStock('telur', parseFloat(addEggQty));
              showToast('Stok telur diperbarui!', 'success');
              setShowAddEgg(false); setAddEggQty(''); loadData();
            }} id="btn-confirm-add-egg">Simpan</button>
          </div>
        }
      >
        <div className="modal-form">
          <label className="form-label">Tambah / Kurangi Stok Telur (kg)</label>
          <p className="form-hint">Gunakan angka negatif untuk mengurangi. cth: -5 untuk kurangi 5 kg</p>
          <input className="form-input" type="number" placeholder="0" value={addEggQty} onChange={e => setAddEggQty(e.target.value)} id="input-add-egg" />
        </div>
      </Modal>

      {/* Modal: Set Livestock */}
      <Modal
        isOpen={showSetLivestock}
        onClose={() => setShowSetLivestock(false)}
        title="🐦 Ubah Populasi Puyuh"
        footer={
          <div className="modal-footer-row">
            <button className="btn btn-ghost" onClick={() => setShowSetLivestock(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSetLivestock} id="btn-confirm-livestock">Simpan</button>
          </div>
        }
      >
        <div className="modal-form">
          <div className="modal-info-row"><span>Populasi saat ini:</span><strong>{formatNumber(livestock)} ekor</strong></div>
          <label className="form-label">Populasi Baru (ekor)</label>
          <input className="form-input" type="number" placeholder={livestock} value={newLivestock} onChange={e => setNewLivestock(e.target.value)} min="0" id="input-new-livestock" />
        </div>
      </Modal>

      <div style={{ height: '20px' }} />
    </div>
  );
}
