import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ kbm_audit = [] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Stats Calculation from 100% real database records
    const totalAssignments = kbm_audit.length;
    const activeUploads = kbm_audit.filter(item => item.status === 'Aktif Mengunggah').length;
    const pendingUploads = totalAssignments - activeUploads;

    // Filtered KBM Data
    const filteredKbm = kbm_audit.filter(row => {
        const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
        const q = search.toLowerCase().trim();
        const titlesStr = Array.isArray(row.material_titles) ? row.material_titles.join(' ') : '';
        const matchesSearch = !q ||
            (row.teacher?.name || '').toLowerCase().includes(q) ||
            (row.teacher?.email || '').toLowerCase().includes(q) ||
            (row.school_class?.name || '').toLowerCase().includes(q) ||
            (row.subject?.name || '').toLowerCase().includes(q) ||
            (row.semester?.name || '').toLowerCase().includes(q) ||
            (row.academic_year?.name || '').toLowerCase().includes(q) ||
            titlesStr.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Audit KBM & Bahan Ajar LMS Guru
                </h2>
            }
        >
            <Head title="Audit KBM & Bahan Ajar LMS Guru" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Real Data Notification Banner */}
                    <div className="mb-6 rounded-r-xl border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 p-4 shadow-xs border-y border-r border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex">
                            <div className="shrink-0 text-indigo-600 dark:text-indigo-400">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                                    Audit Kepatuhan & Bahan Ajar LMS (100% Data Riil Pangkalan Sekolah)
                                </p>
                                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                                    Memantau data riil penugasan mengajar guru beserta bahan ajar dan materi ajar yang aktif diunggah pada database LMS. Fitur yang belum memiliki basis data riil telah dinonaktifkan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary Panel */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xs border border-gray-200 dark:border-gray-700/80 flex items-center gap-4">
                            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 p-3 text-indigo-600 dark:text-indigo-400">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Penugasan Mengajar</span>
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
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Aktif Mengunggah Bahan Ajar</span>
                                <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{activeUploads} Penugasan ({totalAssignments > 0 ? Math.round((activeUploads / totalAssignments) * 100) : 0}%)</h4>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xs border border-gray-200 dark:border-gray-700/80 flex items-center gap-4">
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/40 p-3 text-amber-600 dark:text-amber-400">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Belum Mengunggah Bahan Ajar</span>
                                <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{pendingUploads} Penugasan</h4>
                            </div>
                        </div>
                    </div>

                    {/* Data Table Container */}
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xs sm:rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    Daftar Penugasan Mengajar & Ketersediaan Bahan Ajar
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Menampilkan {filteredKbm.length} dari {totalAssignments} data penugasan riil
                                </p>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="relative min-w-[220px]">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari guru, kelas, mapel, materi..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="py-1.5 px-3 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="Aktif Mengunggah">Aktif Mengunggah</option>
                                    <option value="Belum Mengunggah">Belum Mengunggah</option>
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
                                        <th className="px-6 py-3.5">Bahan Ajar LMS</th>
                                        <th className="px-6 py-3.5 text-right">Status KBM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                                    {filteredKbm.length > 0 ? (
                                        filteredKbm.map((row) => (
                                            <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-gray-700/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{row.teacher?.name}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        {row.teacher?.nip ? `NIP: ${row.teacher.nip}` : row.teacher?.email || 'Akun Guru'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{row.school_class?.name}</div>
                                                    {row.semester && (
                                                        <span className="inline-block text-[10px] text-gray-400 dark:text-gray-500">
                                                            {row.semester.name} {row.academic_year?.name ? `(${row.academic_year.name})` : ''}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-700/80 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                                                        {row.subject?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {row.materials_count > 0 ? (
                                                        <div className="space-y-1">
                                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                {row.materials_count} Berkas Bahan Ajar
                                                            </span>
                                                            {row.material_titles && row.material_titles.length > 0 && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-1" title={row.material_titles.join(', ')}>
                                                                    "{row.material_titles[0]}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                                            Belum ada bahan ajar diunggah
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                                                        row.status === 'Aktif Mengunggah'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                                Tidak ada data penugasan KBM yang cocok dengan pencarian / filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
