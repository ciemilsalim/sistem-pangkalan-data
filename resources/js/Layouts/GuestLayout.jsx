import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 dark:bg-gray-900 pt-6 sm:justify-center sm:pt-0 transition-colors duration-200">
            <div>
                <Link href="/" className="flex items-center gap-3">
                    <ApplicationLogo className="h-16 w-16 fill-current text-indigo-600 dark:text-indigo-500" />
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">Siasek</span>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white dark:bg-gray-800 px-8 py-10 shadow-lg dark:shadow-none sm:max-w-md sm:rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                {children}
            </div>
        </div>
    );
}
