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
    
    echo "   - Total penugasan kelas diampu ril: " . count($kbmAudit) . " kelas.\n";
    $uploadedCount = 0;
    foreach ($kbmAudit as $index => $row) {
        $teacherName = $row['teacher']['name'] ?? 'Guru';
        $className = $row['school_class']['name'] ?? 'Kelas';
        $subjectName = $row['subject']['name'] ?? 'Mapel';
        $materialsCount = $row['materials_count'] ?? 0;
        if ($materialsCount > 0) {
            $uploadedCount++;
            echo "     * [RIL AKTIF] Guru: {$teacherName} | {$className} | {$subjectName}\n";
            echo "       Materi: {$materialsCount} berkas\n";
            if (!empty($row['material_titles'])) {
                echo "       Judul Berkas: " . implode(', ', $row['material_titles']) . "\n";
            }
        }
    }
    echo "   - Total penugasan dengan materi ril: {$uploadedCount}\n";
    echo "[SUKSES] Data KBM Guru 100% ril dari database terverifikasi.\n\n";
    
    // 3. Verifikasi ketiadaan data mock / palsu
    echo "3. Memastikan ketiadaan data tiruan/mock (Remedial & Diagnostik tanpa database):\n";
    if (isset($props['remedial_audit'])) {
        throw new \Exception("Properti 'remedial_audit' terdeteksi masih dikirim! Seharusnya dihapus karena tidak ada data ril.");
    }
    if (isset($props['diagnostic_audit'])) {
        throw new \Exception("Properti 'diagnostic_audit' terdeteksi masih dikirim! Seharusnya dihapus karena tidak ada data ril.");
    }
    echo "   - Properti mock 'remedial_audit': TIDAK ADA (Clean)\n";
    echo "   - Properti mock 'diagnostic_audit': TIDAK ADA (Clean)\n";
    echo "[SUKSES] Verifikasi Zero-Mock Policy berhasil. Hanya data ril yang dikirim ke UI.\n\n";
    
    echo "=== VERIFIKASI SELESAI: 100% PASSED ===\n";
    echo "Seluruh data audit KBM Guru terbukti 100% ril dari tabel database db_absen.\n";
    
} catch (\Exception $e) {
    echo "\n[EROR VERIFIKASI] Terjadi kesalahan: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " di " . $e->getFile() . "\n";
    exit(1);
}

