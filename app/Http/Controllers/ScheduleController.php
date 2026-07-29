<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Models\Schedule;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Display the Schedule Preview page.
     */
    public function index(): Response
    {
        $activeAcademicYearId = session('active_academic_year_id') ?? AcademicYear::where('is_active', true)->value('id');
        $activeSemesterId = session('active_semester_id') ?? Semester::where('is_active', true)->value('id');

        $schoolClasses = SchoolClass::with(['level'])
            ->when($activeAcademicYearId, function ($query, $activeAcademicYearId) {
                return $query->where('academic_year_id', $activeAcademicYearId);
            })
            ->orderBy('name')
            ->get();
            
        $teachers = Teacher::select('id', 'name', 'nip')->orderBy('name')->get();

        $schedules = Schedule::with([
            'teachingAssignment.schoolClass',
            'teachingAssignment.subject',
            'teachingAssignment.teacher'
        ])
          ->when($activeSemesterId, function ($query, $activeSemesterId) {
              return $query->where('semester_id', $activeSemesterId);
          })
          ->orderBy('day_of_week')
          ->orderBy('start_time')
          ->get();
          
        $teachingAssignments = TeachingAssignment::with(['schoolClass', 'subject', 'teacher'])
            ->when($activeSemesterId, function ($query, $activeSemesterId) {
                return $query->where('semester_id', $activeSemesterId);
            })
            ->get();

        return Inertia::render('Schedules/Index', [
            'schoolClasses' => $schoolClasses,
            'teachers' => $teachers,
            'schedules' => $schedules,
            'teachingAssignments' => $teachingAssignments,
            'canManageSchedules' => request()->user()->hasRole('admin') || request()->user()->hasPermissionTo('manage_schedules'),
        ]);
    }
}
