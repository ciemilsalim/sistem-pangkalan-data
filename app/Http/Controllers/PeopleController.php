<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    /**
     * Display a listing of all people components.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'students');
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);

        // Fetch School Classes for student dropdown selection (only active academic year)
        $activeAcademicYearId = session('active_academic_year_id') ?? \App\Models\Semester::where('is_active', true)->value('academic_year_id');
        $schoolClasses = SchoolClass::where('academic_year_id', $activeAcademicYearId)->orderBy('name')->get();

        // Fetch all parents for student creation dropdown (id and name only)
        $parentsList = ParentModel::select('id', 'name')->orderBy('name')->get();

        // Fetch all students for parent creation dropdown (id and name only)
        $studentsList = Student::select('id', 'name', 'nis')->orderBy('name')->get();

        // Fetch all subjects for teacher creation dropdown (id and name only)
        $subjectsList = Subject::select('id', 'name', 'code')->orderBy('name')->get();

        // Initialize variables for paginated datasets
        $students = null;
        $teachers = null;
        $parents = null;

        // Load data depending on active tab or load all paginated safely
        if ($tab === 'students') {
            $studentStatus = $request->input('student_status', 'aktif');
            $schoolClassId = $request->input('school_class_id', '');
            $query = Student::with(['user', 'schoolClass', 'parents']);
            
            if ($studentStatus === 'aktif') {
                $query->where('status', 'aktif');
            } elseif ($studentStatus === 'lulus_pindah') {
                $query->whereIn('status', ['lulus', 'pindah']);
            } elseif ($studentStatus === 'berhenti') {
                $query->where('status', 'keluar');
            } else {
                // If somehow it's something else, fall back to aktif
                $query->where('status', 'aktif');
            }

            if (!empty($schoolClassId)) {
                $query->where('school_class_id', $schoolClassId);
            }

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nis', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('email', 'like', "%{$search}%");
                      });
                });
            }
            $students = $query->orderBy('name')->paginate($perPage)->withQueryString();
        } else {
            $students = Student::with(['user', 'schoolClass'])->where('status', 'aktif')->orderBy('name')->limit(10)->get();
        }

        if ($tab === 'teachers') {
            $query = Teacher::with(['user', 'subjects']);
            if (!empty($search)) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('email', 'like', "%{$search}%");
                      });
            }
            $teachers = $query->orderBy('name')->paginate($perPage)->withQueryString();
        } else {
            $teachers = Teacher::with(['user', 'subjects'])->orderBy('name')->limit(10)->get();
        }

        if ($tab === 'parents') {
            $query = ParentModel::with(['user', 'students']);
            if (!empty($search)) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('email', 'like', "%{$search}%");
                      });
            }
            $parents = $query->orderBy('name')->paginate($perPage)->withQueryString();
        } else {
            $parents = ParentModel::with(['user'])->orderBy('name')->limit(10)->get();
        }

        return Inertia::render('People/Index', [
            'students' => $students,
            'teachers' => $teachers,
            'parents' => $parents,
            'schoolClasses' => $schoolClasses,
            'parentsList' => $parentsList,
            'studentsList' => $studentsList,
            'subjectsList' => $subjectsList,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'per_page' => $perPage,
                'student_status' => $request->input('student_status', 'aktif'),
                'school_class_id' => $request->input('school_class_id', '')
            ],
            'flash' => [
                'message' => session('message'),
            ]
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /*                                 1. STUDENTS                                */
    /* -------------------------------------------------------------------------- */

    public function storeStudent(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nis' => 'required|string|max:50|unique:students,nis',
            'learning_email' => 'nullable|string|email|max:255|unique:students,learning_email',
            'school_class_id' => 'required|exists:school_classes,id',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:parents,id',
            'photo' => 'nullable|image|max:2048',
        ]);

        DB::transaction(function () use ($request) {
            // Create user first
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
            ]);

            // Create student linked to the user
            $student = Student::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'nis' => $request->nis,
                'learning_email' => $request->learning_email,
                'school_class_id' => $request->school_class_id,
            ]);

            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('student_photos', 'public');
                $student->update(['photo' => $photoPath]);
            }

            // Sync parents if provided
            if ($request->filled('parent_ids')) {
                $student->parents()->sync($request->parent_ids);
            }
        });

        return redirect()->route('people.index', ['tab' => 'students'])->with('message', 'Siswa berhasil ditambahkan.');
    }

    public function downloadTemplate()
    {
        $file = public_path('templates/import_siswa.csv');
        $headers = [
            'Content-Type' => 'text/csv',
        ];
        return response()->download($file, 'import_siswa.csv', $headers);
    }

    public function importStudent(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\StudentsImport, $request->file('file'));
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errorMessages = [];
            foreach ($failures as $failure) {
                $errorMessages[] = 'Baris ' . $failure->row() . ': ' . implode(', ', $failure->errors()) . ' (Nilai: ' . $failure->values()[$failure->attribute()] . ')';
            }
            return redirect()->route('people.index', ['tab' => 'students'])->withErrors(['import_errors' => implode(" | ", $errorMessages)]);
        } catch (\Exception $e) {
            return redirect()->route('people.index', ['tab' => 'students'])->withErrors(['import_errors' => 'Gagal mengimpor file: ' . $e->getMessage()]);
        }

        return redirect()->route('people.index', ['tab' => 'students'])->with('message', 'Data siswa berhasil diimpor!');
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nis' => 'required|string|max:50|unique:students,nis,' . $student->id,
            'learning_email' => 'nullable|string|email|max:255|unique:students,learning_email,' . $student->id,
            'school_class_id' => 'required|exists:school_classes,id',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id,
            'status' => 'required|in:aktif,lulus,pindah,keluar',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:parents,id',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['nullable', Rules\Password::defaults()],
            ]);
        }

        DB::transaction(function () use ($request, $student) {
            // Update Student
            $student->update([
                'name' => $request->name,
                'nis' => $request->nis,
                'learning_email' => $request->learning_email,
                'school_class_id' => $request->school_class_id,
                'status' => $request->status,
            ]);

            if ($request->hasFile('photo')) {
                if ($student->photo) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($student->photo);
                }
                $photoPath = $request->file('photo')->store('student_photos', 'public');
                $student->update(['photo' => $photoPath]);
            }

            // Update User login details
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->status !== 'aktif') {
                $userData['is_active'] = false;
            }
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            $student->user->update($userData);

            // Sync parents
            $parentIds = $request->input('parent_ids', []);
            $student->parents()->sync($parentIds);
        });

        return redirect()->route('people.index', ['tab' => 'students'])->with('message', 'Data Siswa berhasil diperbarui.');
    }

    public function destroyStudent(Student $student): RedirectResponse
    {
        DB::transaction(function () use ($student) {
            // Delete pivot relationships first
            $student->parents()->detach();
            
            $userId = $student->user_id;
            
            // Delete Student Profile
            $student->delete();
            
            // Delete Login Account
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('people.index', ['tab' => 'students'])->with('message', 'Siswa berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                                 2. TEACHERS                                */
    /* -------------------------------------------------------------------------- */

    public function storeTeacher(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nip' => 'required|string|max:50|unique:teachers,nip',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        DB::transaction(function () use ($request) {
            // Create user login account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'teacher',
            ]);

            // Create teacher profile
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'nip' => $request->nip,
                'phone_number' => $request->phone_number,
            ]);

            // Sync subjects
            if ($request->filled('subject_ids')) {
                $teacher->subjects()->sync($request->subject_ids);
            }
        });

        return redirect()->route('people.index', ['tab' => 'teachers'])->with('message', 'Guru berhasil ditambahkan.');
    }

    public function updateTeacher(Request $request, Teacher $teacher): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nip' => 'required|string|max:50|unique:teachers,nip,' . $teacher->id,
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->user_id,
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['nullable', Rules\Password::defaults()],
            ]);
        }

        DB::transaction(function () use ($request, $teacher) {
            // Update Teacher profile
            $teacher->update([
                'name' => $request->name,
                'nip' => $request->nip,
                'phone_number' => $request->phone_number,
            ]);

            // Update User login details
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            $teacher->user->update($userData);

            // Sync subjects
            $subjectIds = $request->input('subject_ids', []);
            $teacher->subjects()->sync($subjectIds);
        });

        return redirect()->route('people.index', ['tab' => 'teachers'])->with('message', 'Data Guru berhasil diperbarui.');
    }

    public function destroyTeacher(Teacher $teacher): RedirectResponse
    {
        DB::transaction(function () use ($teacher) {
            $userId = $teacher->user_id;

            // Remove homeroom links from school_classes first to avoid integrity constraints
            SchoolClass::where('teacher_id', $teacher->id)->update(['teacher_id' => null]);

            // Delete Teacher Profile
            $teacher->delete();

            // Delete Login Account
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('people.index', ['tab' => 'teachers'])->with('message', 'Guru berhasil dihapus.');
    }

    /* -------------------------------------------------------------------------- */
    /*                                  3. PARENTS                                */
    /* -------------------------------------------------------------------------- */

    public function storeParent(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        DB::transaction(function () use ($request) {
            // Create user login account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'parent',
            ]);

            // Create parent profile
            $parent = ParentModel::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'phone_number' => $request->phone_number,
            ]);

            // Sync student children links
            if ($request->filled('student_ids')) {
                $parent->students()->sync($request->student_ids);
            }
        });

        return redirect()->route('people.index', ['tab' => 'parents'])->with('message', 'Wali Murid berhasil ditambahkan.');
    }

    public function updateParent(Request $request, ParentModel $parent): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email,' . $parent->user_id,
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['nullable', Rules\Password::defaults()],
            ]);
        }

        DB::transaction(function () use ($request, $parent) {
            // Update Parent profile
            $parent->update([
                'name' => $request->name,
                'phone_number' => $request->phone_number,
            ]);

            // Update User login details
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            $parent->user->update($userData);

            // Sync student children
            $studentIds = $request->input('student_ids', []);
            $parent->students()->sync($studentIds);
        });

        return redirect()->route('people.index', ['tab' => 'parents'])->with('message', 'Data Wali Murid berhasil diperbarui.');
    }

    public function destroyParent(ParentModel $parent): RedirectResponse
    {
        DB::transaction(function () use ($parent) {
            // Detach student children links first
            $parent->students()->detach();

            $userId = $parent->user_id;

            // Delete Parent Profile
            $parent->delete();

            // Delete Login Account
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('people.index', ['tab' => 'parents'])->with('message', 'Wali Murid berhasil dihapus.');
    }

    /**
     * Menampilkan halaman pratinjau cetak kartu QR Siswa.
     */
    public function qr(Request $request)
    {
        $query = Student::with(['schoolClass', 'user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        if ($request->filled('school_class_id')) {
            $query->where('school_class_id', $request->school_class_id);
        }

        $students = $query->orderBy('name')->get();

        // Get school settings for custom card header
        $settings = \App\Models\Setting::pluck('value', 'key')->all();
        $schoolName = $settings['school_name'] ?? 'SMP NEGERI 1 BIAU';
        
        $schoolLogo = isset($settings['school_logo']) 
            ? asset('storage/' . $settings['school_logo']) 
            : null;
            
        $googleLogo = isset($settings['google_education_logo']) 
            ? asset('storage/' . $settings['google_education_logo']) 
            : null;
            
        $cardBackground = isset($settings['student_card_background'])
            ? asset('storage/' . $settings['student_card_background'])
            : null;

        return view('admin.students.qr', compact('students', 'schoolName', 'schoolLogo', 'googleLogo', 'cardBackground'));
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'type' => 'required|in:students,teachers,parents',
        ]);

        $ids = $request->input('ids');
        $type = $request->input('type');
        $userIds = [];

        DB::transaction(function () use ($ids, $type, &$userIds) {
            if ($type === 'students') {
                $students = Student::whereIn('id', $ids)->get();
                foreach ($students as $student) {
                    if ($student->user_id) $userIds[] = $student->user_id;
                    $student->parents()->detach(); // Pivot table cleanup
                    $student->delete();
                }
            } elseif ($type === 'teachers') {
                $teachers = Teacher::whereIn('id', $ids)->get();
                foreach ($teachers as $teacher) {
                    if ($teacher->user_id) $userIds[] = $teacher->user_id;
                    $teacher->subjects()->detach(); // Pivot table cleanup
                    $teacher->delete();
                }
            } elseif ($type === 'parents') {
                $parents = ParentModel::whereIn('id', $ids)->get();
                foreach ($parents as $parent) {
                    if ($parent->user_id) $userIds[] = $parent->user_id;
                    $parent->students()->detach(); // Pivot table cleanup
                    $parent->delete();
                }
            }

            // Prevent deleting oneself just in case
            $userIds = array_diff($userIds, [auth()->id()]);

            if (count($userIds) > 0) {
                User::whereIn('id', $userIds)->delete();
            }
        });

        $typeLabel = $type === 'students' ? 'Siswa' : ($type === 'teachers' ? 'Guru' : 'Wali Murid');
        return redirect()->route('people.index', ['tab' => $type])->with('message', count($ids) . ' ' . $typeLabel . ' berhasil dihapus.');
    }
}
