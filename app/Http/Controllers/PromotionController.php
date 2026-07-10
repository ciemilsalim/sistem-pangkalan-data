<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentClassHistory;
use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $schoolClasses = SchoolClass::with('level')->orderBy('level_id')->orderBy('name')->get();
        return Inertia::render('Curriculum/Promotions/Index', [
            'schoolClasses' => $schoolClasses,
        ]);
    }

    public function getStudents(Request $request)
    {
        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $students = Student::where('school_class_id', $request->school_class_id)
            ->where('status', 'aktif')
            ->orderBy('name')
            ->get(['id', 'name', 'nis']);

        return response()->json($students);
    }

    public function process(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'action_type' => 'required|in:promote,graduate',
            'destination_class_id' => 'required_if:action_type,promote',
        ]);

        $activeAcademicYearId = session('active_academic_year_id') ?? Semester::where('is_active', true)->value('academic_year_id');

        DB::beginTransaction();
        try {
            foreach ($request->student_ids as $studentId) {
                $student = Student::findOrFail($studentId);
                $oldClassId = $student->school_class_id;

                if ($request->action_type === 'graduate') {
                    $student->status = 'lulus';
                    $student->school_class_id = null;
                    $student->save();
                    
                    // Nonaktifkan user
                    if ($student->user) {
                        $student->user->is_active = false;
                        $student->user->save();
                    }

                    // Catat historis lulus
                    StudentClassHistory::create([
                        'student_id' => $student->id,
                        'school_class_id' => $oldClassId,
                        'academic_year_id' => $activeAcademicYearId,
                        'end_date' => now(),
                        'status_reason' => 'Lulus',
                    ]);

                } elseif ($request->action_type === 'promote') {
                    $student->school_class_id = $request->destination_class_id;
                    $student->save();

                    // Catat historis pindah/naik kelas
                    StudentClassHistory::create([
                        'student_id' => $student->id,
                        'school_class_id' => $oldClassId,
                        'academic_year_id' => $activeAcademicYearId,
                        'end_date' => now(),
                        'status_reason' => 'Pindah/Naik Kelas',
                    ]);
                    
                    StudentClassHistory::create([
                        'student_id' => $student->id,
                        'school_class_id' => $request->destination_class_id,
                        'academic_year_id' => $activeAcademicYearId,
                        'start_date' => now(),
                        'status_reason' => 'Masuk Kelas',
                    ]);
                }
            }
            DB::commit();
            return redirect()->back()->with('message', 'Proses berhasil dilakukan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal memproses data: ' . $e->getMessage()]);
        }
    }
}
