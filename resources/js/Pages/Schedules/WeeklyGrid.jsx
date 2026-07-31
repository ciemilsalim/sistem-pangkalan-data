import React from 'react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 7); // 07:00 to 15:00

const SUBJECT_COLORS = [
    { bg: 'bg-red-50', hoverBg: 'hover:bg-red-100', border: '#f87171', text: 'text-red-900', textHover: 'group-hover:text-red-700', subText: 'text-red-700/80', timeText: 'text-red-600/60', scrollThumb: 'scrollbar-thumb-red-200' },
    { bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-100', border: '#fb923c', text: 'text-orange-900', textHover: 'group-hover:text-orange-700', subText: 'text-orange-700/80', timeText: 'text-orange-600/60', scrollThumb: 'scrollbar-thumb-orange-200' },
    { bg: 'bg-amber-50', hoverBg: 'hover:bg-amber-100', border: '#fbbf24', text: 'text-amber-900', textHover: 'group-hover:text-amber-700', subText: 'text-amber-700/80', timeText: 'text-amber-600/60', scrollThumb: 'scrollbar-thumb-amber-200' },
    { bg: 'bg-green-50', hoverBg: 'hover:bg-green-100', border: '#4ade80', text: 'text-green-900', textHover: 'group-hover:text-green-700', subText: 'text-green-700/80', timeText: 'text-green-600/60', scrollThumb: 'scrollbar-thumb-green-200' },
    { bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-100', border: '#34d399', text: 'text-emerald-900', textHover: 'group-hover:text-emerald-700', subText: 'text-emerald-700/80', timeText: 'text-emerald-600/60', scrollThumb: 'scrollbar-thumb-emerald-200' },
    { bg: 'bg-teal-50', hoverBg: 'hover:bg-teal-100', border: '#2dd4bf', text: 'text-teal-900', textHover: 'group-hover:text-teal-700', subText: 'text-teal-700/80', timeText: 'text-teal-600/60', scrollThumb: 'scrollbar-thumb-teal-200' },
    { bg: 'bg-cyan-50', hoverBg: 'hover:bg-cyan-100', border: '#22d3ee', text: 'text-cyan-900', textHover: 'group-hover:text-cyan-700', subText: 'text-cyan-700/80', timeText: 'text-cyan-600/60', scrollThumb: 'scrollbar-thumb-cyan-200' },
    { bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-100', border: '#60a5fa', text: 'text-blue-900', textHover: 'group-hover:text-blue-700', subText: 'text-blue-700/80', timeText: 'text-blue-600/60', scrollThumb: 'scrollbar-thumb-blue-200' },
    { bg: 'bg-indigo-50', hoverBg: 'hover:bg-indigo-100', border: '#818cf8', text: 'text-indigo-900', textHover: 'group-hover:text-indigo-700', subText: 'text-indigo-700/80', timeText: 'text-indigo-600/60', scrollThumb: 'scrollbar-thumb-indigo-200' },
    { bg: 'bg-violet-50', hoverBg: 'hover:bg-violet-100', border: '#a78bfa', text: 'text-violet-900', textHover: 'group-hover:text-violet-700', subText: 'text-violet-700/80', timeText: 'text-violet-600/60', scrollThumb: 'scrollbar-thumb-violet-200' },
    { bg: 'bg-purple-50', hoverBg: 'hover:bg-purple-100', border: '#c084fc', text: 'text-purple-900', textHover: 'group-hover:text-purple-700', subText: 'text-purple-700/80', timeText: 'text-purple-600/60', scrollThumb: 'scrollbar-thumb-purple-200' },
    { bg: 'bg-fuchsia-50', hoverBg: 'hover:bg-fuchsia-100', border: '#e879f9', text: 'text-fuchsia-900', textHover: 'group-hover:text-fuchsia-700', subText: 'text-fuchsia-700/80', timeText: 'text-fuchsia-600/60', scrollThumb: 'scrollbar-thumb-fuchsia-200' },
    { bg: 'bg-pink-50', hoverBg: 'hover:bg-pink-100', border: '#f472b6', text: 'text-pink-900', textHover: 'group-hover:text-pink-700', subText: 'text-pink-700/80', timeText: 'text-pink-600/60', scrollThumb: 'scrollbar-thumb-pink-200' },
    { bg: 'bg-rose-50', hoverBg: 'hover:bg-rose-100', border: '#fb7185', text: 'text-rose-900', textHover: 'group-hover:text-rose-700', subText: 'text-rose-700/80', timeText: 'text-rose-600/60', scrollThumb: 'scrollbar-thumb-rose-200' }
];

const getSubjectColor = (subjectId) => {
    return SUBJECT_COLORS[(subjectId || 0) % SUBJECT_COLORS.length];
};

export default function WeeklyGrid({ schedules, onScheduleClick, viewMode }) {
    // Helper to format time (e.g., '07:30' -> 7.5) for grid positioning
    const timeToDecimal = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes / 60);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-6 overflow-x-auto">
            <div className="min-w-[1000px] h-[800px] flex flex-col">
                {/* Header Row (Days) */}
                <div className="flex bg-gray-50/50 rounded-t-lg border-b border-gray-100">
                    <div className="w-16 flex-shrink-0 border-r border-gray-100"></div>
                    {DAYS.map((day) => (
                        <div key={day} className="flex-1 text-center py-3 font-semibold text-gray-600 border-r border-gray-100 last:border-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 flex overflow-y-auto relative">
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/30 flex flex-col">
                        {HOURS.map((hour) => (
                            <div key={hour} className="flex-1 relative border-b border-gray-100 last:border-0 min-h-[60px]">
                                <span className="absolute -top-3 left-0 w-full text-center text-xs text-gray-400 font-medium bg-transparent">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    <div className="flex-1 flex relative">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {HOURS.map((hour) => (
                                <div key={`line-${hour}`} className="flex-1 border-b border-gray-100/50 last:border-0 min-h-[60px]"></div>
                            ))}
                        </div>
                        
                        {/* Day Vertical Dividers */}
                        {DAYS.map((day, dayIndex) => (
                            <div key={`col-${day}`} className="flex-1 border-r border-gray-100/50 last:border-0 relative">
                                {/* Render Schedules for this Day */}
                                {schedules
                                    .filter(s => s.day_of_week == (dayIndex + 1))
                                    .map(schedule => {
                                        const startDec = timeToDecimal(schedule.start_time);
                                        const endDec = timeToDecimal(schedule.end_time);
                                        
                                        const minHour = HOURS[0];
                                        const maxHour = HOURS[HOURS.length - 1] + 1;
                                        
                                        // Bound checking
                                        const clampedStart = Math.max(minHour, Math.min(startDec, maxHour));
                                        const clampedEnd = Math.max(minHour, Math.min(endDec, maxHour));
                                        
                                        if (clampedEnd <= minHour || clampedStart >= maxHour) return null;
                                        
                                        const topPercent = ((clampedStart - minHour) / (maxHour - minHour)) * 100;
                                        const heightPercent = ((clampedEnd - clampedStart) / (maxHour - minHour)) * 100;
                                        
                                        const assignment = schedule.teaching_assignment;
                                        if (!assignment) return null;

                                        const subjectName = assignment.subject?.name || 'Unknown Subject';
                                        const secondaryText = viewMode === 'teacher' 
                                            ? (assignment.school_class?.name || '-')
                                            : (assignment.teacher?.name || '-');
                                            
                                        const color = getSubjectColor(assignment.subject_id);
                                            
                                        return (
                                            <div
                                                key={schedule.id}
                                                onClick={() => onScheduleClick && onScheduleClick(schedule)}
                                                className={`absolute left-1 right-1 rounded-md p-2 text-xs overflow-y-auto shadow-sm hover:shadow-md transition-all duration-200 border-l-4 group z-10 hover:z-20 scrollbar-thin ${color.bg} ${color.hoverBg} ${color.scrollThumb} ${onScheduleClick ? 'cursor-pointer' : 'cursor-default'}`}
                                                style={{
                                                    top: `${topPercent}%`,
                                                    height: `${heightPercent}%`,
                                                    borderColor: color.border,
                                                }}
                                            >
                                                <div className={`font-semibold leading-tight mb-1 ${color.text} ${color.textHover}`}>
                                                    {subjectName}
                                                </div>
                                                <div className={`truncate ${color.subText}`}>
                                                    {secondaryText}
                                                </div>
                                                <div className={`mt-1 flex items-center gap-1 ${color.timeText}`}>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {schedule.start_time?.substring(0,5)} - {schedule.end_time?.substring(0,5)}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
