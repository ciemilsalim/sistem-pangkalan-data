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

export default function Index({ auth, students, teachers, parents, schoolClasses, parentsList, studentsList, subjectsList, filters }) {
    const activeTab = filters.tab || 'students';
    const [search, setSearch] = useState(filters.search || '');
    const pageProps = usePage().props;

    // Modal States
    const [modalType, setModalType] = useState(null); // 'create' or 'edit' or 'delete'
    const [activeEntity, setActiveEntity] = useState(null); // 'student' or 'teacher' or 'parent'
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [qrFilter, setQrFilter] = useState({ search: '', school_class_id: '' });

    // Form Hooks
    const studentForm = useForm({
        name: '',
        nis: '',
        school_class_id: '',
        email: '',
        password: '',
        parent_ids: [],
    });

    const teacherForm = useForm({
        name: '',
        nip: '',
        phone_number: '',
        email: '',
        password: '',
        subject_ids: [],
    });

    const parentForm = useForm({
        name: '',
        phone_number: '',
        email: '',
        password: '',
        student_ids: [],
    });

    const importForm = useForm({
        file: null,
    });

    // Handle Tab Switch (reloads page via Inertia with new tab param)
    const handleTabSwitch = (newTab) => {
        router.get(route('people.index'), {
            tab: newTab,
            search: '' // clear search when switching tabs
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('people.index'), {
            tab: activeTab,
            search: search
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        router.get(route('people.index'), {
            tab: activeTab
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Open Create Modal
    const openCreateModal = (entityType) => {
        setActiveEntity(entityType);
        setModalType('create');

        if (entityType === 'student') {
            studentForm.reset();
            if (schoolClasses.length > 0) {
                studentForm.setData({
                    name: '',
                    nis: '',
                    school_class_id: schoolClasses[0].id.toString(),
                    email: '',
                    password: '',
                    parent_ids: [],
                });
            }
            studentForm.clearErrors();
        } else if (entityType === 'teacher') {
            teacherForm.reset();
            teacherForm.setData({
                name: '',
                nip: '',
                phone_number: '',
                email: '',
                password: '',
                subject_ids: [],
            });
            teacherForm.clearErrors();
        } else if (entityType === 'parent') {
            parentForm.reset();
            parentForm.clearErrors();
        }
    };

    // Open Edit Modal
    const openEditModal = (entityType, record) => {
        setActiveEntity(entityType);
        setModalType('edit');
        setSelectedRecord(record);

        if (entityType === 'student') {
            const linkedParentIds = record.parents ? record.parents.map(p => p.id) : [];
            studentForm.setData({
                name: record.name,
                nis: record.nis,
                school_class_id: record.school_class_id.toString(),
                email: record.user?.email || '',
                password: '', // optional on update
                parent_ids: linkedParentIds,
            });
            studentForm.clearErrors();
        } else if (entityType === 'teacher') {
            const linkedSubjectIds = record.subjects ? record.subjects.map(s => s.id) : [];
            teacherForm.setData({
                name: record.name,
                nip: record.nip,
                phone_number: record.phone_number || '',
                email: record.user?.email || '',
                password: '', // optional
                subject_ids: linkedSubjectIds,
            });
            teacherForm.clearErrors();
        } else if (entityType === 'parent') {
            const linkedStudentIds = record.students ? record.students.map(s => s.id) : [];
            parentForm.setData({
                name: record.name,
                phone_number: record.phone_number || '',
                email: record.user?.email || '',
                password: '', // optional
                student_ids: linkedStudentIds,
            });
            parentForm.clearErrors();
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

    // Form Submit Handlers
    const handleStudentSubmit = (e) => {
        e.preventDefault();
        if (modalType === 'create') {
            studentForm.post(route('people.students.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            studentForm.put(route('people.students.update', selectedRecord.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        importForm.post(route('people.students.import'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeEntity === 'student') {
            if (modalType === 'create') {
                studentForm.post(route('people.students.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                studentForm.put(route('people.students.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'teacher') {
            if (modalType === 'create') {
                teacherForm.post(route('people.teachers.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                teacherForm.put(route('people.teachers.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'parent') {
            if (modalType === 'create') {
                parentForm.post(route('people.parents.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                parentForm.put(route('people.parents.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        }
    };

    // Delete Handlers
    const handleDelete = (e) => {
        e.preventDefault();

        let deleteRoute = '';
        if (activeEntity === 'student') {
            deleteRoute = route('people.students.destroy', selectedRecord.id);
        } else if (activeEntity === 'teacher') {
            deleteRoute = route('people.teachers.destroy', selectedRecord.id);
        } else if (activeEntity === 'parent') {
            deleteRoute = route('people.parents.destroy', selectedRecord.id);
        }

        router.delete(deleteRoute, {
            onSuccess: () => closeModal()
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Manajemen Sivitas Akademika (Siswa, Guru, Wali)
                </h2>
            }
        >
            <Head title="Manajemen Pengguna Akademik" />

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
                    
                    {pageProps.errors && pageProps.errors.import_errors && (
                        <div className="mb-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-sm" role="alert">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">
                                        Terjadi kesalahan saat mengimpor Excel: {pageProps.errors.import_errors}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter and Create Header */}
                    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full xl:w-auto">
                            <div className="w-full sm:w-80">
                                <TextInput
                                    id="search"
                                    type="text"
                                    name="search"
                                    value={search}
                                    className="block w-full text-sm border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                                    placeholder={
                                        activeTab === 'students' ? 'Cari nama, NIS, atau email...' :
                                        activeTab === 'teachers' ? 'Cari nama, NIP, atau email...' :
                                        'Cari nama, telp, atau email...'
                                    }
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <PrimaryButton type="submit" className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs">
                                    Cari
                                </PrimaryButton>
                                {(filters.search || search) && (
                                    <SecondaryButton onClick={handleReset} type="button" className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs">
                                        Reset
                                    </SecondaryButton>
                                )}
                            </div>
                        </form>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full xl:w-auto">
                            {activeTab === 'students' && (
                                <>
                                    <SecondaryButton
                                        onClick={() => {
                                            setActiveEntity('student');
                                            setModalType('import');
                                            importForm.reset();
                                        }}
                                        className="w-full sm:w-auto justify-center text-xs px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50"
                                    >
                                        Import Excel
                                    </SecondaryButton>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalType('qr');
                                            setQrFilter({ search: '', school_class_id: '' });
                                        }}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-sky-700 active:bg-sky-900 focus:outline-none focus:border-sky-900 focus:ring ring-sky-300 disabled:opacity-25 transition ease-in-out duration-150 w-full sm:w-auto"
                                    >
                                        Cetak QR
                                    </button>
                                </>
                            )}
                            <PrimaryButton
                                onClick={() => openCreateModal(activeTab.slice(0, -1))} // slice 's' (students -> student)
                                className="w-full sm:w-auto justify-center text-xs"
                            >
                                + Tambah {
                                    activeTab === 'students' ? 'Siswa' :
                                    activeTab === 'teachers' ? 'Guru' :
                                    'Wali Murid'
                                }
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Tabs navigation */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                                <button
                                    onClick={() => handleTabSwitch('students')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold ${
                                        activeTab === 'students'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Siswa ({students?.total || 0})
                                </button>
                                <button
                                    onClick={() => handleTabSwitch('teachers')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold ${
                                        activeTab === 'teachers'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Guru ({teachers?.total || 0})
                                </button>
                                <button
                                    onClick={() => handleTabSwitch('parents')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold ${
                                        activeTab === 'parents'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Wali Murid ({parents?.total || 0})
                                </button>
                            </nav>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                            {activeTab === 'students' && renderStudentsTab()}
                            {activeTab === 'teachers' && renderTeachersTab()}
                            {activeTab === 'parents' && renderParentsTab()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create & Edit Modal */}
            {modalType && modalType !== 'delete' && modalType !== 'qr' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={modalType === 'import' ? handleImportSubmit : handleSubmit} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            {modalType === 'create' ? 'Tambah ' : modalType === 'import' ? 'Import ' : 'Edit '}
                            {activeEntity === 'student' && 'Siswa'}
                            {activeEntity === 'teacher' && 'Guru'}
                            {activeEntity === 'parent' && 'Wali Murid'}
                        </h3>

                        {/* IMPORT FORM FIELDS */}
                        {modalType === 'import' && (
                            <div className="mb-4">
                                <InputLabel htmlFor="import_file" value="Pilih File Excel" />
                                <input
                                    id="import_file"
                                    type="file"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => importForm.setData('file', e.target.files[0])}
                                    required
                                />
                                <InputError message={importForm.errors.file} className="mt-2" />
                            </div>
                        )}

                        {/* STUDENT FORM FIELDS */}
                        {activeEntity === 'student' && modalType !== 'import' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="stud_name" value="Nama Lengkap Siswa" />
                                    <TextInput
                                        id="stud_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={studentForm.data.name}
                                        onChange={(e) => studentForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={studentForm.errors.name} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <InputLabel htmlFor="stud_nis" value="NIS (Nomor Induk Siswa)" />
                                        <TextInput
                                            id="stud_nis"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={studentForm.data.nis}
                                            onChange={(e) => studentForm.setData('nis', e.target.value)}
                                            required
                                        />
                                        <InputError message={studentForm.errors.nis} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="stud_class" value="Kelas" />
                                        <select
                                            id="stud_class"
                                            value={studentForm.data.school_class_id}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => studentForm.setData('school_class_id', e.target.value)}
                                            required
                                        >
                                            {schoolClasses.map((cls) => (
                                                <option key={cls.id} value={cls.id}>{cls.name} ({cls.level?.name || 'Kurikulum'})</option>
                                            ))}
                                        </select>
                                        <InputError message={studentForm.errors.school_class_id} className="mt-2" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="stud_email" value="Email Login Akun" />
                                    <TextInput
                                        id="stud_email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={studentForm.data.email}
                                        onChange={(e) => studentForm.setData('email', e.target.value)}
                                        required
                                        placeholder="email@sekolah.com"
                                    />
                                    <InputError message={studentForm.errors.email} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="stud_pass" value={modalType === 'create' ? "Password Login" : "Ubah Password (Kosongkan jika tidak diubah)"} />
                                    <TextInput
                                        id="stud_pass"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={studentForm.data.password}
                                        onChange={(e) => studentForm.setData('password', e.target.value)}
                                        required={modalType === 'create'}
                                        placeholder={modalType === 'edit' ? "Password Baru (Opsional)" : ""}
                                    />
                                    <InputError message={studentForm.errors.password} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel value="Hubungkan dengan Wali Murid (Pilih satu atau lebih)" />
                                    <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm max-h-32 overflow-y-auto p-2 bg-white dark:bg-gray-800">
                                        {parentsList.length === 0 ? (
                                            <span className="text-sm text-gray-400 italic">Belum ada data wali murid.</span>
                                        ) : (
                                            parentsList.map((parent) => (
                                                <label key={parent.id} className="flex items-center mb-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={studentForm.data.parent_ids.includes(parent.id)}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...studentForm.data.parent_ids, parent.id]
                                                                : studentForm.data.parent_ids.filter(id => id !== parent.id);
                                                            studentForm.setData('parent_ids', newIds);
                                                        }}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{parent.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <InputError message={studentForm.errors.parent_ids} className="mt-2" />
                                </div>
                            </>
                        )}

                        {/* TEACHER FORM FIELDS */}
                        {activeEntity === 'teacher' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="teach_name" value="Nama Lengkap Guru" />
                                    <TextInput
                                        id="teach_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={teacherForm.data.name}
                                        onChange={(e) => teacherForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={teacherForm.errors.name} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <InputLabel htmlFor="teach_nip" value="NIP (Nomor Induk Pegawai)" />
                                        <TextInput
                                            id="teach_nip"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={teacherForm.data.nip}
                                            onChange={(e) => teacherForm.setData('nip', e.target.value)}
                                            required
                                        />
                                        <InputError message={teacherForm.errors.nip} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="teach_phone" value="No. Telepon (WhatsApp)" />
                                        <TextInput
                                            id="teach_phone"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={teacherForm.data.phone_number || ''}
                                            onChange={(e) => teacherForm.setData('phone_number', e.target.value)}
                                        />
                                        <InputError message={teacherForm.errors.phone_number} className="mt-2" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="teach_email" value="Email Login Akun" />
                                    <TextInput
                                        id="teach_email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={teacherForm.data.email}
                                        onChange={(e) => teacherForm.setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={teacherForm.errors.email} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="teach_pass" value={modalType === 'create' ? "Password Login" : "Ubah Password (Kosongkan jika tidak diubah)"} />
                                    <TextInput
                                        id="teach_pass"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={teacherForm.data.password}
                                        onChange={(e) => teacherForm.setData('password', e.target.value)}
                                        required={modalType === 'create'}
                                        placeholder={modalType === 'edit' ? "Password Baru (Opsional)" : ""}
                                    />
                                    <InputError message={teacherForm.errors.password} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel value="Mata Pelajaran Diampu (Pilih satu atau lebih)" />
                                    <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm max-h-32 overflow-y-auto p-2 bg-white dark:bg-gray-800">
                                        {subjectsList.length === 0 ? (
                                            <span className="text-sm text-gray-400 italic">Belum ada data mata pelajaran.</span>
                                        ) : (
                                            subjectsList.map((subject) => (
                                                <label key={subject.id} className="flex items-center mb-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={teacherForm.data.subject_ids.includes(subject.id)}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...teacherForm.data.subject_ids, subject.id]
                                                                : teacherForm.data.subject_ids.filter(id => id !== subject.id);
                                                            teacherForm.setData('subject_ids', newIds);
                                                        }}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{subject.name} ({subject.code})</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <InputError message={teacherForm.errors.subject_ids} className="mt-2" />
                                </div>
                            </>
                        )}

                        {/* PARENT FORM FIELDS */}
                        {activeEntity === 'parent' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="par_name" value="Nama Wali / Orang Tua" />
                                    <TextInput
                                        id="par_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={parentForm.data.name}
                                        onChange={(e) => parentForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={parentForm.errors.name} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="par_phone" value="No. Telepon (WhatsApp)" />
                                    <TextInput
                                        id="par_phone"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={parentForm.data.phone_number || ''}
                                        onChange={(e) => parentForm.setData('phone_number', e.target.value)}
                                    />
                                    <InputError message={parentForm.errors.phone_number} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="par_email" value="Email Login Akun" />
                                    <TextInput
                                        id="par_email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={parentForm.data.email}
                                        onChange={(e) => parentForm.setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={parentForm.errors.email} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="par_pass" value={modalType === 'create' ? "Password Login" : "Ubah Password (Kosongkan jika tidak diubah)"} />
                                    <TextInput
                                        id="par_pass"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={parentForm.data.password}
                                        onChange={(e) => parentForm.setData('password', e.target.value)}
                                        required={modalType === 'create'}
                                        placeholder={modalType === 'edit' ? "Password Baru (Opsional)" : ""}
                                    />
                                    <InputError message={parentForm.errors.password} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel value="Hubungkan dengan Anak (Siswa) (Pilih satu atau lebih)" />
                                    <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm max-h-32 overflow-y-auto p-2 bg-white dark:bg-gray-800">
                                        {studentsList.length === 0 ? (
                                            <span className="text-sm text-gray-400 italic">Belum ada data siswa.</span>
                                        ) : (
                                            studentsList.map((student) => (
                                                <label key={student.id} className="flex items-center mb-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={parentForm.data.student_ids.includes(student.id)}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...parentForm.data.student_ids, student.id]
                                                                : parentForm.data.student_ids.filter(id => id !== student.id);
                                                            parentForm.setData('student_ids', newIds);
                                                        }}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{student.name} ({student.nis})</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <InputError message={parentForm.errors.student_ids} className="mt-2" />
                                </div>
                            </>
                        )}

                        <div className="mt-6 flex justify-end border-t pt-4 border-gray-200 dark:border-gray-700">
                            <SecondaryButton type="button" onClick={closeModal}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton className="ml-3" disabled={
                                modalType === 'import' ? importForm.processing :
                                activeEntity === 'student' ? studentForm.processing :
                                activeEntity === 'teacher' ? teacherForm.processing :
                                parentForm.processing
                            }>
                                {modalType === 'import' ? 'Import' : 'Simpan Data'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {modalType === 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleDelete} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Profil & Akun Pengguna</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Apakah Anda yakin ingin menghapus data <strong>{selectedRecord?.name}</strong>? 
                            Tindakan ini akan menghapus data profil akademik beserta **akun login terkait** dari sistem secara permanen.
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

            {/* Cetak QR Modal */}
            {modalType === 'qr' && (
                <Modal show={true} onClose={closeModal}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            Filter Cetak QR Code
                        </h3>
                        <div className="mb-4">
                            <InputLabel htmlFor="qr_search" value="Cari Nama / NIS" />
                            <TextInput
                                id="qr_search"
                                type="text"
                                className="mt-1 block w-full"
                                value={qrFilter.search}
                                onChange={(e) => setQrFilter({ ...qrFilter, search: e.target.value })}
                                placeholder="Kosongkan untuk mencetak semua..."
                            />
                        </div>
                        <div className="mb-6">
                            <InputLabel htmlFor="qr_class" value="Filter Berdasarkan Kelas" />
                            <select
                                id="qr_class"
                                value={qrFilter.school_class_id}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                onChange={(e) => setQrFilter({ ...qrFilter, school_class_id: e.target.value })}
                            >
                                <option value="">Semua Kelas</option>
                                {schoolClasses.map((cls) => (
                                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.level?.name || 'Kurikulum'})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <SecondaryButton type="button" onClick={closeModal}>
                                Batal
                            </SecondaryButton>
                            <a
                                href={`${route('people.students.qr')}?search=${encodeURIComponent(qrFilter.search)}&school_class_id=${qrFilter.school_class_id}`}
                                target="_blank"
                                onClick={closeModal}
                                className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-sky-700 active:bg-sky-900 focus:outline-none focus:border-sky-900 focus:ring ring-sky-300 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                Cetak Sekarang
                            </a>
                        </div>
                    </div>
                </Modal>
            )}
        </AuthenticatedLayout>
    );

    /* -------------------------------------------------------------------------- */
    /*                         TAB RENDERING FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    // 1. Students Tab
    function renderStudentsTab() {
        return (
            <div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Siswa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">NIS</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email Akun</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Wali Murid</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {students.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data siswa ditemukan.</td>
                                </tr>
                            ) : (
                                students.data.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-semibold">{student.nis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-950 font-bold">{student.school_class?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.user?.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {student.parents && student.parents.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {student.parents.map((p) => (
                                                        <span key={p.id} className="inline-flex items-center rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-100">{p.name}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Belum dihubungkan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('student', student)} className="text-indigo-600 hover:text-indigo-600 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('student', student)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {renderPagination(students)}
            </div>
        );
    }

    // 2. Teachers Tab
    function renderTeachersTab() {
        return (
            <div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nama Guru</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">NIP</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Mata Pelajaran Diampu</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">No. Telepon</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email Akun</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {teachers.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data guru ditemukan.</td>
                                </tr>
                            ) : (
                                teachers.data.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{teacher.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">{teacher.nip}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {teacher.subjects && teacher.subjects.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.subjects.map((sub) => (
                                                        <span key={sub.id} className="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-500">
                                                            {sub.name} ({sub.code})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Belum dihubungkan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{teacher.phone_number || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teacher.user?.email || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('teacher', teacher)} className="text-indigo-600 hover:text-indigo-600 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('teacher', teacher)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {renderPagination(teachers)}
            </div>
        );
    }

    // 3. Parents Tab
    function renderParentsTab() {
        return (
            <div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Wali Murid</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">No. Telepon</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email Akun</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Anak Terhubung</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {parents.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data wali murid ditemukan.</td>
                                </tr>
                            ) : (
                                parents.data.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{parent.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{parent.phone_number || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{parent.user?.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {parent.students && parent.students.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {parent.students.map((child) => (
                                                        <span key={child.id} className="inline-flex items-center rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
                                                            {child.name} ({child.nis})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Belum dihubungkan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('parent', parent)} className="text-indigo-600 hover:text-indigo-600 mr-4">Edit</button>
                                            <button onClick={() => openDeleteModal('parent', parent)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {renderPagination(parents)}
            </div>
        );
    }

    // Server-side Pagination Renderer Helper
    function renderPagination(paginator) {
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
                            Menampilkan <span className="font-semibold">{paginator.from || 0}</span> sampai <span className="font-semibold">{paginator.to || 0}</span> dari <span className="font-semibold">{paginator.total}</span> data
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
    }
}
