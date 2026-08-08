<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\SubjectAttendance;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceMonitoringController extends Controller
{
    /**
     * Display the attendance monitoring dashboard.
     */
    public function index(Request $request)
    {
        if (!\Illuminate\Support\Facades\Auth::user()->hasAnyRole(['admin', 'wakasek_kurikulum'])) {
            abort(403, 'Anda tidak memiliki hak akses ke halaman monitoring kehadiran.');
        }

        // Default to last 30 days if no date range is provided
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        
        $totalStudents = Student::count();
        $fallbackTotalStudents = $totalStudents > 0 ? $totalStudents : 405; // Fallback for empty DB

        // 1. Daily Class Attendance Trend
        $classAttendanceTrend = $this->getClassAttendanceTrend($startDate, $endDate, $fallbackTotalStudents);

        // 2. Subject Attendance Average 
        $subjectAttendanceAverages = $this->getSubjectAttendanceAverages($startDate, $endDate);

        return Inertia::render('Monitoring/Attendance/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'charts' => [
                'class_attendance_trend' => $classAttendanceTrend,
                'subject_attendance_averages' => $subjectAttendanceAverages,
            ],
            'stats' => [
                'total_students' => $totalStudents,
            ]
        ]);
    }

    /**
     * Get class attendance trend between dates.
     */
    private function getClassAttendanceTrend($startDate, $endDate, $totalStudents)
    {
        $datesQuery = Attendance::selectRaw('DATE(attendance_time) as date')
            ->whereDate('attendance_time', '>=', $startDate)
            ->whereDate('attendance_time', '<=', $endDate)
            ->whereRaw('DAYOFWEEK(attendance_time) NOT IN (1, 7)')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->pluck('date')
            ->toArray();

        $trend = [];

        if (count($datesQuery) > 0) {
            foreach ($datesQuery as $d) {
                $totalForDay = Attendance::whereDate('attendance_time', $d)->count();
                $countPresent = Attendance::whereDate('attendance_time', $d)
                    ->whereIn('status', ['tepat_waktu', 'terlambat'])
                    ->count();
                
                $rate = $totalForDay > 0 ? round(($countPresent / $totalForDay) * 100, 1) : 0;
                
                $dayName = date('D', strtotime($d));
                $dayTranslations = [
                    'Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab', 
                    'Thu' => 'Kam', 'Fri' => 'Jum'
                ];
                $dayLabel = isset($dayTranslations[$dayName]) ? $dayTranslations[$dayName] : $dayName;
                
                $trend[] = [
                    'date' => $d,
                    'day' => $dayLabel . ' (' . date('d/m', strtotime($d)) . ')',
                    'percentage' => $rate,
                ];
            }
        }

        return $trend;
    }

    /**
     * Get subject attendance averages between dates.
     */
    private function getSubjectAttendanceAverages($startDate, $endDate)
    {
        $averages = [];
        
        $subjects = Subject::all();
        
        if ($subjects->count() > 0) {
            foreach ($subjects as $subject) {
                // Find teaching assignments for this subject
                $assignmentIds = \App\Models\TeachingAssignment::where('subject_id', $subject->id)->pluck('id');
                
                // Find schedules for those assignments
                $scheduleIds = \App\Models\Schedule::whereIn('teaching_assignment_id', $assignmentIds)->pluck('id');
                
                if ($scheduleIds->count() > 0) {
                    $totalSubjectAttendance = SubjectAttendance::whereIn('schedule_id', $scheduleIds)
                        ->whereDate('created_at', '>=', $startDate)
                        ->whereDate('created_at', '<=', $endDate)
                        ->count();
                        
                    $presentSubjectAttendance = SubjectAttendance::whereIn('schedule_id', $scheduleIds)
                        ->whereDate('created_at', '>=', $startDate)
                        ->whereDate('created_at', '<=', $endDate)
                        ->where('status', 'hadir')
                        ->count();
                        
                    if ($totalSubjectAttendance > 0) {
                        $rate = round(($presentSubjectAttendance / $totalSubjectAttendance) * 100, 1);
                        $averages[] = [
                            'subject' => $subject->name,
                            'percentage' => $rate,
                            'total_records' => $totalSubjectAttendance
                        ];
                    }
                }
            }
        }
        
        // Sort by percentage ascending to see worst performing subjects first
        usort($averages, function($a, $b) {
            return $a['percentage'] <=> $b['percentage'];
        });
        
        // Limit to top 15 worst performing for the chart to not be overcrowded
        return array_slice($averages, 0, 15);
    }
}
