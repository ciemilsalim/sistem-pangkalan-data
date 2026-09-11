<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentMutation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'type',
        'academic_year_id',
        'semester_id',
        'mutation_date',
        'reference_number',
        'school_name',
        'school_npsn',
        'school_city',
        'school_province',
        'school_class_id',
        'reason',
        'parent_name',
        'parent_phone',
        'letter_number_destination',
        'letter_date',
        'document_file',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'mutation_date' => 'date',
        'letter_date' => 'date',
    ];

    protected $appends = ['document_url'];

    public function getDocumentUrlAttribute()
    {
        if ($this->document_file) {
            return asset('storage/' . $this->document_file);
        }
        return null;
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
