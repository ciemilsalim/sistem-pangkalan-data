<?php

namespace App\Http\Controllers;

use App\Models\TeachingAssignment;
use App\Models\LmsMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicAuditController extends Controller
{
    /**
     * Audit Akademik LMS (100% Data Riil dari Database).
     * Memantau kepatuhan dan aktivitas guru dalam mengunggah bahan ajar LMS untuk setiap rombel.
     */
    public function index(Request $request)
    {
        $assignments = TeachingAssignment::with([
            'schoolClass',
            'subject',
            'teacher.user',
            'semester',
            'academicYear'
        ])->get();

        $kbmAudit = $assignments->map(function ($assign) {
            // Ambil bahan ajar yang riil diunggah untuk kelas & mapel spesifik ini
            $materials = LmsMaterial::where('teacher_id', $assign->teacher_id)
                ->where('subject_id', $assign->subject_id)
                ->whereHas('schoolClasses', function ($q) use ($assign) {
                    $q->where('school_classes.id', $assign->school_class_id);
                })
                ->get();

            $materialsCount = $materials->count();
            $materialTitles = $materials->pluck('title')->unique()->values()->all();

            $status = $materialsCount > 0 ? 'Aktif Mengunggah' : 'Belum Mengunggah';

            return [
                'id' => $assign->id,
                'teacher' => $assign->teacher ? [
                    'id' => $assign->teacher->id,
                    'name' => $assign->teacher->name,
                    'nip' => $assign->teacher->nip,
                    'email' => $assign->teacher->user?->email,
                ] : null,
                'school_class' => $assign->schoolClass ? [
                    'id' => $assign->schoolClass->id,
                    'name' => $assign->schoolClass->name,
                ] : null,
                'subject' => $assign->subject ? [
                    'id' => $assign->subject->id,
                    'name' => $assign->subject->name,
                    'code' => $assign->subject->code ?? null,
                ] : null,
                'semester' => $assign->semester ? [
                    'id' => $assign->semester->id,
                    'name' => $assign->semester->name,
                ] : null,
                'academic_year' => $assign->academicYear ? [
                    'id' => $assign->academicYear->id,
                    'name' => $assign->academicYear->name,
                ] : null,
                'materials_count' => $materialsCount,
                'material_titles' => $materialTitles,
                'status' => $status,
            ];
        });

        return Inertia::render('AcademicAudit/Index', [
            'kbm_audit' => $kbmAudit,
        ]);
    }
}
