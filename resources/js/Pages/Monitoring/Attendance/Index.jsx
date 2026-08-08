import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AttendanceMonitoring({ filters, charts, stats }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('monitoring.attendance'), {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Class Attendance SVG Logic
    const attendanceTrend = charts.class_attendance_trend || [];
    const minPercentage = attendanceTrend.length > 0 ? Math.min(...attendanceTrend.map(item => item.percentage)) : 80;
    const yMin = minPercentage < 80 ? Math.max(0, Math.floor(minPercentage / 10) * 10) : 80;
    const yMax = 100;
    
    const svgWidth = 600;
    const svgHeight = 250;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const yTicks = [];
    const step = (yMax - yMin) / 4;
    for(let i=0; i<=4; i++) {
        yTicks.push(Math.round(yMin + (step * i)));
    }

    const points = attendanceTrend.map((item, index) => {
        const x = paddingLeft + (index * (plotWidth / (Math.max(attendanceTrend.length - 1, 1))));
        const percentage = Math.max(yMin, Math.min(yMax, item.percentage));
        const y = paddingTop + plotHeight - (((percentage - yMin) / (yMax - yMin)) * plotHeight);
        return { x, y, day: item.day, value: item.percentage };
    });

    let linePath = '';
    let areaPath = '';
    
    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        areaPath = `M ${points[0].x} ${paddingTop + plotHeight} L ${points[0].x} ${points[0].y} ` + 
                   points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + 
                   ` L ${points[points.length - 1].x} ${paddingTop + plotHeight} Z`;
    }

    const [hoveredPoint, setHoveredPoint] = useState(null);
    const subjectAverages = charts.subject_attendance_averages || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
                            Monitoring Kehadiran
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Pantau tingkat kehadiran harian kelas dan per mata pelajaran
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Monitoring Kehadiran" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Filter Section */}
                    <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mulai Tanggal</label>
                                <input 
                                    type="date" 
                                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sampai Tanggal</label>
                                <input 
                                    type="date" 
                                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Terapkan Filter
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* CHART 1: CLASS ATTENDANCE TREND */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Tren Kehadiran Harian Kelas</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Tingkat kehadiran siswa secara kumulatif</p>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                                    Skala {yMin === 80 ? "Zoomed (80% - 100%)" : `Dinamis (${yMin}% - 100%)`}
                                </span>
                            </div>

                            <div className="relative w-full overflow-hidden flex justify-center">
                                {points.length > 0 ? (
                                    <>
                                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
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

                                            {points.map((p, index) => {
                                                // Only show every nth label if there are too many points
                                                if (points.length > 10 && index % Math.ceil(points.length / 10) !== 0 && index !== points.length - 1) return null;
                                                return <text key={index} x={p.x} y={svgHeight - 15} textAnchor="middle" className="text-[9px] fill-gray-400 font-semibold">{p.day}</text>
                                            })}
                                        </svg>
                                        
                                        {hoveredPoint !== null && points[hoveredPoint] && (
                                            <div 
                                                className="absolute bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-md border border-slate-800 font-semibold pointer-events-none z-10"
                                                style={{
                                                    left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                                                    top: `${(points[hoveredPoint].y / svgHeight) * 105 - 18}%`,
                                                    transform: 'translate(-50%, -100%)',
                                                    transition: 'all 0.1s ease-out'
                                                }}
                                            >
                                                {points[hoveredPoint].day}<br/>
                                                Kehadiran: {points[hoveredPoint].value}%
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex h-48 w-full items-center justify-center text-sm text-gray-500 italic">
                                        Data tidak ditemukan untuk rentang waktu ini.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CHART 2: SUBJECT ATTENDANCE (WORST PERFORMING) */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Rata-rata Kehadiran Mata Pelajaran</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">10 mata pelajaran dengan persentase kehadiran terendah</p>
                            </div>
                            
                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {subjectAverages.length > 0 ? (
                                    subjectAverages.map((item, idx) => {
                                        // Colored based on percentage (red for very low, amber for medium, green for good)
                                        let colorClass = 'bg-emerald-500';
                                        let textClass = 'text-emerald-700 dark:text-emerald-400';
                                        
                                        if (item.percentage < 85) {
                                            colorClass = 'bg-rose-500';
                                            textClass = 'text-rose-700 dark:text-rose-400';
                                        } else if (item.percentage < 93) {
                                            colorClass = 'bg-amber-500';
                                            textClass = 'text-amber-700 dark:text-amber-400';
                                        }

                                        return (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    <span className="truncate max-w-[70%]">{item.subject}</span>
                                                    <span className={`font-mono font-bold ${textClass}`}>{item.percentage}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                                    <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 italic">
                                        Data mata pelajaran tidak ditemukan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            {/* Minimal styles for scrollbar if needed */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #475569;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
