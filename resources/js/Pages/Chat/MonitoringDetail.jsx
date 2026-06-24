import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function MonitoringDetail({ conversation, messages }) {
    
    // Handle delete a specific message
    const handleDeleteMessage = (messageId) => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini secara permanen dari basis data sekolah? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('monitoring.chats.destroy_message', { message: messageId }), {
                preserveScroll: true,
            });
        }
    };

    // Handle delete entire conversation
    const handleDeleteConversation = () => {
        const teacherName = conversation.teacher?.name || 'Guru';
        const parentName = conversation.parent?.name || 'Orang Tua';
        if (confirm(`Apakah Anda yakin ingin menghapus seluruh utas percakapan antara Guru ${teacherName} dan Orang Tua ${parentName}? Tindakan ini akan menghapus semua pesan di dalamnya secara permanen.`)) {
            router.delete(route('monitoring.chats.destroy_conversation', { conversation: conversation.id }));
        }
    };

    // Format date and time
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

    const teacherName = conversation.teacher?.name || 'Guru';
    const parentName = conversation.parent?.name || 'Orang Tua';
    const studentName = conversation.student?.name || 'Siswa';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href={route('monitoring.chats.index')} className="hover:text-blue-600 transition flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Daftar
                            </Link>
                            <span>/</span>
                            <span className="text-gray-400">Detail Audit</span>
                        </div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 mt-1">
                            Audit Percakapan: {teacherName} & {parentName}
                        </h2>
                    </div>
                    
                    <button
                        onClick={handleDeleteConversation}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                    >
                        Hapus Seluruh Utas
                    </button>
                </div>
            }
        >
            <Head title={`Audit Chat ${teacherName} - ${parentName}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    {/* Context Card */}
                    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-gray-150">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Informasi Percakapan</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Guru Pengajar</span>
                                <p className="font-semibold text-gray-800 mt-1">{teacherName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">NIP: {conversation.teacher?.nip || '-'}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Wali Murid (Orang Tua)</span>
                                <p className="font-semibold text-gray-800 mt-1">{parentName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Tlp: {conversation.parent?.phone_number || '-'}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Siswa Terkait</span>
                                <p className="font-semibold text-gray-800 mt-1">{studentName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">NISN: {conversation.student?.nisn || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Thread container */}
                    <div className="rounded-xl bg-white shadow-sm border border-gray-150 overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-4">
                            <h3 className="text-sm font-bold text-gray-800">
                                Log Riwayat Pesan ({messages.length} pesan)
                            </h3>
                        </div>

                        <div className="p-6 space-y-6 bg-slate-50/50">
                            {messages.length > 0 ? (
                                messages.map((msg) => {
                                    const isTeacher = msg.user_id === conversation.teacher?.user_id;
                                    const isParent = msg.user_id === conversation.parent?.user_id;
                                    
                                    let senderLabel = 'Sistem';
                                    let bubbleStyle = 'bg-white border-gray-200';
                                    let badgeStyle = 'bg-gray-100 text-gray-600';

                                    if (isTeacher) {
                                        senderLabel = `Guru: ${teacherName}`;
                                        bubbleStyle = 'bg-indigo-50/40 border-indigo-100 border-l-4 border-l-indigo-500';
                                        badgeStyle = 'bg-indigo-100 text-indigo-800';
                                    } else if (isParent) {
                                        senderLabel = `Orang Tua: ${parentName}`;
                                        bubbleStyle = 'bg-sky-50/40 border-sky-100 border-l-4 border-l-sky-500';
                                        badgeStyle = 'bg-sky-100 text-sky-800';
                                    }

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`group relative flex flex-col gap-2 rounded-xl border p-4 bg-white shadow-sm transition-all duration-150 hover:shadow-md ${bubbleStyle}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeStyle}`}>
                                                        {senderLabel}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatDateTime(msg.created_at)}
                                                    </span>
                                                </div>

                                                {/* Delete Moderation Button */}
                                                <button
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition duration-150"
                                                    title="Hapus Pesan untuk Moderasi"
                                                >
                                                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed pr-8">
                                                {msg.body}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center text-sm text-gray-500">
                                    Belum ada pesan yang dikirim dalam percakapan ini.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
