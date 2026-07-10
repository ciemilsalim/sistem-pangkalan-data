<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeachingAssignment extends Model
{
    use HasFactory;

    protected $fillable = ['school_class_id', 'subject_id', 'teacher_id', 'semester_id', 'academic_year_id'];

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

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}