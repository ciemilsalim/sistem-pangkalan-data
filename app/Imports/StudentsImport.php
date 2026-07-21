<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\User;
use App\Models\SchoolClass;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        $nis = (string) $row['nis'];
        $className = isset($row['kelas']) ? $row['kelas'] : null;
        $schoolClassId = null;

        $activeSemesterId = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        // Jika kelas disediakan, cari ID kelas berdasarkan namanya dan tahun ajaran aktif
        if ($className) {
            $schoolClass = SchoolClass::where('name', $className)
                                      ->where('academic_year_id', $activeAcademicYearId)
                                      ->where('semester_id', $activeSemesterId)
                                      ->first();
            if ($schoolClass) {
                $schoolClassId = $schoolClass->id;
            }
        }

        // Cek apakah user dengan email ini sudah ada, jika ada, beri variasi acak agar tidak bentrok
        $email = strtolower(trim($nis)) . '@student.smpn1biau.sch.id';
        if (User::where('email', $email)->exists()) {
            $email = strtolower(trim($nis)) . '_' . Str::random(4) . '@student.smpn1biau.sch.id';
        }

        // Buat User terlebih dahulu
        $user = User::create([
            'name' => $row['nama'],
            'email' => $email,
            'password' => Hash::make($nis),
            'role' => 'student',
        ]);

        return new Student([
            'user_id'         => $user->id,
            'name'            => $row['nama'],
            'nis'             => $nis,
            'learning_email'  => isset($row['email_belajar']) ? $row['email_belajar'] : null,
            'school_class_id' => $schoolClassId,
            'unique_id'       => (string) Str::uuid(),
        ]);
    }

    /**
     * Tentukan aturan validasi untuk setiap baris di file Excel.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'nama'  => 'required|string|max:255',
            'nis'   => 'required|unique:students,nis',
            'kelas' => 'nullable|string', // Kelas opsional
            'email_belajar' => 'nullable|string|email|max:255|unique:students,learning_email',
        ];
    }
}
