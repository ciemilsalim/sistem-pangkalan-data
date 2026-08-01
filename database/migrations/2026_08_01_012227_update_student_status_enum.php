<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Alter enum to include 'tidak_aktif'
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('aktif', 'lulus', 'pindah', 'keluar', 'tidak_aktif') DEFAULT 'aktif'");

        // 2. Update existing records
        DB::table('students')->where('status', 'keluar')->update(['status' => 'tidak_aktif']);

        // 3. Alter enum to remove 'keluar'
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('aktif', 'lulus', 'pindah', 'tidak_aktif') DEFAULT 'aktif'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Alter enum to include 'keluar'
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('aktif', 'lulus', 'pindah', 'keluar', 'tidak_aktif') DEFAULT 'aktif'");

        // 2. Revert existing records
        DB::table('students')->where('status', 'tidak_aktif')->update(['status' => 'keluar']);

        // 3. Alter enum to remove 'tidak_aktif'
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('aktif', 'lulus', 'pindah', 'keluar') DEFAULT 'aktif'");
    }
};
