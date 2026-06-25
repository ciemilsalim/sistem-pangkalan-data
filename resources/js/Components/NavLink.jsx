import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none ' +
                (active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 hover:text-gray-900 dark:text-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
