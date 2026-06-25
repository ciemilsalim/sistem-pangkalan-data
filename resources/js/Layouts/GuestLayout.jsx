import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Left Column - SIPADA Illustration (Hidden on Mobile/Tablet) */}
            <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-indigo-600 dark:bg-indigo-900 p-12 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                
                <div className="relative z-10 w-full max-w-lg">
                    {/* Custom SVG Illustration: Monitor and Hands Typing */}
                    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
                        {/* Desk/Surface */}
                        <path d="M40 250 L360 250 L380 280 L20 280 Z" fill="#4338CA" fillOpacity="0.8" />
                        
                        {/* Monitor Stand */}
                        <rect x="185" y="200" width="30" height="50" fill="#E0E7FF" fillOpacity="0.8" />
                        <path d="M160 240 L240 240 L250 250 L150 250 Z" fill="#C7D2FE" />
                        
                        {/* Monitor Frame */}
                        <rect x="70" y="50" width="260" height="150" rx="8" fill="#1E1B4B" />
                        <rect x="75" y="55" width="250" height="135" rx="4" fill="#EEF2FF" />
                        
                        {/* Screen Content - Dashboard / Database illustration */}
                        <rect x="75" y="55" width="250" height="15" rx="4" fill="#E0E7FF" />
                        <circle cx="85" cy="62" r="3" fill="#818CF8" />
                        <circle cx="95" cy="62" r="3" fill="#818CF8" />
                        <circle cx="105" cy="62" r="3" fill="#818CF8" />
                        
                        <rect x="90" y="85" width="120" height="8" rx="4" fill="#6366F1" fillOpacity="0.4" />
                        <rect x="90" y="105" width="80" height="8" rx="4" fill="#6366F1" fillOpacity="0.2" />
                        <rect x="90" y="125" width="160" height="8" rx="4" fill="#6366F1" fillOpacity="0.3" />
                        <rect x="90" y="145" width="100" height="8" rx="4" fill="#6366F1" fillOpacity="0.5" />
                        
                        <rect x="230" y="85" width="75" height="45" rx="4" fill="#818CF8" fillOpacity="0.3" />
                        <rect x="230" y="140" width="35" height="30" rx="4" fill="#A5B4FC" fillOpacity="0.4" />
                        <rect x="270" y="140" width="35" height="30" rx="4" fill="#818CF8" fillOpacity="0.5" />
                        
                        <circle cx="340" cy="80" r="15" fill="#A5B4FC" fillOpacity="0.6" />
                        <circle cx="60" cy="120" r="10" fill="#818CF8" fillOpacity="0.5" />
                        <path d="M335 75 L345 85 M345 75 L335 85" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                        
                        {/* Keyboard */}
                        <path d="M120 265 L280 265 L290 285 L110 285 Z" fill="#E0E7FF" />
                        <path d="M130 270 L270 270 L275 275 L125 275 Z" fill="#818CF8" fillOpacity="0.3" />
                        
                        {/* Minimalist Hands Typing */}
                        <path d="M90 310 Q120 280 150 280 Q165 280 165 275 Q165 270 150 272" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M310 310 Q280 280 250 280 Q235 280 235 275 Q235 270 250 272" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    
                    <div className="mt-12 text-white">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Pangkalan Data (SIPADA)</h2>
                        <p className="text-indigo-100 text-lg leading-relaxed max-w-md font-medium">
                            Pusat data terpadu untuk ekosistem SIASEK. Kelola informasi, integrasikan layanan, dan pantau aktivitas dengan aman dan efisien.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex flex-col justify-between w-full lg:max-w-xl xl:max-w-2xl bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
                <div className="flex flex-1 flex-col items-center justify-center pt-10 pb-16 lg:pb-10 sm:pt-0 px-4 sm:px-8">
                    {/* Mobile Logo Header */}
                    <div className="w-full flex flex-col items-center justify-center mb-8 lg:hidden">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-14 w-14 fill-current text-indigo-600 dark:text-indigo-500" />
                        </Link>
                        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Masuk ke SIPADA</h1>
                    </div>

                    <div className="w-full sm:max-w-md lg:max-w-sm xl:max-w-md overflow-hidden bg-white dark:bg-gray-800 px-8 py-10 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-2xl border border-gray-100 dark:border-gray-700/60 transition-colors duration-200 relative z-10">
                        {/* Desktop form header */}
                        <div className="hidden lg:flex flex-col mb-8">
                            <ApplicationLogo className="h-10 w-10 fill-current text-indigo-600 dark:text-indigo-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Selamat Datang</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Silakan masuk untuk mengelola Pangkalan Data.</p>
                        </div>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 transition-colors duration-200 shrink-0">
                    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                        <div className="py-6 flex flex-col items-center justify-center gap-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                                &copy; {new Date().getFullYear()} SIPADA (Ekosistem SIASEK). Hak cipta dilindungi undang-undang.
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                                Dibuat dengan <span className="text-red-500">&hearts;</span> oleh <span className="font-semibold text-indigo-600 dark:text-indigo-400">Zahradev</span> &middot; Versi 1.0.0
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
