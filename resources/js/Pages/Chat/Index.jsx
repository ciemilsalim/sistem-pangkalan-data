import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ conversations, selectedParentId, activeConversation, messages }) {
    const [search, setSearch] = useState('');
    const messagesEndRef = useRef(null);
    
    // Form for sending new messages
    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

    // Filter conversations based on search
    const filteredConversations = conversations.filter((conv) => {
        const name = conv.parent?.name || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    // Auto scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Format message time
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Format conversation last message date
    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        
        // Check if today
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        }
        
        // Otherwise return date
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    // Handle select parent chat
    const handleSelectParent = (parentId) => {
        router.get(route('chat.index', { selectedParent: parentId }), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle submit message
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.body.trim() || processing) return;

        post(route('chat.store_message', { conversation: activeConversation.id }), {
            onSuccess: () => {
                reset('body');
            },
            preserveScroll: true,
        });
    };

    // Handle keypress (Enter to send)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Obrolan Orang Tua
                </h2>
            }
        >
            <Head title="Obrolan Ortu" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex h-[calc(100vh-200px)] min-h-[500px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md">
                        
                        {/* LEFT SIDEBAR - CONTACT LIST */}
                        <div className={`flex-col border-r border-gray-200 dark:border-gray-700 w-full md:w-80 lg:w-96 shrink-0 bg-gray-50 dark:bg-gray-900/50 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                            {/* Search bar */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari nama orang tua..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Card List */}
                            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                {filteredConversations.length > 0 ? (
                                    filteredConversations.map((conv) => {
                                        const isSelected = selectedParentId === conv.parent_id;
                                        const parentName = conv.parent?.name || 'Orang Tua';
                                        const initial = parentName.charAt(0).toUpperCase();

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleSelectParent(conv.parent_id)}
                                                className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 hover:bg-gray-100 dark:bg-gray-700 ${
                                                    isSelected ? 'bg-indigo-50 hover:bg-indigo-50 border-l-4 border-indigo-500' : ''
                                                }`}
                                            >
                                                {/* Avatar */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-700 font-bold text-white shadow-sm">
                                                    {initial}
                                                </div>

                                                {/* Text Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline justify-between mb-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                                                            {parentName}
                                                        </h3>
                                                        <span className="text-xs text-gray-400 shrink-0">
                                                            {formatDate(conv.last_message_time)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {conv.last_message ? conv.last_message.body : 'Belum ada percakapan.'}
                                                        </p>
                                                        
                                                        {conv.unread_count > 0 && (
                                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-center text-[10px] font-bold text-white shrink-0">
                                                                {conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Tidak ada kontak orang tua ditemukan.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT SIDE - CONVERSATION PANEL */}
                        <div className={`flex-1 flex-col bg-slate-50 dark:bg-gray-900/10 ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
                            {activeConversation ? (
                                <>
                                    {/* Active Chat Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 md:px-6 py-4 shadow-sm z-10 shrink-0">
                                        <div className="flex items-center gap-3">
                                            {/* Mobile Back Button */}
                                            <Link 
                                                href={route('chat.index')}
                                                className="md:hidden p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </Link>
                                            
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-700 font-bold text-white shrink-0">
                                                {(activeConversation.parent?.name || 'O').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                    {activeConversation.parent?.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activeConversation.parent?.phone_number || 'Tidak ada nomor telepon'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages List Area */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {messages.length > 0 ? (
                                            messages.map((msg, index) => {
                                                const isAdminSender = msg.user_id === activeConversation.admin_id;
                                                
                                                // Grouping divider if date changes
                                                const currentMsgDate = new Date(msg.created_at).toDateString();
                                                const prevMsgDate = index > 0 ? new Date(messages[index - 1].created_at).toDateString() : null;
                                                const showDateDivider = currentMsgDate !== prevMsgDate;

                                                return (
                                                    <div key={msg.id} className="space-y-4">
                                                        {showDateDivider && (
                                                            <div className="flex justify-center my-4">
                                                                <span className="rounded-full bg-gray-200 px-3 py-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                    {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`flex ${isAdminSender ? 'justify-end' : 'justify-start'}`}>
                                                            <div
                                                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                                                                    isAdminSender
                                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700/80 rounded-bl-none'
                                                                }`}
                                                            >
                                                                <p className="leading-relaxed whitespace-pre-wrap break-words">
                                                                    {msg.body}
                                                                </p>
                                                                
                                                                <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                                                                    isAdminSender ? 'text-indigo-600' : 'text-gray-400'
                                                                }`}>
                                                                    <span>{formatTime(msg.created_at)}</span>
                                                                    {isAdminSender && (
                                                                        <span>
                                                                            {msg.read_at ? (
                                                                                // Double checkmark (read)
                                                                                <svg className="h-3.5 w-3.5 fill-current text-indigo-300" viewBox="0 0 24 24">
                                                                                    <path d="M0.293 12.293a1 1 0 011.414 0L7 17.586 22.293 2.293a1 1 0 111.414 1.414l-16 16a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z" />
                                                                                    <path d="M7 17.586l14.293-14.293a1 1 0 111.414 1.414l-15 15a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414l5.3 5.3z" />
                                                                                </svg>
                                                                            ) : (
                                                                                // Single checkmark (sent)
                                                                                <svg className="h-3.5 w-3.5 fill-current text-indigo-600" viewBox="0 0 24 24">
                                                                                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                                                                                </svg>
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                                Kirim pesan untuk memulai obrolan.
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Message Area */}
                                    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-end gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                                        <textarea
                                            placeholder="Tulis pesan..."
                                            rows="1"
                                            className="flex-1 resize-none rounded-xl border-gray-300 dark:border-gray-600 py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-indigo-500 max-h-24 min-h-[40px] focus:outline-none"
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            disabled={processing}
                                        />
                                        
                                        <button
                                            type="submit"
                                            disabled={!data.body.trim() || processing}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors duration-150 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 shrink-0"
                                        >
                                            {processing ? (
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-indigo-600 mb-4 shadow-sm">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Mulai Obrolan Administrasi
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                        Pilih salah satu orang tua dari daftar di sebelah kiri untuk melihat riwayat pesan dan mengirimkan pesan baru.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
