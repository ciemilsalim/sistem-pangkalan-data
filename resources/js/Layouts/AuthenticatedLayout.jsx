import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Icons
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

export default function AuthenticatedLayout({ header, children }) {
    const { auth, semestersList, activeSemesterId } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const activeSemester = semestersList?.find(s => s.id === activeSemesterId);
    const activeSemesterName = activeSemester ? `${activeSemester.name} ${activeSemester.academic_year ? `(${activeSemester.academic_year})` : ''}` : 'Pilih Semester';

    const switchSemester = (id) => {
        import('@inertiajs/react').then(({ router }) => {
            router.post(route('academic-periods.switch'), { semester_id: id }, {
                preserveScroll: true
            });
        });
    };
    
    // Sidebar collapse state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.sidebarCollapsed === 'true';
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.sidebarCollapsed = isSidebarCollapsed;
        }
    }, [isSidebarCollapsed]);
    
    // Dark mode logic
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') || localStorage.theme === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), active: route().current('dashboard'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { name: 'Manajemen User', href: route('users.index'), active: route().current('users.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { name: 'Manajemen Kurikulum', href: route('curriculum.index'), active: route().current('curriculum.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
        { name: 'Manajemen Sivitas', href: route('people.index'), active: route().current('people.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { name: 'Manajemen Pengumuman', href: route('announcements.index'), active: route().current('announcements.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
        { name: 'Kalender Akademik', href: route('calendars.index'), active: route().current('calendars.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { name: 'Obrolan Ortu', href: route('chat.index'), active: route().current('chat.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
        { name: 'Pengawasan Chat', href: route('monitoring.chats.index'), active: route().current('monitoring.chats.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
        { name: 'Audit Akademik', href: route('academic-audit.index'), active: route().current('academic-audit.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l-1.62-1.62m0 0l-1.62 1.62m1.62-1.62v-3.375" /></svg> },
        { name: 'Moderasi LMS', href: route('lms-moderation.index'), active: route().current('lms-moderation.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
        { name: 'Pengaturan', href: route('settings.index'), active: route().current('settings.*'), icon: <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto sticky top-0 h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[88px]' : 'w-64'} shrink-0 z-40`}>
                <div className={`h-16 flex items-center border-b border-gray-200 dark:border-gray-800 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                    <Link href="/" className={`flex items-center overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                        <ApplicationLogo className="block h-8 w-auto fill-current text-indigo-600 dark:text-indigo-500 shrink-0" />
                        <span className="ml-3 font-semibold text-lg text-gray-900 dark:text-gray-100 tracking-tight">SIPADA</span>
                    </Link>
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400 transition-colors ${isSidebarCollapsed ? 'p-2' : 'p-1.5 -mr-2'}`}
                        title={isSidebarCollapsed ? "Perluas Sidebar" : "Lipat Sidebar"}
                    >
                        {isSidebarCollapsed ? (
                            <ApplicationLogo className="block h-7 w-auto fill-current text-indigo-600 dark:text-indigo-500" />
                        ) : (
                            <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        )}
                    </button>
                </div>
                <nav className={`flex-1 py-4 space-y-1 overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'px-4' : 'px-4'}`}>
                    {navigation.map((item) => (
                        <NavLink key={item.name} href={item.href} active={item.active} className={isSidebarCollapsed ? 'justify-center px-0' : ''} title={isSidebarCollapsed ? item.name : undefined}>
                            <div className="shrink-0">{item.icon}</div>
                            <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'max-w-0 opacity-0 -ml-3' : 'max-w-[200px] opacity-100'}`}>
                                <span className="whitespace-nowrap">{item.name}</span>
                            </div>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header (Desktop Only) */}
                <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/75 dark:bg-gray-950/75 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 shrink-0 transition-colors duration-300">
                    <div className="flex items-center">
                        {/* Title or other desktop-only elements can go here */}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Semester Switch Dropdown */}
                        {semestersList && semestersList.length > 0 && (
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold leading-4 text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
                                            >
                                                {activeSemesterName}
                                                <svg className="-me-0.5 ms-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="right" width="48">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tahun Ajaran & Semester</p>
                                        </div>
                                        {semestersList.map(semester => (
                                            <button
                                                key={semester.id}
                                                onClick={() => switchSemester(semester.id)}
                                                className={`w-full text-left block w-full px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out focus:outline-none ${semester.id == activeSemesterId ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{semester.name} {semester.academic_year ? `(${semester.academic_year})` : ''}</span>
                                                    {semester.is_active ? <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">AKTIF</span> : null}
                                                </div>
                                            </button>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? <SunIcon /> : <MoonIcon />}
                        </button>

                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium leading-4 text-gray-600 dark:text-gray-300 transition duration-150 ease-in-out hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
                                        >
                                            {user.name}
                                            <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Mobile Top Bar (Fixed with Glassmorphism) */}
                <header className="md:hidden fixed top-0 left-0 w-full z-40 flex h-14 items-center justify-between px-4 bg-white/75 dark:bg-gray-950/75 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 transition-colors duration-300">
                    <div className="flex items-center gap-2.5">
                        <Link href="/">
                            <ApplicationLogo className="block h-6 w-auto fill-current text-indigo-600 dark:text-indigo-500 drop-shadow-sm" />
                        </Link>
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">SIPADA</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="text-right">
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[100px]">{user.name}</div>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 dark:from-indigo-900/60 dark:to-indigo-800/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-700/50 shadow-sm shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Mobile Bottom Navigation Bar */}
                <div className="md:hidden fixed bottom-0 left-0 z-40 w-full h-[68px] bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] transition-colors duration-200">
                    <Link
                        href={route('dashboard')}
                        className={`group flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            route().current('dashboard')
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className={`px-4 py-1 rounded-full mb-1 transition-all duration-300 ${route().current('dashboard') ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}>
                            <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" fill="none" stroke="currentColor" strokeWidth={route().current('dashboard') ? "2.5" : "2"} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold leading-none">Dasbor</span>
                    </Link>

                    <Link
                        href={route('chat.index')}
                        className={`group flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            route().current('chat.*') || route().current('monitoring.chats.*')
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className={`px-4 py-1 rounded-full mb-1 transition-all duration-300 ${(route().current('chat.*') || route().current('monitoring.chats.*')) ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}>
                            <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" fill="none" stroke="currentColor" strokeWidth={(route().current('chat.*') || route().current('monitoring.chats.*')) ? "2.5" : "2"} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold leading-none">Obrolan</span>
                    </Link>

                    <Link
                        href={route('academic-audit.index')}
                        className={`group flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            route().current('academic-audit.index')
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className={`px-4 py-1 rounded-full mb-1 transition-all duration-300 ${route().current('academic-audit.index') ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}>
                            <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" fill="none" stroke="currentColor" strokeWidth={route().current('academic-audit.index') ? "2.5" : "2"} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l-1.62-1.62m0 0l-1.62 1.62m1.62-1.62v-3.375" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold leading-none">Audit</span>
                    </Link>

                    <button
                        onClick={() => setShowingNavigationDropdown(true)}
                        className={`group flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            showingNavigationDropdown
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className={`px-4 py-1 rounded-full mb-1 transition-all duration-300 ${showingNavigationDropdown ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}>
                            <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" fill="none" stroke="currentColor" strokeWidth={showingNavigationDropdown ? "2.5" : "2"} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold leading-none">Lainnya</span>
                    </button>
                </div>

                {/* Mobile Slide-up Drawer Menu (Bottom Sheet) */}
                {showingNavigationDropdown && (
                    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
                        {/* Tap outside backdrop to close */}
                        <div className="absolute inset-0" onClick={() => setShowingNavigationDropdown(false)}></div>
                        
                        {/* Drawer Panel */}
                        <div className="relative w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-10 overflow-y-auto flex flex-col border-t border-gray-200 dark:border-gray-800 transition-transform duration-300 animate-slide-up">
                            {/* Drawer Header */}
                            <div className="sticky top-0 bg-white dark:bg-gray-900 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-10 shrink-0">
                                <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">Menu Navigasi</span>
                                <button
                                    onClick={() => setShowingNavigationDropdown(false)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Drawer Links Body */}
                            <div className="p-5 flex-1 overflow-y-auto space-y-4 pb-8">
                                <div className="grid grid-cols-2 gap-2">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setShowingNavigationDropdown(false)}
                                            className={`group flex flex-col items-center justify-center gap-1.5 text-center p-3.5 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                                                item.active
                                                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-400 shadow-sm'
                                                    : 'bg-gray-50/50 border-gray-200/60 text-gray-700 dark:bg-gray-800/30 dark:border-gray-800/60 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                                                {item.icon}
                                            </div>
                                            <span>{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                
                                {/* Profile, Dark Mode Toggle & Log Out Actions */}
                                <div className="pt-5 border-t border-gray-200 dark:border-gray-800 mt-2">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl mb-4">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                        </div>
                                        {/* Mobile Dark Mode Button */}
                                        <button
                                            onClick={toggleDarkMode}
                                            className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200/30 dark:border-gray-700/30 shrink-0"
                                            aria-label="Toggle dark mode"
                                        >
                                            {isDarkMode ? <SunIcon /> : <MoonIcon />}
                                        </button>
                                    </div>
                                    
                                    {/* Mobile Semester Dropdown */}
                                    {semestersList && semestersList.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Pilih Semester</p>
                                            <div className="space-y-1">
                                                {semestersList.map(semester => (
                                                    <button
                                                        key={semester.id}
                                                        onClick={() => {
                                                            switchSemester(semester.id);
                                                            setShowingNavigationDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${semester.id == activeSemesterId ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{semester.name} {semester.academic_year ? `(${semester.academic_year})` : ''}</span>
                                                            {semester.is_active ? <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">AKTIF</span> : null}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <Link
                                            href={route('profile.edit')}
                                            onClick={() => setShowingNavigationDropdown(false)}
                                            className="group flex flex-1 flex-col items-center justify-center gap-1.5 text-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Profil
                                        </Link>
                                        <Link
                                            method="post"
                                            href={route('logout')}
                                            as="button"
                                            className="group flex flex-1 flex-col items-center justify-center gap-1.5 text-center py-3 px-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                                        >
                                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Keluar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0 relative flex flex-col">
                    {header && (
                        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200 shrink-0">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </div>
                    )}
                    <div className="p-4 sm:p-6 lg:p-8 flex-1">
                        {children}
                    </div>

                    {/* Footer */}
                    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200 shrink-0">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <ApplicationLogo className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">SIPADA - Sistem Pangkalan Data</span>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        &copy; {new Date().getFullYear()} SIPADA (Ekosistem SIASEK). Hak cipta dilindungi undang-undang.
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                        Dibuat dengan <span className="text-red-500">&hearts;</span> oleh <span className="font-semibold text-indigo-600 dark:text-indigo-400">Zahradev</span> &middot; Versi 1.0.0
                                    </p>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
