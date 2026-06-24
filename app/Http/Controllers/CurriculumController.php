<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\Level;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumController extends Controller
{
    /**
     * Display a listing of all curriculum components.
     */
    public function index(): Response
    {
        $academicYears = AcademicYear::with('semesters')->orderBy('name', 'desc')->get();
        $semesters = Semester::with('academicYear')->orderBy('name')->get();
        $levels = Level::orderBy('name')->get();
        $schoolClasses = SchoolClass::with(['level', 'homeroomTeacher'])->orderBy('name')->get();
        $subjects = Subject::orderBy('name')->get();
        
        // Fetch teachers list for class homeroom selection (id and name only)
        $teachers = Teacher::select('id', 'name', 'nip')->orderBy('name')->get();

        return Inertia::render('Curriculum/Index', [
            'academicYears' => $academicYears,
            'semesters' => $semesters,
            'levels' => $levels,
            'schoolClasses' => $schoolClasses,
            'subjects' => $subjects,
            'teachers' => $teachers,
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
        $request->validate([
            'name' => 'required|string|max:255|unique:school_classes,name',
            'level_id' => 'required|exists:levels,id',
            'teacher_id' => 'nullable|exists:teachers,id',
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
        $request->validate([
            'name' => 'required|string|max:255|unique:school_classes,name,' . $schoolClass->id,
            'level_id' => 'required|exists:levels,id',
            'teacher_id' => 'nullable|exists:teachers,id',
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
}
