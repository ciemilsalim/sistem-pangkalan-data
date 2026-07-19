<?php
// File: app/Models/SchoolClass.php (Diperbarui)
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolClass extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = ['name', 'teacher_id', 'level_id', 'semester_id', 'academic_year_id']; 

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

    public function students() 
    { 
        return $this->hasMany(Student::class); 
    }

    // Relasi ke guru sebagai wali kelas
    public function homeroomTeacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
    
    // Relasi ke penugasan mengajar
    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    /**
     * TAMBAHKAN FUNGSI INI
     * Mendefinisikan relasi ke model Level (Tingkat Kelas).
     */
    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
