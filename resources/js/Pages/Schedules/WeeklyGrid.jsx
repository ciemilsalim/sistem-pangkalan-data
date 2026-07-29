import React from 'react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 07:00 to 17:00

export default function WeeklyGrid({ schedules, onScheduleClick, viewMode }) {
    // Helper to format time (e.g., '07:30' -> 7.5) for grid positioning
    const timeToDecimal = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes / 60);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-6 overflow-x-auto overflow-y-hidden">
            <div className="min-w-[800px] h-[600px] flex flex-col">
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
                                            
                                        return (
                                            <div
                                                key={schedule.id}
                                                onClick={() => onScheduleClick(schedule)}
                                                className="absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-l-4 group"
                                                style={{
                                                    top: `${topPercent}%`,
                                                    height: `${heightPercent}%`,
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    borderColor: '#3b82f6',
                                                }}
                                            >
                                                <div className="font-semibold text-blue-900 leading-tight mb-1 group-hover:text-blue-700">
                                                    {subjectName}
                                                </div>
                                                <div className="text-blue-700/80 truncate">
                                                    {secondaryText}
                                                </div>
                                                <div className="text-blue-600/60 mt-1 flex items-center gap-1">
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
