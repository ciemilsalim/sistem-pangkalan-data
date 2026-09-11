<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Semester;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentClassHistory;
use App\Models\StudentMutation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class StudentMutationController extends Controller
{
    /**
     * Display a listing of student mutations (Incoming and Outgoing).
     */
    public function index(Request $request): Response
    {
        $activeSemester = Semester::where('is_active', true)->with('academicYear')->first();
        $activeAcademicYearId = session('active_academic_year_id') ?? ($activeSemester->academic_year_id ?? null);
        $activeSemesterId = session('active_semester_id') ?? ($activeSemester->id ?? null);

        $tab = $request->input('tab', 'masuk');
        $search = $request->input('search', '');
        $classFilter = $request->input('school_class_id', '');
        $perPage = (int) $request->input('per_page', 10);

        // Base queries
        $incomingQuery = StudentMutation::where('type', 'masuk')
            ->with(['student.user', 'schoolClass.level', 'academicYear', 'semester', 'creator']);

        $outgoingQuery = StudentMutation::where('type', 'keluar')
            ->with(['student.user', 'schoolClass.level', 'academicYear', 'semester', 'creator']);

        if (!empty($search)) {
            $searchFilter = function ($q) use ($search) {
                $q->where('school_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                         ->orWhere('nis', 'like', "%{$search}%");
                  });
            };
            $incomingQuery->where($searchFilter);
            $outgoingQuery->where($searchFilter);
        }

        if (!empty($classFilter)) {
            $incomingQuery->where('school_class_id', $classFilter);
            $outgoingQuery->where('school_class_id', $classFilter);
        }

        $incomingMutations = $incomingQuery->orderBy('mutation_date', 'desc')->paginate($perPage, ['*'], 'incoming_page')->withQueryString();
        $outgoingMutations = $outgoingQuery->orderBy('mutation_date', 'desc')->paginate($perPage, ['*'], 'outgoing_page')->withQueryString();

        // Statistics
        $totalIncomingYear = StudentMutation::where('type', 'masuk')
            ->when($activeAcademicYearId, fn($q) => $q->where('academic_year_id', $activeAcademicYearId))
            ->count();
        $totalOutgoingYear = StudentMutation::where('type', 'keluar')
            ->when($activeAcademicYearId, fn($q) => $q->where('academic_year_id', $activeAcademicYearId))
            ->count();
        $totalIncomingAll = StudentMutation::where('type', 'masuk')->count();
        $totalOutgoingAll = StudentMutation::where('type', 'keluar')->count();

        // Dropdown data
        $schoolClasses = SchoolClass::with('level')->orderBy('name')->get();
        $activeStudents = Student::where('status', 'aktif')
            ->with('schoolClass')
            ->orderBy('name')
            ->get(['id', 'name', 'nis', 'school_class_id']);

        $settings = Setting::pluck('value', 'key')->all();

        return Inertia::render('StudentMutations/Index', [
            'incomingMutations' => $incomingMutations,
            'outgoingMutations' => $outgoingMutations,
            'stats' => [
                'total_incoming_year' => $totalIncomingYear,
                'total_outgoing_year' => $totalOutgoingYear,
                'total_incoming_all' => $totalIncomingAll,
                'total_outgoing_all' => $totalOutgoingAll,
            ],
            'schoolClasses' => $schoolClasses,
            'activeStudents' => $activeStudents,
            'schoolSettings' => [
                'school_name' => $settings['school_name'] ?? 'SMP NEGERI 1 BIAU',
                'school_address' => $settings['school_address'] ?? '',
                'school_headmaster_name' => $settings['school_headmaster_name'] ?? '',
                'school_headmaster_nip' => $settings['school_headmaster_nip'] ?? '',
            ],
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'school_class_id' => $classFilter,
                'per_page' => $perPage,
            ],
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store incoming student mutation (pindahan masuk).
     */
    public function storeIncoming(Request $request): RedirectResponse
    {
        $request->validate([
            // Data Calon Siswa
            'name' => 'required|string|max:255',
            'nis' => 'required|string|max:50|unique:students,nis',
            'learning_email' => 'nullable|string|email|max:255|unique:students,learning_email',
            'school_class_id' => 'required|exists:school_classes,id',
            'religion' => 'nullable|string|max:50',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:50',

            // Data Mutasi Masuk
            'mutation_date' => 'required|date',
            'school_name' => 'required|string|max:255',
            'school_npsn' => 'nullable|string|max:50',
            'school_city' => 'nullable|string|max:100',
            'school_province' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:100', // No Surat Pindah dari Sekolah Asal
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'document_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $activeSemester = Semester::where('is_active', true)->first();
        $academicYearId = session('active_academic_year_id') ?? ($activeSemester->academic_year_id ?? null);
        $semesterId = session('active_semester_id') ?? ($activeSemester->id ?? null);

        DB::beginTransaction();
        try {
            // 1. Buat User Account Siswa
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'is_active' => true,
            ]);

            // 2. Buat Record Student Baru dengan status 'aktif'
            $student = Student::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'nis' => $request->nis,
                'learning_email' => $request->learning_email,
                'school_class_id' => $request->school_class_id,
                'religion' => $request->religion ?: 'islam',
                'status' => 'aktif',
            ]);

            // 3. Upload File Berkas jika ada
            $documentPath = null;
            if ($request->hasFile('document_file')) {
                $documentPath = $request->file('document_file')->store('student_mutations/incoming', 'public');
            }

            // 4. Buat Record StudentMutation
            $mutation = StudentMutation::create([
                'student_id' => $student->id,
                'type' => 'masuk',
                'academic_year_id' => $academicYearId,
                'semester_id' => $semesterId,
                'mutation_date' => $request->mutation_date,
                'reference_number' => $request->reference_number,
                'school_name' => $request->school_name,
                'school_npsn' => $request->school_npsn,
                'school_city' => $request->school_city,
                'school_province' => $request->school_province,
                'school_class_id' => $request->school_class_id,
                'reason' => $request->reason,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'document_file' => $documentPath,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // 5. Catat riwayat kelas (StudentClassHistory)
            StudentClassHistory::create([
                'student_id' => $student->id,
                'school_class_id' => $request->school_class_id,
                'academic_year_id' => $academicYearId,
                'start_date' => $request->mutation_date,
                'status_reason' => 'Siswa Pindahan Masuk dari ' . $request->school_name,
            ]);

            DB::commit();
            return redirect()->route('student-mutations.index', ['tab' => 'masuk'])
                ->with('message', 'Data siswa pindahan masuk berhasil didaftarkan dan tercatat dalam sistem.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal memproses mutasi masuk: ' . $e->getMessage()]);
        }
    }

    /**
     * Store outgoing student mutation (pindah keluar).
     */
    public function storeOutgoing(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'mutation_date' => 'required|date',
            'school_name' => 'required|string|max:255',
            'school_npsn' => 'nullable|string|max:50',
            'school_city' => 'nullable|string|max:100',
            'school_province' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:100', // No Surat Keterangan Pindah Sekolah
            'letter_number_destination' => 'nullable|string|max:100', // No Surat Lolos Butuh Sekolah Tujuan
            'letter_date' => 'nullable|date',
            'reason' => 'required|string|max:255',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'document_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $activeSemester = Semester::where('is_active', true)->first();
        $academicYearId = session('active_academic_year_id') ?? ($activeSemester->academic_year_id ?? null);
        $semesterId = session('active_semester_id') ?? ($activeSemester->id ?? null);

        DB::beginTransaction();
        try {
            $student = Student::with('user')->findOrFail($request->student_id);
            $oldClassId = $student->school_class_id;

            // 1. Upload File Berkas jika ada
            $documentPath = null;
            if ($request->hasFile('document_file')) {
                $documentPath = $request->file('document_file')->store('student_mutations/outgoing', 'public');
            }

            // 2. Buat Record StudentMutation
            $mutation = StudentMutation::create([
                'student_id' => $student->id,
                'type' => 'keluar',
                'academic_year_id' => $academicYearId,
                'semester_id' => $semesterId,
                'mutation_date' => $request->mutation_date,
                'reference_number' => $request->reference_number,
                'school_name' => $request->school_name,
                'school_npsn' => $request->school_npsn,
                'school_city' => $request->school_city,
                'school_province' => $request->school_province,
                'school_class_id' => $oldClassId,
                'reason' => $request->reason,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'letter_number_destination' => $request->letter_number_destination,
                'letter_date' => $request->letter_date,
                'document_file' => $documentPath,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // 3. Update Status Siswa menjadi 'pindah' dan kosongkan rombel
            $student->status = 'pindah';
            $student->school_class_id = null;
            $student->save();

            // 4. Nonaktifkan Akun User Siswa
            if ($student->user) {
                $student->user->is_active = false;
                $student->user->save();
            }

            // 5. Catat/Tutup riwayat kelas (StudentClassHistory)
            StudentClassHistory::create([
                'student_id' => $student->id,
                'school_class_id' => $oldClassId,
                'academic_year_id' => $academicYearId,
                'end_date' => $request->mutation_date,
                'status_reason' => 'Pindah Keluar ke ' . $request->school_name . ' (' . $request->reason . ')',
            ]);

            DB::commit();
            return redirect()->route('student-mutations.index', ['tab' => 'keluar'])
                ->with('message', 'Siswa berhasil diproses mutasi keluar. Status dan riwayat telah diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal memproses mutasi keluar: ' . $e->getMessage()]);
        }
    }

    /**
     * Update mutation record.
     */
    public function update(Request $request, StudentMutation $studentMutation): RedirectResponse
    {
        $request->validate([
            'mutation_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'school_name' => 'required|string|max:255',
            'school_npsn' => 'nullable|string|max:50',
            'school_city' => 'nullable|string|max:100',
            'school_province' => 'nullable|string|max:100',
            'reason' => 'required|string|max:255',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:50',
            'letter_number_destination' => 'nullable|string|max:100',
            'letter_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'document_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $updateData = $request->only([
            'mutation_date',
            'reference_number',
            'school_name',
            'school_npsn',
            'school_city',
            'school_province',
            'reason',
            'parent_name',
            'parent_phone',
            'letter_number_destination',
            'letter_date',
            'notes',
        ]);

        if ($request->hasFile('document_file')) {
            if ($studentMutation->document_file) {
                Storage::disk('public')->delete($studentMutation->document_file);
            }
            $updateData['document_file'] = $request->file('document_file')->store('student_mutations/' . $studentMutation->type, 'public');
        }

        $studentMutation->update($updateData);

        return redirect()->route('student-mutations.index', ['tab' => $studentMutation->type])
            ->with('message', 'Data mutasi berhasil diperbarui.');
    }

    /**
     * Delete / Cancel mutation record.
     */
    public function destroy(StudentMutation $studentMutation): RedirectResponse
    {
        $type = $studentMutation->type;
        $student = $studentMutation->student;

        DB::transaction(function () use ($studentMutation, $student, $type) {
            // Jika mutasi keluar dibatalkan/dihapus, kembalikan status siswa ke aktif jika kelas masih ada
            if ($type === 'keluar' && $student) {
                $student->status = 'aktif';
                if ($studentMutation->school_class_id) {
                    $student->school_class_id = $studentMutation->school_class_id;
                }
                $student->save();

                if ($student->user) {
                    $student->user->is_active = true;
                    $student->user->save();
                }
            }

            if ($studentMutation->document_file) {
                Storage::disk('public')->delete($studentMutation->document_file);
            }

            $studentMutation->delete();
        });

        return redirect()->route('student-mutations.index', ['tab' => $type])
            ->with('message', 'Catatan mutasi berhasil dihapus.');
    }

    /**
     * Print Official Transfer Letter (Surat Keterangan Pindah Sekolah).
     */
    public function printTransferLetter(StudentMutation $studentMutation)
    {
        $studentMutation->load(['student.parents', 'schoolClass.level', 'academicYear', 'semester']);
        $settings = Setting::pluck('value', 'key')->all();

        $schoolName = $settings['school_name'] ?? 'SMP NEGERI 1 BIAU';
        $schoolAddress = $settings['school_address'] ?? 'Jl. Pendidikan No. 1, Kab. Buol, Sulawesi Tengah';
        $headmasterName = $settings['school_headmaster_name'] ?? 'Kepala Sekolah';
        $headmasterNip = $settings['school_headmaster_nip'] ?? '-';
        $schoolLogo = isset($settings['school_logo']) ? asset('storage/' . $settings['school_logo']) : null;

        return view('print.transfer_letter', [
            'mutation' => $studentMutation,
            'student' => $studentMutation->student,
            'schoolClass' => $studentMutation->schoolClass,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
            'headmasterName' => $headmasterName,
            'headmasterNip' => $headmasterNip,
            'schoolLogo' => $schoolLogo,
            'printDate' => now()->translatedFormat('d F Y'),
        ]);
    }

    /**
     * Print Official Acceptance Letter / Surat Lolos Butuh (Surat Keterangan Kesiapan Menerima).
     */
    public function printAcceptanceLetter(Request $request, ?StudentMutation $studentMutation = null)
    {
        $settings = Setting::pluck('value', 'key')->all();

        $schoolName = $settings['school_name'] ?? 'SMP NEGERI 1 BIAU';
        $schoolAddress = $settings['school_address'] ?? 'Jl. Pendidikan No. 1, Kab. Buol, Sulawesi Tengah';
        $headmasterName = $settings['school_headmaster_name'] ?? 'Kepala Sekolah';
        $headmasterNip = $settings['school_headmaster_nip'] ?? '-';
        $schoolLogo = isset($settings['school_logo']) ? asset('storage/' . $settings['school_logo']) : null;

        // Data can come from mutation record or query params for pre-registration letter
        $data = [
            'letter_number' => $request->input('letter_number', $studentMutation?->reference_number ?? '421.3/     /SMP.01/TU/' . date('Y')),
            'student_name' => $request->input('student_name', $studentMutation?->student?->name ?? ''),
            'nisn' => $request->input('nisn', $studentMutation?->student?->nis ?? ''),
            'origin_school' => $request->input('origin_school', $studentMutation?->school_name ?? ''),
            'target_class' => $request->input('target_class', $studentMutation?->schoolClass?->name ?? 'Kelas VII / VIII / IX'),
            'parent_name' => $request->input('parent_name', $studentMutation?->parent_name ?? ''),
            'reason' => $request->input('reason', $studentMutation?->reason ?? 'Mengikuti Orang Tua / Pindah Domisili'),
            'academic_year' => $request->input('academic_year', $studentMutation?->academicYear?->name ?? (date('Y') . '/' . (date('Y') + 1))),
            'print_date' => now()->translatedFormat('d F Y'),
        ];

        return view('print.acceptance_letter', [
            'data' => $data,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
            'headmasterName' => $headmasterName,
            'headmasterNip' => $headmasterNip,
            'schoolLogo' => $schoolLogo,
        ]);
    }
}
