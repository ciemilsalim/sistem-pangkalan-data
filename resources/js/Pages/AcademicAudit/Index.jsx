import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ kbm_audit = [], remedial_audit = [], diagnostic_audit = [] }) {
    const [activeTab, setActiveTab] = useState('kbm');

    // Filter states
    const [kbmSearch, setKbmSearch] = useState('');
    const [kbmStatusFilter, setKbmStatusFilter] = useState('all');

    const [remedialSearch, setRemedialSearch] = useState('');
    const [remedialStatusFilter, setRemedialStatusFilter] = useState('all');

    const [diagnosticSearch, setDiagnosticSearch] = useState('');
    const [diagnosticStyleFilter, setDiagnosticStyleFilter] = useState('all');

    // 1. KBM Tab Stats Calculation
    const totalAssignments = kbm_audit.length;
    const completedCompliance = kbm_audit.filter(item => item.status === 'Lengkap').length;
    const incompleteCompliance = totalAssignments - completedCompliance;

    // Filtered KBM Data
    const filteredKbm = kbm_audit.filter(row => {
        const matchesStatus = kbmStatusFilter === 'all' || row.status === kbmStatusFilter;
        const q = kbmSearch.toLowerCase().trim();
        const matchesSearch = !q || 
            (row.teacher?.name || '').toLowerCase().includes(q) ||
            (row.school_class?.name || '').toLowerCase().includes(q) ||
            (row.subject?.name || '').toLowerCase().includes(q) ||
            (row.semester?.name || '').toLowerCase().includes(q) ||
            (row.academic_year?.name || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    // Filtered Remedial Data
    const filteredRemedial = remedial_audit.filter(row => {
        const matchesStatus = remedialStatusFilter === 'all' || row.status === remedialStatusFilter;
        const q = remedialSearch.toLowerCase().trim();
        const matchesSearch = !q ||
            (row.student_name || '').toLowerCase().includes(q) ||
            (row.subject_name || '').toLowerCase().includes(q) ||
            (row.assignment_title || '').toLowerCase().includes(q) ||
            (row.teacher_name || '').toLowerCase().includes(q) ||
            (row.strategy || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    // Filtered Diagnostic Data
    const filteredDiagnostic = diagnostic_audit.filter(row => {
        const matchesStyle = diagnosticStyleFilter === 'all' || 
            (row.learning_style || '').toLowerCase() === diagnosticStyleFilter.toLowerCase();
        const q = diagnosticSearch.toLowerCase().trim();
        const interestsStr = Array.isArray(row.interests) ? row.interests.join(' ') : String(row.interests || '');
        const matchesSearch = !q ||
            (row.student_name || '').toLowerCase().includes(q) ||
            (row.school_class || '').toLowerCase().includes(q) ||
            (row.subject || '').toLowerCase().includes(q) ||
            interestsStr.toLowerCase().includes(q) ||
            (row.motivation || '').toLowerCase().includes(q);
        return matchesStyle && matchesSearch;
    });

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
                                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                                    Modul Pengawasan Akademik & Kepatuhan KBM LMS
                                </p>
                                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                                    Pantau konsistensi guru dalam mengunggah materi, modul ajar, tugas, rekam jejak remedial siswa, serta hasil pemetaan asesmen awal diagnostik Kurikulum Merdeka.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex rounded-xl bg-white dark:bg-gray-800 p-1.5 shadow-xs border border-gray-200 dark:border-gray-700/80 mb-6">
                        <button
                            onClick={() => setActiveTab('kbm')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition duration-150 ${
                                activeTab === 'kbm'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50'
                            }`}
                        >
                            Pemanfaatan KBM Guru
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'kbm' ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {totalAssignments}
                            </span>
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'remedial' ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {remedial_audit.length}
                            </span>
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'diagnostic' ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {diagnostic_audit.length}
                            </span>
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
                                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            Laporan Unggah Bahan Ajar & Tugas LMS Guru
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Menampilkan {filteredKbm.length} dari {totalAssignments} penugasan mengajar
                                        </p>
                                    </div>

                                    {/* Search & Filter */}
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <div className="relative min-w-[200px]">
                                            <input
                                                type="text"
                                                value={kbmSearch}
                                                onChange={(e) => setKbmSearch(e.target.value)}
                                                placeholder="Cari guru, kelas, mapel..."
                                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                            </svg>
                                        </div>

                                        <select
                                            value={kbmStatusFilter}
                                            onChange={(e) => setKbmStatusFilter(e.target.value)}
                                            className="py-1.5 px-3 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="all">Semua Status</option>
                                            <option value="Lengkap">Lengkap</option>
                                            <option value="Materi Kosong">Materi Kosong</option>
                                            <option value="Tugas Kosong">Tugas Kosong</option>
                                            <option value="Belum Mulai">Belum Mulai</option>
                                        </select>
                                    </div>
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
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                            {filteredKbm.length > 0 ? (
                                                filteredKbm.map((row) => (
                                                    <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-gray-700/40 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{row.teacher?.name}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium">{row.school_class?.name}</div>
                                                            {row.semester && (
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                    {row.semester.name} {row.academic_year?.name ? `(${row.academic_year.name})` : ''}
                                                                </span>
                                                            )}
                                                        </td>
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
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                                                        Tidak ada data penugasan KBM yang cocok dengan pencarian / filter.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: LAPORAN NILAI & REMEDIAL */}
                    {activeTab === 'remedial' && (
                        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xs sm:rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        Log Kasus & Perkembangan Ujian Remedial Siswa
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Menampilkan {filteredRemedial.length} dari {remedial_audit.length} rekam jejak remedial
                                    </p>
                                </div>

                                {/* Search & Filter */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="relative min-w-[200px]">
                                        <input
                                            type="text"
                                            value={remedialSearch}
                                            onChange={(e) => setRemedialSearch(e.target.value)}
                                            placeholder="Cari siswa, mapel, tugas..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </div>

                                    <select
                                        value={remedialStatusFilter}
                                        onChange={(e) => setRemedialStatusFilter(e.target.value)}
                                        className="py-1.5 px-3 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="completed">Selesai</option>
                                        <option value="pending">Proses</option>
                                        <option value="scheduled">Dijadwalkan</option>
                                    </select>
                                </div>
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
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                        {filteredRemedial.length > 0 ? (
                                            filteredRemedial.map((row) => (
                                                <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-gray-700/40 transition-colors">
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
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                                                    Tidak ada catatan remedial yang sesuai dengan pencarian / filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DIAGNOSTIK SISWA */}
                    {activeTab === 'diagnostic' && (
                        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xs sm:rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        Profil Profiling Asesmen Awal Siswa (Kurikulum Merdeka)
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Menampilkan {filteredDiagnostic.length} dari {diagnostic_audit.length} profil diagnostik siswa
                                    </p>
                                </div>

                                {/* Search & Filter */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="relative min-w-[200px]">
                                        <input
                                            type="text"
                                            value={diagnosticSearch}
                                            onChange={(e) => setDiagnosticSearch(e.target.value)}
                                            placeholder="Cari siswa, kelas, minat..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </div>

                                    <select
                                        value={diagnosticStyleFilter}
                                        onChange={(e) => setDiagnosticStyleFilter(e.target.value)}
                                        className="py-1.5 px-3 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">Semua Gaya Belajar</option>
                                        <option value="Visual">Visual</option>
                                        <option value="Auditorial">Auditorial</option>
                                        <option value="Kinestetik">Kinestetik</option>
                                    </select>
                                </div>
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
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                        {filteredDiagnostic.length > 0 ? (
                                            filteredDiagnostic.map((row, idx) => {
                                                const styleLower = (row.learning_style || '').toLowerCase();
                                                const motLower = (row.motivation || '').toLowerCase();
                                                return (
                                                    <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-gray-700/40 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{row.student_name}</td>
                                                        <td className="px-6 py-4">{row.school_class}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold border ${
                                                                styleLower === 'visual' 
                                                                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
                                                                    : styleLower === 'auditorial' || styleLower === 'auditori'
                                                                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                                                    : styleLower === 'kinestetik'
                                                                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                                            }`}>
                                                                {row.learning_style}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold border ${
                                                                motLower.includes('tinggi')
                                                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                                    : motLower.includes('sedang')
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
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                                                    Tidak ada data diagnostik siswa yang sesuai dengan pencarian / filter.
                                                </td>
                                            </tr>
                                        )}
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
