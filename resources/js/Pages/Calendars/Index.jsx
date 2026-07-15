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

export default function Index({ auth, calendars, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const pageProps = usePage().props;

    // Modal States
    const [modalType, setModalType] = useState(null); // 'create' or 'edit' or 'delete'
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Form Hook
    const calendarForm = useForm({
        title: '',
        start_date: '',
        end_date: '',
        description: '',
        is_holiday: false,
        is_self_study: false,
    });

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('calendars.index'), {
            search: search
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        router.get(route('calendars.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Open Create Modal
    const openCreateModal = () => {
        setModalType('create');
        calendarForm.reset({
            title: '',
            start_date: '',
            end_date: '',
            description: '',
            is_holiday: false,
            is_self_study: false,
        });
        calendarForm.clearErrors();
    };

    // Open Edit Modal
    const openEditModal = (record) => {
        setModalType('edit');
        setSelectedRecord(record);
        
        // Format dates to YYYY-MM-DD for date inputs
        const formatDateString = (dateVal) => {
            if (!dateVal) return '';
            const d = new Date(dateVal);
            const month = '' + (d.getMonth() + 1);
            const day = '' + d.getDate();
            const year = d.getFullYear();

            return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
        };

        calendarForm.setData({
            title: record.title,
            start_date: formatDateString(record.start_date),
            end_date: formatDateString(record.end_date),
            description: record.description || '',
            is_holiday: !!record.is_holiday,
            is_self_study: !!record.is_self_study,
        });
        calendarForm.clearErrors();
    };

    // Open Delete Modal
    const openDeleteModal = (record) => {
        setModalType('delete');
        setSelectedRecord(record);
    };

    // Close Modal
    const closeModal = () => {
        setModalType(null);
        setSelectedRecord(null);
    };

    // Submit Handler
    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalType === 'create') {
            calendarForm.post(route('calendars.store'), {
                onSuccess: () => closeModal()
            });
        } else {
            calendarForm.put(route('calendars.update', selectedRecord.id), {
                onSuccess: () => closeModal()
            });
        }
    };

    // Delete Handler
    const handleDelete = (e) => {
        e.preventDefault();
        router.delete(route('calendars.destroy', selectedRecord.id), {
            onSuccess: () => closeModal()
        });
    };

    // Helper to format readable date
    const formatReadableDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Server-side Pagination Renderer Helper
    const renderPagination = (paginator) => {
        if (!paginator || paginator.links.length <= 3) return null;

        return (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                    <Link
                        href={paginator.prev_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.prev_page_url && 'pointer-events-none opacity-50'}`}
                    >
                        Sebelumnya
                    </Link>
                    <Link
                        href={paginator.next_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.next_page_url && 'pointer-events-none opacity-50'}`}
                    >
                        Berikutnya
                    </Link>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Menampilkan <span className="font-semibold">{paginator.from || 0}</span> sampai <span className="font-semibold">{paginator.to || 0}</span> dari <span className="font-semibold">{paginator.total}</span> agenda
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            {paginator.links.map((link, index) => (
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
                                    } ${index === paginator.links.length - 1 ? 'rounded-r-md' : ''}`}
                                />
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Kalender Akademik & Pendidikan
                </h2>
            }
        >
            <Head title="Kalender Akademik" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Flash Message */}
                    {pageProps.flash?.message && (
                        <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200 shadow-sm">
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
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="w-80">
                                <TextInput
                                    id="search"
                                    type="text"
                                    name="search"
                                    value={search}
                                    className="block w-full text-sm border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    placeholder="Cari judul kegiatan atau deskripsi..."
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton type="submit" className="px-4 py-2 text-xs">
                                    Cari
                                </PrimaryButton>
                                {(filters.search || search) && (
                                    <SecondaryButton onClick={handleReset} type="button" className="px-4 py-2 text-xs">
                                        Reset
                                    </SecondaryButton>
                                )}
                            </div>
                        </form>

                        <div>
                            <PrimaryButton
                                onClick={openCreateModal}
                                className="w-full sm:w-auto text-xs"
                            >
                                + Tambah Agenda Akademik
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6">
                            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kegiatan / Agenda</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tanggal Mulai</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tanggal Selesai</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kategori</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                        {calendars.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada agenda kalender akademik ditemukan.</td>
                                            </tr>
                                        ) : (
                                            calendars.data.map((cal) => (
                                                <tr key={cal.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-950">{cal.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-semibold">{formatReadableDate(cal.start_date)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-semibold">{cal.end_date ? formatReadableDate(cal.end_date) : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-wrap gap-1">
                                                            {cal.is_holiday ? (
                                                                <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-100 shadow-sm">
                                                                    Hari Libur
                                                                </span>
                                                            ) : null}
                                                            {cal.is_self_study ? (
                                                                <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100 shadow-sm">
                                                                    Belajar Mandiri
                                                                </span>
                                                            ) : null}
                                                            {!cal.is_holiday && !cal.is_self_study ? (
                                                                <span className="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-500">
                                                                    Efektif Sekolah (Kegiatan)
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{cal.description || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => openEditModal(cal)} className="text-indigo-600 hover:text-indigo-600 mr-4 font-semibold">Edit</button>
                                                        <button onClick={() => openDeleteModal(cal)} className="text-red-600 hover:text-red-900 font-semibold">Hapus</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(calendars)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create & Edit Modal */}
            {modalType && modalType !== 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            {modalType === 'create' ? 'Tambah ' : 'Edit '} Agenda Akademik
                        </h3>

                        <div className="mb-4">
                            <InputLabel htmlFor="cal_title" value="Nama Agenda / Kegiatan" />
                            <TextInput
                                id="cal_title"
                                type="text"
                                className="mt-1 block w-full"
                                value={calendarForm.data.title}
                                onChange={(e) => calendarForm.setData('title', e.target.value)}
                                required
                                placeholder="Contoh: Libur Semester Ganjil, Ujian Akhir Semester"
                            />
                            <InputError message={calendarForm.errors.title} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <InputLabel htmlFor="cal_start" value="Tanggal Mulai" />
                                <TextInput
                                    id="cal_start"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={calendarForm.data.start_date}
                                    onChange={(e) => calendarForm.setData('start_date', e.target.value)}
                                    required
                                />
                                <InputError message={calendarForm.errors.start_date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="cal_end" value="Tanggal Selesai (Kosongkan jika hanya 1 hari)" />
                                <TextInput
                                    id="cal_end"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={calendarForm.data.end_date}
                                    onChange={(e) => calendarForm.setData('end_date', e.target.value)}
                                />
                                <InputError message={calendarForm.errors.end_date} className="mt-2" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="cal_desc" value="Deskripsi / Catatan Tambahan (Opsional)" />
                            <textarea
                                id="cal_desc"
                                rows="3"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                value={calendarForm.data.description}
                                onChange={(e) => calendarForm.setData('description', e.target.value)}
                                placeholder="Tulis catatan penting terkait agenda di sini..."
                            />
                            <InputError message={calendarForm.errors.description} className="mt-2" />
                        </div>

                        <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <InputLabel htmlFor="cal_category" value="Kategori Event" className="mb-2" />
                            <select
                                id="cal_category"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                value={
                                    calendarForm.data.is_holiday ? 'libur' :
                                    calendarForm.data.is_self_study ? 'mandiri' : 'efektif'
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    calendarForm.setData({
                                        ...calendarForm.data,
                                        is_holiday: val === 'libur',
                                        is_self_study: val === 'mandiri'
                                    });
                                }}
                            >
                                <option value="efektif">Efektif Sekolah (Siswa tetap masuk, misal: Ulang Tahun Sekolah, dsb)</option>
                                <option value="libur">Hari Libur Sekolah (Sekolah libur & siswa tidak masuk)</option>
                                <option value="mandiri">Belajar Mandiri (Siswa belajar dari rumah/daring)</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                            <SecondaryButton type="button" onClick={closeModal}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={calendarForm.processing}>
                                Simpan Agenda
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {modalType === 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleDelete} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Agenda Akademik</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Apakah Anda yakin ingin menghapus agenda <strong>{selectedRecord?.title}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <SecondaryButton type="button" onClick={closeModal}>
                                Batal
                            </SecondaryButton>
                            <DangerButton type="submit">
                                Hapus Permanen
                            </DangerButton>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
