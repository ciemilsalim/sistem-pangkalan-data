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

export default function Index({ auth, academicYears, semesters, levels, schoolClasses, subjects, teachers, schedules, extracurriculars, studentsList }) {
    const hasRole = (role) => auth.user.roles?.includes(role);
    const hasPermission = (permission) => auth.user.permissions?.includes(permission);
    const isAdmin = hasRole('admin');
    const canManageCurriculum = isAdmin || hasPermission('manage_curriculum');
    const canManageCp = isAdmin || hasPermission('manage_cp');

    const [activeTab, setActiveTab] = useState(() => {
        if (!canManageCurriculum && canManageCp) {
            return 'subjects';
        }
        return 'academicYears';
    });
    const pageProps = usePage().props;

    // Entity Modals States
    const [modalType, setModalType] = useState(null); // 'create' or 'edit' or 'delete'
    const [activeEntity, setActiveEntity] = useState(null); // 'academicYear', 'semester', 'level', 'schoolClass', 'subject', 'schedule', 'extracurricular'
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Form Hooks for each entity
    const academicYearForm = useForm({ name: '', is_active: false });
    const semesterForm = useForm({ academic_year_id: '', name: '', is_active: false });
    const levelForm = useForm({ name: '' });
    const schoolClassForm = useForm({ name: '', level_id: '', teacher_id: '' });
    const subjectForm = useForm({ name: '', code: '', description: '' });
    const scheduleForm = useForm({
        school_class_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: '1',
        start_time: '07:00',
        end_time: '08:30',
    });
    const extracurricularForm = useForm({
        name: '',
        description: '',
        teacher_id: '',
        student_ids: [],
    });

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
        } else if (entityType === 'schedule') {
            scheduleForm.reset();
            scheduleForm.setData({
                school_class_id: schoolClasses.length > 0 ? schoolClasses[0].id.toString() : '',
                subject_id: subjects.length > 0 ? subjects[0].id.toString() : '',
                teacher_id: teachers.length > 0 ? teachers[0].id.toString() : '',
                day_of_week: '1',
                start_time: '07:00',
                end_time: '08:30',
            });
            scheduleForm.clearErrors();
        } else if (entityType === 'extracurricular') {
            extracurricularForm.reset();
            extracurricularForm.setData({
                name: '',
                description: '',
                teacher_id: '',
                student_ids: [],
            });
            extracurricularForm.clearErrors();
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
                name: record.name || '',
                level_id: record.level_id ? record.level_id.toString() : '',
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
        } else if (entityType === 'schedule') {
            const startClean = record.start_time ? record.start_time.substring(0, 5) : '';
            const endClean = record.end_time ? record.end_time.substring(0, 5) : '';
            scheduleForm.setData({
                school_class_id: record.teaching_assignment?.school_class_id?.toString() || '',
                subject_id: record.teaching_assignment?.subject_id?.toString() || '',
                teacher_id: record.teaching_assignment?.teacher_id?.toString() || '',
                day_of_week: record.day_of_week.toString(),
                start_time: startClean,
                end_time: endClean,
            });
            scheduleForm.clearErrors();
        } else if (entityType === 'extracurricular') {
            const linkedStudentIds = record.students ? record.students.map(s => s.id) : [];
            extracurricularForm.setData({
                name: record.name,
                description: record.description || '',
                teacher_id: record.teacher_id ? record.teacher_id.toString() : '',
                student_ids: linkedStudentIds,
            });
            extracurricularForm.clearErrors();
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
        } else if (activeEntity === 'schedule') {
            if (modalType === 'create') {
                scheduleForm.post(route('curriculum.schedules.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                scheduleForm.put(route('curriculum.schedules.update', selectedRecord.id), {
                    onSuccess: () => closeModal()
                });
            }
        } else if (activeEntity === 'extracurricular') {
            if (modalType === 'create') {
                extracurricularForm.post(route('curriculum.extracurriculars.store'), {
                    onSuccess: () => closeModal()
                });
            } else {
                extracurricularForm.put(route('curriculum.extracurriculars.update', selectedRecord.id), {
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
        } else if (activeEntity === 'schedule') {
            deleteRoute = route('curriculum.schedules.destroy', selectedRecord.id);
        } else if (activeEntity === 'extracurricular') {
            deleteRoute = route('curriculum.extracurriculars.destroy', selectedRecord.id);
        }

        router.delete(deleteRoute, {
            onSuccess: () => closeModal()
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
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
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('academicYears')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'academicYears'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Tahun Akademik
                                </button>
                                <button
                                    onClick={() => setActiveTab('semesters')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'semesters'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Semester
                                </button>
                                <button
                                    onClick={() => setActiveTab('levels')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'levels'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Tingkat Kelas
                                </button>
                                <button
                                    onClick={() => setActiveTab('schoolClasses')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'schoolClasses'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Kelas
                                </button>
                                <button
                                    onClick={() => setActiveTab('subjects')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'subjects'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Mata Pelajaran
                                </button>

                                <button
                                    onClick={() => setActiveTab('extracurriculars')}
                                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                        activeTab === 'extracurriculars'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Ekstrakurikuler
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

                            {activeTab === 'extracurriculars' && renderExtracurricularsTab()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Form Modal (Create & Edit) */}
            {modalType && modalType !== 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
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
                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={academicYearForm.data.is_active}
                                        onChange={(e) => academicYearForm.setData('is_active', e.target.checked)}
                                    />
                                    <label htmlFor="ay_active" className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-semibold">
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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
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
                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={semesterForm.data.is_active}
                                        onChange={(e) => semesterForm.setData('is_active', e.target.checked)}
                                    />
                                    <label htmlFor="sem_active" className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-semibold">
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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={subjectForm.data.description}
                                        onChange={(e) => subjectForm.setData('description', e.target.value)}
                                    />
                                    <InputError message={subjectForm.errors.description} className="mt-2" />
                                </div>
                            </>
                        )}

                        {activeEntity === 'schedule' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <InputLabel htmlFor="sch_class" value="Kelas" />
                                        <select
                                            id="sch_class"
                                            value={scheduleForm.data.school_class_id}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => scheduleForm.setData('school_class_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Kelas --</option>
                                            {schoolClasses.map((cls) => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={scheduleForm.errors.school_class_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sch_subject" value="Mata Pelajaran" />
                                        <select
                                            id="sch_subject"
                                            value={scheduleForm.data.subject_id}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => scheduleForm.setData('subject_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Mapel --</option>
                                            {subjects.map((sub) => (
                                                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                            ))}
                                        </select>
                                        <InputError message={scheduleForm.errors.subject_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sch_teacher" value="Guru Pengampu" />
                                        <select
                                            id="sch_teacher"
                                            value={scheduleForm.data.teacher_id}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => scheduleForm.setData('teacher_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Guru --</option>
                                            {teachers.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={scheduleForm.errors.teacher_id} className="mt-2" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="sch_day" value="Hari" />
                                    <select
                                        id="sch_day"
                                        value={scheduleForm.data.day_of_week}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => scheduleForm.setData('day_of_week', e.target.value)}
                                        required
                                    >
                                        <option value="1">Senin</option>
                                        <option value="2">Selasa</option>
                                        <option value="3">Rabu</option>
                                        <option value="4">Kamis</option>
                                        <option value="5">Jumat</option>
                                    </select>
                                    <InputError message={scheduleForm.errors.day_of_week} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <InputLabel htmlFor="sch_start" value="Jam Mulai (HH:MM)" />
                                        <TextInput
                                            id="sch_start"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={scheduleForm.data.start_time}
                                            onChange={(e) => scheduleForm.setData('start_time', e.target.value)}
                                            required
                                        />
                                        <InputError message={scheduleForm.errors.start_time} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sch_end" value="Jam Selesai (HH:MM)" />
                                        <TextInput
                                            id="sch_end"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={scheduleForm.data.end_time}
                                            onChange={(e) => scheduleForm.setData('end_time', e.target.value)}
                                            required
                                        />
                                        <InputError message={scheduleForm.errors.end_time} className="mt-2" />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeEntity === 'extracurricular' && (
                            <>
                                <div className="mb-4">
                                    <InputLabel htmlFor="extra_name" value="Nama Ekstrakurikuler (Contoh: Pramuka, Basket)" />
                                    <TextInput
                                        id="extra_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={extracurricularForm.data.name}
                                        onChange={(e) => extracurricularForm.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={extracurricularForm.errors.name} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="extra_coach" value="Guru Pembina / Pelatih" />
                                    <select
                                        id="extra_coach"
                                        value={extracurricularForm.data.teacher_id}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => extracurricularForm.setData('teacher_id', e.target.value)}
                                    >
                                        <option value="">-- Tanpa Pembina / Pilih Nanti --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={extracurricularForm.errors.teacher_id} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel htmlFor="extra_desc" value="Deskripsi / Catatan Tambahan (Opsional)" />
                                    <textarea
                                        id="extra_desc"
                                        rows="3"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={extracurricularForm.data.description}
                                        onChange={(e) => extracurricularForm.setData('description', e.target.value)}
                                    />
                                    <InputError message={extracurricularForm.errors.description} className="mt-2" />
                                </div>
                                <div className="mb-4">
                                    <InputLabel value="Daftar Anggota Siswa (Pilih satu atau lebih)" />
                                    <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm max-h-40 overflow-y-auto p-2 bg-white dark:bg-gray-800">
                                        {studentsList.length === 0 ? (
                                            <span className="text-sm text-gray-400 italic">Belum ada data siswa.</span>
                                        ) : (
                                            studentsList.map((student) => (
                                                <label key={student.id} className="flex items-center mb-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:ring-indigo-500 h-4 w-4"
                                                        checked={extracurricularForm.data.student_ids.includes(student.id)}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...extracurricularForm.data.student_ids, student.id]
                                                                : extracurricularForm.data.student_ids.filter(id => id !== student.id);
                                                            extracurricularForm.setData('student_ids', newIds);
                                                        }}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-semibold">{student.name} <span className="text-xs text-gray-400">({student.nis})</span></span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <InputError message={extracurricularForm.errors.student_ids} className="mt-2" />
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                            <SecondaryButton type="button" onClick={closeModal} title="Batal">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </SecondaryButton>
                            <PrimaryButton type="submit" title="Simpan Data" disabled={
                                academicYearForm.processing || 
                                semesterForm.processing || 
                                levelForm.processing || 
                                schoolClassForm.processing || 
                                subjectForm.processing ||
                                scheduleForm.processing ||
                                extracurricularForm.processing
                            }>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                                </svg>
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {modalType === 'delete' && (
                <Modal show={true} onClose={closeModal}>
                    <form onSubmit={handleDelete} className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Komponen Kurikulum</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Apakah Anda yakin ingin menghapus data <strong>{selectedRecord?.name || selectedRecord?.code}</strong>? 
                            Tindakan ini tidak dapat dibatalkan dan dapat memicu eror jika data ini sedang digunakan oleh komponen lain.
                        </p>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <SecondaryButton type="button" onClick={closeModal} title="Batal">
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
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Tahun Akademik</h3>
                    {canManageCurriculum && (
                        <PrimaryButton onClick={() => openCreateModal('academicYear')} className="text-xs" title="Tambah Tahun Akademik">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {academicYears.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data tahun akademik.</td>
                                </tr>
                            ) : (
                                academicYears.map((ay) => (
                                    <tr key={ay.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{ay.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ay.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">Tidak Aktif</span>
                                            )}
                                        </td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('academicYear', ay)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('academicYear', ay)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
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
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Semester</h3>
                    {canManageCurriculum && (academicYears.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tahun Akademik terlebih dahulu sebelum membuat Semester.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('semester')} className="text-xs" title="Tambah Semester">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    ))}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Semester</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {semesters.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data semester.</td>
                                </tr>
                            ) : (
                                semesters.map((sem) => (
                                    <tr key={sem.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{sem.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sem.academic_year?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sem.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">Tidak Aktif</span>
                                            )}
                                        </td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('semester', sem)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('semester', sem)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
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
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Tingkat Kelas</h3>
                    {canManageCurriculum && (
                        <PrimaryButton onClick={() => openCreateModal('level')} className="text-xs" title="Tambah Tingkat Kelas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {levels.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data tingkat kelas.</td>
                                </tr>
                            ) : (
                                levels.map((lvl) => (
                                    <tr key={lvl.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{lvl.name}</td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('level', lvl)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('level', lvl)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
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
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Kelas</h3>
                    {canManageCurriculum && (levels.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tingkat Kelas terlebih dahulu sebelum membuat Kelas.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schoolClass')} className="text-xs" title="Tambah Kelas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    ))}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wali Kelas</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {schoolClasses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data kelas.</td>
                                </tr>
                            ) : (
                                schoolClasses.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{cls.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cls.level?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                            {cls.homeroom_teacher ? (
                                                <span>{cls.homeroom_teacher.name} <span className="text-xs text-gray-400">({cls.homeroom_teacher.nip || 'NIP -'})</span></span>
                                            ) : (
                                                <span className="text-gray-400 font-normal italic">Belum ditentukan</span>
                                            )}
                                        </td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('schoolClass', cls)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('schoolClass', cls)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
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
                <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Mata Pelajaran</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        {canManageCp && (
                            <Link href={route('curriculum.capaian-pembelajaran.index')} className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-md font-semibold text-xs text-indigo-700 uppercase tracking-widest shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 w-full md:w-auto justify-center">
                                Kelola Capaian Pembelajaran (CP)
                            </Link>
                        )}
                        {canManageCurriculum && (
                            <PrimaryButton onClick={() => openCreateModal('subject')} className="text-xs w-full md:w-auto justify-center" title="Tambah Mata Pelajaran">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </PrimaryButton>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kode</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {subjects.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data mata pelajaran.</td>
                                </tr>
                            ) : (
                                subjects.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{sub.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{sub.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{sub.description || '-'}</td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('subject', sub)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('subject', sub)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 6. Schedules Tab
    function renderSchedulesTab() {
        const getDayName = (dayNum) => {
            const days = {
                1: 'Senin',
                2: 'Selasa',
                3: 'Rabu',
                4: 'Kamis',
                5: 'Jumat',
                6: 'Sabtu',
                7: 'Minggu'
            };
            return days[dayNum] || 'Tidak Diketahui';
        };

        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Jadwal Pelajaran</h3>
                    {canManageCurriculum && (schoolClasses.length === 0 || subjects.length === 0 || teachers.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 p-2 border border-red-200 rounded">
                            Pastikan data Kelas, Mata Pelajaran, dan Guru sudah tersedia sebelum membuat jadwal.
                        </p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schedule')} className="text-xs" title="Tambah Jadwal Pelajaran">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    ))}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hari</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waktu</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Guru Pengampu</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {schedules.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data jadwal pelajaran.</td>
                                </tr>
                            ) : (
                                schedules.map((sch) => {
                                    const startClean = sch.start_time ? sch.start_time.substring(0, 5) : '';
                                    const endClean = sch.end_time ? sch.end_time.substring(0, 5) : '';
                                    return (
                                        <tr key={sch.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{getDayName(sch.day_of_week)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{startClean} - {endClean}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-950">{sch.teaching_assignment?.school_class?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {sch.teaching_assignment?.subject?.name || '-'} <span className="text-xs text-gray-400 font-semibold">({sch.teaching_assignment?.subject?.code})</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                                {sch.teaching_assignment?.teacher?.name || '-'}
                                            </td>
                                            {canManageCurriculum && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal('schedule', sch)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => openDeleteModal('schedule', sch)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 7. Extracurriculars Tab
    function renderExtracurricularsTab() {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Kegiatan Ekstrakurikuler</h3>
                    {canManageCurriculum && (
                        <PrimaryButton onClick={() => openCreateModal('extracurricular')} className="text-xs" title="Tambah Ekstrakurikuler">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Ekskul</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Guru Pembina</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Anggota</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            {extracurriculars.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada data ekstrakurikuler.</td>
                                </tr>
                            ) : (
                                extracurriculars.map((extra) => (
                                    <tr key={extra.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{extra.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-semibold">
                                            {extra.coach ? (
                                                <span>{extra.coach.name} <span className="text-xs text-gray-400 font-normal">({extra.coach.nip || '-'})</span></span>
                                            ) : (
                                                <span className="text-gray-400 italic font-normal">Belum ditentukan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                                            {extra.students ? extra.students.length : 0} Siswa
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{extra.description || '-'}</td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('extracurricular', extra)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('extracurricular', extra)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
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
