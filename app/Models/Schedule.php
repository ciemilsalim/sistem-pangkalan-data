<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'teaching_assignment_id',
        'cocurricular_id',
        'schedule_type',
        'day_of_week',
        'start_time',
        'end_time',
        'teacher_id',
        'school_class_id',
        'semester_id',
        'academic_year_id',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->semester_id)) {
                $model->semester_id = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
                $model->academic_year_id = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');
            }
        });
    }

    /**
     * Mendapatkan data penugasan (guru, mapel, kelas)
     * yang terkait dengan jadwal ini.
     */
    public function teachingAssignment()
    {
        return $this->belongsTo(TeachingAssignment::class);
    }

    /**
     * Relasi baru untuk absensi per mata pelajaran.
     * Satu jadwal pelajaran dapat memiliki banyak catatan absensi siswa.
     */
    public function subjectAttendances()
    {
        return $this->hasMany(SubjectAttendance::class);
    }

    /**
     * Mendapatkan data proyek kokurikuler yang terkait dengan jadwal ini.
     */
    public function cocurricular()
    {
        return $this->belongsTo(Cocurricular::class);
    }

    /**
     * Mendapatkan data kelas untuk jadwal (terutama jadwal kokurikuler).
     */
    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    /**
     * Mendapatkan data guru pengampu untuk jadwal (terutama jadwal kokurikuler).
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}
