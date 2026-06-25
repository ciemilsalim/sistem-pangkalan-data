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
                'group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out focus:outline-none ' +
                (active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100/80 hover:text-gray-900 dark:hover:bg-gray-800/80 dark:hover:text-gray-200') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
