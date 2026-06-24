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

export default function Index({ auth, academicYears, semesters, levels, schoolClasses, subjects, teachers }) {
    const [activeTab, setActiveTab] = useState('academicYears');
    const pageProps = usePage().props;

    // Entity Modals States
    const [modalType, setModalType] = useState(null); // 'create' or 'edit' or 'delete'
    const [activeEntity, setActiveEntity] = useState(null); // 'academicYear', 'semester', 'level', 'schoolClass', 'subject'
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Form Hooks for each entity
    const academicYearForm = useForm({ name: '', is_active: false });
    const semesterForm = useForm({ academic_year_id: '', name: '', is_active: false });
    const levelForm = useForm({ name: '' });
    const schoolClassForm = useForm({ name: '', level_id: '', teacher_id: '' });
    const subjectForm = useForm({ name: '', code: '', description: '' });

    // Open Create Modal
    const openCreateModal = (entityType) => {
        setActiveEntity(entityType);
        setModalType('create');
        
        if (entityType === 'academicYear') {
            academicYearForm.reset();
            academicYearForm.clearErrors();
        } else if (entityType === 'semester') {
            semesterForm.reset();
            // Default select first academic year if available
            if (academicYears.length > 0) {
                semesterForm.setData({
                    academic_year_id: academicYears[0].id.toString(),
                    name: '',
                    is_active: false
                });
            }
            semesterForm.clearErrors();
        } else if (entityType === 'level') {
            levelForm.reset();
            levelForm.clearErrors();
        } else if (entityType === 'schoolClass') {
            schoolClassForm.reset();
            if (levels.length > 0) {
                schoolClassForm.setData({
                    name: '',
                    level_id: levels[0].id.toString(),
                    teacher_id: ''
                });
            }
            schoolClassForm.clearErrors();
        } else if (entityType === 'subject') {
            subjectForm.reset();
            subjectForm.clearErrors();
        }
    };

    // Open Edit Modal
    const openEditModal = (entityType, record) => {
        setActiveEntity(entityType);
        setModalType('edit');
        setSelectedRecord(record);

        if (entityType === 'academicYear') {
            academicYearForm.setData({
                name: record.name,
                is_active: !!record.is_active,
            });
            academicYearForm.clearErrors();
        } else if (entityType === 'semester') {
            semesterForm.setData({
                academic_year_id: record.academic_year_id.toString(),
                name: record.name,
                is_active: !!record.is_active,
            });
            semesterForm.clearErrors();
        } else if (entityType === 'level') {
            levelForm.setData({
                name: record.name,
            });
            levelForm.clearErrors();
        } else if (entityType === 'schoolClass') {
            schoolClassForm.setData({
                name: record.name,
                level_id: record.level_id.toString(),
                teacher_id: record.teacher_id ? record.teacher_id.toString() : '',
            });
            schoolClassForm.clearErrors();
        } else if (entityType === 'subject') {
            subjectForm.setData({
                name: record.name,
                code: record.code,
                description: record.description || '',
            });
            subjectForm.clearErrors();
        }
    };

    // Open Delete Modal
    const openDeleteModal = (entityType, record) => {
        setActiveEntity(entityType);
        setModalType('delete');
        setSelectedRecord(record);
    };

    // Close Modal
    const closeModal = () => {
        setModalType(null);
        setActiveEntity(null);
        setSelectedRecord(null);
    };

    // Submit Handlers
    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeEntity === 'academicYear') {
            if (modalType === 'create') {
                academicYearForm.post(route('curriculum.academic-years.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                academicYearForm.put(route('curriculum.academic-years.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'semester') {
            if (modalType === 'create') {
                semesterForm.post(route('curriculum.semesters.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                semesterForm.put(route('curriculum.semesters.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'level') {
            if (modalType === 'create') {
                levelForm.post(route('curriculum.levels.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                levelForm.put(route('curriculum.levels.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'schoolClass') {
            if (modalType === 'create') {
                schoolClassForm.post(route('curriculum.classes.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                schoolClassForm.put(route('curriculum.classes.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'subject') {
            if (modalType === 'create') {
                subjectForm.post(route('curriculum.subjects.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                subjectForm.put(route('curriculum.subjects.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        }
    };

    // Delete Handlers
    const handleDelete = (e) => {
        e.preventDefault();
        
        let deleteRoute = '';
        if (activeEntity === 'academicYear') {
            deleteRoute = route('curriculum.academic-years.destroy', selectedRecord.id);
        } else if (activeEntity === 'semester') {
            deleteRoute = route('curriculum.semesters.destroy', selectedRecord.id);
        } else if (activeEntity === 'level') {
            deleteRoute = route('curriculum.levels.destroy', selectedRecord.id);
        } else if (activeEntity === 'schoolClass') {
            deleteRoute = route('curriculum.classes.destroy', selectedRecord.id);
        } else if (activeEntity === 'subject') {
            deleteRoute = route('curriculum.subjects.destroy', selectedRecord.id);
        }

        router.delete(deleteRoute, {
            onSuccess: () => closeModal()
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Manajemen Kurikulum & Akademik
                </h2>
            }
        >
            <Head title="Manajemen Kurikulum" />

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

                    {/* Global Error (e.g., integrity constraint error) */}
                    {pageProps.errors?.error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">
                                        {pageProps.errors.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs navigation */}
                    <div className="mb-6 bg-white rounded-lg shadow border border-gray-200">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('academicYears')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'academicYears'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Tahun Akademik
                                </button>
                                <button
                                    onClick={() => setActiveTab('semesters')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'semesters'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Semester
                                </button>
                                <button
                                    onClick={() => setActiveTab('levels')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'levels'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Tingkat Kelas
                                </button>
                                <button
                                    onClick={() => setActiveTab('schoolClasses')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'schoolClasses'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Kelas
                                </button>
                                <button
                                    onClick={() => setActiveTab('subjects')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'subjects'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Mata Pelajaran
                                </button>
                            </nav>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                            {activeTab === 'academicYears' && renderAcademicYearsTab()}
                            {activeTab === 'semesters' && renderSemestersTab()}
                            {activeTab === 'levels' && renderLevelsTab()}
                            {activeTab === 'schoolClasses' && renderSchoolClassesTab()}
                            {activeTab === 'subjects' && renderSubjectsTab()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Form Modal (Create & Edit) */}
            {modalType && modalType !== 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            {modalType === 'create' ? 'Tambah ' : 'Edit '} 
                            {activeEntity === 'academicYear' && 'Tahun Akademik'}
                            {activeEntity === 'semester' && 'Semester'}
                            {activeEntity === 'level' && 'Tingkat Kelas'}
                            {activeEntity === 'schoolClass' && 'Kelas'}
                            {activeEntity === 'subject' && 'Mata Pelajaran'}
                        </h3>

                        {activeEntity === 'academicYear' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="ay_name" value="Nama Tahun Ajaran (Contoh: 2025/2026)" />
                                    <TextInput
                                        id="ay_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={academicYearForm.data.name}
                                        onChange={(e) => academicYearForm.setData('name', e.target.value)}
                                        required
                                        placeholder="2025/2026"
                                    />
                                    <InputError message={academicYearForm.errors.name} className="mt-2" />
                                </div>
                                <div className="mb-4 flex items-center">
                                    <input
                                        id="ay_active"
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={academicYearForm.data.is_active}
                                        onChange={(e) => academicYearForm.setData('is_active', e.target.checked)}
                                    />
                                    <label htmlFor="ay_active" className="ml-2 text-sm text-gray-600 font-semibold">
                                        Set sebagai Tahun Akademik Aktif
                                    </label>
                                </div>
                            </>
                        )}

                        {activeEntity === 'semester' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="sem_ay" value="Tahun Akademik" />
                                    <select
                                        id="sem_ay"
                                        value={semesterForm.data.academic_year_id}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => semesterForm.setData('academic_year_id', e.target.value)}
                                        required
                                    >
                                        {academicYears.map((ay) => (
                                            <option key={ay.id} value={ay.id}>{ay.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={semesterForm.errors.academic_year_id} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="sem_name" value="Nama Semester (Contoh: Ganjil, Genap)" />
                                    <TextInput
                                        id="sem_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={semesterForm.data.name}
                                        onChange={(e) => semesterForm.setData('name', e.target.value)}
                                        required
                                        placeholder="Ganjil"
                                    />
                                    <InputError message={semesterForm.errors.name} className="mt-2" />
                                </div>
                                <div className="mb-4 flex items-center">
                                    <input
                                        id="sem_active"
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={semesterForm.data.is_active}
                                        onChange={(e) => semesterForm.setData('is_active', e.target.checked)}
                                    />
                                    <label htmlFor="sem_active" className="ml-2 text-sm text-gray-600 font-semibold">
                                        Set sebagai Semester Aktif
                                    </label>
                                </div>
                            </>
                        )}

                        {activeEntity === 'level' && (
                            <div className="mb-4">
                                <InputLabel htmlFor="lvl_name" value="Nama Tingkat (Contoh: Kelas X, Kelas XI)" />
                                <TextInput
                                    id="lvl_name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={levelForm.data.name}
                                    onChange={(e) => levelForm.setData('name', e.target.value)}
                                    required
                                    placeholder="Kelas X"
                                />
                                <InputError message={levelForm.errors.name} className="mt-2" />
                            </div>
                        )}

                        {activeEntity === 'schoolClass' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="cls_name" value="Nama Kelas (Contoh: X-A, XI-MIPA-1)" />
                                    <TextInput
                                        id="cls_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={schoolClassForm.data.name}
                                        onChange={(e) => schoolClassForm.setData('name', e.target.value)}
                                        required
                                        placeholder="X-A"
                                    />
                                    <InputError message={schoolClassForm.errors.name} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="cls_lvl" value="Tingkat Kelas" />
                                    <select
                                        id="cls_lvl"
                                        value={schoolClassForm.data.level_id}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => schoolClassForm.setData('level_id', e.target.value)}
                                        required
                                    >
                                        {levels.map((lvl) => (
                                            <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={schoolClassForm.errors.level_id} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="cls_teacher" value="Wali Kelas (Opsional)" />
                                    <select
                                        id="cls_teacher"
                                        value={schoolClassForm.data.teacher_id}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => schoolClassForm.setData('teacher_id', e.target.value)}
                                    >
                                        <option value="">-- Pilih Wali Kelas --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name} (NIP: {t.nip || '-'})</option>
                                        ))}
                                    </select>
                                    <InputError message={schoolClassForm.errors.teacher_id} className="mt-2" />
                                </div>
                            </>
                        )}

                        {activeEntity === 'subject' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="sub_name" value="Nama Mata Pelajaran (Contoh: Matematika Wajib)" />
                                    <TextInput
                                        id="sub_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={subjectForm.data.name}
                                        onChange={(e) => subjectForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={subjectForm.errors.name} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="sub_code" value="Kode Mata Pelajaran (Contoh: MTK-X)" />
                                    <TextInput
                                        id="sub_code"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={subjectForm.data.code}
                                        onChange={(e) => subjectForm.setData('code', e.target.value)}
                                        required
                                    />
                                    <InputError message={subjectForm.errors.code} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="sub_desc" value="Deskripsi Singkat (Opsional)" />
                                    <textarea
                                        id="sub_desc"
                                        rows="3"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={subjectForm.data.description}
                                        onChange={(e) => subjectForm.setData('description', e.target.value)}
                                    />
                                    <InputError message={subjectForm.errors.description} className="mt-2" />
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                            <SecondaryButton type="button" onClick={closeModal}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={
                                academicYearForm.processing || 
                                semesterForm.processing || 
                                levelForm.processing || 
                                schoolClassForm.processing || 
                                subjectForm.processing
                            }>
                                Simpan Data
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {modalType === 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleDelete} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hapus Komponen Kurikulum</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Apakah Anda yakin ingin menghapus data <strong>{selectedRecord?.name || selectedRecord?.code}</strong>? 
                            Tindakan ini tidak dapat dibatalkan dan dapat memicu eror jika data ini sedang digunakan oleh komponen lain.
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

    /* -------------------------------------------------------------------------- */
    /*                         TAB RENDERING FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    // 1. Academic Years Tab
    function renderAcademicYearsTab() {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700">Daftar Tahun Akademik</h3>
                    <PrimaryButton onClick={() => openCreateModal('academicYear')} className="text-xs">
                        + Tambah Tahun Akademik
                    </PrimaryButton>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {academicYears.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data tahun akademik.</td>
                                </tr>
                            ) : (
                                academicYears.map((ay) => (
                                    <tr key={ay.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{ay.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ay.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">Tidak Aktif</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('academicYear', ay)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('academicYear', ay)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 2. Semesters Tab
    function renderSemestersTab() {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700">Daftar Semester</h3>
                    {academicYears.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tahun Akademik terlebih dahulu sebelum membuat Semester.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('semester')} className="text-xs">
                            + Tambah Semester
                        </PrimaryButton>
                    )}
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {semesters.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data semester.</td>
                                </tr>
                            ) : (
                                semesters.map((sem) => (
                                    <tr key={sem.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{sem.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sem.academic_year?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sem.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">Tidak Aktif</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('semester', sem)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('semester', sem)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 3. Levels Tab
    function renderLevelsTab() {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700">Daftar Tingkat Kelas</h3>
                    <PrimaryButton onClick={() => openCreateModal('level')} className="text-xs">
                        + Tambah Tingkat Kelas
                    </PrimaryButton>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tingkat</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {levels.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data tingkat kelas.</td>
                                </tr>
                            ) : (
                                levels.map((lvl) => (
                                    <tr key={lvl.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{lvl.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('level', lvl)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('level', lvl)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 4. School Classes Tab
    function renderSchoolClassesTab() {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700">Daftar Kelas</h3>
                    {levels.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tingkat Kelas terlebih dahulu sebelum membuat Kelas.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schoolClass')} className="text-xs">
                            + Tambah Kelas
                        </PrimaryButton>
                    )}
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tingkat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wali Kelas</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schoolClasses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data kelas.</td>
                                </tr>
                            ) : (
                                schoolClasses.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{cls.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.level?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                            {cls.homeroom_teacher ? (
                                                <span>{cls.homeroom_teacher.name} <span className="text-xs text-gray-400">({cls.homeroom_teacher.nip || 'NIP -'})</span></span>
                                            ) : (
                                                <span className="text-gray-400 font-normal italic">Belum ditentukan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('schoolClass', cls)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('schoolClass', cls)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 5. Subjects Tab
    function renderSubjectsTab() {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700">Daftar Mata Pelajaran</h3>
                    <PrimaryButton onClick={() => openCreateModal('subject')} className="text-xs">
                        + Tambah Mata Pelajaran
                    </PrimaryButton>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data mata pelajaran.</td>
                                </tr>
                            ) : (
                                subjects.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{sub.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{sub.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{sub.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('subject', sub)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('subject', sub)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
