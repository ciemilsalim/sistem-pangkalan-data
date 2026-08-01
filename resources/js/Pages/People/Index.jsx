import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    const [studentStatus, setStudentStatus] = useState(filters.student_status || 'aktif');
    const [schoolClassId, setSchoolClassId] = useState(filters.school_class_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [selectedItems, setSelectedItems] = useState([]);
    const pageProps = usePage().props;

    // Modal States
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [modalType, setModalType] = useState(null); // 'create' or 'edit' or 'delete'
    const [activeEntity, setActiveEntity] = useState(null); // 'student' or 'teacher' or 'parent'
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [qrFilter, setQrFilter] = useState({ search: '', school_class_id: '' });
    const [parentSearchTerm, setParentSearchTerm] = useState('');
    const [studentPhotoPreview, setStudentPhotoPreview] = useState(null);


    // Form Hooks
    const studentForm = useForm({
        name: '',
        nis: '',
        learning_email: '',
        school_class_id: '',
        email: '',
        password: '',
        parent_ids: [],
        status: 'aktif',
        photo: null,
    });

    useEffect(() => {
        if (!studentForm.data.photo) {
            setStudentPhotoPreview(null);
            return;
        }
        if (!(studentForm.data.photo instanceof File)) {
            return;
        }
        const objectUrl = URL.createObjectURL(studentForm.data.photo);
        setStudentPhotoPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [studentForm.data.photo]);

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
        setSelectedItems([]); // Clear selection when switching tabs
        router.get(route('people.index'), {
            tab: newTab,
            search: '', // clear search when switching tabs
            per_page: perPage,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        if(e) e.preventDefault();
        router.get(route('people.index'), {
            tab: activeTab,
            search: search,
            per_page: perPage,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        setStudentStatus('aktif');
        setSchoolClassId('');
        setPerPage('10');
        setSelectedItems([]);
        router.get(route('people.index'), {
            tab: activeTab,
            student_status: 'aktif',
            school_class_id: ''
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        router.get(route('people.index'), {
            tab: activeTab,
            search: search,
            per_page: newPerPage,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, { preserveState: true, replace: true });
    };

    const handleSelectAll = (e, items) => {
        if (e.target.checked) {
            setSelectedItems(items.map(i => i.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (e, id) => {
        if (e.target.checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleBulkDeleteSubmit = (e) => {
        e.preventDefault();
        if (deleteConfirmationText !== 'DELETE') return;
        
        router.delete(route('people.bulkDestroy'), {
            data: { ids: selectedItems, type: activeTab },
            onSuccess: () => {
                setIsBulkDeleteOpen(false);
                setSelectedItems([]);
                setDeleteConfirmationText('');
            }
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
                    learning_email: '',
                    school_class_id: schoolClasses[0].id.toString(),
                    email: '',
                    password: '',
                    parent_ids: [],
                    photo: null,
                    status: 'aktif',
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
                learning_email: record.learning_email || '',
                school_class_id: record.school_class_id ? record.school_class_id.toString() : '',
                email: record.user?.email || '',
                password: '', // optional on update
                parent_ids: linkedParentIds,
                status: record.status || 'aktif',
                photo: null,
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

    // Open Detail Modal
    const openDetailModal = (entityType, record) => {
        setActiveEntity(entityType);
        setModalType('detail');
        setSelectedRecord(record);
    };

    // Close Modal
    const closeModal = () => {
        setModalType(null);
        setActiveEntity(null);
        setSelectedRecord(null);
        setParentSearchTerm(''); // Reset search term on close
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
                studentForm.post(route('people.students.update', selectedRecord.id), {
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
                            {activeTab === 'students' && (
                                <>
                                    <div className="w-full sm:w-48">
                                        <select
                                            className="block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={schoolClassId}
                                            onChange={(e) => setSchoolClassId(e.target.value)}
                                        >
                                            <option value="">Semua Kelas</option>
                                            {schoolClasses.map((cls) => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-48">
                                        <select
                                            className="block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={studentStatus}
                                            onChange={(e) => setStudentStatus(e.target.value)}
                                        >
                                            <option value="aktif">Status: Aktif</option>
                                            <option value="lulus_pindah">Status: Lulus / Pindah</option>
                                            <option value="berhenti">Status: Berhenti / Tidak Aktif</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="flex gap-2 w-full sm:w-auto">
                                <PrimaryButton type="submit" className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs" title="Cari">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </PrimaryButton>
                                {(filters.search || search) && (
                                    <SecondaryButton onClick={handleReset} type="button" className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs" title="Reset Filter">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </SecondaryButton>
                                )}
                            </div>
                        </form>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full xl:w-auto mt-4 xl:mt-0">
                            {activeTab === 'students' && (
                                <>
                                    <SecondaryButton
                                        onClick={() => {
                                            setActiveEntity('student');
                                            setModalType('import');
                                            importForm.reset();
                                        }}
                                        className="w-full sm:w-auto justify-center text-xs px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50"
                                        title="Import Excel"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </SecondaryButton>
                                    {auth.user.permissions?.includes('print_student_qr') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalType('qr');
                                                setQrFilter({ search: '', school_class_id: '' });
                                            }}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-sky-700 active:bg-sky-900 focus:outline-none focus:border-sky-900 focus:ring ring-sky-300 disabled:opacity-25 transition ease-in-out duration-150 w-full sm:w-auto"
                                            title="Cetak QR"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            )}
                            <PrimaryButton
                                onClick={() => openCreateModal(activeTab.slice(0, -1))} // slice 's' (students -> student)
                                className="w-full sm:w-auto justify-center text-xs"
                                title={`Tambah ${
                                    activeTab === 'students' ? 'Siswa' :
                                    activeTab === 'teachers' ? 'Guru' :
                                    'Wali Murid'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
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
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Panduan Import Data</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
                                        Pastikan file Excel atau CSV yang Anda unggah memiliki header (baris pertama) dengan nama kolom: <strong>nis</strong>, <strong>nama</strong>, dan <strong>kelas</strong> (opsional).
                                    </p>
                                    <a
                                        href={route('people.students.template')}
                                        className="inline-flex items-center text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:underline"
                                    >
                                        <svg className="mr-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Unduh Contoh Format CSV
                                    </a>
                                </div>

                                <InputLabel htmlFor="import_file" value="Pilih File Excel / CSV" />
                                <input
                                    id="import_file"
                                    type="file"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => importForm.setData('file', e.target.files[0])}
                                    required
                                />
                                <InputError message={importForm.errors.file} className="mt-2" />
                            </div>
                        )}

                        {/* STUDENT FORM FIELDS */}
                        {activeEntity === 'student' && modalType !== 'import' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Left Column: Identity & Credentials */}
                                <div className="space-y-4">
                                    <div>
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="stud_nis" value="NIS" />
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
                                                required={studentForm.data.status === 'aktif'}
                                            >
                                                <option value="">-- Pilih Kelas --</option>
                                                {schoolClasses.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.level?.name || 'Kurikulum'})</option>
                                                ))}
                                            </select>
                                            <InputError message={studentForm.errors.school_class_id} className="mt-2" />
                                        </div>
                                    </div>

                                    <div>
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

                                    <div>
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

                                        <div className="mt-4">
                                            <InputLabel htmlFor="status" value="Status Siswa" />
                                            <select
                                                id="status"
                                                value={studentForm.data.status}
                                                onChange={(e) => studentForm.setData('status', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                            >
                                                <option value="aktif">Aktif</option>
                                                <option value="lulus">Lulus</option>
                                                <option value="pindah">Pindah</option>
                                                <option value="tidak_aktif">Tidak Aktif</option>
                                            </select>
                                            <InputError message={studentForm.errors.status} className="mt-2" />
                                        </div>
                                </div>

                                {/* Right Column: Photo, Learning Email, Parent Association */}
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="stud_photo" value="Foto Siswa (Opsional)" />
                                        <div className="mt-1 flex items-center gap-4">
                                            {/* Photo Preview Container */}
                                            <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                {studentPhotoPreview ? (
                                                    <img src={studentPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : selectedRecord?.photo ? (
                                                    <img src={`/storage/${selectedRecord.photo}`} alt="Current" className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    id="stud_photo"
                                                    type="file"
                                                    accept="image/*"
                                                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    onChange={(e) => studentForm.setData('photo', e.target.files[0])}
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Saran: foto portret vertikal.</p>
                                            </div>
                                        </div>
                                        <InputError message={studentForm.errors.photo} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="stud_learning_email" value="Email Belajar (Opsional)" />
                                        <TextInput
                                            id="stud_learning_email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={studentForm.data.learning_email}
                                            onChange={(e) => studentForm.setData('learning_email', e.target.value)}
                                            placeholder="nama@belajar.id"
                                        />
                                        <InputError message={studentForm.errors.learning_email} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel value="Hubungkan dengan Wali Murid (Pilih satu atau lebih)" />
                                        <TextInput
                                            type="text"
                                            placeholder="Cari nama wali murid..."
                                            className="mt-1 mb-2 block w-full text-sm"
                                            value={parentSearchTerm}
                                            onChange={(e) => setParentSearchTerm(e.target.value)}
                                        />
                                        <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm max-h-32 overflow-y-auto p-2 bg-white dark:bg-gray-800">
                                            {parentsList.length === 0 ? (
                                                <span className="text-sm text-gray-400 italic">Belum ada data wali murid.</span>
                                            ) : (
                                                parentsList.filter(parent => parent.name.toLowerCase().includes(parentSearchTerm.toLowerCase())).length === 0 ? (
                                                    <span className="text-sm text-gray-400 italic">Wali murid tidak ditemukan.</span>
                                                ) : (
                                                    parentsList.filter(parent => parent.name.toLowerCase().includes(parentSearchTerm.toLowerCase())).map((parent) => (
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
                                                )
                                            )}
                                        </div>
                                        <InputError message={studentForm.errors.parent_ids} className="mt-2" />
                                    </div>
                                </div>
                            </div>
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

                        <div className="mt-6 flex justify-end gap-3 border-t pt-4 border-gray-200 dark:border-gray-700">
                            <SecondaryButton type="button" onClick={closeModal} title="Batal" className="px-4 py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </SecondaryButton>
                            <PrimaryButton className="px-4 py-2" title={modalType === 'import' ? 'Import Data' : 'Simpan Data'} disabled={
                                modalType === 'import' ? importForm.processing :
                                activeEntity === 'student' ? studentForm.processing :
                                activeEntity === 'teacher' ? teacherForm.processing :
                                parentForm.processing
                            }>
                                {modalType === 'import' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Detail Student Modal */}
            {modalType === 'detail' && activeEntity === 'student' && selectedRecord && (
                <Modal show={true} onClose={closeModal} maxWidth="2xl">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detail Siswa: {selectedRecord.name}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Photo Column */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-start space-y-3 md:w-1/3">
                                <div className="w-40 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                                    {selectedRecord.photo ? (
                                        <img src={`/storage/${selectedRecord.photo}`} alt={selectedRecord.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="text-center">
                                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                                        selectedRecord.status === 'aktif' ? 'bg-green-100 text-green-800' :
                                        selectedRecord.status === 'lulus' ? 'bg-blue-100 text-blue-800' :
                                        selectedRecord.status === 'pindah' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedRecord.status === 'tidak_aktif' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        Status: {selectedRecord.status ? selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1) : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Data Column */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">NIS</h4>
                                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100">{selectedRecord.nis || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kelas</h4>
                                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100 font-bold">{selectedRecord.school_class?.name || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Akun Login</h4>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedRecord.user?.email || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Belajar (Belajar.id)</h4>
                                    <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">{selectedRecord.learning_email || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Wali Murid Terhubung</h4>
                                    {selectedRecord.parents && selectedRecord.parents.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {selectedRecord.parents.map((p) => (
                                                <div key={p.id} className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{p.phone_number || p.user?.email || 'Tidak ada kontak'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Belum ada wali murid yang dihubungkan.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <SecondaryButton onClick={closeModal} className="px-4 py-2">
                                Tutup
                            </SecondaryButton>
                            <PrimaryButton onClick={() => {
                                closeModal();
                                openEditModal('student', selectedRecord);
                            }} className="px-4 py-2">
                                Edit Data
                            </PrimaryButton>
                        </div>
                    </div>
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
                            <SecondaryButton type="button" onClick={closeModal} title="Batal" className="px-4 py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </SecondaryButton>
                            <DangerButton type="submit" title="Hapus Permanen" className="px-4 py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
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
                            <SecondaryButton type="button" onClick={closeModal} title="Batal" className="px-4 py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </SecondaryButton>
                            <a
                                href={`${route('people.students.qr')}?search=${encodeURIComponent(qrFilter.search)}&school_class_id=${qrFilter.school_class_id}`}
                                target="_blank"
                                onClick={closeModal}
                                className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-sky-700 active:bg-sky-900 focus:outline-none focus:border-sky-900 focus:ring ring-sky-300 disabled:opacity-25 transition ease-in-out duration-150"
                                title="Cetak Sekarang"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                                </svg>
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {students.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data siswa ditemukan.</td>
                                </tr>
                            ) : (
                                students.data.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-semibold">{student.nis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-950 font-bold">{student.school_class?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {student.status === 'aktif' ? (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Aktif</span>
                                            ) : student.status === 'lulus' ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Lulus</span>
                                            ) : student.status === 'pindah' ? (
                                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pindah</span>
                                            ) : student.status === 'tidak_aktif' ? (
                                                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Tidak Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{student.status || '-'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openDetailModal('student', student)} className="text-blue-600 hover:text-blue-900 mr-3" title="Detail">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openEditModal('student', student)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('student', student)} className="text-red-600 hover:text-red-900" title="Hapus">
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
                                            <button onClick={() => openEditModal('teacher', teacher)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('teacher', teacher)} className="text-red-600 hover:text-red-900" title="Hapus">
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
                                            <button onClick={() => openEditModal('parent', parent)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('parent', parent)} className="text-red-600 hover:text-red-900" title="Hapus">
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
                        title="Sebelumnya"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <Link
                        href={paginator.next_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.next_page_url && 'pointer-events-none opacity-50'}`}
                        title="Berikutnya"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
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
                                    dangerouslySetInnerHTML={{ __html: link.label.includes('Previous') ? '&laquo;' : (link.label.includes('Next') ? '&raquo;' : link.label) }}
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
