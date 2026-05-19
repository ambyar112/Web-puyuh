# 🐣 Puyuh Dashboard

> Dashboard internal dan mandiri untuk manajemen produksi, stok gudang, dan keuangan peternakan burung puyuh.

---

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Dexie.js](https://img.shields.io/badge/Database-Dexie.js--IndexedDB-007ACC?style=flat-square&logo=databricks&logoColor=white)](https://dexie.org/)

Dashboard ini dirancang khusus untuk mempermudah peternak dalam mengelola kegiatan operasional harian peternakan puyuh, memantau tingkat stok pakan dan telur, serta melacak arus kas secara terperinci. Dengan pendekatan **local-first (Dexie.js)** dan sinkronisasi **Firebase**, aplikasi ini dapat diakses dengan cepat, aman, dan responsif baik melalui *mobile* maupun *desktop*.

---

## ✨ Fitur Utama

- **📦 Monitor Stok Gudang**: Pemantauan stok pakan (dalam karung), stok telur (dalam kg), karung pakan bekas, dan total populasi puyuh secara *real-time*.
- **💰 Kalkulator HPP Otomatis**: Menghitung secara otomatis Harga Pokok Penjualan (HPP) / modal pakan harian berdasarkan konsumsi pakan terbaru.
- **📊 Laporan Keuangan**: Pencatatan kas harian (pemasukan & pengeluaran) lengkap dengan grafik akumulasi laba/rugi bersih bulanan.
- **⚡ Aksi Cepat (Quick Actions)**:
  - Input harian produksi telur & pakan.
  - Catat penjualan telur secara langsung.
  - Catat penjualan karung bekas atau kotoran puyuh.
- **🔔 Alarm Peringatan Pakan**: Notifikasi otomatis saat stok pakan di gudang berada di level kritis atau darurat.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React (Hooks, Context API, Router)
- **Bundler & Dev Server**: Vite
- **Penyimpanan Lokal (Offline-first)**: Dexie.js (IndexedDB wrapper)
- **Database Cloud & Sinkronisasi**: Firebase Firestore & Auth
- **Visualisasi**: Chart.js / React Chartjs 2
- **Desain UI**: Custom CSS dengan pendekatan *Mobile-First* & Dark Mode modern
- **Ikon**: Lucide React

---

## 🚀 Memulai Pengoperasian

### 📋 Prasyarat
Pastikan Anda sudah menginstal **Node.js** di perangkat Anda.

### ⚙️ Jalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone <repository-url>
   cd puyuh-dashboard
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```

4. **Buka di browser:**
   Akses `http://localhost:5173` untuk melihat dashboard Anda.

---

## 👥 Developer & Socials

<table>
  <tr>
    <td align="center" valign="middle" style="padding: 12px;">
      <a href="https://x.com/shafiqqmu" target="_blank">
        <img src="https://img.shields.io/badge/Twitter-@shafiqqmu-1DA1F2?style=for-the-badge&logo=x&logoColor=white" alt="Twitter/X Badge" />
      </a>
    </td>
    <td valign="middle" style="padding: 12px; line-height: 1.6;">
      <strong>Shafiqqmu</strong><br>
      Halo! Saya pengembang aplikasi ini. Jika Anda menyukai proyek ini, memiliki pertanyaan, ingin berkolaborasi, atau sekadar memberikan masukan, silakan hubungi atau ikuti saya di Twitter/X! 🚀
    </td>
  </tr>
</table>

---
