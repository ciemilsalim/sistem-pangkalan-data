# 🏛️ SIPADA — Sistem Pangkalan Data Akademik (Core SIASEK)

SIPADA (Sistem Pangkalan Data Akademik) adalah tulang punggung (Core) dari ekosistem **SIASEK (Sistem Informasi Akademik Ekosistem)**. Aplikasi ini dirancang khusus untuk Administrasi Tata Usaha (TU) dan Kepala Sekolah dalam mengelola Master Data Pendidikan secara terpusat.

Platform ini mengusung arsitektur *Enterprise-Ready* dengan fitur **Global Semester Filtering** dan **Soft Deletes**, menjamin integritas riwayat data siswa tetap aman dari waktu ke waktu.

---

## 🛠️ Tech Stack

Platform Administrasi ini dibangun dengan teknologi yang mementingkan produktivitas dan fungsionalitas UI:

* **Backend Framework**: [Laravel 11](https://laravel.com) (PHP 8.2+)
* **Frontend Bridge**: [Inertia.js v2.0](https://inertiajs.com) 
* **Frontend Framework**: [React v19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com) & Komponen Antarmuka Modern
* **Database**: MySQL (Database Terpusat `db_absen`)

---

## ✨ Peran Sentral di Ekosistem SIASEK

Karena SIPADA adalah pondasi dari semua sistem SIASEK lainnya (Aplikasi Presensi dan LMS Mokopani), maka **seluruh migrasi database utama berada di dalam repositori ini**. 

SIPADA mengelola:
* Data Guru & Tenaga Kependidikan
* Data Siswa & Wali Murid
* Tahun Ajaran & Semester (Sistem Waktu Global)
* Rombongan Belajar (Kelas) & Buku Induk Pemindahan Siswa
* Jadwal Pelajaran Induk
* Ekstrakurikuler

---

## 🚀 Panduan Instalasi (Wajib Dilakukan Pertama)

Jika Anda ingin menjalankan ekosistem SIASEK secara lengkap, **Anda wajib menginstal SIPADA terlebih dahulu** karena SIPADA memegang kendali atas struktur tabel database (`migrations`).

Ikuti langkah-langkah di bawah ini:

### 1. Kloning & Masuk ke Folder Proyek
```bash
git clone <url-repo-sipada> sistem-pangkalan-data
cd sistem-pangkalan-data
```

### 2. Instal Dependensi Backend (Composer)
```bash
composer install
```

### 3. Instal Dependensi Frontend (NPM)
```bash
npm install
```

### 4. Salin & Konfigurasi File Lingkungan (`.env`)
Salin file `.env.example` menjadi file `.env`:
```bash
copy .env.example .env
```

Buka file `.env` di editor Anda dan atur koneksi MySQL Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_absen
DB_USERNAME=root
DB_PASSWORD=
```
*(Pastikan Anda telah membuat database kosong bernama `db_absen` di phpMyAdmin / MySQL Anda).*

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Migrasi Database & Data Awal (Penting!)
Jalankan perintah berikut untuk membangun struktur tabel ekosistem SIASEK dan menyuntikkan data *dummy* awal:
```bash
php artisan migrate:fresh --seed
```

---

## 🖥️ Menjalankan Aplikasi secara Lokal

Jalankan dua perintah berikut di terminal terpisah:

### Terminal 1: Server Backend
```bash
php artisan serve --port=8001
```
*Catatan: Kami menyarankan menggunakan port 8001 untuk SIPADA agar tidak bentrok dengan aplikasi Presensi / LMS.*

### Terminal 2: Server Compilator Frontend (Vite)
```bash
npm run dev
```

Sekarang, buka browser Anda dan akses `http://127.0.0.1:8001`. Anda dapat masuk menggunakan kredensial Admin TU yang telah dihasilkan dari proses *seeding*.

---

## 📖 Fitur Kunci: "Smart Auto-Select Semester"

SIPADA dilengkapi dengan Dropdown Semester Global di sudut kanan atas layar.
1. **Frictionless Workflow**: Admin TU secara default bekerja pada "Semester Berjalan". Semua data yang dimasukkan (Siswa, Kelas, Jadwal) otomatis terikat ke semester aktif.
2. **Riwayat Terjaga**: Admin dapat mengubah tuas dropdown untuk mundur ke semester lalu (melihat arsip) atau maju ke semester depan (untuk persiapan kelas tahun ajaran baru).

---

## 📅 Changelog & Pembaruan Terkini (Agustus 2026)

Sejumlah pembaruan fitur telah ditambahkan untuk meningkatkan fleksibilitas dan kenyamanan pengguna:

*   **Jadwal Pelajaran**: Penyesuaian antarmuka *grid* mingguan untuk menampilkan slot jam secara penuh hingga pukul 15.00 sore.
*   **Pengumpulan Berkas (Guru & Wakasek)**: Sistem kini mendukung pengumpulan dokumen dalam bentuk tautan/URL eksternal. Terdapat deteksi otomatis yang akan menampilkan ikon sesuai dengan jenis tautan (Google Docs, Google Sheets, Google Drive, PDF, dsb).
*   **Kalender Akademik**: Pembaruan tampilan kalender menjadi format bulanan penuh (*grid view* bergaya Google Calendar) sehingga lebih mudah dibaca, lengkap dengan penanda warna khusus untuk hari libur (merah) dan acara sekolah.
*   **Manajemen Status Siswa**:
    *   Penggantian terminologi status "Keluar" menjadi "Tidak Aktif".
    *   Penambahan status baru: **Lulus** dan **Pindah**.
    *   Perbaikan logika pada formulir Edit dan Filter Tabel agar data siswa yang sudah lulus/tidak aktif tetap dapat dikelola secara normal meskipun mereka sudah tidak lagi terikat pada kelas (ID Kelas dikosongkan).
*   **Dasbor Analitik (Grafik Kehadiran)**:
    *   Optimalisasi akurasi data grafik Tren Persentase Kehadiran agar terhubung langsung dengan tabel `attendances` (aplikasi absensi) dan hanya menghitung siswa berstatus hadir (*Tepat Waktu* & *Terlambat*).
    *   Penerapan **Skala Sumbu-Y Dinamis** pada grafik SVG untuk memastikan visualisasi tren data tetap terlihat jelas meskipun di dalam lingkungan pengujian (development) dengan persentase data yang sangat kecil.
*   **Manajemen Kurikulum**:
    *   **Ekstrakurikuler**: Peningkatan fungsi pada form penambahan/pengelolaan siswa dengan menambahkan fitur pencarian (search filter) dan menampilkan detail rombongan belajar setiap siswa, sehingga memudahkan pemilihan siswa lintas kelas.
    *   **Kokurikuler (Fitur Baru)**: Implementasi tab khusus Proyek Kokurikuler sesuai Panduan Kokurikuler terbaru. Mendukung penambahan kode proyek (Misal: P1, P2), Judul Kegiatan, bentuk kegiatan (Pembelajaran Kolaboratif Lintas Disiplin Ilmu, 7KAIH, dll.), pilihan Multi-Dimensi Profil Lulusan, penugasan **Tim Fasilitator Lintas Mapel**, serta penargetan ke berbagai Rombongan Belajar.

---
*Dibuat dengan dedikasi penuh untuk kemajuan ekosistem pendidikan digital Indonesia.*
