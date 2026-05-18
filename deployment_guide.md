# Panduan Deployment Puyuh Dashboard ke Vercel

Aplikasi **Puyuh Dashboard** (React + Vite + Firebase) Anda sudah siap dan terkonfigurasi dengan sangat baik untuk di-deploy ke Vercel! File `vercel.json` sudah dibuat untuk menangani routing SPA (Single Page Application) agar halaman tidak error 404 saat di-refresh.

Berikut adalah langkah-langkah lengkap untuk melakukan deploy:

---

## ⚠️ LANGKAH UTAMA: Daftarkan Domain di Firebase (SANGAT PENTING!)

Karena aplikasi ini menggunakan **Firebase Authentication (Google Sign-In)**, Google secara default akan menolak permintaan masuk (login) dari domain baru selain `localhost` kecuali domain tersebut terdaftar di Firebase Console. 

Setelah Anda mendeploy aplikasi dan mendapatkan URL dari Vercel (misal: `https://puyuh-dashboard.vercel.app`), Anda **wajib** melakukan langkah berikut:

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih project Firebase Anda: `gen-lang-client-0740538788` (atau project custom yang Anda gunakan).
3. Di menu bilah samping kiri, pilih **Build** > **Authentication**.
4. Masuk ke tab **Settings** di panel atas.
5. Pada menu sebelah kiri settings, klik **Authorized Domains** (Domain Terotorisasi).
6. Klik tombol **Add Domain** (Tambahkan Domain).
7. Masukkan domain Vercel Anda (contoh: `puyuh-dashboard.vercel.app`, tanpa `https://` atau path belakang).
8. Klik **Add**. Sekarang login Google akan berfungsi dengan sempurna pada aplikasi live Anda!

---

## PILIHAN METODE DEPLOYMENT

Pilih salah satu dari dua metode mudah berikut untuk mendeploy aplikasi Anda ke Vercel:

### Metode A: Menggunakan GitHub (Sangat Direkomendasikan 🌟)

Metode ini adalah yang terbaik karena setiap kali Anda memperbarui kode dan melakukan `git push` ke GitHub, Vercel secara otomatis akan memperbarui website Anda secara real-time.

#### Langkah 1: Buat Repositori GitHub
1. Masuk ke akun [GitHub](https://github.com/) Anda.
2. Buat repositori baru (beri nama, misalnya `puyuh-dashboard`). Repositori bisa berupa **Private** maupun **Public**.

#### Langkah 2: Upload Kode ke GitHub
Buka terminal Anda di folder proyek `puyuh-dashboard` dan jalankan perintah berikut:
```bash
# Inisialisasi Git (jika belum pernah)
git init

# Tambahkan semua file proyek ke Git
git add .

# Buat commit pertama Anda
git commit -m "Initial commit: Puyuh Dashboard siap deploy"

# Arahkan ke branch main
git branch -M main

# Hubungkan repositori lokal Anda ke GitHub (Ganti URL dengan URL repositori Anda)
git remote add origin https://github.com/USERNAME_ANDA/puyuh-dashboard.git

# Unggah kode ke GitHub
git push -u origin main
```

#### Langkah 3: Sambungkan ke Vercel
1. Buka [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New"** di pojok kanan atas, lalu pilih **"Project"**.
3. Pada bagian **"Import Git Repository"**, pilih repositori `puyuh-dashboard` Anda dan klik **"Import"**.
4. Vercel akan otomatis mengenali bahwa proyek Anda menggunakan **Vite**. Konfigurasi default berikut sudah tepat dan tidak perlu diubah:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (atau `vite build`)
   - **Output Directory**: `dist`
5. Klik **"Deploy"**!
6. Selesai! Dalam 1-2 menit, aplikasi Anda akan online secara publik.

---

### Metode B: Menggunakan Vercel CLI (Deploy Langsung dari Terminal 💻)

Jika Anda tidak ingin menggunakan GitHub dan ingin mendeploy langsung dari komputer lokal Anda, gunakan Vercel CLI.

#### Langkah 1: Install Vercel CLI secara Global
Buka terminal dan instal Vercel CLI dengan perintah berikut:
```bash
npm install -g vercel
```

#### Langkah 2: Login ke Akun Vercel Anda
Jalankan perintah ini dan selesaikan otentikasi di browser yang terbuka otomatis:
```bash
vercel login
```

#### Langkah 3: Jalankan Perintah Deploy
Di dalam folder proyek `puyuh-dashboard` Anda, jalankan perintah berikut:
```bash
vercel
```
Anda akan ditanya beberapa hal di terminal, silakan ikuti panduan berikut:
- *Set up and deploy?* Ketik `y` lalu tekan **Enter**.
- *Which scope?* Pilih akun Vercel pribadi Anda lalu tekan **Enter**.
- *Link to existing project?* Ketik `n` (No) lalu tekan **Enter**.
- *What's your project's name?* Tekan **Enter** untuk menggunakan nama default (`puyuh-dashboard`).
- *In which directory is your code located?* Tekan **Enter** untuk `./`.
- *Want to modify settings?* Ketik `n` (No) lalu tekan **Enter** (karena Vercel otomatis mendeteksi konfigurasi Vite dan `vercel.json` Anda).

#### Langkah 4: Publikasikan ke Production
Setelah proses deployment preview di atas selesai, publikasikan secara permanen ke production dengan perintah:
```bash
vercel --prod
```

---

## 🛠️ Informasi Penting tentang Konfigurasi Proyek

1. **File `vercel.json`**:
   Di dalam direktori Anda sudah terdapat file `vercel.json` dengan kode berikut:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   Ini berfungsi agar jika user mengakses link halaman secara langsung (misalnya `https://domain-anda.vercel.app/history`), server Vercel tidak akan mengembalikan error *404 Not Found*, melainkan menyerahkan routing-nya ke React Router Anda di `index.html`.

2. **Kredensial Firebase**:
   Kredensial Firebase Anda sudah terkonfigurasi secara hardcode di `src/db.js`, sehingga Anda **tidak perlu** mengkonfigurasi Environment Variables (`.env`) apa pun di panel dashboard Vercel, kecuali jika di masa mendatang Anda ingin memisahkan API keys tersebut ke file `.env` demi alasan keamanan.
