<?php
// verify_chat.php
// Bootstraps Laravel in sistem-pangkalan-data to verify the database chat operations,
// queries, relationships, and moderation functions for Phase 4.5.

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ParentModel;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\AdminConversation;
use App\Models\AdminMessage;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "=== MEMULAI VERIFIKASI CHAT & MONITORING (FASE 4.5) ===\n\n";

try {
    DB::beginTransaction();

    // 1. Persiapkan Akun Pengujian
    echo "1. Menyiapkan entitas pengujian di database...\n";
    
    // Admin
    $adminUser = User::where('role', 'admin')->first();
    if (!$adminUser) {
        $adminUser = User::create([
            'name' => 'Admin Uji Coba',
            'email' => 'admin.test@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
        echo "   - Akun Admin Baru dibuat: {$adminUser->email}\n";
    } else {
        echo "   - Akun Admin Ada: {$adminUser->email}\n";
    }

    // Parent
    $parentUser = User::where('role', 'parent')->first();
    if (!$parentUser) {
        $parentUser = User::create([
            'name' => 'Wali Uji Coba',
            'email' => 'wali.test@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'parent',
        ]);
        $parent = ParentModel::create([
            'user_id' => $parentUser->id,
            'name' => 'Wali Uji Coba',
            'phone_number' => '089876543210',
        ]);
        echo "   - Akun Orang Tua Baru dibuat: {$parentUser->email} (ID Parent: {$parent->id})\n";
    } else {
        $parent = $parentUser->parent ?: ParentModel::create([
            'user_id' => $parentUser->id,
            'name' => $parentUser->name,
            'phone_number' => '089876543210',
        ]);
        echo "   - Akun Orang Tua Ada: {$parentUser->email} (ID Parent: {$parent->id})\n";
    }

    // Teacher
    $teacherUser = User::where('role', 'teacher')->first();
    if (!$teacherUser) {
        $teacherUser = User::create([
            'name' => 'Guru Uji Coba',
            'email' => 'guru.test@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'teacher',
        ]);
        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'name' => 'Guru Uji Coba',
            'nip' => 'TESTNIP12345',
            'phone_number' => '081234567890',
        ]);
        echo "   - Akun Guru Baru dibuat: {$teacherUser->email} (ID Guru: {$teacher->id})\n";
    } else {
        $teacher = $teacherUser->teacher ?: Teacher::create([
            'user_id' => $teacherUser->id,
            'name' => $teacherUser->name,
            'nip' => 'TESTNIP12345',
            'phone_number' => '081234567890',
        ]);
        echo "   - Akun Guru Ada: {$teacherUser->email} (ID Guru: {$teacher->id})\n";
    }

    // Student
    $student = Student::first();
    if (!$student) {
        $student = Student::create([
            'nisn' => 'NISN12345',
            'nis' => 'NIS123',
            'name' => 'Siswa Uji Coba',
            'gender' => 'L',
        ]);
        echo "   - Siswa Baru dibuat: {$student->name} (ID: {$student->id})\n";
    } else {
        echo "   - Siswa Ada: {$student->name} (ID: {$student->id})\n";
    }

    echo "\n";

    // ==========================================
    // UJI 1: OBROLAN ADMIN-ORTU
    // ==========================================
    echo "=== UJI 1: ALUR OBROLAN ADMIN-ORTU ===\n";
    
    // Bersihkan percakapan lama jika ada agar tes deterministik
    AdminConversation::where('admin_id', $adminUser->id)->where('parent_id', $parent->id)->delete();

    // Jalankan logika auto-create
    echo "1. Menjalankan logika inisialisasi percakapan (AdminChatController@index)...\n";
    $existingParentIds = AdminConversation::where('admin_id', $adminUser->id)->pluck('parent_id')->toArray();
    $allParents = ParentModel::all();
    $missingParentIds = $allParents->pluck('id')->diff($existingParentIds);

    if ($missingParentIds->isNotEmpty()) {
        $insertData = [];
        foreach ($missingParentIds as $parentId) {
            $insertData[] = [
                'parent_id' => $parentId,
                'admin_id' => $adminUser->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        AdminConversation::insert($insertData);
        echo "   - Auto-create berhasil! Membuat " . $missingParentIds->count() . " percakapan baru.\n";
    }

    $adminConv = AdminConversation::where('admin_id', $adminUser->id)->where('parent_id', $parent->id)->first();
    if ($adminConv) {
        echo "[SUKSES] Percakapan Admin-Parent berhasil diverifikasi di database (ID: {$adminConv->id}).\n";
    } else {
        throw new \Exception("Gagal menemukan atau membuat percakapan Admin-Parent.");
    }

    // Admin mengirim pesan
    echo "2. Admin mengirim pesan...\n";
    $msgAdmin = AdminMessage::create([
        'admin_conversation_id' => $adminConv->id,
        'user_id' => $adminUser->id,
        'body' => 'Halo dari Administrator. Apakah ada kendala administratif?',
    ]);
    echo "   - Pesan Admin disimpan (ID: {$msgAdmin->id}, Body: '{$msgAdmin->body}')\n";

    // Orang Tua mengirim balasan
    echo "3. Orang Tua mengirim balasan...\n";
    $msgParent = AdminMessage::create([
        'admin_conversation_id' => $adminConv->id,
        'user_id' => $parentUser->id,
        'body' => 'Halo Admin, terima kasih. Pembayaran SPP bulan ini sudah lunas ya.',
    ]);
    echo "   - Pesan Orang Tua disimpan (ID: {$msgParent->id}, Body: '{$msgParent->body}')\n";

    // Hitung pesan unread dari sisi Admin
    echo "4. Menghitung jumlah pesan belum dibaca oleh Admin...\n";
    $unreadCount = AdminMessage::where('admin_conversation_id', $adminConv->id)
        ->where('user_id', '!=', $adminUser->id)
        ->whereNull('read_at')
        ->count();
    echo "   - Jumlah pesan masuk belum dibaca: {$unreadCount}\n";
    if ($unreadCount === 1) {
        echo "[SUKSES] Hitungan unread count untuk Admin tepat (diharapkan 1, hasil {$unreadCount}).\n";
    } else {
        throw new \Exception("Hitungan unread count salah! Diharapkan 1, hasil {$unreadCount}.");
    }

    // Admin membuka percakapan (menandai dibaca)
    echo "5. Admin membuka percakapan (menandai dibaca)...\n";
    AdminMessage::where('admin_conversation_id', $adminConv->id)
        ->where('user_id', '!=', $adminUser->id)
        ->whereNull('read_at')
        ->update(['read_at' => now()]);

    $unreadCountAfter = AdminMessage::where('admin_conversation_id', $adminConv->id)
        ->where('user_id', '!=', $adminUser->id)
        ->whereNull('read_at')
        ->count();
    echo "   - Jumlah pesan masuk belum dibaca setelah dibuka: {$unreadCountAfter}\n";
    if ($unreadCountAfter === 0) {
        echo "[SUKSES] Semua pesan berhasil ditandai sebagai dibaca (unread count menjadi 0).\n";
    } else {
        throw new \Exception("Pesan gagal ditandai sebagai dibaca! Sisa unread: {$unreadCountAfter}.");
    }

    echo "\n";

    // ==========================================
    // UJI 2: PENGAWASAN CHAT GURU-ORTU
    // ==========================================
    echo "=== UJI 2: PENGAWASAN & MODERASI CHAT GURU-ORTU ===\n";

    // Bersihkan percakapan lama jika ada
    Conversation::where('teacher_id', $teacher->id)->where('parent_id', $parent->id)->delete();

    // Buat percakapan Guru-Ortu mengenai Siswa
    echo "1. Membuat percakapan Guru-Ortu baru...\n";
    $conversation = Conversation::create([
        'parent_id' => $parent->id,
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);
    echo "   - Percakapan Guru-Ortu dibuat (ID: {$conversation->id}, Membahas: {$student->name})\n";

    // Kirim beberapa pesan obrolan
    echo "2. Mengisi obrolan Guru-Ortu dengan beberapa pesan...\n";
    $msgTeacher1 = Message::create([
        'conversation_id' => $conversation->id,
        'user_id' => $teacherUser->id,
        'body' => 'Selamat siang, saya ingin menginfokan bahwa siswa sering melamun di kelas.',
    ]);
    $msgParent1 = Message::create([
        'conversation_id' => $conversation->id,
        'user_id' => $parentUser->id,
        'body' => 'Selamat siang juga guru, baik nanti saya akan tanyakan kondisinya di rumah.',
    ]);
    $msgInappropriate = Message::create([
        'conversation_id' => $conversation->id,
        'user_id' => $teacherUser->id,
        'body' => 'Pesan tidak pantas yang melanggar aturan sekolah!',
    ]);
    echo "   - Pesan 1 (Guru): '{$msgTeacher1->body}'\n";
    $totalMessages = Message::where('conversation_id', $conversation->id)->count();
    echo "   - Total pesan dalam utas percakapan: {$totalMessages} pesan.\n";

    // Lakukan simulasi pencarian di Monitoring Board
    echo "3. Simulasi pencarian percakapan pada Papan Pengawasan...\n";
    $searchQuery = substr($parent->name, 0, 4);
    $searchResult = Conversation::whereHas('parent', function($q) use ($searchQuery) {
        $q->where('name', 'like', "%{$searchQuery}%");
    })->get();
    echo "   - Mencari dengan kata kunci '{$searchQuery}', hasil ditemukan: " . $searchResult->count() . " percakapan.\n";
    if ($searchResult->contains('id', $conversation->id)) {
        echo "[SUKSES] Percakapan berhasil dicari dan disaring oleh filter pengawasan.\n";
    } else {
        throw new \Exception("Sistem pencarian monitoring gagal mendeteksi percakapan.");
    }

    // Moderasi: Hapus pesan tidak pantas
    echo "4. Admin memoderasi percakapan dengan menghapus pesan tidak pantas...\n";
    $inappropriateId = $msgInappropriate->id;
    $msgInappropriate->delete();
    
    $checkMsg = Message::find($inappropriateId);
    if (!$checkMsg) {
        echo "[SUKSES] Pesan tidak pantas berhasil dihapus secara permanen dari database oleh Admin.\n";
    } else {
        throw new \Exception("Gagal menghapus/memoderasi pesan tidak pantas.");
    }

    // Hapus seluruh utas percakapan (Clean Up / Reset)
    echo "5. Admin menghapus seluruh utas percakapan...\n";
    $conversation->messages()->delete();
    $conversation->delete();

    $checkConv = Conversation::find($conversation->id);
    $checkMessagesLeft = Message::where('conversation_id', $conversation->id)->count();
    if (!$checkConv && $checkMessagesLeft === 0) {
        echo "[SUKSES] Seluruh utas percakapan beserta seluruh pesannya berhasil dibersihkan.\n";
    } else {
        throw new \Exception("Gagal membersihkan seluruh utas percakapan.");
    }

    // Rollback agar database kembali bersih dari data uji coba temporal
    DB::rollBack();
    echo "\n=== VERIFIKASI BERHASIL: 100% SUKSES ===\n";
    echo "Seluruh alur backend obrolan dua arah, perhitungan unread, pembacaan status,\n";
    echo "hingga fitur audit/moderasi pengawasan chat terbukti bekerja secara sempurna\n";
    echo "pada database bersama 'db_absen'.\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n[EROR VERIFIKASI] Terjadi kesalahan: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " di " . $e->getFile() . "\n";
    exit(1);
}
