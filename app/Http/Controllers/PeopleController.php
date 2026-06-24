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

        // Fetch School Classes for student dropdown selection
        $schoolClasses = SchoolClass::orderBy('name')->get();

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
            $query = Student::with(['user', 'schoolClass', 'parents']);
            if (!empty($search)) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('nis', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('email', 'like', "%{$search}%");
                      });
            }
            $students = $query->orderBy('name')->paginate(10)->withQueryString();
        } else {
            $students = Student::with(['user', 'schoolClass'])->orderBy('name')->limit(10)->get();
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
            $teachers = $query->orderBy('name')->paginate(10)->withQueryString();
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
            $parents = $query->orderBy('name')->paginate(10)->withQueryString();
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
                'search' => $search
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
            'school_class_id' => 'required|exists:school_classes,id',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:parents,id',
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
                'school_class_id' => $request->school_class_id,
            ]);

            // Sync parents if provided
            if ($request->filled('parent_ids')) {
                $student->parents()->sync($request->parent_ids);
            }
        });

        return redirect()->route('people.index', ['tab' => 'students'])->with('message', 'Siswa berhasil ditambahkan.');
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nis' => 'required|string|max:50|unique:students,nis,' . $student->id,
            'school_class_id' => 'required|exists:school_classes,id',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id,
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:parents,id',
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
                'school_class_id' => $request->school_class_id,
            ]);

            // Update User login details
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];
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
}
