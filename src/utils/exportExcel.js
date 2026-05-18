import * as XLSX from 'xlsx';
import { getMonthName } from './dateUtils';
import { formatRupiah } from './formatCurrency';

// Export Laporan Bulanan
export async function exportMonthly(transactions, dailyRecords, year, month) {
  const wb = XLSX.utils.book_new();
  const monthName = getMonthName(month);

  // Sheet 1: Kas Bulanan
  const kasData = transactions.map(t => ({
    'Tanggal': t.date,
    'Jenis': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Kategori': t.category,
    'Keterangan': t.description,
    'Pembeli/Vendor': t.buyer || '-',
    'Jumlah': t.quantity || '',
    'Satuan': t.unit || '',
    'Harga Satuan': t.pricePerUnit || '',
    'Total (Rp)': t.totalAmount,
  }));
  const ws1 = XLSX.utils.json_to_sheet(kasData.length > 0 ? kasData : [{ 'Info': 'Tidak ada data transaksi bulan ini' }]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Kas Bulanan');

  // Sheet 2: Produksi Harian
  const prodData = dailyRecords.map(r => ({
    'Tanggal': r.date,
    'Hasil Panen': r.eggCount,
    'Satuan': r.eggUnit,
    'Pakan Keluar (karung)': r.feedUsed,
    'Puyuh Mati': r.deaths || 0,
    'Puyuh Afkir': r.afkir || 0,
    'Catatan': r.notes || '',
  }));
  const ws2 = XLSX.utils.json_to_sheet(prodData.length > 0 ? prodData : [{ 'Info': 'Tidak ada data produksi bulan ini' }]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Produksi Harian');

  XLSX.writeFile(wb, `Laporan_${monthName}_${year}.xlsx`);
}

// Export Laporan Tahunan (3 Tabs)
export async function exportYearly(transactions, dailyRecords, year) {
  const wb = XLSX.utils.book_new();

  // Hitung per bulan
  const monthlyData = {};
  for (let m = 1; m <= 12; m++) {
    monthlyData[m] = { income: 0, expense: 0, netProfit: 0, monthName: getMonthName(m) };
  }

  transactions.forEach(t => {
    const month = parseInt(t.date.split('-')[1]);
    if (t.type === 'income') {
      monthlyData[month].income += t.totalAmount || 0;
    } else {
      monthlyData[month].expense += t.totalAmount || 0;
    }
  });

  for (let m = 1; m <= 12; m++) {
    monthlyData[m].netProfit = monthlyData[m].income - monthlyData[m].expense;
  }

  // Tab 1: Dashboard Tahunan
  const dashboardData = Object.values(monthlyData).map(m => ({
    'Bulan': m.monthName,
    'Total Pemasukan (Rp)': m.income,
    'Total Pengeluaran (Rp)': m.expense,
    'Keuntungan Bersih (Rp)': m.netProfit,
  }));

  const totalIncome = Object.values(monthlyData).reduce((s, m) => s + m.income, 0);
  const totalExpense = Object.values(monthlyData).reduce((s, m) => s + m.expense, 0);
  dashboardData.push({
    'Bulan': 'TOTAL',
    'Total Pemasukan (Rp)': totalIncome,
    'Total Pengeluaran (Rp)': totalExpense,
    'Keuntungan Bersih (Rp)': totalIncome - totalExpense,
  });

  const ws1 = XLSX.utils.json_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Dashboard Tahunan');

  // Tab 2: Detail Transaksi
  const detailData = transactions.map(t => ({
    'Tanggal': t.date,
    'Jenis': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Kategori': t.category,
    'Keterangan': t.description,
    'Pembeli/Vendor': t.buyer || '-',
    'Jumlah': t.quantity || '',
    'Satuan': t.unit || '',
    'Harga Satuan': t.pricePerUnit || '',
    'Total (Rp)': t.totalAmount,
  }));
  const ws2 = XLSX.utils.json_to_sheet(detailData.length > 0 ? detailData : [{ 'Info': 'Tidak ada data' }]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail Transaksi');

  // Tab 3: Evaluasi Produksi
  // Hitung total telur (dalam kg) dan kematian
  const prodEval = dailyRecords.map(r => {
    let kgEquiv = 0;
    if (r.eggUnit === 'kg') kgEquiv = r.eggCount;
    else if (r.eggUnit === 'krat') kgEquiv = r.eggCount * 10;
    else kgEquiv = r.eggCount / 200; // asumsi 200 butir = 1 kg
    return {
      'Tanggal': r.date,
      'Panen (satuan asli)': r.eggCount,
      'Satuan': r.eggUnit,
      'Estimasi (kg)': Math.round(kgEquiv * 10) / 10,
      'Pakan Keluar (karung)': r.feedUsed,
      'Mati': r.deaths || 0,
      'Afkir': r.afkir || 0,
    };
  });

  const totalEgg = prodEval.reduce((s, r) => s + r['Estimasi (kg)'], 0);
  const totalDead = prodEval.reduce((s, r) => s + r['Mati'], 0);
  const totalAfkir = prodEval.reduce((s, r) => s + r['Afkir'], 0);
  prodEval.push({
    'Tanggal': 'TOTAL',
    'Panen (satuan asli)': '',
    'Satuan': '',
    'Estimasi (kg)': Math.round(totalEgg * 10) / 10,
    'Pakan Keluar (karung)': '',
    'Mati': totalDead,
    'Afkir': totalAfkir,
  });

  const ws3 = XLSX.utils.json_to_sheet(prodEval.length > 1 ? prodEval : [{ 'Info': 'Tidak ada data produksi' }]);
  XLSX.utils.book_append_sheet(wb, ws3, 'Evaluasi Produksi');

  XLSX.writeFile(wb, `Laporan_Tahunan_${year}.xlsx`);
}

// Export All Time (Semua Data)
export async function exportAllTime(transactions, dailyRecords) {
  const wb = XLSX.utils.book_new();

  // Tab 1: Detail Transaksi Semua Waktu
  const detailData = transactions.map(t => ({
    'Tanggal': t.date,
    'Jenis': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Kategori': t.category,
    'Keterangan': t.description,
    'Pembeli/Vendor': t.buyer || '-',
    'Jumlah': t.quantity || '',
    'Satuan': t.unit || '',
    'Harga Satuan': t.pricePerUnit || '',
    'Total (Rp)': t.totalAmount,
  }));
  const ws1 = XLSX.utils.json_to_sheet(detailData.length > 0 ? detailData : [{ 'Info': 'Tidak ada data' }]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Semua Transaksi');

  // Tab 2: Evaluasi Produksi Semua Waktu
  const prodEval = dailyRecords.map(r => {
    let kgEquiv = 0;
    if (r.eggUnit === 'kg') kgEquiv = r.eggCount;
    else if (r.eggUnit === 'krat') kgEquiv = r.eggCount * 10;
    else kgEquiv = r.eggCount / 200;
    return {
      'Tanggal': r.date,
      'Panen (satuan asli)': r.eggCount,
      'Satuan': r.eggUnit,
      'Estimasi (kg)': Math.round(kgEquiv * 10) / 10,
      'Pakan Keluar (karung)': r.feedUsed,
      'Mati': r.deaths || 0,
      'Afkir': r.afkir || 0,
    };
  });

  const totalEgg = prodEval.reduce((s, r) => s + r['Estimasi (kg)'], 0);
  const totalDead = prodEval.reduce((s, r) => s + r['Mati'], 0);
  const totalAfkir = prodEval.reduce((s, r) => s + r['Afkir'], 0);
  prodEval.push({
    'Tanggal': 'TOTAL KESELURUHAN',
    'Panen (satuan asli)': '',
    'Satuan': '',
    'Estimasi (kg)': Math.round(totalEgg * 10) / 10,
    'Pakan Keluar (karung)': '',
    'Mati': totalDead,
    'Afkir': totalAfkir,
  });

  const ws2 = XLSX.utils.json_to_sheet(prodEval.length > 1 ? prodEval : [{ 'Info': 'Tidak ada data produksi' }]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Semua Produksi');

  XLSX.writeFile(wb, `Laporan_Semua_Waktu.xlsx`);
}
