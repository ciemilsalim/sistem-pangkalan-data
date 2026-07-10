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

        // Jika kelas disediakan, cari ID kelas berdasarkan namanya
        if ($className) {
            $schoolClass = SchoolClass::where('name', $className)->first();
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
        ];
    }
}
