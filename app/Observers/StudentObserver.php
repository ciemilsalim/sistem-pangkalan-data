<?php

namespace App\Observers;

use App\Models\Student;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class StudentObserver
{
    /**
     * Handle the Student "created" event.
     */
    public function created(Student $student): void
    {
        $this->syncClassHistory($student);
    }

    /**
     * Handle the Student "updated" event.
     */
    public function updated(Student $student): void
    {
        if ($student->isDirty('school_class_id')) {
            $this->syncClassHistory($student);
        }
    }

    /**
     * Sync the student's class history to class_student table.
     */
    protected function syncClassHistory(Student $student)
    {
        if (empty($student->school_class_id)) {
            return;
        }

        $semesterId = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
        $academicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        if ($semesterId) {
            DB::table('class_student')->updateOrInsert(
                [
                    'student_id' => $student->id,
                    'semester_id' => $semesterId,
                ],
                [
                    'school_class_id' => $student->school_class_id,
                    'academic_year_id' => $academicYearId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
