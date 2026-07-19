import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth, announcements, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const pageProps = usePage().props;

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // Form for Create
    const createForm = useForm({
        title: '',
        content: '',
        banner: null,
        published_at: new Date().toISOString().slice(0, 16), // current datetime formatted for datetime-local input
    });

    // Form for Edit (uses POST with _method: PUT for file upload compatibility)
    const editForm = useForm({
        title: '',
        content: '',
        banner: null,
        published_at: '',
        _method: 'PUT',
    });

    // Handle Search
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('announcements.index'), {
            search: search
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        router.get(route('announcements.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Open Edit Modal
    const openEditModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        
        // Format published_at datetime for input
        let formattedDate = '';
        if (announcement.published_at) {
            const d = new Date(announcement.published_at);
            // offset timezone adjustment to get correct local time format YYYY-MM-DDThh:mm
            const tzOffset = d.getTimezoneOffset() * 60000;
            formattedDate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        }

        editForm.setData({
            title: announcement.title,
            content: announcement.content,
            banner: null, // keep null unless uploading a new one
            published_at: formattedDate,
            _method: 'PUT',
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setIsDeleteOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('announcements.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
        });
    };

    // Submit Edit (POST request with spoofed PUT method)
    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.post(route('announcements.update', selectedAnnouncement.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
            }
        });
    };

    // Submit Delete
    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        router.delete(route('announcements.destroy', selectedAnnouncement.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Manajemen Pengumuman Sekolah
                </h2>
            }
        >
            <Head title="Manajemen Pengumuman" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Flash Message */}
                    {pageProps.flash?.message && (
                        <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {pageProps.flash.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter and Create Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="w-80">
                                <TextInput
                                    id="search"
                                    type="text"
                                    name="search"
                                    value={search}
                                    className="block w-full text-sm border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                                    placeholder="Cari judul atau isi pengumuman..."
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton type="submit" className="px-4 py-2 text-xs" title="Cari">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </PrimaryButton>
                                {(filters.search || search) && (
                                    <SecondaryButton onClick={handleReset} type="button" className="px-4 py-2 text-xs" title="Reset">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </SecondaryButton>
                                )}
                            </div>
                        </form>

                        <div>
                            <PrimaryButton
                                onClick={() => {
                                    createForm.reset();
                                    createForm.setData('published_at', new Date().toISOString().slice(0, 16));
                                    createForm.clearErrors();
                                    setIsCreateOpen(true);
                                }}
                                className="w-full sm:w-auto text-xs"
                                title="Buat Pengumuman"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Announcements Table */}
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Banner
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Judul
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Penulis
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Tanggal Terbit
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Aksi</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
                                    {announcements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Belum ada pengumuman yang diterbitkan.
                                            </td>
                                        </tr>
                                    ) : (
                                        announcements.data.map((ann) => (
                                            <tr key={ann.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {ann.banner_url ? (
                                                        <img
                                                            src={ann.banner_url}
                                                            alt={ann.title}
                                                            className="h-10 w-16 object-cover rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-16 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
                                                            No Banner
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{ann.title}</div>
                                                    <div className="text-xs text-gray-400 line-clamp-1">{ann.content}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{ann.user?.name || 'Admin'}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                                                    {ann.published_at ? new Date(ann.published_at).toLocaleString('id-ID') : '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(ann)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(ann)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Hapus"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {announcements.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={announcements.prev_page_url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!announcements.prev_page_url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Sebelumnya
                                    </Link>
                                    <Link
                                        href={announcements.next_page_url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!announcements.next_page_url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Berikutnya
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            Menampilkan <span className="font-semibold">{announcements.from || 0}</span> sampai <span className="font-semibold">{announcements.to || 0}</span> dari <span className="font-semibold">{announcements.total}</span> data
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            {announcements.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                                                        link.active
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 border-indigo-500'
                                                            : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 focus:outline-offset-0 border-gray-300 dark:border-gray-600'
                                                    } ${!link.url && 'pointer-events-none opacity-50'} ${
                                                        index === 0 ? 'rounded-l-md' : ''
                                                    } ${index === announcements.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Buat Pengumuman Baru</h3>
                    
                    <div className="mb-4">
                        <InputLabel htmlFor="create_title" value="Judul Pengumuman" />
                        <TextInput
                            id="create_title"
                            type="text"
                            className="mt-1 block w-full"
                            value={createForm.data.title}
                            onChange={(e) => createForm.setData('title', e.target.value)}
                            required
                        />
                        <InputError message={createForm.errors.title} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="create_content" value="Isi / Konten Pengumuman" />
                        <textarea
                            id="create_content"
                            rows="5"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            value={createForm.data.content}
                            onChange={(e) => createForm.setData('content', e.target.value)}
                            required
                        />
                        <InputError message={createForm.errors.content} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <InputLabel htmlFor="create_published" value="Tanggal & Waktu Terbit" />
                            <TextInput
                                id="create_published"
                                type="datetime-local"
                                className="mt-1 block w-full text-sm"
                                value={createForm.data.published_at}
                                onChange={(e) => createForm.setData('published_at', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.published_at} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="create_banner" value="Gambar Banner (Opsional, Maks 2MB)" />
                            <input
                                id="create_banner"
                                type="file"
                                accept="image/*"
                                className="mt-1.5 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-600 cursor-pointer"
                                onChange={(e) => createForm.setData('banner', e.target.files[0])}
                            />
                            <InputError message={createForm.errors.banner} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsCreateOpen(false)} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={createForm.processing} title="Terbitkan">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                            </svg>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditOpen} onClose={() => setIsEditOpen(false)}>
                <form onSubmit={handleEditSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Edit Pengumuman</h3>
                    
                    <div className="mb-4">
                        <InputLabel htmlFor="edit_title" value="Judul Pengumuman" />
                        <TextInput
                            id="edit_title"
                            type="text"
                            className="mt-1 block w-full"
                            value={editForm.data.title}
                            onChange={(e) => editForm.setData('title', e.target.value)}
                            required
                        />
                        <InputError message={editForm.errors.title} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="edit_content" value="Isi / Konten Pengumuman" />
                        <textarea
                            id="edit_content"
                            rows="5"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            value={editForm.data.content}
                            onChange={(e) => editForm.setData('content', e.target.value)}
                            required
                        />
                        <InputError message={editForm.errors.content} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <InputLabel htmlFor="edit_published" value="Tanggal & Waktu Terbit" />
                            <TextInput
                                id="edit_published"
                                type="datetime-local"
                                className="mt-1 block w-full text-sm"
                                value={editForm.data.published_at}
                                onChange={(e) => editForm.setData('published_at', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.published_at} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit_banner" value="Ubah Gambar Banner (Maks 2MB)" />
                            <input
                                id="edit_banner"
                                type="file"
                                accept="image/*"
                                className="mt-1.5 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-600 cursor-pointer"
                                onChange={(e) => editForm.setData('banner', e.target.files[0])}
                            />
                            <InputError message={editForm.errors.banner} className="mt-2" />
                        </div>
                    </div>

                    {selectedAnnouncement?.banner_url && (
                        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">Banner Saat Ini:</span>
                            <img
                                src={selectedAnnouncement.banner_url}
                                alt="Current Banner"
                                className="h-20 w-32 object-cover rounded border border-gray-200 dark:border-gray-700"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsEditOpen(false)} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={editForm.processing} title="Simpan Perubahan">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                            </svg>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <form onSubmit={handleDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Pengumuman</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Apakah Anda yakin ingin menghapus pengumuman berjudul <strong>{selectedAnnouncement?.title}</strong>?
                        Tindakan ini tidak dapat dibatalkan dan pengumuman tidak akan terlihat lagi di seluruh aplikasi.
                    </p>
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsDeleteOpen(false)} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <DangerButton type="submit" title="Hapus Permanen">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
