import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ kbm_audit = [], remedial_audit = [], diagnostic_audit = [] }) {
    const [activeTab, setActiveTab] = useState('kbm');

    // 1. KBM Tab Stats Calculation
    const totalAssignments = kbm_audit.length;
    const completedCompliance = kbm_audit.filter(item => item.status === 'Lengkap').length;
    const incompleteCompliance = totalAssignments - completedCompliance;

    // Helper: format status badge for KBM Compliance
    const getKbmBadge = (status) => {
        switch (status) {
            case 'Lengkap':
                return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'Materi Kosong':
                return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'Tugas Kosong':
                return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            case 'Belum Mulai':
                return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            default:
                return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    // Helper: format status badge for Remedial Status
    const getRemedialBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'pending':
                return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'scheduled':
                return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            default:
                return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    // Helper: format interests tag badges
    const formatInterests = (interests) => {
        if (!interests) return <span className="text-gray-400">-</span>;
        let items = [];
        if (Array.isArray(interests)) {
            items = interests;
        } else if (typeof interests === 'string') {
            try {
                const parsed = JSON.parse(interests);
                if (Array.isArray(parsed)) items = parsed;
                else items = [interests];
            } catch {
                items = interests.replace(/^\[|\]$/g, '').split(',').map(s => s.replace(/["']/g, '').trim()).filter(Boolean);
            }
        }
        if (items.length === 0) return <span className="text-gray-400">-</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {items.map((item, i) => (
                    <span key={i} className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 capitalize">
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    // Helper: format status label for Remedial
    const getRemedialLabel = (status) => {
        switch (status) {
            case 'completed':
                return 'Selesai';
            case 'pending':
                return 'Proses';
            case 'scheduled':
                return 'Dijadwalkan';
            default:
                return status;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Audit Akademik LMS
                </h2>
            }
        >
            <Head title="Audit Akademik LMS" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Compliance Alert Banner */}
                    <div className="mb-6 rounded-r-xl border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 p-4 shadow-xs border-y border-r border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex">
                            <div className="shrink-0 text-indigo-600 dark:text-indigo-400">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                                    Audit Kepatuhan Pembelajaran & Diagnostik Siswa
                                </h3>
                                <p className="text-xs text-indigo-700 dark:text-indigo-300/90 mt-0.5 leading-relaxed">
                                    Halaman audit ini mensinkronisasikan penugasan mengajar guru dengan bahan ajar yang diunggah ke LMS Mokopani, hasil remedial evaluasi siswa, serta profil asesmen diagnostik awal tahun pelajaran.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* INTER-TAB NAVIGATION */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm max-w-2xl">
                        <button
                            onClick={() => setActiveTab('kbm')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition duration-150 ${
                                activeTab === 'kbm'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50'
                            }`}
                        >
                            Pemantauan KBM Guru
                        </button>
                        <button
                            onClick={() => setActiveTab('remedial')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition duration-150 ${
                                activeTab === 'remedial'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50'
                            }`}
                        >
                            Laporan Nilai & Remedial
                        </button>
                        <button
                            onClick={() => setActiveTab('diagnostic')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition duration-150 ${
                                activeTab === 'diagnostic'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50'
                            }`}
                        >
                            Hasil Diagnostik Siswa
                        </button>
                    </div>

                    {/* TAB 1: PEMANTAUAN KBM GURU */}
                    {activeTab === 'kbm' && (
                        <div className="space-y-6">
                            {/* Stats Summary Panel */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xs border border-gray-200 dark:border-gray-700/80 flex items-center gap-4">
                                    <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 p-3 text-indigo-600 dark:text-indigo-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Kelas Diampu</span>
                                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 font-mono mt-0.5">{totalAssignments} Kelas</h4>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xs border border-gray-200 dark:border-gray-700/80 flex items-center gap-4">
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/40 p-3 text-emerald-600 dark:text-emerald-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Kepatuhan Lengkap</span>
                                        <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{completedCompliance} Kelas ({totalAssignments > 0 ? round((completedCompliance / totalAssignments) * 100) : 0}%)</h4>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xs border border-gray-200 dark:border-gray-700/80 flex items-center gap-4">
                                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/40 p-3 text-amber-600 dark:text-amber-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Perlu Perhatian</span>
                                        <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{incompleteCompliance} Kelas</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xs sm:rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        Laporan Unggah Bahan Ajar & Tugas LMS Guru
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                                <th className="px-6 py-3.5">Nama Guru</th>
                                                <th className="px-6 py-3.5">Rombel / Kelas</th>
                                                <th className="px-6 py-3.5">Mata Pelajaran</th>
                                                <th className="px-6 py-3.5 text-center">Bahan Ajar</th>
                                                <th className="px-6 py-3.5 text-center">Tugas & Asesmen</th>
                                                <th className="px-6 py-3.5 text-right">Kepatuhan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                                            {kbm_audit.map((row) => (
                                                <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-gray-750 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{row.teacher?.name}</td>
                                                    <td className="px-6 py-4">{row.school_class?.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                                                            {row.subject?.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-mono font-bold text-gray-800 dark:text-gray-200">{row.materials_count}</td>
                                                    <td className="px-6 py-4 text-center font-mono font-bold text-gray-800 dark:text-gray-200">{row.assignments_count}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold border ${getKbmBadge(row.status)}`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: LAPORAN NILAI & REMEDIAL */}
                    {activeTab === 'remedial' && (
                        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xs sm:rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    Log Kasus & Perkembangan Ujian Remedial Siswa
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                            <th className="px-6 py-3.5">Nama Siswa</th>
                                            <th className="px-6 py-3.5">Mata Pelajaran</th>
                                            <th className="px-6 py-3.5">Evaluasi / Tugas</th>
                                            <th className="px-6 py-3.5 text-center">Nilai Awal</th>
                                            <th className="px-6 py-3.5 text-center">Nilai Remedial</th>
                                            <th className="px-6 py-3.5">Strategi</th>
                                            <th className="px-6 py-3.5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                                        {remedial_audit.map((row) => (
                                            <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{row.student_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                                        {row.subject_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 truncate max-w-[200px]" title={row.assignment_title}>
                                                    {row.assignment_title}
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono font-bold text-rose-600 dark:text-rose-400">{row.initial_score}</td>
                                                <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    {row.remedial_score !== null ? row.remedial_score : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">{row.strategy}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold border ${getRemedialBadge(row.status)}`}>
                                                        {getRemedialLabel(row.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DIAGNOSTIK SISWA */}
                    {activeTab === 'diagnostic' && (
                        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xs sm:rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    Profil Profiling Asesmen Awal Siswa (Kurikulum Merdeka)
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                            <th className="px-6 py-3.5">Nama Siswa</th>
                                            <th className="px-6 py-3.5">Rombel</th>
                                            <th className="px-6 py-3.5">Kategori Gaya Belajar</th>
                                            <th className="px-6 py-3.5 text-center">Motivasi</th>
                                            <th className="px-6 py-3.5">Minat / Bakat</th>
                                            <th className="px-6 py-3.5 text-center">Skor Kognitif</th>
                                            <th className="px-6 py-3.5 text-right">Rekomendasi Pedagogi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                                        {diagnostic_audit.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{row.student_name}</td>
                                                <td className="px-6 py-4">{row.school_class}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold border ${
                                                        row.learning_style === 'Visual' 
                                                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
                                                            : row.learning_style === 'Auditorial'
                                                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                                            : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                                    }`}>
                                                        {row.learning_style}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold border ${
                                                        row.motivation === 'Tinggi'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                            : row.motivation === 'Sedang'
                                                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                                            : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                                                    }`}>
                                                        {row.motivation}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {formatInterests(row.interests)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-mono font-bold text-sm ${row.is_passed === true ? 'text-emerald-600 dark:text-emerald-400' : row.is_passed === false ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {row.cognitive_score !== null ? row.cognitive_score : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed italic" title={row.recommendation}>
                                                    {row.recommendation}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Simple Math helper to avoid loading big library
function round(value, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}
