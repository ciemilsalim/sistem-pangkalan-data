<?php

namespace App\Http\Controllers;

use App\Models\TeachingAssignment;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\LmsMaterial;
use App\Models\LmsAssignment;
use App\Models\LmsRemedialRecord;
use App\Models\GradebookFinalScore;
use App\Models\StudentDiagnosticResult;
use App\Models\StudentNonCognitiveDiagnostic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicAuditController extends Controller
{
    public function index(Request $request)
    {
        // 1. DATA TAB 1: PEMANTAUAN KBM GURU
        $assignments = TeachingAssignment::with(['schoolClass', 'subject', 'teacher.user'])->get();
        
        $kbmAudit = $assignments->map(function ($assign) {
            // Hitung bahan ajar yang diunggah untuk kelas & mapel spesifik ini
            $materialsCount = LmsMaterial::where('teacher_id', $assign->teacher_id)
                ->where('subject_id', $assign->subject_id)
                ->whereHas('schoolClasses', function($q) use ($assign) {
                    $q->where('school_classes.id', $assign->school_class_id);
                })
                ->count();

            // Hitung tugas yang diunggah untuk kelas & mapel spesifik ini
            $assignmentsCount = LmsAssignment::where('teacher_id', $assign->teacher_id)
                ->where('subject_id', $assign->subject_id)
                ->whereHas('schoolClasses', function($q) use ($assign) {
                    $q->where('school_classes.id', $assign->school_class_id);
                })
                ->count();

            // Tentukan status kepatuhan mengajar
            $complianceStatus = 'Lengkap';
            if ($materialsCount === 0 && $assignmentsCount === 0) {
                $complianceStatus = 'Belum Mulai';
            } elseif ($materialsCount === 0) {
                $complianceStatus = 'Materi Kosong';
            } elseif ($assignmentsCount === 0) {
                $complianceStatus = 'Tugas Kosong';
            }

            return [
                'id' => $assign->id,
                'teacher' => $assign->teacher,
                'school_class' => $assign->schoolClass,
                'subject' => $assign->subject,
                'materials_count' => $materialsCount,
                'assignments_count' => $assignmentsCount,
                'status' => $complianceStatus,
            ];
        });

        // Demo Fallback jika KBM audit kosong
        if ($kbmAudit->isEmpty()) {
            $kbmAudit = collect([
                [
                    'id' => 1,
                    'teacher' => ['name' => 'Drs. Jalil, M.Pd'],
                    'school_class' => ['name' => 'Kelas X-A'],
                    'subject' => ['name' => 'Matematika'],
                    'materials_count' => 12,
                    'assignments_count' => 4,
                    'status' => 'Lengkap',
                ],
                [
                    'id' => 2,
                    'teacher' => ['name' => 'Dra. Ani Suryani'],
                    'school_class' => ['name' => 'Kelas X-A'],
                    'subject' => ['name' => 'Fisika'],
                    'materials_count' => 0,
                    'assignments_count' => 2,
                    'status' => 'Materi Kosong',
                ],
                [
                    'id' => 3,
                    'teacher' => ['name' => 'Budi Santoso, S.Kom'],
                    'school_class' => ['name' => 'Kelas X-B'],
                    'subject' => ['name' => 'Informatika'],
                    'materials_count' => 8,
                    'assignments_count' => 0,
                    'status' => 'Tugas Kosong',
                ],
                [
                    'id' => 4,
                    'teacher' => ['name' => 'Hasan Basri, S.Pd'],
                    'school_class' => ['name' => 'Kelas XI-A'],
                    'subject' => ['name' => 'Sejarah'],
                    'materials_count' => 0,
                    'assignments_count' => 0,
                    'status' => 'Belum Mulai',
                ]
            ]);
        }


        // 2. DATA TAB 2: LAPORAN NILAI & REMEDIAL
        $remedialRecords = LmsRemedialRecord::with(['student', 'subject', 'teacher', 'assignment'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rem) {
                return [
                    'id' => $rem->id,
                    'student_name' => $rem->student?->name ?? 'Siswa',
                    'subject_name' => $rem->subject?->name ?? 'Mapel',
                    'teacher_name' => $rem->teacher?->name ?? 'Guru',
                    'assignment_title' => $rem->assignment?->title ?? 'Tugas',
                    'initial_score' => $rem->initial_score,
                    'remedial_score' => $rem->remedial_score,
                    'strategy' => $rem->remedial_strategy ?? 'Ujian Ulang',
                    'status' => $rem->status ?? 'pending',
                    'created_at' => $rem->created_at ? $rem->created_at->toISOString() : null,
                ];
            });

        // Demo Fallback jika data remedial kosong
        if ($remedialRecords->isEmpty()) {
            $remedialRecords = collect([
                [
                    'id' => 1,
                    'student_name' => 'Emil Salim',
                    'subject_name' => 'Matematika',
                    'teacher_name' => 'Drs. Jalil, M.Pd',
                    'assignment_title' => 'Kuis Trigonometri Dasar',
                    'initial_score' => 62,
                    'remedial_score' => 78,
                    'strategy' => 'Ujian Ulang Tertulis',
                    'status' => 'completed',
                    'created_at' => now()->subDays(2)->toISOString(),
                ],
                [
                    'id' => 2,
                    'student_name' => 'Ahmad Rian',
                    'subject_name' => 'Fisika',
                    'teacher_name' => 'Dra. Ani Suryani',
                    'assignment_title' => 'Tugas Dinamika Gerak',
                    'initial_score' => 55,
                    'remedial_score' => null,
                    'strategy' => 'Tugas Portofolio',
                    'status' => 'pending',
                    'created_at' => now()->subDays(1)->toISOString(),
                ],
                [
                    'id' => 3,
                    'student_name' => 'Ratih Kumala',
                    'subject_name' => 'Kimia',
                    'teacher_name' => 'Drs. H. Mulyadi',
                    'assignment_title' => 'Praktikum Reaksi Redoks',
                    'initial_score' => 68,
                    'remedial_score' => 85,
                    'strategy' => 'Ujian Lisan & Tugas',
                    'status' => 'completed',
                    'created_at' => now()->subDays(5)->toISOString(),
                ],
                [
                    'id' => 4,
                    'student_name' => 'Dewi Lestari',
                    'subject_name' => 'Matematika',
                    'teacher_name' => 'Drs. Jalil, M.Pd',
                    'assignment_title' => 'Kuis Trigonometri Dasar',
                    'initial_score' => 50,
                    'remedial_score' => null,
                    'strategy' => 'Pendampingan Sebaya & Uji Ulang',
                    'status' => 'scheduled',
                    'created_at' => now()->toISOString(),
                ]
            ]);
        }


        // 3. DATA TAB 3: DIAGNOSTIK SISWA
        // Ambil data non-kognitif
        $nonCognitive = StudentNonCognitiveDiagnostic::with(['student', 'subject'])->get();
        // Ambil data kognitif
        $cognitive = StudentDiagnosticResult::with(['student', 'subject'])->get();

        // Gabungkan profil diagnostik siswa
        $diagnosticAudit = [];

        if ($nonCognitive->isNotEmpty() || $cognitive->isNotEmpty()) {
            // Loop over students who have diagnostic data
            $studentIds = $nonCognitive->pluck('student_id')->merge($cognitive->pluck('student_id'))->unique();
            $students = Student::whereIn('id', $studentIds)->with('schoolClass')->get();

            foreach ($students as $stu) {
                $stuNonCog = $nonCognitive->where('student_id', $stu->id)->first();
                $stuCog = $cognitive->where('student_id', $stu->id)->first();
                $subject = $stuNonCog?->subject ?? $stuCog?->subject;

                // Defensive motivation parsing
                $motivation = 'Sedang';
                if ($stuNonCog) {
                    if (is_array($stuNonCog->motivation_level)) {
                        $motivation = $stuNonCog->motivation_level['level'] ?? (isset($stuNonCog->motivation_level[0]) ? $stuNonCog->motivation_level[0] : 'Sedang');
                    } elseif (is_string($stuNonCog->motivation_level)) {
                        $motivation = $stuNonCog->motivation_level;
                    }
                }

                // Defensive interests parsing
                $interests = 'Umum';
                if ($stuNonCog) {
                    if (is_array($stuNonCog->interests)) {
                        $flatInt = [];
                        foreach ($stuNonCog->interests as $item) {
                            if (is_array($item)) {
                                $flatInt[] = json_encode($item);
                            } else {
                                $flatInt[] = (string)$item;
                            }
                        }
                        $interests = implode(', ', $flatInt);
                    } elseif (is_string($stuNonCog->interests)) {
                        $interests = $stuNonCog->interests;
                    }
                }

                // Defensive recommendation parsing
                $recommendation = 'Pendampingan umum.';
                if ($stuCog) {
                    if (is_array($stuCog->recommendations)) {
                        $flatRec = [];
                        foreach ($stuCog->recommendations as $item) {
                            if (is_array($item)) {
                                $flatRec[] = json_encode($item);
                            } else {
                                $flatRec[] = (string)$item;
                            }
                        }
                        $recommendation = implode('; ', $flatRec);
                    } elseif (is_string($stuCog->recommendations)) {
                        $recommendation = $stuCog->recommendations;
                    }
                }

                $diagnosticAudit[] = [
                    'student_name' => $stu->name,
                    'school_class' => $stu->schoolClass?->name ?? 'Kelas',
                    'subject' => $subject?->name ?? 'Umum',
                    'learning_style' => $stuNonCog?->learning_style ?? 'Belum Diisi',
                    'motivation' => $motivation,
                    'interests' => $interests,
                    'cognitive_score' => $stuCog ? (float)$stuCog->total_score : null,
                    'is_passed' => $stuCog ? (bool)$stuCog->is_passed : null,
                    'recommendation' => $recommendation,
                ];
            }
        }

        // Demo Fallback jika data diagnostik kosong
        if (empty($diagnosticAudit)) {
            $diagnosticAudit = [
                [
                    'student_name' => 'Emil Salim',
                    'school_class' => 'Kelas X-A',
                    'subject' => 'Asesmen Awal Matematika',
                    'learning_style' => 'Visual',
                    'motivation' => 'Tinggi',
                    'interests' => 'Sains, Teknologi',
                    'cognitive_score' => 82.5,
                    'is_passed' => true,
                    'recommendation' => 'Dapat melanjutkan ke materi pengayaan geometri lanjut.',
                ],
                [
                    'student_name' => 'Ahmad Rian',
                    'school_class' => 'Kelas X-A',
                    'subject' => 'Asesmen Awal Fisika',
                    'learning_style' => 'Kinestetik',
                    'motivation' => 'Sedang',
                    'interests' => 'Olahraga, Musik',
                    'cognitive_score' => 58.0,
                    'is_passed' => false,
                    'recommendation' => 'Perlu metode pembelajaran praktikum fisik; diberikan remedial terbimbing.',
                ],
                [
                    'student_name' => 'Ratih Kumala',
                    'school_class' => 'Kelas X-B',
                    'subject' => 'Asesmen Awal Kimia',
                    'learning_style' => 'Auditorial',
                    'motivation' => 'Tinggi',
                    'interests' => 'Kesenian, Menulis',
                    'cognitive_score' => 74.0,
                    'is_passed' => true,
                    'recommendation' => 'Pemahaman konsep baik; direkomendasikan latihan soal mandiri.',
                ],
                [
                    'student_name' => 'Dewi Lestari',
                    'school_class' => 'Kelas X-A',
                    'subject' => 'Asesmen Awal Matematika',
                    'learning_style' => 'Visual',
                    'motivation' => 'Rendah',
                    'interests' => 'Desain Grafis, Game',
                    'cognitive_score' => 45.0,
                    'is_passed' => false,
                    'recommendation' => 'Diberikan pendampingan psikologis motivasi; visualisasi materi melalui infografis.',
                ]
            ];
        }

        return Inertia::render('AcademicAudit/Index', [
            'kbm_audit' => $kbmAudit,
            'remedial_audit' => $remedialRecords,
            'diagnostic_audit' => $diagnosticAudit,
        ]);
    }
}
