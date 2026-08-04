<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\Cocurricular;
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
            'teachingAssignment.teacher',
            'cocurricular.teachers',
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

        $subjects = Subject::orderBy('name')->get();

        $cocurriculars = Cocurricular::with(['level', 'teachers'])
            ->when($activeAcademicYearId, function ($query, $activeAcademicYearId) {
                return $query->where('academic_year_id', $activeAcademicYearId);
            })
            ->orderBy('title')
            ->get();

        // Detect existing conflicts in the database
        $existingConflicts = $this->detectExistingConflicts($schedules);

        return Inertia::render('Schedules/Index', [
            'schoolClasses' => $schoolClasses,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'schedules' => $schedules,
            'teachingAssignments' => $teachingAssignments,
            'cocurriculars' => $cocurriculars,
            'existingConflicts' => $existingConflicts,
            'canManageSchedules' => request()->user()->hasRole('admin') || request()->user()->hasPermissionTo('manage_schedules'),
        ]);
    }

    /**
     * Detect existing schedule conflicts in the loaded schedules.
     * Returns an array of conflict groups, each with a description and the IDs involved.
     */
    private function detectExistingConflicts($schedules)
    {
        $days = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];
        $conflicts = [];
        $reportedPairs = [];

        for ($i = 0; $i < count($schedules); $i++) {
            for ($j = $i + 1; $j < count($schedules); $j++) {
                $a = $schedules[$i];
                $b = $schedules[$j];

                // Must be on the same day
                if ($a->day_of_week != $b->day_of_week) continue;

                // Check time overlap (back-to-back is NOT a conflict)
                if ($a->start_time >= $b->end_time || $b->start_time >= $a->end_time) continue;

                // Get class IDs and teacher IDs for each schedule
                $aClassIds = [];
                $aTeacherIds = [];
                $bClassIds = [];
                $bTeacherIds = [];

                if (($a->schedule_type === 'regular' || !$a->schedule_type) && $a->teachingAssignment) {
                    $aClassIds = [$a->teachingAssignment->school_class_id];
                    $aTeacherIds = [$a->teachingAssignment->teacher_id];
                } elseif ($a->schedule_type === 'cocurricular' && $a->cocurricular) {
                    $aClassIds = $a->school_class_id ? [$a->school_class_id] : [];
                    $aTeacherIds = $a->teacher_id ? [$a->teacher_id] : [];
                }

                if (($b->schedule_type === 'regular' || !$b->schedule_type) && $b->teachingAssignment) {
                    $bClassIds = [$b->teachingAssignment->school_class_id];
                    $bTeacherIds = [$b->teachingAssignment->teacher_id];
                } elseif ($b->schedule_type === 'cocurricular' && $b->cocurricular) {
                    $bClassIds = $b->school_class_id ? [$b->school_class_id] : [];
                    $bTeacherIds = $b->teacher_id ? [$b->teacher_id] : [];
                }

                $classOverlap = array_intersect($aClassIds, $bClassIds);
                $teacherOverlap = array_intersect($aTeacherIds, $bTeacherIds);

                if (empty($classOverlap) && empty($teacherOverlap)) continue;

                // Prevent duplicate pair reports
                $pairKey = min($a->id, $b->id) . '-' . max($a->id, $b->id);
                if (in_array($pairKey, $reportedPairs)) continue;
                $reportedPairs[] = $pairKey;

                // Build human-readable description
                $dayName = $days[$a->day_of_week] ?? '?';
                $aName = $this->getScheduleLabel($a);
                $bName = $this->getScheduleLabel($b);
                $aTime = substr($a->start_time, 0, 5) . '-' . substr($a->end_time, 0, 5);
                $bTime = substr($b->start_time, 0, 5) . '-' . substr($b->end_time, 0, 5);

                $reason = '';
                if (!empty($classOverlap)) {
                    $reason = 'kelas sama';
                } elseif (!empty($teacherOverlap)) {
                    $reason = 'guru sama';
                }

                $conflicts[] = [
                    'schedule_ids' => [$a->id, $b->id],
                    'description' => "{$dayName}: \"{$aName}\" ({$aTime}) bentrok dengan \"{$bName}\" ({$bTime}) — {$reason}",
                ];
            }
        }

        return $conflicts;
    }

    /**
     * Get a human-readable label for a schedule.
     */
    private function getScheduleLabel($schedule)
    {
        if ($schedule->schedule_type === 'cocurricular' && $schedule->cocurricular) {
            return $schedule->cocurricular->title ?? 'Proyek Kokurikuler';
        }
        if ($schedule->teachingAssignment) {
            $subject = $schedule->teachingAssignment->subject->name ?? 'Mapel';
            $class = $schedule->teachingAssignment->schoolClass->name ?? 'Kelas';
            return "{$subject} ({$class})";
        }
        return 'Jadwal #' . $schedule->id;
    }
}
