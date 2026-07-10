<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SyncStudentUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:sync-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi data siswa dengan tabel users (Membuat user untuk siswa yang belum punya akun)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai sinkronisasi akun pengguna untuk siswa...');

        $students = Student::whereNull('user_id')->get();
        
        if ($students->count() === 0) {
            $this->info('Semua siswa sudah memiliki akun pengguna (user_id). Tidak ada yang perlu disinkronkan.');
            return 0;
        }

        $this->info('Ditemukan ' . $students->count() . ' siswa yang belum memiliki akun pengguna.');
        
        $bar = $this->output->createProgressBar($students->count());
        $bar->start();

        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($students as $student) {
                // Buat email default berdasarkan NIS
                // Jika NIS kosong, gunakan string acak
                $nis = $student->nis ?: Str::random(8);
                $email = strtolower(trim($nis)) . '@student.smpn1biau.sch.id';
                
                // Cek apakah email sudah ada (mungkin duplikat)
                $existingUser = User::where('email', $email)->first();
                if ($existingUser) {
                    $email = strtolower(trim($nis)) . '_' . Str::random(4) . '@student.smpn1biau.sch.id';
                }

                // Buat user baru
                $user = User::create([
                    'name' => $student->name,
                    'email' => $email,
                    'password' => Hash::make($nis), // Password default adalah NIS
                    'role' => 'student',
                ]);

                // Update siswa dengan user_id yang baru
                $student->user_id = $user->id;
                $student->save();

                $count++;
                $bar->advance();
            }
            
            DB::commit();
            $bar->finish();
            $this->newLine();
            $this->info("Berhasil membuat {$count} akun pengguna baru untuk siswa.");
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->newLine();
            $this->error('Terjadi kesalahan saat sinkronisasi: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
