import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ stats = {}, charts = {}, announcements = [], upcoming_events = [] }) {
    // Default Fallbacks for safety
    const totalStudents = stats.total_students ?? 0;
    const totalTeachers = stats.total_teachers ?? 0;
    const totalParents = stats.total_parents ?? 0;
    const totalClasses = stats.total_classes ?? 0;
    const totalExtracurriculars = stats.total_extracurriculars ?? 0;
    const attendanceRate = stats.attendance_rate ?? 96.4;

    const studentDistribution = charts.student_distribution || [];
    const attendanceTrend = charts.attendance_trend || [];
    const chatEngagement = charts.chat_engagement || { teacher_parent_count: 0, admin_parent_count: 0, total: 0 };

    // Find max value in student distribution for scaling progress bars
    const maxStudentValue = studentDistribution.length > 0 
        ? Math.max(...studentDistribution.map(item => item.value)) 
        : 1;

    // SVG Chart Coordinates Calculation for Attendance Trend (7 days)
    const svgWidth = 500;
    const svgHeight = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;
    const yMin = 80; // Scale from 80% to 100%
    const yMax = 100;

    // Generate coordinates
    const points = attendanceTrend.map((item, index) => {
        const x = paddingLeft + (index * (plotWidth / (attendanceTrend.length - 1 || 1)));
        // Clamp percentage between 80 and 100
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
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Dasbor Administrator
                        </h2>
                        <p className="text-xs text-gray-550 mt-0.5">
                            Sistem Pangkalan Data & Pengawasan Komunikasi Sekolah
                        </p>
                    </div>
                    <div className="text-xs text-gray-500 font-medium bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-150 shrink-0 self-start sm:self-auto">
                        Hari ini: <span className="font-semibold text-gray-850">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Welcome Banner */}
                    <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
                        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold sm:text-xl">Selamat Datang di Sistem Portal SIASEK</h3>
                            <p className="text-sm text-blue-100 mt-1 max-w-2xl">
                                Kelola seluruh kurikulum, sivitas akademika, agenda pendidikan, pengumuman portal, dan moderasi kepatuhan obrolan secara terintegrasi dari satu dasbor kendali utama.
                            </p>
                        </div>
                    </div>

                    {/* STATISTICS GRID (6 CARDS) */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
                        
                        {/* 1. SISWA CARD */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">Total Siswa</span>
                                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100 transition duration-150">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{totalStudents}</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Siswa Terdaftar</p>
                            </div>
                        </div>

                        {/* 2. GURU CARD */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">Total Guru</span>
                                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-100 transition duration-150">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{totalTeachers}</h4>
                                <p className="text-[10px] text-emerald-650 font-medium mt-1">Tenaga Pengajar Aktif</p>
                            </div>
                        </div>

                        {/* 3. WALI CARD */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">Wali Murid</span>
                                <div className="rounded-xl bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-100 transition duration-150">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{totalParents}</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Wali Terhubung</p>
                            </div>
                        </div>

                        {/* 4. KELAS CARD */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">Total Kelas</span>
                                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 group-hover:bg-amber-100 transition duration-150">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{totalClasses}</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Rombongan Belajar</p>
                            </div>
                        </div>

                        {/* 5. KEHADIRAN CARD */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">Presensi Hari Ini</span>
                                <div className="rounded-xl bg-teal-50 p-2 text-teal-600 group-hover:bg-teal-100 transition duration-150">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{attendanceRate}%</h4>
                                <p className="text-[10px] text-teal-600 font-semibold mt-1">Rata-rata Kehadiran</p>
                            </div>
                        </div>

                        {/* 6. EKSKUL CARD */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition duration-200 group flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">Ekstrakurikuler</span>
                                <div className="rounded-xl bg-rose-50 p-2 text-rose-600 group-hover:bg-rose-100 transition duration-150">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{totalExtracurriculars}</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Program Ekskul Aktif</p>
                            </div>
                        </div>

                    </div>

                    {/* DATA ANALYSIS CHARTS SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        
                        {/* CHART 1: ATTENDANCE TREND CHART (SVG) */}
                        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-150 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Tren Persentase Kehadiran Siswa</h3>
                                    <p className="text-[10px] text-gray-400">Fluktuasi kehadiran 7 hari aktif belajar terakhir</p>
                                </div>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                                    Skala Zoomed (80% - 100%)
                                </span>
                            </div>

                            {/* Custom SVG Area Chart */}
                            <div className="relative w-full overflow-hidden flex justify-center">
                                <svg 
                                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                                    className="w-full max-w-[550px] h-auto overflow-visible select-none"
                                >
                                    {/* Gradients Definitions */}
                                    <defs>
                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                        </linearGradient>
                                        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.2" />
                                        </filter>
                                    </defs>

                                    {/* Grid Lines */}
                                    {[80, 85, 90, 95, 100].map((val) => {
                                        const y = paddingTop + plotHeight - (((val - yMin) / (yMax - yMin)) * plotHeight);
                                        return (
                                            <g key={val}>
                                                <line 
                                                    x1={paddingLeft} 
                                                    y1={y} 
                                                    x2={svgWidth - paddingRight} 
                                                    y2={y} 
                                                    stroke="#f3f4f6" 
                                                    strokeWidth="1.2"
                                                    strokeDasharray={val === 80 ? "none" : "4 4"}
                                                />
                                                <text 
                                                    x={paddingLeft - 8} 
                                                    y={y + 4} 
                                                    textAnchor="end" 
                                                    className="text-[10px] fill-gray-400 font-medium font-mono"
                                                >
                                                    {val}%
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Area under the line */}
                                    {areaPath && (
                                        <path d={areaPath} fill="url(#areaGradient)" />
                                    )}

                                    {/* Main Line path */}
                                    {linePath && (
                                        <path 
                                            d={linePath} 
                                            fill="none" 
                                            stroke="#3b82f6" 
                                            strokeWidth="3" 
                                            strokeLinecap="round"
                                            filter="url(#shadow)"
                                        />
                                    )}

                                    {/* Data Nodes / Markers */}
                                    {points.map((p, index) => (
                                        <circle
                                            key={index}
                                            cx={p.x}
                                            cy={p.y}
                                            r={hoveredPoint === index ? "6" : "4"}
                                            fill={hoveredPoint === index ? "#2563eb" : "#ffffff"}
                                            stroke="#3b82f6"
                                            strokeWidth={hoveredPoint === index ? "3" : "2"}
                                            className="transition-all duration-150 cursor-pointer"
                                            onMouseEnter={() => setHoveredPoint(index)}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                        />
                                    ))}

                                    {/* X Axis Labels */}
                                    {points.map((p, index) => (
                                        <text
                                            key={index}
                                            x={p.x}
                                            y={svgHeight - 15}
                                            textAnchor="middle"
                                            className="text-[9px] fill-gray-400 font-semibold"
                                        >
                                            {p.day}
                                        </text>
                                    ))}
                                </svg>
                                
                                {/* Absolute Tooltip */}
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

                        {/* CHART 2: STUDENT DISTRIBUTION & CHAT ENGAGEMENT */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-150 flex flex-col justify-between gap-6">
                            
                            {/* Grade Level Distribution */}
                            <div>
                                <div className="mb-3">
                                    <h3 className="font-bold text-gray-800 text-sm">Distribusi Siswa per Tingkat</h3>
                                    <p className="text-[10px] text-gray-400">Komparasi jumlah siswa per jenjang kelas</p>
                                </div>
                                <div className="space-y-2.5">
                                    {studentDistribution.length > 0 ? (
                                        studentDistribution.map((item, idx) => {
                                            const pct = maxStudentValue > 0 ? (item.value / maxStudentValue) * 100 : 0;
                                            // Dynamic Colors
                                            const gradColors = [
                                                'from-blue-500 to-blue-600',
                                                'from-indigo-500 to-indigo-600',
                                                'from-purple-500 to-purple-600'
                                            ];
                                            const colorClass = gradColors[idx % gradColors.length];

                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                                                        <span>{item.label}</span>
                                                        <span className="font-mono">{item.value} siswa</span>
                                                    </div>
                                                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Data kosong.</p>
                                    )}
                                </div>
                            </div>

                            {/* Chat Communication Analyzer */}
                            <div className="border-t border-gray-100 pt-4">
                                <div className="mb-3">
                                    <h3 className="font-bold text-gray-850 text-sm">Aktivitas Chat Sekolah</h3>
                                    <p className="text-[10px] text-gray-400">Proporsi obrolan yang terpantau di database</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
                                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0"></span>
                                            <span>Guru - Ortu</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-semibold text-blue-700">
                                            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0"></span>
                                            <span>Admin - Ortu</span>
                                        </div>
                                    </div>

                                    {/* Split comparative progress bar */}
                                    {chatEngagement.total > 0 ? (
                                        (() => {
                                            const teacherPct = (chatEngagement.teacher_parent_count / chatEngagement.total) * 100;
                                            const adminPct = (chatEngagement.admin_parent_count / chatEngagement.total) * 100;

                                            return (
                                                <div className="space-y-2">
                                                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex">
                                                        <div 
                                                            className="h-full bg-indigo-600 transition-all duration-500"
                                                            style={{ width: `${teacherPct}%` }}
                                                            title={`Guru-Ortu: ${chatEngagement.teacher_parent_count} pesan`}
                                                        ></div>
                                                        <div 
                                                            className="h-full bg-blue-600 transition-all duration-500"
                                                            style={{ width: `${adminPct}%` }}
                                                            title={`Admin-Ortu: ${chatEngagement.admin_parent_count} pesan`}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold font-mono">
                                                        <span>{chatEngagement.teacher_parent_count} pesan ({teacherPct.toFixed(0)}%)</span>
                                                        <span>{chatEngagement.admin_parent_count} pesan ({adminPct.toFixed(0)}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Belum ada obrolan terekam.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* RECENT ACTIVITIES & INFORMATION FEED */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* COLUMN 1: LATEST ANNOUNCEMENTS */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-150">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 text-sm">Pengumuman Terbaru</h3>
                                <Link 
                                    href={route('announcements.index')} 
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {announcements.length > 0 ? (
                                    announcements.map((ann) => (
                                        <div key={ann.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 group">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <h4 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition truncate">
                                                    {ann.title}
                                                </h4>
                                                <span className="text-[9px] text-gray-400 shrink-0 font-semibold font-mono">
                                                    {formatAnnDate(ann.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                {ann.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-400 italic">
                                        Tidak ada pengumuman aktif.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2: UPCOMING EVENTS */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-150">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 text-sm">Agenda Akademik Terdekat</h3>
                                <Link 
                                    href={route('calendars.index')} 
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                                >
                                    Lihat Kalender
                                </Link>
                            </div>

                            <div className="space-y-3.5">
                                {upcoming_events.length > 0 ? (
                                    upcoming_events.map((event) => {
                                        let badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
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
                                                {/* Date Badge */}
                                                <div className="flex flex-col items-center justify-center h-11 w-11 rounded-xl bg-slate-50 border border-slate-150 shrink-0 text-center p-1 font-semibold">
                                                    <span className="text-xs text-gray-800 font-bold leading-none">
                                                        {new Date(event.start_date).getDate()}
                                                    </span>
                                                    <span className="text-[8px] text-gray-400 uppercase mt-0.5">
                                                        {new Date(event.start_date).toLocaleDateString('id-ID', { month: 'short' })}
                                                    </span>
                                                </div>

                                                {/* Text Info */}
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-gray-800 truncate">{event.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[9px] text-gray-400 font-semibold font-mono">
                                                            {formatCalDate(event.start_date, event.end_date)}
                                                        </span>
                                                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[8px] font-bold border ${badgeColor}`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-400 italic">
                                        Tidak ada agenda akademik terdekat.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
