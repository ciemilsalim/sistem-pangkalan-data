import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ stats = {}, charts = {}, announcements = [], upcoming_events = [], lms_stats = {} }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isAdmin = user.roles?.includes('admin');
    const hasPermission = (permission) => user.permissions?.includes(permission);

    // State to toggle between School Summary and LMS Analytics
    const [activeTab, setActiveTab] = useState('school');

    // Default Fallbacks for safety (School Stats)
    const totalStudents = stats.total_students ?? 0;
    const totalTeachers = stats.total_teachers ?? 0;
    const totalParents = stats.total_parents ?? 0;
    const totalClasses = stats.total_classes ?? 0;
    const totalExtracurriculars = stats.total_extracurriculars ?? 0;
    const attendanceRate = stats.attendance_rate ?? 96.4;

    const studentDistribution = charts.student_distribution || [];
    const attendanceTrend = charts.attendance_trend || [];
    const chatEngagement = charts.chat_engagement || { teacher_parent_count: 0, admin_parent_count: 0, total: 0 };

    // Default Fallbacks for safety (LMS Stats - Fase 1)
    const lmsMaterials = lms_stats.total_materials ?? 0;
    const lmsAssignments = lms_stats.total_assignments ?? 0;
    const lmsSubmissions = lms_stats.total_submissions ?? 0;
    const lmsSubmissionRate = lms_stats.submission_rate ?? 0;
    const lmsActiveRemedials = lms_stats.active_remedials ?? 0;
    const lmsSubjectRemedials = lms_stats.subject_remedials || [];

    // Find max value in student distribution for scaling progress bars
    const maxStudentValue = studentDistribution.length > 0 
        ? Math.max(...studentDistribution.map(item => item.value)) 
        : 1;

    // Find max value in subject remedials for scaling vertical bars
    const maxRemedialValue = lmsSubjectRemedials.length > 0
        ? Math.max(...lmsSubjectRemedials.map(item => item.count))
        : 1;

    // SVG Chart Coordinates Calculation for Attendance Trend (5 days)
    const svgWidth = 500;
    const svgHeight = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;
    
    // Dynamic Y-axis scale
    const minPercentage = attendanceTrend.length > 0 ? Math.min(...attendanceTrend.map(item => item.percentage)) : 80;
    const yMin = minPercentage < 80 ? Math.max(0, Math.floor(minPercentage / 10) * 10) : 80;
    const yMax = 100;
    
    const yTicks = [];
    const step = (yMax - yMin) / 4;
    for(let i=0; i<=4; i++) {
        yTicks.push(Math.round(yMin + (step * i)));
    }

    // Generate coordinates
    const points = attendanceTrend.map((item, index) => {
        const x = paddingLeft + (index * (plotWidth / (attendanceTrend.length - 1 || 1)));
        const percentage = Math.max(yMin, Math.min(yMax, item.percentage));
        const y = paddingTop + plotHeight - (((percentage - yMin) / (yMax - yMin)) * plotHeight);
        return { x, y, day: item.day, value: item.percentage };
    });

    // Create SVG Path strings
    let linePath = '';
    let areaPath = '';
    
    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        areaPath = `M ${points[0].x} ${paddingTop + plotHeight} L ${points[0].x} ${points[0].y} ` + 
                   points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + 
                   ` L ${points[points.length - 1].x} ${paddingTop + plotHeight} Z`;
    }

    // Helper: format date for announcement
    const formatAnnDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Helper: format date for calendar event
    const formatCalDate = (startDateStr, endDateStr) => {
        if (!startDateStr) return '';
        const start = new Date(startDateStr);
        const startFormatted = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        if (endDateStr && endDateStr !== startDateStr) {
            const end = new Date(endDateStr);
            const endFormatted = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            return `${startFormatted} - ${endFormatted}`;
        }
        
        return startFormatted;
    };

    // State for chart hover tooltip
    const [hoveredPoint, setHoveredPoint] = useState(null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
                            Dasbor Administrator
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">
                            Sistem Pangkalan Data & Pengawasan Komunikasi Sekolah
                        </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 font-medium bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 shrink-0 self-start sm:self-auto">
                        Hari ini: <span className="font-semibold text-gray-900 dark:text-gray-100">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Welcome Banner */}
                    <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-blue-50 dark:from-indigo-900/50 dark:via-indigo-950/40 dark:to-blue-900/30 border border-indigo-200/60 dark:border-indigo-800/50 p-6 shadow-sm">
                        <h3 className="text-lg font-bold sm:text-xl text-indigo-900 dark:text-indigo-100">
                            Selamat Datang di SIPADA (Sistem Pangkalan Data)
                        </h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1.5 max-w-3xl leading-relaxed">
                            SIPADA merupakan pusat data inti (central database hub) yang mengintegrasikan seluruh data akademik, kurikulum, sivitas sekolah, dan administrasi untuk ekosistem besar SIASEK. Sebagai platform penyedia data utama, seluruh informasi dikelola di sini untuk dikonsumsi oleh aplikasi lain seperti Aplikasi Absensi, LMS Mokopani, dan Zexam.
                        </p>
                    </div>

                    {/* Alert for Effective Days */}
                    {isAdmin && stats.is_effective_days_set === false && (
                        <div className="mb-8 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3 animate-pulse">
                            <span className="material-icons text-amber-500 mt-0.5">warning</span>
                            <div>
                                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Perhatian: Hari Efektif Belajar Belum Diatur</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
                                    Jumlah hari efektif sekolah untuk bulan ini belum diisi. Kalkulasi persentase kehadiran pada Dasbor Absensi mungkin tidak akurat.
                                </p>
                                <Link 
                                    href={route('settings.index')} 
                                    className="inline-flex mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 underline decoration-amber-500/30 underline-offset-4"
                                >
                                    Buka menu Pengaturan untuk mengisi data &rarr;
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Ecosystem Quick Access (Single Sign-On) */}
                    {(isAdmin || hasPermission('access_sso_lms') || hasPermission('access_sso_attendance')) && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Jalur Cepat Ekosistem SIASEK
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Card 1: LMS Mokopani */}
                            {(isAdmin || hasPermission('access_sso_lms')) && (
                            <a
                                href="/sso/redirect/lms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-gray-800/80 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/40 hover:-translate-y-0.5"
                            >
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-indigo-50/50 dark:bg-indigo-950/10 transition-transform duration-500 group-hover:scale-125"></div>
                                <div className="relative flex items-start gap-4">
                                    <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 text-indigo-600 dark:text-indigo-400 transition-colors duration-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                            LMS Mokopani
                                        </h5>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            Buka platform pembelajaran digital, modul ajar berbasis AI, penugasan, dan penilaian siswa secara otomatis tanpa login ulang.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                            <span>Masuk Aplikasi</span>
                                            <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </a>
                            )}

                            {/* Card 2: Aplikasi Absensi */}
                            {(isAdmin || hasPermission('access_sso_attendance')) && (
                            <a
                                href="/sso/redirect/absensi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block relative overflow-hidden rounded-2xl border border-blue-100 dark:border-gray-800/80 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/40 hover:-translate-y-0.5"
                            >
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-blue-50/50 dark:bg-blue-950/10 transition-transform duration-500 group-hover:scale-125"></div>
                                <div className="relative flex items-start gap-4">
                                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-600 dark:text-blue-400 transition-colors duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            Aplikasi Absensi
                                        </h5>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            Buka panel pemantauan kehadiran harian, jadwal piket guru, perizinan dispensasi, dan laporan rekapitulasi secara instan.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                            <span>Masuk Aplikasi</span>
                                            <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </a>
                            )}
                        </div>
                    </div>
                    )}

                    {/* TAB BAR NAVIGATION */}
                    <div className="flex sm:inline-flex w-full sm:w-auto mb-8 bg-slate-100/80 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
                        <button
                            onClick={() => setActiveTab('school')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 py-2.5 px-6 text-sm font-semibold rounded-lg transition-all duration-300 ease-out ${
                                activeTab === 'school'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-slate-200/50 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                            }`}
                        >
                            <svg className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'school' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'school' ? "2.5" : "2"} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Ringkasan Sekolah
                        </button>
                        <button
                            onClick={() => setActiveTab('lms')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 py-2.5 px-6 text-sm font-semibold rounded-lg transition-all duration-300 ease-out ${
                                activeTab === 'lms'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-slate-200/50 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                            }`}
                        >
                            <svg className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'lms' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'lms' ? "2.5" : "2"} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Analisis LMS
                        </button>
                    </div>

                    {/* TAB 1: SCHOOL SUMMARY */}
                    {activeTab === 'school' && (
                        <>
                            {/* STATISTICS GRID (6 CARDS) */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
                                {/* 1. SISWA CARD */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Total Siswa</span>
                                        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{totalStudents}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Siswa Terdaftar</p>
                                    </div>
                                </div>

                                {/* 2. GURU CARD */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Total Guru</span>
                                        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{totalTeachers}</h4>
                                        <p className="text-[10px] text-indigo-600 font-medium mt-1">Tenaga Pengajar Aktif</p>
                                    </div>
                                </div>

                                {/* 3. WALI CARD */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Wali Murid</span>
                                        <div className="rounded-xl bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{totalParents}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Wali Terhubung</p>
                                    </div>
                                </div>

                                {/* 4. KELAS CARD */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Total Kelas</span>
                                        <div className="rounded-xl bg-amber-50 p-2 text-amber-600 group-hover:bg-amber-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{totalClasses}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Rombongan Belajar</p>
                                    </div>
                                </div>

                                {/* 5. KEHADIRAN CARD */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Presensi Hari Ini</span>
                                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{attendanceRate}%</h4>
                                        <p className="text-[10px] text-blue-600 font-semibold mt-1">Rata-rata Kehadiran</p>
                                    </div>
                                </div>

                                {/* 6. EKSKUL CARD */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Ekstrakurikuler</span>
                                        <div className="rounded-xl bg-rose-50 p-2 text-rose-600 group-hover:bg-rose-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{totalExtracurriculars}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Program Ekskul Aktif</p>
                                    </div>
                                </div>
                            </div>

                            {/* DATA ANALYSIS CHARTS */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* CHART 1: ATTENDANCE TREND */}
                                <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Tren Persentase Kehadiran Siswa</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Fluktuasi kehadiran 5 hari aktif belajar terakhir</p>
                                        </div>
                                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                                            Skala {yMin === 80 ? "Zoomed (80% - 100%)" : `Dinamis (${yMin}% - 100%)`}
                                        </span>
                                    </div>

                                    <div className="relative w-full overflow-hidden flex justify-center">
                                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[550px] h-auto overflow-visible select-none">
                                            <defs>
                                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                                </linearGradient>
                                                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                                                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#059669" floodOpacity="0.2" />
                                                </filter>
                                            </defs>

                                            {yTicks.map((val) => {
                                                const y = paddingTop + plotHeight - (((val - yMin) / (yMax - yMin)) * plotHeight);
                                                return (
                                                    <g key={val}>
                                                        <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#f3f4f6" strokeWidth="1.2" strokeDasharray={val === yMin ? "none" : "4 4"} />
                                                        <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-medium font-mono">{val}%</text>
                                                    </g>
                                                );
                                            })}

                                            {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}
                                            {linePath && <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#shadow)" />}

                                            {points.map((p, index) => (
                                                <circle
                                                    key={index}
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={hoveredPoint === index ? "6" : "4"}
                                                    fill={hoveredPoint === index ? "#059669" : "#ffffff"}
                                                    stroke="#10b981"
                                                    strokeWidth={hoveredPoint === index ? "3" : "2"}
                                                    className="transition-all duration-150 cursor-pointer"
                                                    onMouseEnter={() => setHoveredPoint(index)}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                />
                                            ))}

                                            {points.map((p, index) => (
                                                <text key={index} x={p.x} y={svgHeight - 15} textAnchor="middle" className="text-[9px] fill-gray-400 font-semibold">{p.day}</text>
                                            ))}
                                        </svg>
                                        
                                        {hoveredPoint !== null && points[hoveredPoint] && (
                                            <div 
                                                className="absolute bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-md border border-slate-800 font-semibold pointer-events-none"
                                                style={{
                                                    left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                                                    top: `${(points[hoveredPoint].y / svgHeight) * 105 - 18}%`,
                                                    transform: 'translate(-50%, -100%)',
                                                    transition: 'all 0.1s ease-out'
                                                }}
                                            >
                                                Kehadiran: {points[hoveredPoint].value}%
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CHART 2: DISTRIBUTION & CHAT ENGAGEMENT */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between gap-6">
                                    {/* Grade Level Distribution */}
                                    <div>
                                        <div className="mb-3">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Distribusi Siswa per Tingkat</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Komparasi jumlah siswa per jenjang kelas</p>
                                        </div>
                                        <div className="space-y-2.5">
                                            {studentDistribution.length > 0 ? (
                                                studentDistribution.map((item, idx) => {
                                                    const pct = maxStudentValue > 0 ? (item.value / maxStudentValue) * 100 : 0;
                                                    const colorClass = [
                                                        'bg-indigo-500',
                                                        'bg-indigo-600',
                                                        'bg-indigo-700'
                                                    ][idx % 3];

                                                    return (
                                                        <div key={idx} className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                                <span>{item.label}</span>
                                                                <span className="font-mono">{item.value} siswa</span>
                                                            </div>
                                                            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                                                <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 italic">Data kosong.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chat Communication Analyzer */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Aktivitas Chat Sekolah</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Proporsi obrolan yang terpantau di database</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 font-semibold text-blue-700">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0"></span>
                                                    <span>Guru - Ortu</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0"></span>
                                                    <span>Admin - Ortu</span>
                                                </div>
                                            </div>

                                            {chatEngagement.total > 0 ? (
                                                (() => {
                                                    const teacherPct = (chatEngagement.teacher_parent_count / chatEngagement.total) * 100;
                                                    const adminPct = (chatEngagement.admin_parent_count / chatEngagement.total) * 100;

                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex">
                                                                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${teacherPct}%` }} title={`Guru-Ortu: ${chatEngagement.teacher_parent_count} pesan`}></div>
                                                                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${adminPct}%` }} title={`Admin-Ortu: ${chatEngagement.admin_parent_count} pesan`}></div>
                                                            </div>
                                                            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-semibold font-mono">
                                                                <span>{chatEngagement.teacher_parent_count} pesan ({teacherPct.toFixed(0)}%)</span>
                                                                <span>{chatEngagement.admin_parent_count} pesan ({adminPct.toFixed(0)}%)</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 italic">Belum ada obrolan terekam.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TAB 2: LMS ANALYTICS (FASE 1) */}
                    {activeTab === 'lms' && (
                        <>
                            {/* LMS MACRO STATS GRID (4 CARDS) */}
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
                                
                                {/* 1. BAHAN AJAR */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Total Bahan Ajar</span>
                                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{lmsMaterials}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Bahan & Materi Diunggah</p>
                                    </div>
                                </div>

                                {/* 2. TUGAS / EVALUASI */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Total Tugas</span>
                                        <div className="rounded-xl bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{lmsAssignments}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Tugas & Asesmen Aktif</p>
                                    </div>
                                </div>

                                {/* 3. SUBMISSION RATE */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Pengumpulan Tugas</span>
                                        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{lmsSubmissionRate}%</h4>
                                        <p className="text-[10px] text-indigo-600 font-semibold mt-1">Rata-rata Penyerahan: {lmsSubmissions} file</p>
                                    </div>
                                </div>

                                {/* 4. REMEDIAL AKTIF */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400">Remedial Aktif</span>
                                        <div className="rounded-xl bg-rose-50 p-2 text-rose-600 group-hover:bg-rose-100 transition duration-150">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{lmsActiveRemedials} <span className="text-xs font-normal text-gray-500 dark:text-gray-400 dark:text-gray-400">kasus</span></h4>
                                        <p className="text-[10px] text-rose-600 font-semibold mt-1">Perlu Pembinaan & Ujian Ulang</p>
                                    </div>
                                </div>
                            </div>

                            {/* LMS DETAILED ANALYSIS GRAPHICS */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                
                                {/* COLUMN 1 (2/3 width): Subject Remedial Bar Chart */}
                                <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Tren Kasus Remedial per Mata Pelajaran</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Peta subjek dengan tingkat kesulitan tertinggi (kasus remedial terbanyak)</p>
                                    </div>

                                    {/* Vertical Bar Chart using Tailwind */}
                                    <div className="flex h-56 items-end justify-between gap-4 pt-6 px-2 border-b border-gray-200 dark:border-gray-700">
                                        {lmsSubjectRemedials.length > 0 ? (
                                            lmsSubjectRemedials.map((item, idx) => {
                                                const pct = maxRemedialValue > 0 ? (item.count / maxRemedialValue) * 85 : 0;
                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                                        {/* Hover Tooltip showing count */}
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-mono font-bold mb-1 shadow-sm">
                                                            {item.count} kasus
                                                        </span>
                                                        {/* Rounded vertical bar with gradient */}
                                                        <div 
                                                            className="w-full max-w-[36px] rounded-t-lg bg-rose-500 hover:bg-rose-600 transition-all duration-300 shadow-sm cursor-pointer"
                                                            style={{ height: `${Math.max(8, pct)}%` }}
                                                        ></div>
                                                        {/* Subject name label */}
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 font-semibold truncate max-w-full text-center mt-1">
                                                            {item.subject}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="w-full text-center py-12 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 italic">
                                                Tidak ada data remedial.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* COLUMN 2 (1/3 width): Submission Breakdown Radial Gauge */}
                                <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Status Pengumpulan Tugas</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">Rasio penyerahan tugas siswa terdaftar</p>
                                    </div>

                                    {/* Radial/Circular Gauge */}
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="relative flex items-center justify-center h-36 w-36">
                                            {/* SVG Circle Gauge */}
                                            <svg className="absolute transform -rotate-90 h-full w-full" viewBox="0 0 100 100">
                                                {/* Background circle */}
                                                <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="9" fill="transparent" />
                                                {/* Foreground progress circle */}
                                                <circle 
                                                    cx="50" 
                                                    cy="50" 
                                                    r="40" 
                                                    stroke="#10b981" 
                                                    strokeWidth="9" 
                                                    fill="transparent" 
                                                    strokeDasharray={251.2}
                                                    strokeDashoffset={251.2 - (251.2 * (lmsSubmissionRate / 100))}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-700 ease-out"
                                                />
                                            </svg>
                                            <div className="text-center z-10">
                                                <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight font-mono">{lmsSubmissionRate}%</span>
                                                <p className="text-[9px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Tepat Waktu</p>
                                            </div>
                                        </div>

                                        {/* Supporting text labels */}
                                        <div className="w-full grid grid-cols-2 gap-2 mt-4 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                            <div>
                                                <span className="text-xs text-indigo-600 font-extrabold font-mono">{lmsSubmissions}</span>
                                                <p className="text-[9px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-semibold">Tugas Diserahkan</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 font-extrabold font-mono">{(100 - lmsSubmissionRate).toFixed(1)}%</span>
                                                <p className="text-[9px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-semibold">Terlambat / Kosong</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                    )}

                    {/* RECENT ACTIVITIES & INFORMATION FEED */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* COLUMN 1: LATEST ANNOUNCEMENTS */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Pengumuman Terbaru</h3>
                                <Link href={route('announcements.index')} className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg">
                                    Lihat Semua
                                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {announcements.length > 0 ? (
                                    announcements.map((ann) => (
                                        <div key={ann.id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0 group">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition truncate">{ann.title}</h4>
                                                <span className="text-[9px] text-gray-500 dark:text-gray-400 dark:text-gray-400 shrink-0 font-semibold font-mono">{formatAnnDate(ann.created_at)}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 italic">Tidak ada pengumuman aktif.</div>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2: UPCOMING EVENTS */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Agenda Akademik Terdekat</h3>
                                <Link href={route('calendars.index')} className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Lihat Kalender
                                    <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="space-y-3.5">
                                {upcoming_events.length > 0 ? (
                                    upcoming_events.map((event) => {
                                        let badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                                        let label = 'Kegiatan Sekolah';
                                        
                                        if (event.is_holiday) {
                                            badgeColor = 'bg-red-50 text-red-700 border-red-100';
                                            label = 'Hari Libur';
                                        } else if (event.is_study_at_home) {
                                            badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
                                            label = 'Belajar Mandiri';
                                        }

                                        return (
                                            <div key={event.id} className="flex items-center gap-3 border-b border-gray-55 pb-3 last:border-0 last:pb-0">
                                                <div className="flex flex-col items-center justify-center h-11 w-11 rounded-xl bg-slate-50 border border-slate-150 shrink-0 text-center p-1 font-semibold">
                                                    <span className="text-xs text-gray-900 dark:text-gray-100 font-bold leading-none">{new Date(event.start_date).getDate()}</span>
                                                    <span className="text-[8px] text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase mt-0.5">{new Date(event.start_date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{event.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[9px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-semibold font-mono">{formatCalDate(event.start_date, event.end_date)}</span>
                                                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[8px] font-bold border ${badgeColor}`}>{label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 italic">Tidak ada agenda akademik terdekat.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
