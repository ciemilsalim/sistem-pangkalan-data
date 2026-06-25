import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form for Create
    const createForm = useForm({
        name: '',
        email: '',
        role: 'teacher',
        password: '',
    });

    // Form for Edit
    const editForm = useForm({
        name: '',
        email: '',
        role: 'teacher',
        password: '', // optional on edit
    });

    // Handle Search & Filter submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('users.index'), {
            search: search,
            role: roleFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset filters
    const handleReset = () => {
        setSearch('');
        setRoleFilter('');
        router.get(route('users.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Open Edit Modal
    const openEditModal = (user) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
        });
    };

    // Submit Edit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
            }
        });
    };

    // Submit Delete
    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        router.delete(route('users.destroy', selectedUser.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
            }
        });
    };

    // Helper to render role badges
    const renderRoleBadge = (role) => {
        const badges = {
            admin: 'bg-red-100 text-red-800 border-red-200',
            teacher: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            student: 'bg-green-100 text-green-800 border-green-200',
            parent: 'bg-purple-100 text-purple-800 border-purple-200',
        };
        const labels = {
            admin: 'Administrator',
            teacher: 'Guru',
            student: 'Siswa',
            parent: 'Wali Murid',
        };

        return (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badges[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}>
                {labels[role] || role}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Manajemen User & Akun
                </h2>
            }
        >
            <Head title="Manajemen User" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Flash Message */}
                    {usePageProps().flash?.message && (
                        <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {usePageProps().flash.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Global Error Message (e.g. self delete error) */}
                    {usePageProps().errors?.error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">
                                        {usePageProps().errors.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter and Create Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                            <div className="w-64">
                                <TextInput
                                    id="search"
                                    type="text"
                                    name="search"
                                    value={search}
                                    className="block w-full text-sm border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                                    placeholder="Cari nama atau email..."
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div>
                                <select
                                    id="role-filter"
                                    value={roleFilter}
                                    className="block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Semua Peran</option>
                                    <option value="admin">Administrator</option>
                                    <option value="teacher">Guru</option>
                                    <option value="student">Siswa</option>
                                    <option value="parent">Wali Murid</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton type="submit" className="px-4 py-2 text-xs">
                                    Cari
                                </PrimaryButton>
                                {(filters.search || filters.role || search || roleFilter) && (
                                    <SecondaryButton onClick={handleReset} type="button" className="px-4 py-2 text-xs">
                                        Reset
                                    </SecondaryButton>
                                )}
                            </div>
                        </form>

                        <div>
                            <PrimaryButton
                                onClick={() => {
                                    createForm.reset();
                                    createForm.clearErrors();
                                    setIsCreateOpen(true);
                                }}
                                className="w-full sm:w-auto text-xs"
                            >
                                + Tambah Pengguna
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Peran
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Aktivitas Terakhir
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Aksi</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Tidak ada data pengguna ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {renderRoleBadge(user.role)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString('id-ID') : '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-indigo-600 hover:text-indigo-600 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    {auth.user.id !== user.id && (
                                                        <button
                                                            onClick={() => openDeleteModal(user)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={users.prev_page_url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!users.prev_page_url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Sebelumnya
                                    </Link>
                                    <Link
                                        href={users.next_page_url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!users.next_page_url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Berikutnya
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan <span className="font-semibold">{users.from || 0}</span> sampai <span className="font-semibold">{users.to || 0}</span> dari <span className="font-semibold">{users.total}</span> data
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            {users.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                                                        link.active
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 border-indigo-500'
                                                            : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 focus:outline-offset-0 border-gray-300 dark:border-gray-600'
                                                    } ${!link.url && 'pointer-events-none opacity-50'} ${
                                                        index === 0 ? 'rounded-l-md' : ''
                                                    } ${index === users.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Tambah Pengguna Baru</h3>
                    
                    <div className="mb-4">
                        <InputLabel htmlFor="create_name" value="Nama Lengkap" />
                        <TextInput
                            id="create_name"
                            type="text"
                            className="mt-1 block w-full"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            required
                        />
                        <InputError message={createForm.errors.name} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="create_email" value="Alamat Email" />
                        <TextInput
                            id="create_email"
                            type="email"
                            className="mt-1 block w-full"
                            value={createForm.data.email}
                            onChange={(e) => createForm.setData('email', e.target.value)}
                            required
                        />
                        <InputError message={createForm.errors.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="create_role" value="Peran / Hak Akses" />
                        <select
                            id="create_role"
                            value={createForm.data.role}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            onChange={(e) => createForm.setData('role', e.target.value)}
                            required
                        >
                            <option value="admin">Administrator</option>
                            <option value="teacher">Guru</option>
                            <option value="student">Siswa</option>
                            <option value="parent">Wali Murid</option>
                        </select>
                        <InputError message={createForm.errors.role} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="create_password" value="Password Awal" />
                        <TextInput
                            id="create_password"
                            type="password"
                            className="mt-1 block w-full"
                            value={createForm.data.password}
                            onChange={(e) => createForm.setData('password', e.target.value)}
                            required
                        />
                        <InputError message={createForm.errors.password} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            Simpan Pengguna
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditOpen} onClose={() => setIsEditOpen(false)}>
                <form onSubmit={handleEditSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Edit Pengguna</h3>
                    
                    <div className="mb-4">
                        <InputLabel htmlFor="edit_name" value="Nama Lengkap" />
                        <TextInput
                            id="edit_name"
                            type="text"
                            className="mt-1 block w-full"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            required
                        />
                        <InputError message={editForm.errors.name} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="edit_email" value="Alamat Email" />
                        <TextInput
                            id="edit_email"
                            type="email"
                            className="mt-1 block w-full"
                            value={editForm.data.email}
                            onChange={(e) => editForm.setData('email', e.target.value)}
                            required
                        />
                        <InputError message={editForm.errors.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="edit_role" value="Peran / Hak Akses" />
                        <select
                            id="edit_role"
                            value={editForm.data.role}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            onChange={(e) => editForm.setData('role', e.target.value)}
                            required
                        >
                            <option value="admin">Administrator</option>
                            <option value="teacher">Guru</option>
                            <option value="student">Siswa</option>
                            <option value="parent">Wali Murid</option>
                        </select>
                        <InputError message={editForm.errors.role} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="edit_password" value="Ubah Password (Kosongkan jika tidak diubah)" />
                        <TextInput
                            id="edit_password"
                            type="password"
                            className="mt-1 block w-full"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            placeholder="Password Baru (Opsional)"
                        />
                        <InputError message={editForm.errors.password} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsEditOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={editForm.processing}>
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <form onSubmit={handleDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Akun Pengguna</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Apakah Anda yakin ingin menghapus akun milik <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
                        Tindakan ini tidak dapat dibatalkan dan semua data terkait akun ini akan terpengaruh.
                    </p>
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsDeleteOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton type="submit">
                            Hapus Permanen
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

// Reusable helper hook to read page props cleanly
function usePageProps() {
    return usePage().props;
}
