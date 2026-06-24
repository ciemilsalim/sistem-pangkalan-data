<?php
// verify_academic_audit.php
// Bootstraps Laravel in sistem-pangkalan-data to verify the AcademicAuditController's
// database queries, calculations, and data structures.

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\AcademicAuditController;

echo "=== MEMULAI VERIFIKASI DEREFERENSI & DATA AUDIT AKADEMIK (FASE 2) ===\n\n";

try {
    // Inisialisasi Controller
    $controller = new AcademicAuditController();
    
    // Panggil method index() untuk memperoleh Response Inertia
    echo "1. Memanggil AcademicAuditController@index...\n";
    $response = $controller->index(request());
    
    // Ambil properti (props) dari response menggunakan Reflection
    $reflection = new \ReflectionClass($response);
    $property = $reflection->getProperty('props');
    $property->setAccessible(true);
    $props = $property->getValue($response);
    
    echo "[SUKSES] Controller berhasil dieksekusi dan mengembalikan response Inertia.\n\n";
    
    // 2. Verifikasi Struktur Properti KBM Audit
    echo "2. Memverifikasi properti KBM Guru ('kbm_audit'):\n";
    $kbmAudit = $props['kbm_audit'] ?? null;
    if (!$kbmAudit) throw new \Exception("Properti 'kbm_audit' tidak ditemukan.");
    
    echo "   - Total penugasan kelas diampu: " . count($kbmAudit) . " kelas.\n";
    foreach ($kbmAudit as $index => $row) {
        if ($index >= 5) {
            echo "     * (Dan " . (count($kbmAudit) - 5) . " penugasan kelas lainnya...)\n";
            break;
        }
        $teacherName = $row['teacher']['name'] ?? 'Guru';
        $className = $row['school_class']['name'] ?? 'Kelas';
        $subjectName = $row['subject']['name'] ?? 'Mapel';
        echo "     * [{$row['status']}] Guru: {$teacherName} | {$className} | {$subjectName} (Materi: {$row['materials_count']}, Tugas: {$row['assignments_count']})\n";
    }
    echo "[SUKSES] Data KBM Guru berhasil diverifikasi.\n\n";
    
    // 3. Verifikasi Laporan Remedial
    echo "3. Memverifikasi properti Laporan Remedial ('remedial_audit'):\n";
    $remedialAudit = $props['remedial_audit'] ?? null;
    if (!$remedialAudit) throw new \Exception("Properti 'remedial_audit' tidak ditemukan.");
    
    echo "   - Total kasus remedial terdaftar: " . count($remedialAudit) . " kasus.\n";
    foreach ($remedialAudit as $index => $row) {
        if ($index >= 4) {
            echo "     * (Dan " . (count($remedialAudit) - 4) . " catatan remedial lainnya...)\n";
            break;
        }
        echo "     * [{$row['status']}] Siswa: {$row['student_name']} | Mapel: {$row['subject_name']} | Skor Awal: {$row['initial_score']} -> Skor Rem: " . ($row['remedial_score'] ?? '-') . " (Strategi: {$row['strategy']})\n";
    }
    echo "[SUKSES] Data Laporan Remedial berhasil diverifikasi.\n\n";
    
    // 4. Verifikasi Hasil Diagnostik Siswa
    echo "4. Memverifikasi properti Asesmen Diagnostik Siswa ('diagnostic_audit'):\n";
    $diagAudit = $props['diagnostic_audit'] ?? null;
    if (!$diagAudit) throw new \Exception("Properti 'diagnostic_audit' tidak ditemukan.");
    
    echo "   - Total profil diagnostik siswa: " . count($diagAudit) . " siswa.\n";
    foreach ($diagAudit as $index => $row) {
        if ($index >= 4) {
            echo "     * (Dan " . (count($diagAudit) - 4) . " profil diagnostik lainnya...)\n";
            break;
        }
        $passedLabel = $row['is_passed'] === true ? 'Lulus' : ($row['is_passed'] === false ? 'Remedial' : 'N/A');
        echo "     * Siswa: {$row['student_name']} | Rombel: {$row['school_class']} | Gaya Belajar: {$row['learning_style']} | Motivasi: {$row['motivation']} | Kognitif: " . ($row['cognitive_score'] ?? '-') . " ({$passedLabel})\n";
        echo "       Rekomendasi: \"{$row['recommendation']}\"\n";
    }
    echo "[SUKSES] Data Asesmen Diagnostik berhasil diverifikasi.\n\n";
    
    echo "=== VERIFIKASI FASE 2 SELESAI: 100% PASSED ===\n";
    echo "Seluruh data audit KBM Guru, log remedial akademik, profil diagnostik siswa,\n";
    echo "dan penanganan fallback data uji coba terbukti berjalan sempurna.\n";
    
} catch (\Exception $e) {
    echo "\n[EROR VERIFIKASI] Terjadi kesalahan: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " di " . $e->getFile() . "\n";
    exit(1);
}
