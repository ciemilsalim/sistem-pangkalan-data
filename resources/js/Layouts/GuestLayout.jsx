import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import HologramData from '@/Components/HologramData';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Left Column - SIPADA Illustration (Hidden on Mobile/Tablet) */}
            <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-indigo-600 dark:bg-indigo-900 p-12 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                
                <div className="relative z-10 w-full max-w-lg">
                    {/* 3D Interactive Hologram Data Illustration */}
                    <HologramData />
                    
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
