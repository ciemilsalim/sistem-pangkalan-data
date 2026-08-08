<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\SubjectAttendance;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\TeachingAssignment;
use App\Models\Schedule;
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

        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        $classId = $request->input('class_id');
        $subjectId = $request->input('subject_id');
        
        $studentQuery = Student::where('status', 'aktif');
        if ($classId) {
            $studentQuery->where('school_class_id', $classId);
        }
        $totalStudents = $studentQuery->count();
        $fallbackTotalStudents = $totalStudents > 0 ? $totalStudents : 405; // Fallback

        // 1. Daily Class (Gate) Attendance Trend
        $classAttendanceTrend = $this->getClassAttendanceTrend($startDate, $endDate, $fallbackTotalStudents, $classId);

        // 2. Daily Subject Attendance Trend
        $subjectAttendanceTrend = $this->getSubjectAttendanceTrend($startDate, $endDate, $classId, $subjectId);

        // 3. Subject Attendance Average 
        $subjectAttendanceAverages = $this->getSubjectAttendanceAverages($startDate, $endDate, $classId, $subjectId);

        // Retrieve active academic year to filter classes
        $activeAcademicYear = \App\Models\AcademicYear::where('is_active', true)->first();
        $activeAcademicYearId = $activeAcademicYear ? $activeAcademicYear->id : null;
        
        $classesQuery = SchoolClass::select('id', 'name')->orderBy('name');
        if ($activeAcademicYearId) {
            $classesQuery->where('academic_year_id', $activeAcademicYearId);
        }

        return Inertia::render('Monitoring/Attendance/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'class_id' => $classId,
                'subject_id' => $subjectId,
            ],
            'options' => [
                'classes' => $classesQuery->get(),
                'subjects' => Subject::select('id', 'name')->orderBy('name')->get(),
            ],
            'charts' => [
                'class_attendance_trend' => $classAttendanceTrend,
                'subject_attendance_trend' => $subjectAttendanceTrend,
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
    private function getClassAttendanceTrend($startDate, $endDate, $totalStudents, $classId)
    {
        $datesQuery = Attendance::selectRaw('DATE(attendance_time) as date')
            ->whereDate('attendance_time', '>=', $startDate)
            ->whereDate('attendance_time', '<=', $endDate)
            ->whereRaw('DAYOFWEEK(attendance_time) NOT IN (1, 7)');
            
        if ($classId) {
            $datesQuery->whereHas('student', function($q) use ($classId) {
                $q->where('school_class_id', $classId);
            });
        }
            
        $dates = $datesQuery->groupBy('date')->orderBy('date', 'asc')->pluck('date')->toArray();

        $trend = [];
        if (count($dates) > 0) {
            foreach ($dates as $d) {
                $q = Attendance::whereDate('attendance_time', $d)->whereIn('status', ['tepat_waktu', 'terlambat']);
                if ($classId) {
                    $q->whereHas('student', function($sq) use ($classId) {
                        $sq->where('school_class_id', $classId);
                    });
                }
                $countPresent = $q->count();
                // Gunakan total seluruh siswa aktif, bukan total absen hari itu, agar % turun jika ada yang tidak tap kartu
                $rate = $totalStudents > 0 ? round(($countPresent / $totalStudents) * 100, 1) : 0;
                
                $dayName = date('D', strtotime($d));
                $dayTranslations = ['Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab', 'Thu' => 'Kam', 'Fri' => 'Jum'];
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
     * Get subject attendance trend between dates.
     */
    private function getSubjectAttendanceTrend($startDate, $endDate, $classId, $subjectId)
    {
        $datesQuery = SubjectAttendance::selectRaw('DATE(created_at) as date')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);
            
        if ($classId) {
            $datesQuery->whereHas('student', function($q) use ($classId) {
                $q->where('school_class_id', $classId);
            });
        }
        
        if ($subjectId) {
            $datesQuery->whereHas('schedule.teachingAssignment', function($q) use ($subjectId) {
                $q->where('subject_id', $subjectId);
            });
        }
            
        $dates = $datesQuery->groupBy('date')->orderBy('date', 'asc')->pluck('date')->toArray();

        $trend = [];
        if (count($dates) > 0) {
            foreach ($dates as $d) {
                // Total expected (number of attendance records created for that day)
                $qTotal = SubjectAttendance::whereDate('created_at', $d);
                if ($classId) {
                    $qTotal->whereHas('student', function($sq) use ($classId) {
                        $sq->where('school_class_id', $classId);
                    });
                }
                if ($subjectId) {
                    $qTotal->whereHas('schedule.teachingAssignment', function($sq) use ($subjectId) {
                        $sq->where('subject_id', $subjectId);
                    });
                }
                $totalForDay = $qTotal->count();
                
                $qPresent = clone $qTotal;
                $countPresent = $qPresent->where('status', 'hadir')->count();
                
                $rate = $totalForDay > 0 ? round(($countPresent / $totalForDay) * 100, 1) : 0;
                
                $dayName = date('D', strtotime($d));
                $dayTranslations = ['Mon'=>'Sen','Tue'=>'Sel','Wed'=>'Rab','Thu'=>'Kam','Fri'=>'Jum'];
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
    private function getSubjectAttendanceAverages($startDate, $endDate, $classId, $subjectId)
    {
        $averages = [];
        
        $subjectsQuery = Subject::query();
        if ($subjectId) {
            $subjectsQuery->where('id', $subjectId);
        }
        $subjects = $subjectsQuery->get();
        
        if ($subjects->count() > 0) {
            foreach ($subjects as $subject) {
                $assignmentIds = TeachingAssignment::where('subject_id', $subject->id)->pluck('id');
                $scheduleIds = Schedule::whereIn('teaching_assignment_id', $assignmentIds)->pluck('id');
                
                if ($scheduleIds->count() > 0) {
                    $qTotal = SubjectAttendance::whereIn('schedule_id', $scheduleIds)
                        ->whereDate('created_at', '>=', $startDate)
                        ->whereDate('created_at', '<=', $endDate);
                        
                    if ($classId) {
                        $qTotal->whereHas('student', function($sq) use ($classId) {
                            $sq->where('school_class_id', $classId);
                        });
                    }
                    
                    $totalSubjectAttendance = $qTotal->count();
                    
                    $qPresent = clone $qTotal;
                    $presentSubjectAttendance = $qPresent->where('status', 'hadir')->count();
                        
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
        
        usort($averages, function($a, $b) {
            return $a['percentage'] <=> $b['percentage'];
        });
        
        return array_slice($averages, 0, 15);
    }
}
