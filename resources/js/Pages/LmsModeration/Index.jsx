import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ comments = [], ai_prompts = [], ai_caches = [] }) {
    const [activeTab, setActiveTab] = useState('comments');

    // Handle delete comment
    const handleDeleteComment = (id, sender) => {
        if (confirm(`Apakah Anda yakin ingin menghapus komentar dari ${sender} ini secara permanen dari LMS?`)) {
            router.delete(route('lms-moderation.destroy_comment', { comment: id }), {
                preserveScroll: true,
            });
        }
    };

    // Handle clear AI cache
    const handleClearCache = (id, hash) => {
        if (confirm(`Apakah Anda yakin ingin membersihkan cache AI untuk hash ${hash}? Tindakan ini memaksa LMS untuk meregenerasi materi/tugas baru saat guru mengaksesnya kembali.`)) {
            router.delete(route('lms-moderation.destroy_cache', { cache: id }), {
                preserveScroll: true,
            });
        }
    };

    // Helper: format date time
    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper: get role badge style
    const getRoleBadge = (role) => {
        if (role === 'teacher' || role === 'guru') {
            return 'bg-indigo-50 text-indigo-700 border-indigo-150';
        }
        return 'bg-sky-50 text-sky-700 border-sky-150';
    };

    // Helper: get prompt type badge style
    const getPromptTypeBadge = (type) => {
        switch (type) {
            case 'modul_ajar':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'orchestrator_draft':
                return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'assessment':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'experiences':
                return 'bg-purple-50 text-purple-700 border-purple-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Moderasi & Pengawasan LMS
                </h2>
            }
        >
            <Head title="Moderasi & AI Audit LMS" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Policy Alert Banner */}
                    <div className="mb-6 rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm">
                        <div className="flex">
                            <div className="shrink-0 text-amber-500">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-semibold text-amber-800">
                                    Papan Moderasi Konten & Audit Prompt AI Sekolah
                                </h3>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Gunakan papan ini untuk memoderasi kepatuhan perilaku digital siswa di kolom komentar LMS, serta melakukan pengawasan terhadap efisiensi cache dan prompt kecerdasan buatan (AI) yang disewa sekolah.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* INTER-TAB NAVIGATION */}
                    <div className="flex border-b border-gray-200 mb-6 bg-white p-1 rounded-xl shadow-sm max-w-md">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition duration-150 ${
                                activeTab === 'comments'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Moderasi Komentar
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition duration-150 ${
                                activeTab === 'ai'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Audit Penggunaan AI
                        </button>
                    </div>

                    {/* TAB 1: MODERASI KOMENTAR LMS */}
                    {activeTab === 'comments' && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-150">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-sm font-bold text-gray-950">
                                    Umpan Diskusi & Komentar LMS Aktif
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            <th className="px-6 py-3">Pengirim</th>
                                            <th className="px-6 py-3">Kategori Konten</th>
                                            <th className="px-6 py-3">Nama Bahan / Tugas</th>
                                            <th className="px-6 py-3">Isi Komentar</th>
                                            <th className="px-6 py-3">Waktu Kirim</th>
                                            <th className="px-6 py-3 text-right">Moderasi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {comments.map((com) => (
                                            <tr key={com.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{com.sender_name}</span>
                                                        <span className={`inline-flex items-center rounded px-1.5 py-0.25 text-[9px] font-extrabold uppercase border ${getRoleBadge(com.sender_role)}`}>
                                                            {com.sender_role === 'student' ? 'Siswa' : 'Guru'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold text-gray-500">{com.target_type}</span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-800 truncate max-w-[180px]" title={com.target_name}>
                                                    {com.target_name}
                                                </td>
                                                <td className="px-6 py-4 max-w-xs break-words leading-relaxed text-gray-700">
                                                    "{com.body}"
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400 font-semibold font-mono">
                                                    {formatDateTime(com.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteComment(com.id, com.sender_name)}
                                                        className="inline-flex items-center justify-center rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-150 transition shadow-sm"
                                                    >
                                                        Sensor
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: AUDIT PENGGUNAAN AI */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            
                            {/* AI Cache summary card info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl bg-white p-5 border border-gray-200 flex items-center gap-4 shadow-sm">
                                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400">Total Generasi AI (Cached)</span>
                                        <h4 className="text-xl font-bold text-gray-800 font-mono mt-0.5">{ai_caches.length} Respon Terlindungi</h4>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-white p-5 border border-gray-200 flex items-center gap-4 shadow-sm">
                                    <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400">Template Prompt AI</span>
                                        <h4 className="text-xl font-bold text-purple-600 font-mono mt-0.5">{ai_prompts.length || 4} Template Aktif</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: AI Cache Audit */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-150">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-950">
                                        Log Cache Hasil Generasi AI (Efisiensi Token)
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                <th className="px-6 py-3">Hash Respon</th>
                                                <th className="px-6 py-3">Tipe Generasi</th>
                                                <th className="px-6 py-3">Mata Pelajaran</th>
                                                <th className="px-6 py-3 text-center">Kelas</th>
                                                <th className="px-6 py-3">Model Pembelajaran</th>
                                                <th className="px-6 py-3">Waktu Dibuat</th>
                                                <th className="px-6 py-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                            {ai_caches.map((cache) => (
                                                <tr key={cache.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600 truncate max-w-[100px]">{cache.hash}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border ${getPromptTypeBadge(cache.prompt_type)}`}>
                                                            {cache.type_label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">{cache.subject}</td>
                                                    <td className="px-6 py-4 text-center font-medium text-gray-500">{cache.class}</td>
                                                    <td className="px-6 py-4 text-xs font-medium text-gray-400">{cache.model}</td>
                                                    <td className="px-6 py-4 text-xs text-gray-400 font-semibold font-mono">
                                                        {formatDateTime(cache.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleClearCache(cache.id, cache.hash)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-150 transition shadow-sm"
                                                        >
                                                            Hapus Cache
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Section 2: AI Prompt Templates List */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-150">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-950">
                                        Template Prompt Utama AI Copilot LMS
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4 bg-slate-50/50">
                                    {ai_prompts.length > 0 ? (
                                        ai_prompts.map((prompt) => (
                                            <div key={prompt.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">{prompt.name}</h4>
                                                        <span className="rounded bg-indigo-50 px-1.5 py-0.25 text-[9px] font-extrabold text-indigo-700 font-mono uppercase">
                                                            {prompt.key}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-semibold">
                                                        Penyusun: <span className="text-gray-600 font-bold">{prompt.teacher?.name || 'Sistem Default (Global)'}</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-550 leading-relaxed mt-3">
                                                    {prompt.description}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        // Standard Fallback list of prompts if DB has not seeded them
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">Draf Bahan Ajar Kurikulum Merdeka</h4>
                                                        <span className="rounded bg-indigo-50 px-1.5 py-0.25 text-[9px] font-extrabold text-indigo-700 font-mono uppercase">
                                                            orchestrator_draft
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-semibold">
                                                        Penyusun: <span className="text-gray-600 font-bold">Sistem Default (Global)</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-550 leading-relaxed mt-3">
                                                    Menggunakan model Kurikulum Merdeka SMP dengan pendekatan Deep Learning untuk menyusun draf materi pembelajaran yang sangat detail, interaktif, dan mudah dipahami siswa.
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">Rancangan Modul Ajar / RPP</h4>
                                                        <span className="rounded bg-indigo-50 px-1.5 py-0.25 text-[9px] font-extrabold text-indigo-700 font-mono uppercase">
                                                            modul_ajar
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-semibold">
                                                        Penyusun: <span className="text-gray-600 font-bold">Sistem Default (Global)</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-550 leading-relaxed mt-3">
                                                    Menyusun Modul Ajar (RPP) Kurikulum Merdeka secara lengkap dan komprehensif, mencakup alokasi waktu, dimensi Profil Pelajar Pancasila, langkah kegiatan pembelajaran (Memahami, Mengaplikasikan, Merefleksikan), dan LKPD.
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">Instrumen Asesmen Pembelajaran</h4>
                                                        <span className="rounded bg-indigo-50 px-1.5 py-0.25 text-[9px] font-extrabold text-indigo-700 font-mono uppercase">
                                                            assessment
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-semibold">
                                                        Penyusun: <span className="text-gray-600 font-bold">Sistem Default (Global)</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-550 leading-relaxed mt-3">
                                                    Merancang kuis diagnosik, exit ticket, atau peta konsep ramah anak SMP dengan tingkat kesulitan bergradasi untuk evaluasi formatif/sumatif yang akurat.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
