import React, { useState, useMemo } from 'react';

const MonthlyCalendar = ({ events, onEventClick, onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    // Let's use Sunday as start of week (standard for Date.getDay())
    const paddingDays = firstDayOfMonth;

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToday = () => {
        setCurrentDate(new Date());
    };

    const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Parse events into a map of date string (YYYY-MM-DD) -> array of events
    const eventsByDate = useMemo(() => {
        const map = {};
        if (!events) return map;
        
        events.forEach(evt => {
            const start = new Date(evt.start_date);
            // set to midnight
            start.setHours(0,0,0,0);
            
            const end = evt.end_date ? new Date(evt.end_date) : new Date(start);
            end.setHours(0,0,0,0);

            // loop through all dates from start to end
            let iter = new Date(start);
            while (iter <= end) {
                const dateStr = [iter.getFullYear(), String(iter.getMonth()+1).padStart(2,'0'), String(iter.getDate()).padStart(2,'0')].join('-');
                if (!map[dateStr]) map[dateStr] = [];
                map[dateStr].push(evt);
                
                // add 1 day
                iter.setDate(iter.getDate() + 1);
            }
        });
        return map;
    }, [events]);

    const renderDays = () => {
        const dayNodes = [];
        // Add padding days
        for (let i = 0; i < paddingDays; i++) {
            dayNodes.push(<div key={`pad-${i}`} className="min-h-[100px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2"></div>);
        }

        const todayDateStr = [new Date().getFullYear(), String(new Date().getMonth()+1).padStart(2,'0'), String(new Date().getDate()).padStart(2,'0')].join('-');

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = [currentDate.getFullYear(), String(currentDate.getMonth()+1).padStart(2,'0'), String(i).padStart(2,'0')].join('-');
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayDateStr;

            dayNodes.push(
                <div 
                    key={dateStr} 
                    className={`min-h-[100px] border border-gray-100 dark:border-gray-800 p-2 flex flex-col group transition-colors ${onDayClick ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'}`}
                    onClick={() => onDayClick && onDayClick(dateStr)}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                            {i}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                        {dayEvents.map((evt, idx) => {
                            let colorClass = "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/70";
                            if (evt.is_holiday) {
                                colorClass = "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/70";
                            } else if (evt.is_self_study) {
                                colorClass = "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/70";
                            }

                            return (
                                <div 
                                    key={`${evt.id}-${idx}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick && onEventClick(evt);
                                    }}
                                    className={`text-xs px-2 py-1 rounded truncate border cursor-pointer transition-colors ${colorClass}`}
                                    title={evt.title}
                                >
                                    {evt.title}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Add end padding (make it multiple of 7)
        const totalCells = paddingDays + daysInMonth;
        const remainder = totalCells % 7;
        const endPadding = remainder > 0 ? 7 - remainder : 0;
        
        for (let i = 0; i < endPadding; i++) {
            dayNodes.push(<div key={`end-pad-${i}`} className="min-h-[100px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2"></div>);
        }

        return dayNodes;
    };

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{monthName}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={goToday} type="button" className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Hari Ini</button>
                    <div className="flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                        <button onClick={prevMonth} type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextMonth} type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {dayNames.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-0">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 bg-white dark:bg-gray-800">
                {renderDays()}
            </div>
        </div>
    );
};

export default MonthlyCalendar;
