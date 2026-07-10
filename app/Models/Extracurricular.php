<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Extracurricular extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'teacher_id', 'semester_id', 'academic_year_id'];

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

    public function coach()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'extracurricular_student');
    }

    public function attendances()
    {
        return $this->hasMany(ExtracurricularAttendance::class);
    }
}
