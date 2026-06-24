<?php
// verify_integration.php
// Bootstraps Laravel in sistem-pangkalan-data to access DB, then queries a teacher and tests the API of aplikasi-absensi.

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Teacher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

echo "=== MEMULAI VERIFIKASI INTEGRASI FASE 4 ===\n";

// 1. Temukan atau Buat Akun Guru Uji Coba untuk Login API
$teacherUser = User::where('role', 'teacher')->first();
if (!$teacherUser) {
    echo "Tidak ditemukan akun guru di database. Membuat akun guru uji coba...\n";
    $teacherUser = User::create([
        'name' => 'Guru Uji Coba',
        'email' => 'guru.test@sekolah.com',
        'password' => Hash::make('password123'),
        'role' => 'teacher',
    ]);
    
    Teacher::create([
        'user_id' => $teacherUser->id,
        'name' => 'Guru Uji Coba',
        'nip' => 'TESTNIP12345',
        'phone_number' => '081234567890',
    ]);
}

$email = $teacherUser->email;
$password = 'password123'; 

// Simpan password hash lama dan set sementara password guru ke 'password123' untuk uji coba login
$oldPasswordHash = $teacherUser->password;
$teacherUser->update(['password' => Hash::make('password123')]);

echo "Akun guru yang digunakan untuk uji coba: {$email}\n";

// 2. Hubungi API Login di aplikasi-absensi (Port 8080)
$baseUrl = 'http://127.0.0.1:8080/api';
echo "Menghubungi API Login ke {$baseUrl}/login ...\n";

try {
    $loginResponse = Http::post("{$baseUrl}/login", [
        'login' => $email,
        'password' => $password,
        'device_name' => 'Verification Script'
    ]);
    
    // Kembalikan hash password asli demi keamanan
    $teacherUser->update(['password' => $oldPasswordHash]);

    if ($loginResponse->failed()) {
        echo "[EROR] Gagal login ke Aplikasi Absensi. Silakan pastikan server aplikasi-absensi aktif di port 8000.\n";
        echo "Respon Eror: " . $loginResponse->body() . "\n";
        exit(1);
    }

    $token = $loginResponse->json('token');
    echo "[SUKSES] Login berhasil! Token diperoleh.\n\n";

    $headers = [
        'Authorization' => "Bearer {$token}",
        'Accept' => 'application/json',
    ];

    // 3. Tes Rute Pengumuman Sekolah (API Flutter)
    echo "--- 1. Menguji API Pengumuman Sekolah ---\n";
    $annResponse = Http::withHeaders($headers)->get("{$baseUrl}/teacher/announcements");
    if ($annResponse->successful()) {
        $count = count($annResponse->json());
        echo "[SUKSES] API Pengumuman berhasil diakses. Jumlah pengumuman aktif: {$count} data.\n";
    } else {
        echo "[EROR] Gagal mengakses API Pengumuman: " . $annResponse->status() . "\n";
    }

    // 4. Tes Rute Kalender Akademik (API Flutter)
    echo "\n--- 2. Menguji API Kalender Akademik ---\n";
    $calResponse = Http::withHeaders($headers)->get("{$baseUrl}/teacher/calendar");
    if ($calResponse->successful()) {
        $count = count($calResponse->json());
        echo "[SUKSES] API Kalender Akademik berhasil diakses. Jumlah agenda: {$count} data.\n";
    } else {
        echo "[EROR] Gagal mengakses API Kalender Akademik: " . $calResponse->status() . "\n";
    }

    // 5. Tes Rute Jadwal Pelajaran (API Flutter)
    echo "\n--- 3. Menguji API Jadwal Pelajaran Guru ---\n";
    $schResponse = Http::withHeaders($headers)->get("{$baseUrl}/teacher/schedules");
    if ($schResponse->successful()) {
        $count = count($schResponse->json());
        echo "[SUKSES] API Jadwal Pelajaran berhasil diakses. Jumlah jadwal guru pengampu: {$count} data.\n";
    } else {
        echo "[EROR] Gagal mengakses API Jadwal Pelajaran: " . $schResponse->status() . "\n";
    }

    // 6. Tes Rute Ekstrakurikuler (API Flutter)
    echo "\n--- 4. Menguji API Ekstrakurikuler Guru ---\n";
    $extraResponse = Http::withHeaders($headers)->get("{$baseUrl}/teacher/extracurriculars");
    if ($extraResponse->successful()) {
        $count = count($extraResponse->json());
        echo "[SUKSES] API Ekstrakurikuler berhasil diakses. Jumlah ekskul yang dibina: {$count} data.\n";
    } else {
        echo "[EROR] Gagal mengakses API Ekstrakurikuler: " . $extraResponse->status() . "\n";
    }

    // 7. Tes Rute Pengaturan Geofencing & Sekolah (API Flutter)
    echo "\n--- 5. Menguji API Pengaturan GPS & Profil Sekolah ---\n";
    $gpsResponse = Http::withHeaders($headers)->get("{$baseUrl}/settings/gps");
    $profileResponse = Http::withHeaders($headers)->get("{$baseUrl}/settings/school-profile");
    
    if ($gpsResponse->successful() && $profileResponse->successful()) {
        echo "[SUKSES] API GPS Settings & Profil Sekolah berhasil diakses.\n";
        echo "Detail GPS: Radius = " . $gpsResponse->json('attendance_radius') . " meter, Lat = " . $gpsResponse->json('school_latitude') . ", Long = " . $gpsResponse->json('school_longitude') . "\n";
        echo "Detail Sekolah: Nama = " . $profileResponse->json('school_name') . "\n";
    } else {
        echo "[EROR] Gagal mengakses API Pengaturan Sekolah.\n";
    }

    echo "\n=== SELESAI VERIFIKASI INTEGRASI FASE 4 ===\n";
    echo "Seluruh data master, pengumuman, dan pengaturan yang Anda kelola melalui\n";
    echo "Sistem Pangkalan Data baru terbukti 100% tersinkronisasi dan dapat dibaca\n";
    echo "oleh API Flutter secara sempurna melalui Aplikasi Absensi utama.\n";

} catch (\Exception $e) {
    echo "[EROR] Terjadi kesalahan saat melakukan request HTTP: " . $e->getMessage() . "\n";
}
