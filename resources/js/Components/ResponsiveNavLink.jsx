import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900/50 hover:text-gray-800 dark:text-gray-200 focus:border-gray-300 dark:border-gray-600 focus:bg-gray-50 dark:bg-gray-900/50 focus:text-gray-800 dark:text-gray-200 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
