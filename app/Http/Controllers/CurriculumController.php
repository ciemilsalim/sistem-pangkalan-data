<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\Level;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Schedule;
use App\Models\TeachingAssignment;
use App\Models\Extracurricular;
use App\Models\Cocurricular;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumController extends Controller
{
    /**
     * Display a listing of all curriculum components.
     */
    public function index(): Response
    {
        $activeAcademicYearId = session('active_academic_year_id') ?? AcademicYear::where('is_active', true)->value('id');
        $activeSemesterId = session('active_semester_id') ?? Semester::where('is_active', true)->value('id');

        $academicYears = AcademicYear::with('semesters')->orderBy('name', 'desc')->get();
        $semesters = Semester::with('academicYear')->orderBy('name')->get();
        $levels = Level::orderBy('name')->get();
        
        $schoolClasses = SchoolClass::with(['level', 'homeroomTeacher'])
            ->when($activeAcademicYearId, function ($query, $activeAcademicYearId) {
                return $query->where('academic_year_id', $activeAcademicYearId);
            })
            ->orderBy('name')
            ->get();
            
        $subjects = Subject::orderBy('name')->get();
        
        // Fetch teachers list for class homeroom selection (id and name only)
        $teachers = Teacher::select('id', 'name', 'nip')->orderBy('name')->get();

        // Fetch schedules eager loading related assignment data, filtered by active semester
        $schedules = Schedule::with([
            'teachingAssignment.schoolClass',
            'teachingAssignment.subject',
            'teachingAssignment.teacher',
            'cocurricular',
            'schoolClass',
            'teacher'
        ])
          ->when($activeSemesterId, function ($query, $activeSemesterId) {
              return $query->where('semester_id', $activeSemesterId);
          })
          ->orderBy('day_of_week')
          ->orderBy('start_time')
          ->get();

        // Fetch extracurriculars with coach and students, filtered by active academic year
        $extracurriculars = Extracurricular::with(['coach', 'students'])
            ->when($activeAcademicYearId, function ($query, $activeAcademicYearId) {
                return $query->where('academic_year_id', $activeAcademicYearId);
            })
            ->orderBy('name')
            ->get();

        // Fetch students list for extracurricular member selection (id, name, nis, and class)
        // Hanya tampilkan siswa dengan status 'aktif'
        $studentsList = Student::with('schoolClass:id,name')
            ->where('status', 'aktif')
            ->select('id', 'name', 'nis', 'school_class_id')
            ->orderBy('name')
            ->get();

        // Fetch cocurriculars with relations
        $cocurriculars = Cocurricular::with(['level', 'teachers', 'schoolClasses'])
            ->when($activeAcademicYearId, function ($query, $activeAcademicYearId) {
                return $query->where('academic_year_id', $activeAcademicYearId);
            })
            ->orderBy('title')
            ->get();

        return Inertia::render('Curriculum/Index', [
            'academicYears' => $academicYears,
            'semesters' => $semesters,
            'levels' => $levels,
            'schoolClasses' => $schoolClasses,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'schedules' => $schedules,
            'extracurriculars' => $extracurriculars,
            'cocurriculars' => $cocurriculars,
            'studentsList' => $studentsList,
            'flash' => [
                'message' => session('message'),
            ]
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /*                             1. ACADEMIC YEARS                              */
    /* -------------------------------------------------------------------------- */

    public function storeAcademicYear(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name',
            'is_active' => 'required|boolean',
        ]);

        if ($request->is_active) {
            // Deactivate all other academic years
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        AcademicYear::create([
            'name' => $request->name,
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Tahun Akademik berhasil ditambahkan.');
    }

    public function updateAcademicYear(Request $request, AcademicYear $academicYear): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $academicYear->id,
            'is_active' => 'required|boolean',
        ]);

        if ($request->is_active) {
            // Deactivate all other academic years
            AcademicYear::where('id', '!=', $academicYear->id)->where('is_active', true)->update(['is_active' => false]);
        }

        $academicYear->update([
            'name' => $request->name,
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Tahun Akademik berhasil diperbarui.');
    }

    public function destroyAcademicYear(AcademicYear $academicYear): RedirectResponse
    {
        // Check if has semesters
        if ($academicYear->semesters()->count() > 0) {
            return redirect()->route('curriculum.index')->withErrors([
                'error' => 'Tahun akademik tidak dapat dihapus karena masih memiliki data semester terkait.',
            ]);
        }

        $academicYear->delete();

        return redirect()->route('curriculum.index')->with('message', 'Tahun Akademik berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                                2. SEMESTERS                                */
    /* -------------------------------------------------------------------------- */

    public function storeSemester(Request $request): RedirectResponse
    {
        $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
        ]);

        if ($request->is_active) {
            // Deactivate all other semesters in the system
            Semester::where('is_active', true)->update(['is_active' => false]);
        }

        Semester::create([
            'academic_year_id' => $request->academic_year_id,
            'name' => $request->name,
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Semester berhasil ditambahkan.');
    }

    public function updateSemester(Request $request, Semester $semester): RedirectResponse
    {
        $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
        ]);

        if ($request->is_active) {
            // Deactivate all other semesters in the system
            Semester::where('id', '!=', $semester->id)->where('is_active', true)->update(['is_active' => false]);
        }

        $semester->update([
            'academic_year_id' => $request->academic_year_id,
            'name' => $request->name,
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Semester berhasil diperbarui.');
    }

    public function destroySemester(Semester $semester): RedirectResponse
    {
        $semester->delete();

        return redirect()->route('curriculum.index')->with('message', 'Semester berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                                  3. LEVELS                                 */
    /* -------------------------------------------------------------------------- */

    public function storeLevel(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:levels,name',
        ]);

        Level::create([
            'name' => $request->name,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Tingkat Kelas berhasil ditambahkan.');
    }

    public function updateLevel(Request $request, Level $level): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:levels,name,' . $level->id,
        ]);

        $level->update([
            'name' => $request->name,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Tingkat Kelas berhasil diperbarui.');
    }

    public function destroyLevel(Level $level): RedirectResponse
    {
        // Check if level has classes
        if ($level->schoolClasses()->count() > 0) {
            return redirect()->route('curriculum.index')->withErrors([
                'error' => 'Tingkat tidak dapat dihapus karena masih memiliki kelas terkait.',
            ]);
        }

        $level->delete();

        return redirect()->route('curriculum.index')->with('message', 'Tingkat Kelas berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                               4. SCHOOL CLASSES                            */
    /* -------------------------------------------------------------------------- */

    public function storeSchoolClass(Request $request): RedirectResponse
    {
        $activeSemesterId = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('school_classes', 'name')->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                    return $query->where('academic_year_id', $activeAcademicYearId)
                                 ->where('semester_id', $activeSemesterId);
                }),
            ],
            'level_id' => 'required|exists:levels,id',
            'teacher_id' => [
                'nullable', 'exists:teachers,id',
                Rule::unique('school_classes', 'teacher_id')->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                    return $query->where('academic_year_id', $activeAcademicYearId)
                                 ->where('semester_id', $activeSemesterId);
                }),
            ],
        ]);

        SchoolClass::create([
            'name' => $request->name,
            'level_id' => $request->level_id,
            'teacher_id' => $request->teacher_id,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Kelas berhasil ditambahkan.');
    }

    public function updateSchoolClass(Request $request, SchoolClass $schoolClass): RedirectResponse
    {
        $activeSemesterId = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('school_classes', 'name')->ignore($schoolClass->id)->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                    return $query->where('academic_year_id', $activeAcademicYearId)
                                 ->where('semester_id', $activeSemesterId);
                }),
            ],
            'level_id' => 'required|exists:levels,id',
            'teacher_id' => [
                'nullable', 'exists:teachers,id',
                Rule::unique('school_classes', 'teacher_id')->ignore($schoolClass->id)->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                    return $query->where('academic_year_id', $activeAcademicYearId)
                                 ->where('semester_id', $activeSemesterId);
                }),
            ],
        ]);

        $schoolClass->update([
            'name' => $request->name,
            'level_id' => $request->level_id,
            'teacher_id' => $request->teacher_id,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Kelas berhasil diperbarui.');
    }

    public function destroySchoolClass(SchoolClass $schoolClass): RedirectResponse
    {
        // Check if class has students
        if ($schoolClass->students()->count() > 0) {
            return redirect()->route('curriculum.index')->withErrors([
                'error' => 'Kelas tidak dapat dihapus karena masih memiliki siswa terdaftar didalamnya.',
            ]);
        }

        $schoolClass->delete();

        return redirect()->route('curriculum.index')->with('message', 'Kelas berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                                 5. SUBJECTS                                */
    /* -------------------------------------------------------------------------- */

    public function storeSubject(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'description' => 'nullable|string',
        ]);

        Subject::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Mata Pelajaran berhasil ditambahkan.');
    }

    public function updateSubject(Request $request, Subject $subject): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
        ]);

        $subject->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        return redirect()->route('curriculum.index')->with('message', 'Mata Pelajaran berhasil diperbarui.');
    }

    public function destroySubject(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return redirect()->route('curriculum.index')->with('message', 'Mata Pelajaran berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                                6. SCHEDULES                                */
    /* -------------------------------------------------------------------------- */

    private function checkScheduleConflict($dayOfWeek, $startTime, $endTime, $semesterId, $schoolClassId, $teacherId, $ignoreScheduleId = null)
    {
        // Find any schedule in the same semester and day that overlaps in time
        // Back-to-back schedules (end_time == start_time) are NOT considered conflicts
        $query = Schedule::where('semester_id', $semesterId)
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            })->with([
                'teachingAssignment.schoolClass',
                'teachingAssignment.subject',
                'teachingAssignment.teacher',
                'cocurricular',
                'schoolClass',
                'teacher'
            ]);

        if ($ignoreScheduleId) {
            $query->where('id', '!=', $ignoreScheduleId);
        }

        $conflicts = $query->get();

        foreach ($conflicts as $conflict) {
            $conflictTime = substr($conflict->start_time, 0, 5) . '-' . substr($conflict->end_time, 0, 5);

            if (($conflict->schedule_type === 'regular' || !$conflict->schedule_type) && $conflict->teachingAssignment) {
                $ta = $conflict->teachingAssignment;

                if ($ta->school_class_id == $schoolClassId) {
                    $className = $ta->schoolClass->name ?? 'Kelas';
                    $subjectName = $ta->subject->name ?? 'Mapel';
                    return "Kelas {$className} sudah memiliki jadwal {$subjectName} pada jam {$conflictTime}.";
                }
                if ($ta->teacher_id == $teacherId) {
                    $teacherName = $ta->teacher->name ?? 'Guru';
                    $className = $ta->schoolClass->name ?? 'Kelas';
                    return "Guru {$teacherName} sudah dijadwalkan di {$className} pada jam {$conflictTime}.";
                }
            } elseif ($conflict->schedule_type === 'cocurricular' && $conflict->cocurricular) {
                if ($conflict->school_class_id == $schoolClassId) {
                    $className = $conflict->schoolClass->name ?? 'Kelas';
                    return "Kelas {$className} sudah memiliki jadwal proyek kokurikuler \"{$conflict->cocurricular->title}\" pada jam {$conflictTime}.";
                }
                if ($conflict->teacher_id == $teacherId) {
                    $teacherName = $conflict->teacher->name ?? 'Guru';
                    return "Guru {$teacherName} sudah menjadi fasilitator proyek \"{$conflict->cocurricular->title}\" pada jam {$conflictTime}.";
                }
            }
        }

        return null; // No conflict
    }

    public function storeSchedule(Request $request): RedirectResponse
    {
        $request->validate([
            'schedule_type' => 'required|in:regular,cocurricular',
            'day_of_week' => 'required|integer|between:1,7',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required_if:schedule_type,regular|nullable|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'cocurricular_id' => 'required_if:schedule_type,cocurricular|nullable|exists:cocurriculars,id',
        ]);

        $activeSemesterId = session('active_semester_id') ?? Semester::where('is_active', true)->value('id');
        $schoolClassId = $request->school_class_id;
        $teacherId = $request->teacher_id;

        // Check Conflict
        $conflictError = $this->checkScheduleConflict(
            $request->day_of_week, 
            $request->start_time, 
            $request->end_time, 
            $activeSemesterId, 
            $schoolClassId, 
            $teacherId
        );

        if ($conflictError) {
            return redirect()->back()->withErrors(['error' => $conflictError])->withInput();
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            if ($request->schedule_type === 'regular') {
                // Find or create TeachingAssignment
                $assignment = TeachingAssignment::firstOrCreate(
                    [
                        'school_class_id' => $request->school_class_id,
                        'subject_id' => $request->subject_id,
                    ],
                    [
                        'teacher_id' => $request->teacher_id,
                    ]
                );

                // If the teacher has changed, update it to the newly selected teacher
                if ($assignment->teacher_id != $request->teacher_id) {
                    $assignment->update(['teacher_id' => $request->teacher_id]);
                }

                Schedule::create([
                    'schedule_type' => 'regular',
                    'teaching_assignment_id' => $assignment->id,
                    'cocurricular_id' => null,
                    'day_of_week' => $request->day_of_week,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                ]);
            } else {
                Schedule::create([
                    'schedule_type' => 'cocurricular',
                    'teaching_assignment_id' => null,
                    'cocurricular_id' => $request->cocurricular_id,
                    'day_of_week' => $request->day_of_week,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'school_class_id' => $request->school_class_id,
                    'teacher_id' => $request->teacher_id,
                ]);
            }
        });

        return redirect()->back()->with('message', 'Jadwal Pelajaran berhasil ditambahkan.');
    }

    public function updateSchedule(Request $request, Schedule $schedule): RedirectResponse
    {
        $request->validate([
            'schedule_type' => 'required|in:regular,cocurricular',
            'day_of_week' => 'required|integer|between:1,7',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required_if:schedule_type,regular|nullable|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'cocurricular_id' => 'required_if:schedule_type,cocurricular|nullable|exists:cocurriculars,id',
        ]);

        $activeSemesterId = session('active_semester_id') ?? Semester::where('is_active', true)->value('id');
        $schoolClassId = $request->school_class_id;
        $teacherId = $request->teacher_id;

        // Check Conflict
        $conflictError = $this->checkScheduleConflict(
            $request->day_of_week, 
            $request->start_time, 
            $request->end_time, 
            $activeSemesterId, 
            $schoolClassId, 
            $teacherId,
            $schedule->id
        );

        if ($conflictError) {
            return redirect()->back()->withErrors(['error' => $conflictError])->withInput();
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $schedule) {
            if ($request->schedule_type === 'regular') {
                // Find or create TeachingAssignment
                $assignment = TeachingAssignment::firstOrCreate(
                    [
                        'school_class_id' => $request->school_class_id,
                        'subject_id' => $request->subject_id,
                    ],
                    [
                        'teacher_id' => $request->teacher_id,
                    ]
                );

                // If the teacher has changed, update it to the newly selected teacher
                if ($assignment->teacher_id != $request->teacher_id) {
                    $assignment->update(['teacher_id' => $request->teacher_id]);
                }

                // Update Schedule attributes
                $schedule->update([
                    'schedule_type' => 'regular',
                    'teaching_assignment_id' => $assignment->id,
                    'cocurricular_id' => null,
                    'day_of_week' => $request->day_of_week,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                ]);
            } else {
                $schedule->update([
                    'schedule_type' => 'cocurricular',
                    'teaching_assignment_id' => null,
                    'cocurricular_id' => $request->cocurricular_id,
                    'day_of_week' => $request->day_of_week,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'school_class_id' => $request->school_class_id,
                    'teacher_id' => $request->teacher_id,
                ]);
            }
        });

        return redirect()->back()->with('message', 'Jadwal Pelajaran berhasil diperbarui.');
    }

    public function destroySchedule(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();
        return redirect()->back()->with('message', 'Jadwal Pelajaran berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                             7. EXTRACURRICULARS                            */
    /* -------------------------------------------------------------------------- */

    public function storeExtracurricular(Request $request): RedirectResponse
    {
        $activeSemesterId = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('extracurriculars', 'name')->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                    return $query->where('academic_year_id', $activeAcademicYearId)
                                 ->where('semester_id', $activeSemesterId);
                }),
            ],
            'description' => 'nullable|string',
            'teacher_id' => 'nullable|exists:teachers,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $extracurricular = Extracurricular::create([
                'name' => $request->name,
                'description' => $request->description,
                'teacher_id' => $request->teacher_id ? $request->teacher_id : null,
            ]);

            if ($request->filled('student_ids')) {
                $extracurricular->students()->sync($request->student_ids);
            }
        });

        return redirect()->route('curriculum.index')->with('message', 'Ekstrakurikuler berhasil ditambahkan.');
    }

    public function updateExtracurricular(Request $request, Extracurricular $extracurricular): RedirectResponse
    {
        $activeSemesterId = session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id');
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('extracurriculars', 'name')->ignore($extracurricular->id)->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                    return $query->where('academic_year_id', $activeAcademicYearId)
                                 ->where('semester_id', $activeSemesterId);
                }),
            ],
            'description' => 'nullable|string',
            'teacher_id' => 'nullable|exists:teachers,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $extracurricular) {
            $extracurricular->update([
                'name' => $request->name,
                'description' => $request->description,
                'teacher_id' => $request->teacher_id ? $request->teacher_id : null,
            ]);

            $studentIds = $request->input('student_ids', []);
            $extracurricular->students()->sync($studentIds);
        });

        return redirect()->route('curriculum.index')->with('message', 'Ekstrakurikuler berhasil diperbarui.');
    }

    public function destroyExtracurricular(Extracurricular $extracurricular): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($extracurricular) {
            $extracurricular->students()->detach();
            $extracurricular->delete();
        });

        return redirect()->route('curriculum.index')->with('message', 'Ekstrakurikuler berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                         COCURRICULAR (KOKURIKULER)                         */
    /* -------------------------------------------------------------------------- */

    public function storeCocurricular(Request $request): RedirectResponse
    {
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');

        $request->validate([
            'level_id' => 'required|exists:levels,id',
            'code' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'activity_type' => 'required|in:pembelajaran_kolaboratif,7kaih,cara_lainnya',
            'dimensions' => 'nullable|array',
            'time_allocation' => 'required|integer|min:0',
            'learning_objectives' => 'nullable|string',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:teachers,id',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $activeAcademicYearId) {
            $cocurricular = Cocurricular::create([
                'academic_year_id' => $activeAcademicYearId,
                'level_id' => $request->level_id,
                'code' => $request->code,
                'title' => $request->title,
                'activity_type' => $request->activity_type,
                'dimensions' => $request->dimensions,
                'time_allocation' => $request->time_allocation,
                'learning_objectives' => $request->learning_objectives,
            ]);

            $cocurricular->teachers()->sync($request->input('teacher_ids', []));
        });

        return redirect()->route('curriculum.index')->with('message', 'Proyek Kokurikuler berhasil ditambahkan.');
    }

    public function updateCocurricular(Request $request, Cocurricular $cocurricular): RedirectResponse
    {
        $request->validate([
            'level_id' => 'required|exists:levels,id',
            'code' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'activity_type' => 'required|in:pembelajaran_kolaboratif,7kaih,cara_lainnya',
            'dimensions' => 'nullable|array',
            'time_allocation' => 'required|integer|min:0',
            'learning_objectives' => 'nullable|string',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:teachers,id',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $cocurricular) {
            $cocurricular->update([
                'level_id' => $request->level_id,
                'code' => $request->code,
                'title' => $request->title,
                'activity_type' => $request->activity_type,
                'dimensions' => $request->dimensions,
                'time_allocation' => $request->time_allocation,
                'learning_objectives' => $request->learning_objectives,
            ]);

            $cocurricular->teachers()->sync($request->input('teacher_ids', []));
        });

        return redirect()->route('curriculum.index')->with('message', 'Proyek Kokurikuler berhasil diperbarui.');
    }

    public function destroyCocurricular(Cocurricular $cocurricular): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($cocurricular) {
            $cocurricular->teachers()->detach();
            $cocurricular->delete();
        });

        return redirect()->route('curriculum.index')->with('message', 'Proyek Kokurikuler berhasil dihapus.');
    }
}
