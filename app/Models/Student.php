<?php

// File: app/Models/Student.php
namespace App\Models;

use App\Models\User;
use App\Models\ParentModel;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'nis',
        'learning_email',
        'school_class_id',
        'religion',
        'unique_id',
        'photo',
        'face_descriptor',
        'status'
    ];

    protected $appends = ['photo_url'];

    /**
     * Accessor untuk mendapatkan URL lengkap foto siswa di SIPADA.
     * Kompatibel dengan cPanel dan integrasi Aplikasi Absensi.
     */
    public function getPhotoUrlAttribute()
    {
        if (empty($this->photo)) {
            return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
        }

        if (Str::startsWith($this->photo, ['http://', 'https://'])) {
            return $this->photo;
        }

        // 1. Cek file fisik di storage publik SIPADA
        if (file_exists(public_path('storage/' . $this->photo))) {
            return asset('storage/' . $this->photo);
        }

        // 2. Cek file fisik di direktori aplikasi-absensi jika berdampingan
        $absensiStoragePath = env('ABSENSI_STORAGE_DIR', base_path('../aplikasi-absensi/storage/app/public'));
        if (file_exists($absensiStoragePath . '/' . $this->photo)) {
            $absensiUrl = rtrim(env('SSO_ABSENSI_URL', 'http://localhost:8002'), '/');
            return $absensiUrl . '/storage/' . $this->photo;
        }

        // 3. Fallback cPanel jika foto diunggah dari absensi ('students/photos/...')
        if (Str::startsWith($this->photo, 'students/photos/')) {
            $absensiUrl = rtrim(env('SSO_ABSENSI_URL', 'http://localhost:8002'), '/');
            return $absensiUrl . '/storage/' . $this->photo;
        }

        return asset('storage/' . $this->photo);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Otomatis membuat unique_id saat siswa baru dibuat
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->unique_id)) {
                $model->unique_id = (string)Str::uuid();
            }

            // Otomatis buat user account jika belum ada
            if (empty($model->user_id)) {
                $user = User::create([
                    'name' => $model->name,
                    'email' => $model->nis . '@mokopani.com',
                    'password' => bcrypt($model->nis),
                    'role' => 'student',
                ]);
                $model->user_id = $user->id;
            }
        });
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function classHistories()
    {
        return $this->hasMany(StudentClassHistory::class);
    }

    /**
     * Relasi baru untuk absensi per mata pelajaran.
     * Seorang siswa dapat memiliki banyak catatan absensi mata pelajaran.
     */
    public function subjectAttendances()
    {
        return $this->hasMany(SubjectAttendance::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * Mendefinisikan relasi ke model ParentModel.
     */
    public function parents()
    {
        return $this->belongsToMany(ParentModel::class , 'parent_student', 'student_id', 'parent_id');
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function extracurriculars()
    {
        return $this->belongsToMany(Extracurricular::class, 'extracurricular_student');
    }

    public function extracurricularAttendances()
    {
        return $this->hasMany(ExtracurricularAttendance::class);
    }
}
