<?php

namespace App\Http\Controllers;

use App\Models\LmsComment;
use App\Models\LmsAiCache;
use App\Models\LmsAiPrompt;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LmsModerationController extends Controller
{
    public function index()
    {
        // 1. DATA TAB 1: MODERASI KOMENTAR LMS
        $comments = LmsComment::with(['user', 'assignment', 'material'])
            ->latest()
            ->get()
            ->map(function ($com) {
                // Determine sender role & name
                $senderName = $com->user?->name ?? 'User';
                $senderRole = $com->user?->role ?? 'Siswa';
                
                // Determine target name
                $targetName = 'Umum';
                $targetType = 'Umum';
                if ($com->material) {
                    $targetName = $com->material->title;
                    $targetType = 'Bahan Ajar';
                } elseif ($com->assignment) {
                    $targetName = $com->assignment->title;
                    $targetType = 'Tugas / Kuis';
                }

                return [
                    'id' => $com->id,
                    'sender_name' => $senderName,
                    'sender_role' => $senderRole,
                    'body' => $com->body,
                    'target_name' => $targetName,
                    'target_type' => $targetType,
                    'created_at' => $com->created_at ? $com->created_at->toISOString() : null,
                ];
            });

        // Fallback jika komentar kosong
        if ($comments->isEmpty()) {
            $comments = collect([
                [
                    'id' => 1,
                    'sender_name' => 'Emil Salim',
                    'sender_role' => 'student',
                    'body' => 'Bu, apakah batas pengumpulan tugas kuis ini bisa diperpanjang sampai besok sore?',
                    'target_name' => 'Kuis Trigonometri Dasar',
                    'target_type' => 'Tugas / Kuis',
                    'created_at' => now()->subMinutes(10)->toISOString(),
                ],
                [
                    'id' => 2,
                    'sender_name' => 'Ahmad Rian',
                    'sender_role' => 'student',
                    'body' => 'Materi modul ajarnya sangat lengkap pak, penjelasannya mudah dipahami.',
                    'target_name' => 'Materi Dinamika Gerak Lurus',
                    'target_type' => 'Bahan Ajar',
                    'created_at' => now()->subHours(2)->toISOString(),
                ],
                [
                    'id' => 3,
                    'sender_name' => 'Dewi Lestari',
                    'sender_role' => 'student',
                    'body' => 'Soal nomor 3 kuis ini ada kesalahan ketik di pilihan jawabannya pak.',
                    'target_name' => 'Kuis Trigonometri Dasar',
                    'target_type' => 'Tugas / Kuis',
                    'created_at' => now()->subDays(1)->toISOString(),
                ],
                [
                    'id' => 4,
                    'sender_name' => 'Drs. Jalil, M.Pd',
                    'sender_role' => 'teacher',
                    'body' => 'Bagi siswa yang belum melengkapi LKPD minggu lalu, harap segera dikumpulkan hari ini.',
                    'target_name' => 'Materi Dinamika Gerak Lurus',
                    'target_type' => 'Bahan Ajar',
                    'created_at' => now()->subDays(2)->toISOString(),
                ]
            ]);
        }

        // 2. DATA TAB 2: AUDIT PENGGUNAAN AI
        $prompts = LmsAiPrompt::with('teacher')->get();
        
        $caches = LmsAiCache::latest()
            ->get()
            ->map(function ($cache) {
                // Parse input params defensively
                $params = $cache->input_params;
                $subject = 'Umum';
                $class = 'Semua';
                $pedagogicalModel = '-';

                if (is_array($params)) {
                    $subject = $params['subject'] ?? ($params['subject_name'] ?? 'Umum');
                    $class = $params['class'] ?? ($params['school_class_name'] ?? 'Semua');
                    $pedagogicalModel = $params['pedagogical_model'] ?? ($params['model'] ?? '-');
                }

                // Format prompt type label
                $typeLabel = 'Lainnya';
                switch ($cache->prompt_type) {
                    case 'orchestrator_draft':
                        $typeLabel = 'Draf Bahan Ajar';
                        break;
                    case 'experiences':
                        $typeLabel = 'Kegiatan Belajar (Deep Learning)';
                        break;
                    case 'assessment':
                        $typeLabel = 'Instrumen Asesmen / Soal';
                        break;
                    case 'modul_ajar':
                        $typeLabel = 'Modul Ajar / RPP';
                        break;
                }

                return [
                    'id' => $cache->id,
                    'hash' => $cache->prompt_hash,
                    'prompt_type' => $cache->prompt_type,
                    'type_label' => $typeLabel,
                    'subject' => $subject,
                    'class' => $class,
                    'model' => $pedagogicalModel,
                    'created_at' => $cache->created_at ? $cache->created_at->toISOString() : null,
                ];
            });

        // Fallback jika cache AI kosong
        if ($caches->isEmpty()) {
            $caches = collect([
                [
                    'id' => 1,
                    'hash' => 'a8f5e712cd3914b5',
                    'prompt_type' => 'modul_ajar',
                    'type_label' => 'Modul Ajar / RPP',
                    'subject' => 'Matematika',
                    'class' => 'Kelas X-A',
                    'model' => 'Discovery Learning',
                    'created_at' => now()->subMinutes(15)->toISOString(),
                ],
                [
                    'id' => 2,
                    'hash' => '3f47b8c0a91e5d22',
                    'prompt_type' => 'orchestrator_draft',
                    'type_label' => 'Draf Bahan Ajar',
                    'subject' => 'Fisika',
                    'class' => 'Kelas X-B',
                    'model' => 'Problem Based Learning',
                    'created_at' => now()->subHours(1)->toISOString(),
                ],
                [
                    'id' => 3,
                    'hash' => '9c8b72d1f03a4e85',
                    'prompt_type' => 'assessment',
                    'type_label' => 'Instrumen Asesmen / Soal',
                    'subject' => 'Kimia',
                    'class' => 'Kelas X-1',
                    'model' => '-',
                    'created_at' => now()->subDays(1)->toISOString(),
                ],
                [
                    'id' => 4,
                    'hash' => '7e2c90a18b3d4f56',
                    'prompt_type' => 'experiences',
                    'type_label' => 'Kegiatan Belajar (Deep Learning)',
                    'subject' => 'Bahasa Inggris',
                    'class' => 'Kelas XI-A',
                    'model' => 'Task-Based Learning',
                    'created_at' => now()->subDays(2)->toISOString(),
                ]
            ]);
        }

        return Inertia::render('LmsModeration/Index', [
            'comments' => $comments,
            'ai_prompts' => $prompts,
            'ai_caches' => $caches,
        ]);
    }

    public function destroyComment($id)
    {
        $comment = LmsComment::find($id);
        if ($comment) {
            $comment->delete();
            return redirect()->route('lms-moderation.index')
                ->with('success', 'Komentar berhasil dihapus.');
        }

        // Handle fallback delete for demo purposes
        return redirect()->route('lms-moderation.index')
            ->with('success', 'Komentar berhasil disensor (Mode Demo).');
    }

    public function destroyCache($id)
    {
        $cache = LmsAiCache::find($id);
        if ($cache) {
            $cache->delete();
            return redirect()->route('lms-moderation.index')
                ->with('success', 'Cache respon AI berhasil dihapus.');
        }

        // Handle fallback delete for demo purposes
        return redirect()->route('lms-moderation.index')
            ->with('success', 'Respon AI berhasil dibersihkan dari cache (Mode Demo).');
    }
}
