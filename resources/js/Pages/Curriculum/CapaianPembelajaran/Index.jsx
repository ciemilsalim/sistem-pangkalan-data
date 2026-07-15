import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function CapaianPembelajaranIndex({ auth, capaianPembelajarans, subjects, nextCpNumbers, filters }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [faseFilter, setFaseFilter] = useState(filters.fase || '');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject_id || '');

    const form = useForm({
        kode: '',
        fase: 'D',
        elemen: '',
        subject_id: '',
        deskripsi: '',
    });

    useEffect(() => {
        if (isCreating && form.data.subject_id) {
            const nextNumber = nextCpNumbers[form.data.subject_id] || 1;
            const selectedSubject = subjects.find(s => s.id == form.data.subject_id);
            const prefix = selectedSubject?.code ? `${selectedSubject.code} ` : '';
            const generatedKode = `${prefix}CP.${nextNumber}`;
            if (form.data.kode !== generatedKode) {
                form.setData('kode', generatedKode);
            }
        }
    }, [form.data.subject_id, isCreating, subjects, nextCpNumbers]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('curriculum.capaian-pembelajaran.index'), {
            search: searchTerm,
            fase: faseFilter,
            subject_id: subjectFilter
        }, { preserveState: true });
    };

    const openCreateModal = () => {
        form.reset();
        setIsCreating(true);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        form.setData({
            kode: item.kode,
            fase: item.fase,
            elemen: item.elemen || '',
            subject_id: item.subject_id,
            deskripsi: item.deskripsi,
        });
        setIsEditing(true);
    };

    const confirmDeletion = (item) => {
        setSelectedItem(item);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setIsCreating(false);
        setIsEditing(false);
        setConfirmingDeletion(false);
        setSelectedItem(null);
        form.reset();
        form.clearErrors();
    };

    const storeItem = (e) => {
        e.preventDefault();
        form.post(route('curriculum.capaian-pembelajaran.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const updateItem = (e) => {
        e.preventDefault();
        form.put(route('curriculum.capaian-pembelajaran.update', selectedItem.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const deleteItem = (e) => {
        e.preventDefault();
        router.delete(route('curriculum.capaian-pembelajaran.destroy', selectedItem.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const fases = ['Fondasi', 'A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen Capaian Pembelajaran (CP)</h2>}
        >
            <Head title="Capaian Pembelajaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    <TextInput
                                        type="text"
                                        placeholder="Cari CP..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-48"
                                    />
                                    <select
                                        className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm w-full sm:w-32"
                                        value={faseFilter}
                                        onChange={e => setFaseFilter(e.target.value)}
                                    >
                                        <option value="">Semua Fase</option>
                                        {fases.map(fase => (
                                            <option key={fase} value={fase}>Fase {fase}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm w-full sm:w-48"
                                        value={subjectFilter}
                                        onChange={e => setSubjectFilter(e.target.value)}
                                    >
                                        <option value="">Semua Mapel</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                                        ))}
                                    </select>
                                    <PrimaryButton type="submit">Filter</PrimaryButton>
                                </form>
                                <PrimaryButton onClick={openCreateModal} className="shrink-0">
                                    + Tambah CP
                                </PrimaryButton>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Kode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">Elemen</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Fase</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">Mata Pelajaran</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deskripsi</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {capaianPembelajarans.data.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.kode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">
                                                    {item.elemen || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {item.fase}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {item.subject ? item.subject.name : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl truncate" title={item.deskripsi}>
                                                        {item.deskripsi}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal(item)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => confirmDeletion(item)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {capaianPembelajarans.data.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 italic">
                                                    Tidak ada data Capaian Pembelajaran.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Component bisa ditambahkan disini */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal show={isCreating || isEditing} onClose={closeModal}>
                <form onSubmit={isEditing ? updateItem : storeItem} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {isEditing ? 'Edit Capaian Pembelajaran' : 'Tambah Capaian Pembelajaran'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                            <select
                                id="subject_id"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={form.data.subject_id}
                                onChange={(e) => form.setData('subject_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>Pilih Mata Pelajaran...</option>
                                {subjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={form.errors.subject_id} />
                        </div>

                        <div>
                            <InputLabel htmlFor="fase" value="Fase" />
                            <select
                                id="fase"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={form.data.fase}
                                onChange={(e) => form.setData('fase', e.target.value)}
                                required
                            >
                                <option value="" disabled>Pilih Fase...</option>
                                {fases.map(fase => (
                                    <option key={fase} value={fase}>{fase}</option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={form.errors.fase} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="kode" value="Kode CP" />
                            <TextInput
                                id="kode"
                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800"
                                value={form.data.kode}
                                onChange={(e) => form.setData('kode', e.target.value)}
                                required
                                placeholder="Kode otomatis terisi (contoh: CP.1)"
                            />
                            <p className="mt-1 text-xs text-gray-500">Otomatis dibuat berurutan saat memilih Mata Pelajaran.</p>
                            <InputError className="mt-2" message={form.errors.kode} />
                        </div>

                        <div>
                            <InputLabel htmlFor="elemen" value="Nama Elemen (Opsional)" />
                            <TextInput
                                id="elemen"
                                className="mt-1 block w-full"
                                value={form.data.elemen}
                                onChange={(e) => form.setData('elemen', e.target.value)}
                                placeholder="Contoh: Bilangan / Menyimak"
                            />
                            <InputError className="mt-2" message={form.errors.elemen} />
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="deskripsi" value="Deskripsi Capaian" />
                        <textarea
                            id="deskripsi"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            rows="4"
                            value={form.data.deskripsi}
                            onChange={(e) => form.setData('deskripsi', e.target.value)}
                            required
                        ></textarea>
                        <InputError className="mt-2" message={form.errors.deskripsi} />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3" disabled={form.processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={confirmingDeletion} onClose={closeModal}>
                <form onSubmit={deleteItem} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Hapus Capaian Pembelajaran?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus <strong>{selectedItem?.kode}</strong> secara permanen?
                        Data yang sudah dihapus mungkin mempengaruhi data relasional di LMS.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3 bg-red-600 hover:bg-red-500" disabled={form.processing}>
                            Ya, Hapus
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
