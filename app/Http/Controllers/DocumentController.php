<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\DocumentSubmission;
use App\Models\Semester;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isWakasek = $user->hasRole('Wakasek Kurikulum') || $user->hasRole('Admin');
        $isGuru = $user->hasRole('Guru');

        $activeAcademicYearId = session('active_academic_year_id') ?? Semester::where('is_active', true)->value('academic_year_id');

        $query = DocumentRequest::with('creator')
            ->where('academic_year_id', $activeAcademicYearId)
            ->latest();

        if ($isGuru && !$isWakasek) {
            $teacher = $user->teacher;
            if (!$teacher) {
                abort(403, 'Profil guru tidak ditemukan.');
            }
            // Guru sees requests and their own submissions
            $requests = $query->with(['submissions' => function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            }])->paginate(10);
        } else {
            // Wakasek sees requests and count of submissions
            $requests = $query->withCount('submissions')->paginate(10);
        }

        return Inertia::render('Documents/Index', [
            'requests' => $requests,
            'isWakasek' => $isWakasek,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        $activeAcademicYearId = session('active_academic_year_id') ?? Semester::where('is_active', true)->value('academic_year_id');
        $activeSemesterId = session('active_semester_id') ?? Semester::where('is_active', true)->value('id');

        DocumentRequest::create([
            'title' => $request->title,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'academic_year_id' => $activeAcademicYearId,
            'semester_id' => $activeSemesterId,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('documents.index')->with('message', 'Permintaan berkas berhasil dibuat.');
    }

    public function show(DocumentRequest $document)
    {
        $user = Auth::user();
        $isWakasek = $user->hasRole('Wakasek Kurikulum') || $user->hasRole('Admin');
        
        $document->load('creator');

        if ($isWakasek) {
            // Get all teachers and their submissions
            $teachers = Teacher::with(['user', 'documentSubmissions' => function ($q) use ($document) {
                $q->where('document_request_id', $document->id);
            }])->where('status', 'aktif')->orderBy('name')->get();

            return Inertia::render('Documents/ShowWakasek', [
                'documentRequest' => $document,
                'teachers' => $teachers,
            ]);
        } else {
            $teacher = $user->teacher;
            $submission = DocumentSubmission::where('document_request_id', $document->id)
                ->where('teacher_id', $teacher->id)
                ->first();

            return Inertia::render('Documents/ShowGuru', [
                'documentRequest' => $document,
                'submission' => $submission,
            ]);
        }
    }

    public function update(Request $request, DocumentRequest $document)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        $document->update($request->only('title', 'description', 'deadline'));

        return redirect()->back()->with('message', 'Permintaan berkas berhasil diperbarui.');
    }

    public function destroy(DocumentRequest $document)
    {
        $document->delete();
        return redirect()->route('documents.index')->with('message', 'Permintaan berkas dihapus.');
    }

    public function submit(Request $request, DocumentRequest $document)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'file' => 'nullable|file|max:5120', // 5MB limit
            'url' => 'nullable|url|max:255',
        ]);

        if (!$request->hasFile('file') && !$request->filled('url')) {
            return back()->withErrors(['file' => 'Harap unggah file atau masukkan link URL.']);
        }

        $submission = DocumentSubmission::firstOrNew([
            'document_request_id' => $document->id,
            'teacher_id' => $teacher->id,
        ]);

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($submission->file_path) {
                Storage::delete($submission->file_path);
            }
            $file = $request->file('file');
            $path = $file->store('documents/' . $document->id);
            $submission->file_path = $path;
            $submission->file_name = $file->getClientOriginalName();
            $submission->submitted_url = null;
        } elseif ($request->filled('url')) {
            if ($submission->file_path) {
                Storage::delete($submission->file_path);
                $submission->file_path = null;
                $submission->file_name = null;
            }
            $submission->submitted_url = $request->url;
        }

        $submission->status = 'submitted';
        $submission->submitted_at = now();
        $submission->save();

        return redirect()->back()->with('message', 'Berkas berhasil dikumpulkan.');
    }

    public function review(Request $request, DocumentSubmission $submission)
    {
        $request->validate([
            'status' => 'required|in:verified,revision_needed',
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'status' => $request->status,
            'feedback' => $request->feedback,
        ]);

        return redirect()->back()->with('message', 'Status berkas diperbarui.');
    }

    public function download(DocumentSubmission $submission)
    {
        if (!$submission->file_path || !Storage::exists($submission->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return Storage::download($submission->file_path, $submission->file_name);
    }
}
