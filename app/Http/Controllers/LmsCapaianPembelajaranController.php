<?php

namespace App\Http\Controllers;

use App\Models\LmsCapaianPembelajaran;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class LmsCapaianPembelajaranController extends Controller
{
    public function index(Request $request)
    {
        $query = LmsCapaianPembelajaran::with('subject');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhereHas('subject', function ($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('fase')) {
            $query->where('fase', $request->fase);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $capaianPembelajarans = $query->latest()->paginate(10)->withQueryString();
        
        $subjects = Subject::orderBy('name')->get(['id', 'name', 'code']);

        $cpCounts = LmsCapaianPembelajaran::selectRaw('subject_id, count(*) as count')
            ->groupBy('subject_id')
            ->pluck('count', 'subject_id')
            ->toArray();
            
        $nextCpNumbers = [];
        foreach ($subjects as $subject) {
            $nextCpNumbers[$subject->id] = ($cpCounts[$subject->id] ?? 0) + 1;
        }

        return Inertia::render('Curriculum/CapaianPembelajaran/Index', [
            'capaianPembelajarans' => $capaianPembelajarans,
            'subjects' => $subjects,
            'nextCpNumbers' => $nextCpNumbers,
            'filters' => $request->only(['search', 'fase', 'subject_id'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:255', 'unique:lms_capaian_pembelajaran,kode'],
            'fase' => ['required', Rule::in(['Fondasi', 'A', 'B', 'C', 'D', 'E', 'F'])],
            'elemen' => ['nullable', 'string', 'max:255'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'deskripsi' => ['required', 'string'],
        ]);

        LmsCapaianPembelajaran::create($validated);

        return redirect()->back()->with('success', 'Capaian Pembelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, LmsCapaianPembelajaran $capaianPembelajaran)
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:255', Rule::unique('lms_capaian_pembelajaran')->ignore($capaianPembelajaran->id)],
            'fase' => ['required', Rule::in(['Fondasi', 'A', 'B', 'C', 'D', 'E', 'F'])],
            'elemen' => ['nullable', 'string', 'max:255'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'deskripsi' => ['required', 'string'],
        ]);

        $capaianPembelajaran->update($validated);

        return redirect()->back()->with('success', 'Capaian Pembelajaran berhasil diperbarui.');
    }

    public function destroy(LmsCapaianPembelajaran $capaianPembelajaran)
    {
        $capaianPembelajaran->delete();

        return redirect()->back()->with('success', 'Capaian Pembelajaran berhasil dihapus.');
    }
}
