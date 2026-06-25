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
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
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
        { name: 'Dashboard', href: route('dashboard'), active: route().current('dashboard') },
        { name: 'Manajemen User', href: route('users.index'), active: route().current('users.*') },
        { name: 'Manajemen Kurikulum', href: route('curriculum.index'), active: route().current('curriculum.*') },
        { name: 'Manajemen Sivitas', href: route('people.index'), active: route().current('people.*') },
        { name: 'Manajemen Pengumuman', href: route('announcements.index'), active: route().current('announcements.*') },
        { name: 'Kalender Akademik', href: route('calendars.index'), active: route().current('calendars.*') },
        { name: 'Obrolan Ortu', href: route('chat.index'), active: route().current('chat.*') },
        { name: 'Pengawasan Chat', href: route('monitoring.chats.index'), active: route().current('monitoring.chats.*') },
        { name: 'Audit Akademik', href: route('academic-audit.index'), active: route().current('academic-audit.*') },
        { name: 'Moderasi LMS', href: route('lms-moderation.index'), active: route().current('lms-moderation.*') },
        { name: 'Pengaturan', href: route('settings.index'), active: route().current('settings.*') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <Link href="/">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-indigo-600 dark:text-indigo-500" />
                    </Link>
                    <span className="ml-3 font-semibold text-lg text-gray-900 dark:text-gray-100">Siasek</span>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => (
                        <NavLink key={item.name} href={item.href} active={item.active}>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header (Desktop Only) */}
                <header className="hidden md:flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 transition-colors duration-200">
                    <div className="flex items-center">
                        {/* Title or other desktop-only elements can go here */}
                    </div>

                    <div className="flex items-center gap-4">
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

                {/* Mobile Bottom Navigation Bar */}
                <div className="md:hidden fixed bottom-0 left-0 z-40 w-full h-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] transition-colors duration-200">
                    <Link
                        href={route('dashboard')}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                            route().current('dashboard')
                                ? 'text-indigo-600 dark:text-indigo-450'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-250'
                        }`}
                    >
                        <svg className="w-5.5 h-5.5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span>Dasbor</span>
                    </Link>

                    <Link
                        href={route('chat.index')}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                            route().current('chat.*') || route().current('monitoring.chats.*')
                                ? 'text-indigo-600 dark:text-indigo-455'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-255'
                        }`}
                    >
                        <svg className="w-5.5 h-5.5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <span>Obrolan</span>
                    </Link>

                    <Link
                        href={route('academic-audit.index')}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                            route().current('academic-audit.index')
                                ? 'text-indigo-600 dark:text-indigo-455'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-255'
                        }`}
                    >
                        <svg className="w-5.5 h-5.5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l-1.62-1.62m0 0l-1.62 1.62m1.62-1.62v-3.375" />
                        </svg>
                        <span>Audit</span>
                    </Link>

                    <button
                        onClick={() => setShowingNavigationDropdown(true)}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                            showingNavigationDropdown
                                ? 'text-indigo-600 dark:text-indigo-455'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-255'
                        }`}
                    >
                        <svg className="w-5.5 h-5.5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                        <span>Lainnya</span>
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
                                            className={`flex items-center justify-center text-center p-3.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                                                item.active
                                                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-400 shadow-sm'
                                                    : 'bg-gray-50/50 border-gray-200/60 text-gray-700 dark:bg-gray-800/30 dark:border-gray-800/60 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {item.name}
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
                                    
                                    <div className="flex gap-3">
                                        <Link
                                            href={route('profile.edit')}
                                            onClick={() => setShowingNavigationDropdown(false)}
                                            className="flex-1 text-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Profil
                                        </Link>
                                        <Link
                                            method="post"
                                            href={route('logout')}
                                            as="button"
                                            className="flex-1 text-center py-3 px-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                                        >
                                            Keluar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    {header && (
                        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </div>
                    )}
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
