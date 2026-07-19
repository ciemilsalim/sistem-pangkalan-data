import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Monitoring({ conversations, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    // Handle search input submission
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('monitoring.chats.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    // Reset search
    const handleReset = () => {
        setSearch('');
        router.get(route('monitoring.chats.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle delete entire conversation
    const handleDeleteConversation = (convId, teacherName, parentName) => {
        if (confirm(`Apakah Anda yakin ingin menghapus seluruh riwayat percakapan antara Guru ${teacherName} dan Orang Tua ${parentName}? Tindakan ini bersifat permanen.`)) {
            router.delete(route('monitoring.chats.destroy_conversation', { conversation: convId }), {
                preserveScroll: true,
            });
        }
    };

    // Format last message date
    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Pengawasan Obrolan
                </h2>
            }
        >
            <Head title="Pengawasan Obrolan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Compliance Alert Banner */}
                    <div className="mb-6 rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm">
                        <div className="flex">
                            <div className="shrink-0 text-amber-500">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-semibold text-amber-800">
                                    Papan Moderasi & Pengawasan Sekolah
                                </h3>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Halaman ini memfasilitasi admin untuk memantau pesan privat antara Guru dan Orang Tua. Gunakan fitur ini dengan bijak demi menegakkan kepatuhan hukum, etika sekolah, dan keamanan lingkungan akademis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Content Card */}
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl">
                        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                                    Daftar Percakapan Guru-Ortu
                                </h3>
                                <div className="flex flex-1 max-w-md items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Cari Guru, Wali Murid, atau Siswa..."
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 pl-9 pr-4 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 transition"
                                        title="Cari"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </button>
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:bg-gray-900/50 transition"
                                            title="Reset"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Conversation List Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50 dark:bg-gray-900/50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="px-6 py-3">Pihak Terlibat & Siswa</th>
                                        <th className="px-6 py-3">Pesan Terakhir</th>
                                        <th className="px-6 py-3 text-center">Jumlah Pesan</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {conversations.length > 0 ? (
                                        conversations.map((conv) => {
                                            const teacherName = conv.teacher?.name || 'Guru';
                                            const parentName = conv.parent?.name || 'Orang Tua';
                                            const studentName = conv.student?.name || 'Siswa';

                                            return (
                                                <tr key={conv.id} className="hover:bg-slate-50/70 transition-colors">
                                                    {/* Involving Parties */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-500">
                                                                    Guru: {teacherName}
                                                                </span>
                                                                <span className="text-gray-400">↔</span>
                                                                <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 border border-sky-100">
                                                                    Ortu: {parentName}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Membahas Siswa: <span className="font-semibold text-gray-700 dark:text-gray-300">{studentName}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Last Message Preview */}
                                                    <td className="px-6 py-4 max-w-md">
                                                        {conv.last_message ? (
                                                            <div className="flex flex-col">
                                                                <p className="text-gray-600 dark:text-gray-400 truncate text-xs">
                                                                    "{conv.last_message.body}"
                                                                </p>
                                                                <span className="text-[10px] text-gray-400 mt-1">
                                                                    {formatDate(conv.last_message.created_at)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Belum ada pesan terkirim.</span>
                                                        )}
                                                    </td>

                                                    {/* Total Messages Count */}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                                                            {conv.total_messages}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Link
                                                                href={route('monitoring.chats.show', { conversation: conv.id })}
                                                                className="inline-flex items-center justify-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-indigo-600 transition shadow-sm border border-blue-150"
                                                            >
                                                                Audit Percakapan
                                                            </Link>
                                                            
                                                            <button
                                                                onClick={() => handleDeleteConversation(conv.id, teacherName, parentName)}
                                                                className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 hover:text-red-800 transition shadow-sm border border-red-150"
                                                            >
                                                                Hapus Utas
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada percakapan guru-ortu yang ditemukan.
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
