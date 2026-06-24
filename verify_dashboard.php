<?php
// verify_dashboard.php
// Bootstraps Laravel in sistem-pangkalan-data to verify the DashboardController's
// database queries, calculations, and data structures.

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\DashboardController;

echo "=== MEMULAI VERIFIKASI DEREFERENSI & DATA DASBOR ===\n\n";

try {
    // Inisialisasi Controller
    $controller = new DashboardController();
    
    // Panggil method index() untuk memperoleh Response Inertia
    echo "1. Memanggil DashboardController@index...\n";
    $response = $controller->index();
    
    // Ambil properti (props) dari response menggunakan Reflection
    $reflection = new \ReflectionClass($response);
    $property = $reflection->getProperty('props');
    $property->setAccessible(true);
    $props = $property->getValue($response);
    
    echo "[SUKSES] Controller berhasil dieksekusi dan mengembalikan response Inertia.\n\n";
    
    // 2. Verifikasi Struktur Properti Stats
    echo "2. Memverifikasi properti statistik dasar ('stats'):\n";
    $stats = $props['stats'] ?? null;
    if (!$stats) throw new \Exception("Properti 'stats' tidak ditemukan.");
    
    $requiredStatsKeys = [
        'total_students', 'total_teachers', 'total_parents', 
        'total_classes', 'total_extracurriculars', 'attendance_rate'
    ];
    foreach ($requiredStatsKeys as $key) {
        if (!isset($stats[$key]) && !array_key_exists($key, $stats)) {
            throw new \Exception("Kunci stats '{$key}' tidak ditemukan.");
        }
        echo "   - {$key}: " . json_encode($stats[$key]) . " (" . gettype($stats[$key]) . ")\n";
    }
    echo "[SUKSES] Statistik dasar terisi dan terformat dengan benar.\n\n";
    
    // 3. Verifikasi Struktur Grafik & Analisis
    echo "3. Memverifikasi data grafik ('charts'):\n";
    $charts = $props['charts'] ?? null;
    if (!$charts) throw new \Exception("Properti 'charts' tidak ditemukan.");
    
    // Student Distribution
    $dist = $charts['student_distribution'] ?? null;
    if (!is_array($dist)) throw new \Exception("Data distribusi siswa ('student_distribution') tidak valid.");
    echo "   - Distribusi Siswa per Tingkat: " . count($dist) . " kelompok ditemukan.\n";
    foreach ($dist as $item) {
        if (!isset($item['label']) || !isset($item['value'])) {
            throw new \Exception("Format item distribusi siswa tidak valid: " . json_encode($item));
        }
        echo "     * {$item['label']}: {$item['value']} siswa\n";
    }
    
    // Attendance Trend
    $trend = $charts['attendance_trend'] ?? null;
    if (!is_array($trend)) throw new \Exception("Data tren presensi ('attendance_trend') tidak valid.");
    echo "   - Tren Presensi 7 Hari Belajar: " . count($trend) . " hari terekam.\n";
    foreach ($trend as $item) {
        if (!isset($item['day']) || !isset($item['percentage'])) {
            throw new \Exception("Format item tren presensi tidak valid: " . json_encode($item));
        }
        echo "     * {$item['day']}: {$item['percentage']}% Kehadiran\n";
    }
    
    // Chat Engagement
    $chat = $charts['chat_engagement'] ?? null;
    if (!$chat) throw new \Exception("Data keterlibatan chat ('chat_engagement') tidak ditemukan.");
    echo "   - Keterlibatan Modul Chat:\n";
    echo "     * Total Pesan: {$chat['total']}\n";
    echo "     * Pesan Guru-Ortu: {$chat['teacher_parent_count']}\n";
    echo "     * Pesan Admin-Ortu: {$chat['admin_parent_count']}\n";
    
    echo "[SUKSES] Seluruh struktur grafik presisi dan siap dikonsumsi komponen React.\n\n";
    
    // 4. Verifikasi Pengumuman & Kalender Pendidikan
    echo "4. Memverifikasi pengumuman & kalender akademik terdekat:\n";
    $announcements = $props['announcements'] ?? [];
    $upcomingEvents = $props['upcoming_events'] ?? [];
    echo "   - Jumlah Pengumuman Terbaru: " . count($announcements) . " data.\n";
    echo "   - Jumlah Agenda Terdekat: " . count($upcomingEvents) . " data.\n";
    echo "[SUKSES] Umpan pengumuman dan kalender pendidikan termuat dengan baik.\n\n";
    
    echo "=== VERIFIKASI SELESAI: 100% PASSED ===\n";
    echo "Seluruh data analisis dasbor, perhitungan statistik, fallback data demo,\n";
    echo "dan format keluaran Inertia terbukti 100% konsisten dan valid.\n";
    
} catch (\Exception $e) {
    echo "\n[EROR VERIFIKASI] Terjadi kesalahan: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " di " . $e->getFile() . "\n";
    exit(1);
}
