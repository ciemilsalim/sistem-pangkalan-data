import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({
    auth,
    incomingMutations,
    outgoingMutations,
    stats,
    schoolClasses,
    activeAcademicYear,
    activeStudents,
    schoolSettings,
    filters
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'masuk');
    const [search, setSearch] = useState(filters.search || '');
    const [classFilter, setClassFilter] = useState(filters.school_class_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    // Modals
    const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
    const [isOutgoingModalOpen, setIsOutgoingModalOpen] = useState(false);
    const [isAcceptanceLetterModalOpen, setIsAcceptanceLetterModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMutation, setSelectedMutation] = useState(null);

    // Search inside Outgoing form for active student
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    // Standard Dapodik reasons for student mutation
    const standardReasons = [
        'Mengikuti Orang Tua / Pindah Domisili',
        'Jarak Tempat Tinggal Terlalu Jauh',
        'Pindah ke Pondok Pesantren / Boarding School',
        'Kondisi Khusus / Kesehatan',
        'Alasan Ekonomi / Keluarga',
        'Keinginan Pribadi Siswa',
        'Lainnya'
    ];

    // Form: Incoming Mutation (Siswa Pindahan Masuk)
    const incomingForm = useForm({
        name: '',
        nis: '',
        learning_email: '',
        school_class_id: '',
        religion: 'islam',
        email: '',
        password: '',
        parent_name: '',
        parent_phone: '',
        mutation_date: new Date().toISOString().split('T')[0],
        school_name: '',
        school_npsn: '',
        school_city: '',
        school_province: '',
        reference_number: '',
        reason: standardReasons[0],
        notes: '',
        document_file: null,
    });

    // Auto-generate student email and password based on NIS
    const handleNisChange = (nisVal) => {
        incomingForm.setData({
            ...incomingForm.data,
            nis: nisVal,
            email: nisVal ? `${nisVal}@mokopani.com` : '',
            learning_email: nisVal ? `${nisVal}@smp.belajar.id` : '',
            password: nisVal || '',
        });
    };

    // Form: Outgoing Mutation (Siswa Pindah Keluar)
    const outgoingForm = useForm({
        student_id: '',
        mutation_date: new Date().toISOString().split('T')[0],
        school_name: '',
        school_npsn: '',
        school_city: '',
        school_province: '',
        reference_number: '',
        letter_number_destination: '',
        letter_date: new Date().toISOString().split('T')[0],
        reason: standardReasons[0],
        parent_name: '',
        parent_phone: '',
        notes: '',
        document_file: null,
    });

    // Form: Quick Acceptance Letter (Surat Lolos Butuh Mandiri)
    const acceptanceLetterForm = useForm({
        letter_number: `421.3/${String(Math.floor(Math.random() * 900) + 100)}/SMP.01/TU/${new Date().getFullYear()}`,
        student_name: '',
        nisn: '',
        origin_school: '',
        target_class: schoolClasses.length > 0 ? schoolClasses[0].name : 'Kelas VII',
        parent_name: '',
        reason: 'Mengikuti Orang Tua / Pindah Domisili',
        academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    });

    // Form: Edit Mutation Record
    const editForm = useForm({
        mutation_date: '',
        reference_number: '',
        school_name: '',
        school_npsn: '',
        school_city: '',
        school_province: '',
        reason: '',
        parent_name: '',
        parent_phone: '',
        letter_number_destination: '',
        letter_date: '',
        notes: '',
        document_file: null,
    });

    // Filter active students for Outgoing student picker
    const filteredActiveStudents = useMemo(() => {
        if (!studentSearchTerm) return activeStudents;
        const term = studentSearchTerm.toLowerCase();
        return activeStudents.filter(s => 
            s.name.toLowerCase().includes(term) || 
            (s.nis && s.nis.toLowerCase().includes(term))
        );
    }, [activeStudents, studentSearchTerm]);

    // Handle search filter submission
    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('student-mutations.index'), {
            tab: activeTab,
            search,
            school_class_id: classFilter,
            per_page: perPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle Tab change
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        router.get(route('student-mutations.index'), {
            tab: tabName,
            search,
            school_class_id: classFilter,
            per_page: perPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Submit Incoming Mutation
    const submitIncoming = (e) => {
        e.preventDefault();
        incomingForm.post(route('student-mutations.incoming'), {
            onSuccess: () => {
                setIsIncomingModalOpen(false);
                incomingForm.reset();
            }
        });
    };

    // Submit Outgoing Mutation
    const submitOutgoing = (e) => {
        e.preventDefault();
        outgoingForm.post(route('student-mutations.outgoing'), {
            onSuccess: () => {
                setIsOutgoingModalOpen(false);
                outgoingForm.reset();
            }
        });
    };

    // Open Edit/Detail Modal
    const openEditModal = (mutation) => {
        setSelectedMutation(mutation);
        editForm.setData({
            mutation_date: mutation.mutation_date ? mutation.mutation_date.split('T')[0] : '',
            reference_number: mutation.reference_number || '',
            school_name: mutation.school_name || '',
            school_npsn: mutation.school_npsn || '',
            school_city: mutation.school_city || '',
            school_province: mutation.school_province || '',
            reason: mutation.reason || '',
            parent_name: mutation.parent_name || '',
            parent_phone: mutation.parent_phone || '',
            letter_number_destination: mutation.letter_number_destination || '',
            letter_date: mutation.letter_date ? mutation.letter_date.split('T')[0] : '',
            notes: mutation.notes || '',
            document_file: null,
        });
        setIsDetailModalOpen(true);
    };

    // Submit Edit Mutation
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.post(route('student-mutations.update', selectedMutation.id), {
            _method: 'PUT',
            onSuccess: () => {
                setIsDetailModalOpen(false);
                setSelectedMutation(null);
            }
        });
    };

    // Open Delete Confirmation Modal
    const openDeleteModal = (mutation) => {
        setSelectedMutation(mutation);
        setIsDeleteModalOpen(true);
    };

    // Submit Delete Mutation
    const submitDelete = () => {
        if (!selectedMutation) return;
        router.delete(route('student-mutations.destroy', selectedMutation.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedMutation(null);
            }
        });
    };

    // Open Acceptance Letter Print
    const handlePrintAcceptanceDirect = (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            letter_number: acceptanceLetterForm.data.letter_number,
            student_name: acceptanceLetterForm.data.student_name,
            nisn: acceptanceLetterForm.data.nisn,
            origin_school: acceptanceLetterForm.data.origin_school,
            target_class: acceptanceLetterForm.data.target_class,
            parent_name: acceptanceLetterForm.data.parent_name,
            reason: acceptanceLetterForm.data.reason,
            academic_year: acceptanceLetterForm.data.academic_year,
        });
        window.open(`${route('student-mutations.print-acceptance')}?${params.toString()}`, '_blank');
        setIsAcceptanceLetterModalOpen(false);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-100 leading-tight flex items-center gap-2.5">
                            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                </svg>
                            </span>
                            Manajemen Mutasi Siswa
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs animate-pulse">
                                FITUR BARU
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pencatatan siswa pindahan masuk, mutasi keluar, rekam jejak rombel, dan penerbitan surat resmi kedinasan.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => setIsAcceptanceLetterModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow-sm transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Cetak Surat Lolos Butuh
                        </button>
                        <button
                            onClick={() => setIsOutgoingModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                            Proses Mutasi Keluar
                        </button>
                        <button
                            onClick={() => setIsIncomingModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Catat Siswa Masuk
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Mutasi Siswa (Pindahan & Keluar)" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Masuk Tahun Ini</p>
                                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{stats.total_incoming_year}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">Siswa pindahan masuk semester/tahun aktif</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keluar Tahun Ini</p>
                                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{stats.total_outgoing_year}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">Siswa pindah ke sekolah lain tahun ini</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Riwayat Masuk</p>
                                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.total_incoming_all}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">Akumulasi seluruh siswa pindahan masuk</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Riwayat Keluar</p>
                                <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{stats.total_outgoing_all}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">Akumulasi seluruh siswa mutasi keluar</div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
                    
                    {/* Tab Navigation & Search Filter */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Tabs */}
                        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => handleTabChange('masuk')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                    activeTab === 'masuk'
                                        ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Siswa Pindahan Masuk
                                <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold">
                                    {incomingMutations.total}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTabChange('keluar')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                    activeTab === 'keluar'
                                        ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Siswa Pindah Keluar
                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-bold">
                                    {outgoingMutations.total}
                                </span>
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[240px]">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari siswa, NIS, sekolah..."
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>

                            <select
                                value={classFilter}
                                onChange={(e) => {
                                    setClassFilter(e.target.value);
                                    router.get(route('student-mutations.index'), {
                                        tab: activeTab,
                                        search,
                                        school_class_id: e.target.value,
                                        per_page: perPage,
                                    }, { preserveState: true, replace: true });
                                }}
                                className="py-2 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Semua Rombel/Kelas</option>
                                {schoolClasses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
                            >
                                Filter
                            </button>
                        </form>
                    </div>

                    {/* Table: Mutasi Masuk (Incoming) */}
                    {activeTab === 'masuk' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-gray-700/40 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">Tgl Masuk</th>
                                        <th className="px-5 py-3.5 font-semibold">Nama Siswa</th>
                                        <th className="px-5 py-3.5 font-semibold">Rombel Tujuan</th>
                                        <th className="px-5 py-3.5 font-semibold">Sekolah Asal</th>
                                        <th className="px-5 py-3.5 font-semibold">Alasan</th>
                                        <th className="px-5 py-3.5 font-semibold">No Surat Asal</th>
                                        <th className="px-5 py-3.5 font-semibold">Berkas</th>
                                        <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {incomingMutations.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-5 py-12 text-center text-gray-400 dark:text-gray-500">
                                                <div className="max-w-sm mx-auto flex flex-col items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>
                                                    <p className="font-semibold text-gray-600 dark:text-gray-300">Belum ada data siswa pindahan masuk</p>
                                                    <p className="text-xs text-gray-400 mt-1">Gunakan tombol "Catat Siswa Masuk" di atas untuk menambahkan data siswa baru pindahan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        incomingMutations.data.map((m) => (
                                            <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {m.mutation_date ? new Date(m.mutation_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {m.student ? m.student.name : 'Siswa telah dihapus'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        NIS: {m.student ? m.student.nis : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                                        {m.school_class ? m.school_class.name : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{m.school_name}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {[m.school_npsn ? `NPSN: ${m.school_npsn}` : null, m.school_city].filter(Boolean).join(' • ')}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 max-w-xs truncate text-xs text-gray-600 dark:text-gray-300" title={m.reason}>
                                                    {m.reason}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                    {m.reference_number || '-'}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {m.document_url ? (
                                                        <a
                                                            href={m.document_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                                            </svg>
                                                            Lihat
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={route('student-mutations.print-acceptance-record', m.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Cetak Surat Lolos Butuh"
                                                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.115-.465-1.12-1.08L6.34 18m11.32 0h-11.32m9.495-8.81a3.97 3.97 0 0 0-3.663-2.91 3.97 3.97 0 0 0-3.663 2.91m7.325 0a3 3 0 1 1-6 0m6 0v-.025a1.214 1.214 0 0 0-1.025-1.196L14.25 7.5m-4.5 1.479-.175-.854a1.214 1.214 0 0 0-1.025-1.196v.025" />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => openEditModal(m)}
                                                            title="Detail & Edit Catatan"
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(m)}
                                                            title="Hapus Catatan Mutasi"
                                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Table: Mutasi Keluar (Outgoing) */}
                    {activeTab === 'keluar' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-gray-700/40 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">Tgl Keluar</th>
                                        <th className="px-5 py-3.5 font-semibold">Nama Siswa</th>
                                        <th className="px-5 py-3.5 font-semibold">Kelas Asal</th>
                                        <th className="px-5 py-3.5 font-semibold">Sekolah Tujuan</th>
                                        <th className="px-5 py-3.5 font-semibold">Alasan Kepindahan</th>
                                        <th className="px-5 py-3.5 font-semibold">No Surat Pindah</th>
                                        <th className="px-5 py-3.5 font-semibold">Berkas</th>
                                        <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {outgoingMutations.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-5 py-12 text-center text-gray-400 dark:text-gray-500">
                                                <div className="max-w-sm mx-auto flex flex-col items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                                    </svg>
                                                    <p className="font-semibold text-gray-600 dark:text-gray-300">Belum ada data siswa mutasi keluar</p>
                                                    <p className="text-xs text-gray-400 mt-1">Gunakan tombol "Proses Mutasi Keluar" untuk mencatat siswa yang pindah ke sekolah lain.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        outgoingMutations.data.map((m) => (
                                            <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {m.mutation_date ? new Date(m.mutation_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {m.student ? m.student.name : 'Siswa telah dihapus'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        NIS: {m.student ? m.student.nis : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                                                        {m.school_class ? m.school_class.name : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{m.school_name}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {[m.school_npsn ? `NPSN: ${m.school_npsn}` : null, m.school_city].filter(Boolean).join(' • ')}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 max-w-xs truncate text-xs text-gray-600 dark:text-gray-300" title={m.reason}>
                                                    {m.reason}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                    {m.reference_number || `421.3/${String(m.id).padStart(3, '0')}/SMP.01/TU`}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {m.document_url ? (
                                                        <a
                                                            href={m.document_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                                            </svg>
                                                            Lihat
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={route('student-mutations.print-transfer', m.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Cetak Surat Keterangan Pindah Sekolah Resmi"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.115-.465-1.12-1.08L6.34 18m11.32 0h-11.32m9.495-8.81a3.97 3.97 0 0 0-3.663-2.91 3.97 3.97 0 0 0-3.663 2.91m7.325 0a3 3 0 1 1-6 0m6 0v-.025a1.214 1.214 0 0 0-1.025-1.196L14.25 7.5m-4.5 1.479-.175-.854a1.214 1.214 0 0 0-1.025-1.196v.025" />
                                                            </svg>
                                                            Cetak Surat Pindah
                                                        </a>
                                                        <button
                                                            onClick={() => openEditModal(m)}
                                                            title="Detail & Edit Catatan"
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(m)}
                                                            title="Batalkan / Hapus Mutasi"
                                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: CATAT SISWA PINDAHAN MASUK                                      */}
            {/* ========================================================================= */}
            <Modal show={isIncomingModalOpen} onClose={() => setIsIncomingModalOpen(false)} maxWidth="2xl">
                <form onSubmit={submitIncoming} className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Catat Siswa Pindahan Masuk</h3>
                                <p className="text-xs text-gray-500">Mendaftarkan peserta didik baru yang pindah dari SMP/MTs lain.</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsIncomingModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                    </div>

                    <div className="mt-5 max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                        
                        {/* Section A: Identitas Siswa */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">1. Data Calon Siswa</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="in_name" value="Nama Lengkap Siswa *" />
                                    <TextInput
                                        id="in_name"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.name}
                                        onChange={(e) => incomingForm.setData('name', e.target.value)}
                                        required
                                        placeholder="Contoh: Muhammad Farhan"
                                    />
                                    <InputError message={incomingForm.errors.name} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_nis" value="Nomor Induk Siswa (NIS) *" />
                                    <TextInput
                                        id="in_nis"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.nis}
                                        onChange={(e) => handleNisChange(e.target.value)}
                                        required
                                        placeholder="Contoh: 2026071"
                                    />
                                    <InputError message={incomingForm.errors.nis} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <InputLabel htmlFor="in_school_class_id" value="Rombel / Kelas Penempatan *" />
                                        {activeAcademicYear && (
                                            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 tracking-tight">
                                                T.A. {activeAcademicYear.name} ({activeAcademicYear.semester_name})
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        id="in_school_class_id"
                                        className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={incomingForm.data.school_class_id}
                                        onChange={(e) => incomingForm.setData('school_class_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Kelas Tujuan (T.A. Aktif)...</option>
                                        {schoolClasses.length === 0 ? (
                                            <option value="" disabled>Tidak ada kelas di tahun ajaran aktif</option>
                                        ) : (
                                            schoolClasses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.level ? `(Tingkat ${c.level.name})` : ''}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {schoolClasses.length === 0 && (
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                                            * Belum ada kelas yang dibuat untuk Tahun Ajaran aktif ini. Silakan buat kelas di menu Manajemen Kurikulum &gt; Kelas.
                                        </p>
                                    )}
                                    <InputError message={incomingForm.errors.school_class_id} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_religion" value="Agama" />
                                    <select
                                        id="in_religion"
                                        className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        value={incomingForm.data.religion}
                                        onChange={(e) => incomingForm.setData('religion', e.target.value)}
                                    >
                                        <option value="islam">Islam</option>
                                        <option value="kristen">Kristen</option>
                                        <option value="katolik">Katolik</option>
                                        <option value="hindu">Hindu</option>
                                        <option value="buddha">Buddha</option>
                                        <option value="khonghucu">Khonghucu</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_email" value="Email Akun Login *" />
                                    <TextInput
                                        id="in_email"
                                        type="email"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.email}
                                        onChange={(e) => incomingForm.setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={incomingForm.errors.email} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_password" value="Password Akun *" />
                                    <TextInput
                                        id="in_password"
                                        type="password"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.password}
                                        onChange={(e) => incomingForm.setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={incomingForm.errors.password} className="mt-1 text-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Section B: Data Mutasi & Sekolah Asal */}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">2. Asal Sekolah & Berkas Mutasi</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="in_mutation_date" value="Tanggal Resmi Masuk *" />
                                    <TextInput
                                        id="in_mutation_date"
                                        type="date"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.mutation_date}
                                        onChange={(e) => incomingForm.setData('mutation_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={incomingForm.errors.mutation_date} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_school_name" value="Nama Sekolah Asal (SMP/MTs) *" />
                                    <TextInput
                                        id="in_school_name"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.school_name}
                                        onChange={(e) => incomingForm.setData('school_name', e.target.value)}
                                        required
                                        placeholder="Contoh: SMP Negeri 2 Momunu"
                                    />
                                    <InputError message={incomingForm.errors.school_name} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_school_npsn" value="NPSN Sekolah Asal" />
                                    <TextInput
                                        id="in_school_npsn"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.school_npsn}
                                        onChange={(e) => incomingForm.setData('school_npsn', e.target.value)}
                                        placeholder="Nomor Pokok Sekolah Nasional"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_school_city" value="Kabupaten / Kota & Provinsi Asal" />
                                    <TextInput
                                        id="in_school_city"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.school_city}
                                        onChange={(e) => incomingForm.setData('school_city', e.target.value)}
                                        placeholder="Contoh: Buol, Sulawesi Tengah"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_reference_number" value="No. Surat Keterangan Pindah Asal" />
                                    <TextInput
                                        id="in_reference_number"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.reference_number}
                                        onChange={(e) => incomingForm.setData('reference_number', e.target.value)}
                                        placeholder="Nomor Surat dari SMP Asal"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_reason" value="Alasan Pindah Masuk *" />
                                    <select
                                        id="in_reason"
                                        className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        value={incomingForm.data.reason}
                                        onChange={(e) => incomingForm.setData('reason', e.target.value)}
                                        required
                                    >
                                        {standardReasons.map((r, idx) => (
                                            <option key={idx} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    <InputError message={incomingForm.errors.reason} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_parent_name" value="Nama Orang Tua / Wali" />
                                    <TextInput
                                        id="in_parent_name"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.parent_name}
                                        onChange={(e) => incomingForm.setData('parent_name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="in_parent_phone" value="No. HP Orang Tua" />
                                    <TextInput
                                        id="in_parent_phone"
                                        type="text"
                                        className="mt-1 block w-full text-sm"
                                        value={incomingForm.data.parent_phone}
                                        onChange={(e) => incomingForm.setData('parent_phone', e.target.value)}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="in_doc" value="Upload Scan Berkas Mutasi / Surat Pindah (PDF/Foto)" />
                                    <input
                                        id="in_doc"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => incomingForm.setData('document_file', e.target.files[0])}
                                        className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="in_notes" value="Catatan Tambahan TU" />
                                    <textarea
                                        id="in_notes"
                                        rows="2"
                                        className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        value={incomingForm.data.notes}
                                        onChange={(e) => incomingForm.setData('notes', e.target.value)}
                                        placeholder="Catatan kelengkapan rapor asli, nisn valid, dll..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsIncomingModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={incomingForm.processing}>
                            {incomingForm.processing ? 'Menyimpan...' : 'Simpan Data Siswa Masuk'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 2: PROSES MUTASI SISWA KELUAR                                      */}
            {/* ========================================================================= */}
            <Modal show={isOutgoingModalOpen} onClose={() => setIsOutgoingModalOpen(false)} maxWidth="2xl">
                <form onSubmit={submitOutgoing} className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Proses Mutasi Siswa Keluar</h3>
                                <p className="text-xs text-gray-500">Mencatat kepindahan siswa aktif ke sekolah tujuan dan menonaktifkan akun.</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsOutgoingModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                    </div>

                    <div className="mt-5 max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                        
                        {/* Pilih Siswa Aktif */}
                        <div>
                            <InputLabel htmlFor="out_student_search" value="Pilih Siswa Aktif yang Pindah *" />
                            <div className="mt-1 space-y-2">
                                <input
                                    type="text"
                                    id="out_student_search"
                                    placeholder="Ketik nama atau NIS siswa untuk mencari..."
                                    value={studentSearchTerm}
                                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-amber-500"
                                />
                                <select
                                    id="out_student_id"
                                    size="5"
                                    className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    value={outgoingForm.data.student_id}
                                    onChange={(e) => {
                                        const stdId = e.target.value;
                                        const std = activeStudents.find(s => String(s.id) === String(stdId));
                                        outgoingForm.setData({
                                            ...outgoingForm.data,
                                            student_id: stdId,
                                            parent_name: std?.parents?.[0]?.name || outgoingForm.data.parent_name,
                                        });
                                    }}
                                    required
                                >
                                    {filteredActiveStudents.map((s) => (
                                        <option key={s.id} value={s.id} className="p-1.5">
                                            {s.name} (NIS: {s.nis}) — {s.school_class ? s.school_class.name : 'Tanpa Kelas'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <InputError message={outgoingForm.errors.student_id} className="mt-1 text-xs" />
                        </div>

                        {/* Detail Kepindahan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="out_date" value="Tanggal Efektif Mutasi Keluar *" />
                                <TextInput
                                    id="out_date"
                                    type="date"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.mutation_date}
                                    onChange={(e) => outgoingForm.setData('mutation_date', e.target.value)}
                                    required
                                />
                                <InputError message={outgoingForm.errors.mutation_date} className="mt-1 text-xs" />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_school_name" value="Nama Sekolah Tujuan (SMP/MTs) *" />
                                <TextInput
                                    id="out_school_name"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.school_name}
                                    onChange={(e) => outgoingForm.setData('school_name', e.target.value)}
                                    required
                                    placeholder="Contoh: SMP Negeri 1 Palu"
                                />
                                <InputError message={outgoingForm.errors.school_name} className="mt-1 text-xs" />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_school_npsn" value="NPSN Sekolah Tujuan" />
                                <TextInput
                                    id="out_school_npsn"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.school_npsn}
                                    onChange={(e) => outgoingForm.setData('school_npsn', e.target.value)}
                                    placeholder="NPSN Sekolah Tujuan"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_school_city" value="Kabupaten / Kota & Provinsi Tujuan" />
                                <TextInput
                                    id="out_school_city"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.school_city}
                                    onChange={(e) => outgoingForm.setData('school_city', e.target.value)}
                                    placeholder="Contoh: Kota Palu, Sulawesi Tengah"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_ref" value="No. Surat Keterangan Pindah (Keluar)" />
                                <TextInput
                                    id="out_ref"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.reference_number}
                                    onChange={(e) => outgoingForm.setData('reference_number', e.target.value)}
                                    placeholder="Contoh: 421.3/045/SMP.01/TU/2026"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_reason" value="Alasan Kepindahan *" />
                                <select
                                    id="out_reason"
                                    className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    value={outgoingForm.data.reason}
                                    onChange={(e) => outgoingForm.setData('reason', e.target.value)}
                                    required
                                >
                                    {standardReasons.map((r, idx) => (
                                        <option key={idx} value={r}>{r}</option>
                                    ))}
                                </select>
                                <InputError message={outgoingForm.errors.reason} className="mt-1 text-xs" />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_dest_letter" value="No. Surat Lolos Butuh Sekolah Tujuan" />
                                <TextInput
                                    id="out_dest_letter"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.letter_number_destination}
                                    onChange={(e) => outgoingForm.setData('letter_number_destination', e.target.value)}
                                    placeholder="Jika ada surat kesiapan menerima"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="out_parent_name" value="Nama Pemohon (Orang Tua / Wali)" />
                                <TextInput
                                    id="out_parent_name"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={outgoingForm.data.parent_name}
                                    onChange={(e) => outgoingForm.setData('parent_name', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="out_doc" value="Upload Scan Surat Permohonan Ortu / Lolos Butuh (PDF/Foto)" />
                                <input
                                    id="out_doc"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => outgoingForm.setData('document_file', e.target.files[0])}
                                    className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="out_notes" value="Catatan Tambahan TU" />
                                <textarea
                                    id="out_notes"
                                    rows="2"
                                    className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    value={outgoingForm.data.notes}
                                    onChange={(e) => outgoingForm.setData('notes', e.target.value)}
                                    placeholder="Rapor asli telah diserahkan, bebas tanggungan perpus, dll..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsOutgoingModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <button
                            type="submit"
                            disabled={outgoingForm.processing}
                            className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            {outgoingForm.processing ? 'Memproses...' : 'Konfirmasi Mutasi Keluar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 3: CETAK CEPAT SURAT LOLOS BUTUH (KESIAPAN MENERIMA)                */}
            {/* ========================================================================= */}
            <Modal show={isAcceptanceLetterModalOpen} onClose={() => setIsAcceptanceLetterModalOpen(false)} maxWidth="xl">
                <form onSubmit={handlePrintAcceptanceDirect} className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cetak Surat Kesiapan Menerima</h3>
                                <p className="text-xs text-gray-500">Menerbitkan Surat Lolos Butuh untuk calon siswa pindahan masuk.</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsAcceptanceLetterModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <InputLabel htmlFor="acc_num" value="Nomor Surat Keluar *" />
                            <TextInput
                                id="acc_num"
                                type="text"
                                className="mt-1 block w-full text-sm"
                                value={acceptanceLetterForm.data.letter_number}
                                onChange={(e) => acceptanceLetterForm.setData('letter_number', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="acc_name" value="Nama Calon Siswa *" />
                                <TextInput
                                    id="acc_name"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={acceptanceLetterForm.data.student_name}
                                    onChange={(e) => acceptanceLetterForm.setData('student_name', e.target.value)}
                                    required
                                    placeholder="Nama siswa"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="acc_nisn" value="NISN Siswa" />
                                <TextInput
                                    id="acc_nisn"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={acceptanceLetterForm.data.nisn}
                                    onChange={(e) => acceptanceLetterForm.setData('nisn', e.target.value)}
                                    placeholder="NISN 10 digit"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="acc_school" value="Asal Sekolah (SMP Asal) *" />
                                <TextInput
                                    id="acc_school"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={acceptanceLetterForm.data.origin_school}
                                    onChange={(e) => acceptanceLetterForm.setData('origin_school', e.target.value)}
                                    required
                                    placeholder="SMP Negeri Asal"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="acc_class" value="Kelas / Rombel Dituju *" />
                                <select
                                    id="acc_class"
                                    className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    value={acceptanceLetterForm.data.target_class}
                                    onChange={(e) => acceptanceLetterForm.setData('target_class', e.target.value)}
                                >
                                    {schoolClasses.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                    <option value="Kelas VII">Kelas VII (Semua)</option>
                                    <option value="Kelas VIII">Kelas VIII (Semua)</option>
                                    <option value="Kelas IX">Kelas IX (Semua)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="acc_parent" value="Nama Orang Tua / Pemohon" />
                                <TextInput
                                    id="acc_parent"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={acceptanceLetterForm.data.parent_name}
                                    onChange={(e) => acceptanceLetterForm.setData('parent_name', e.target.value)}
                                    placeholder="Nama orang tua"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsAcceptanceLetterModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.115-.465-1.12-1.08L6.34 18m11.32 0h-11.32m9.495-8.81a3.97 3.97 0 0 0-3.663-2.91 3.97 3.97 0 0 0-3.663 2.91m7.325 0a3 3 0 1 1-6 0m6 0v-.025a1.214 1.214 0 0 0-1.025-1.196L14.25 7.5m-4.5 1.479-.175-.854a1.214 1.214 0 0 0-1.025-1.196v.025" />
                            </svg>
                            Buka & Cetak Surat Lolos Butuh
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 4: DETAIL & EDIT CATATAN MUTASI                                     */}
            {/* ========================================================================= */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="xl">
                <form onSubmit={submitEdit} className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Detail & Edit Mutasi {selectedMutation?.type === 'masuk' ? 'Masuk' : 'Keluar'}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Siswa: <strong>{selectedMutation?.student?.name}</strong> (NIS: {selectedMutation?.student?.nis})
                            </p>
                        </div>
                        <button type="button" onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                    </div>

                    <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="ed_date" value="Tanggal Mutasi" />
                                <TextInput
                                    id="ed_date"
                                    type="date"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.mutation_date}
                                    onChange={(e) => editForm.setData('mutation_date', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="ed_school" value="Nama Sekolah Asal/Tujuan" />
                                <TextInput
                                    id="ed_school"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.school_name}
                                    onChange={(e) => editForm.setData('school_name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="ed_ref" value="Nomor Surat Resmi" />
                                <TextInput
                                    id="ed_ref"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.reference_number}
                                    onChange={(e) => editForm.setData('reference_number', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="ed_city" value="Kabupaten/Kota & Provinsi" />
                                <TextInput
                                    id="ed_city"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.school_city}
                                    onChange={(e) => editForm.setData('school_city', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="ed_reason" value="Alasan Mutasi" />
                                <TextInput
                                    id="ed_reason"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.reason}
                                    onChange={(e) => editForm.setData('reason', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="ed_notes" value="Catatan Tambahan TU" />
                                <textarea
                                    id="ed_notes"
                                    rows="2"
                                    className="mt-1 block w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData('notes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsDetailModalOpen(false)}>
                            Tutup
                        </SecondaryButton>
                        <PrimaryButton disabled={editForm.processing}>
                            {editForm.processing ? 'Menyimpan...' : 'Perbarui Catatan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 5: KONFIRMASI HAPUS / BATALKAN MUTASI                                */}
            {/* ========================================================================= */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
                        <span className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Batalkan / Hapus Catatan Mutasi?</h3>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Apakah Anda yakin ingin menghapus catatan mutasi untuk <strong>{selectedMutation?.student?.name}</strong>?
                    </p>

                    {selectedMutation?.type === 'keluar' && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                            <strong>Perhatian:</strong> Menghapus catatan mutasi keluar akan mengembalikan status siswa menjadi <strong>Aktif</strong> dan mengembalikan ke kelas asal jika masih tersedia.
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={submitDelete}>
                            Ya, Hapus Catatan
                        </DangerButton>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
