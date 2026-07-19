import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';

export default function RolesIndex({ auth, roles, permissions }) {
    const [confirmingRoleDeletion, setConfirmingRoleDeletion] = useState(false);
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const createForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
        permissions: [],
    });

    const confirmRoleDeletion = (role) => {
        setSelectedRole(role);
        setConfirmingRoleDeletion(true);
    };

    const openCreateModal = () => {
        setIsCreatingRole(true);
    };

    const openEditModal = (role) => {
        setSelectedRole(role);
        editForm.setData({
            name: role.name,
            permissions: role.permissions.map(p => p.name)
        });
        setIsEditingRole(true);
    };

    const closeModal = () => {
        setConfirmingRoleDeletion(false);
        setIsCreatingRole(false);
        setIsEditingRole(false);
        setSelectedRole(null);
        createForm.reset();
        editForm.reset();
        createForm.clearErrors();
        editForm.clearErrors();
    };

    const deleteRole = (e) => {
        e.preventDefault();
        router.delete(route('roles.destroy', selectedRole.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const storeRole = (e) => {
        e.preventDefault();
        createForm.post(route('roles.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const updateRole = (e) => {
        e.preventDefault();
        editForm.put(route('roles.update', selectedRole.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const handlePermissionChange = (e) => {
        const value = e.target.value;
        const checked = e.target.checked;
        
        if (checked) {
            editForm.setData('permissions', [...editForm.data.permissions, value]);
        } else {
            editForm.setData('permissions', editForm.data.permissions.filter(p => p !== value));
        }
    };

    const formatPermission = (permName) => {
        const labels = {
            'manage_users': 'Kelola Pengguna',
            'manage_roles': 'Kelola Hak Akses',
            'manage_curriculum': 'Kelola Kurikulum',
            'manage_academic_periods': 'Kelola Periode Akademik',
            'manage_classes': 'Kelola Kelas',
            'manage_subjects': 'Kelola Mata Pelajaran',
            'manage_schedules': 'Kelola Jadwal',
            'manage_extracurriculars': 'Kelola Ekstrakurikuler',
            'manage_cp': 'Kelola Capaian Pembelajaran',
            'manage_promotions': 'Kenaikan Kelas',
            'manage_students': 'Data Siswa',
            'manage_teachers': 'Data Guru',
            'manage_parents': 'Data Wali Murid',
            'manage_announcements': 'Pengumuman',
            'manage_calendars': 'Kalender Akademik',
            'manage_settings': 'Pengaturan Sistem',
            'manage_lms_audit': 'Audit LMS',
            'manage_lms_moderation': 'Moderasi LMS',
            'manage_chat': 'Pusat Pesan',
            'monitor_chats': 'Pengawasan Obrolan',
            'access_sso_lms': 'SSO LMS Mokopani',
            'access_sso_attendance': 'SSO Aplikasi Absensi'
        };
        
        if (labels[permName]) return labels[permName];
        
        // Auto format: replace underscore and capitalize
        return permName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen Hak Akses (Roles & Permissions)</h2>}
        >
            <Head title="Manajemen Hak Akses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Daftar Peran (Roles)</h3>
                                <PrimaryButton onClick={openCreateModal} title="Tambah Peran">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </PrimaryButton>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nama Peran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Hak Akses (Permissions)
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {roles.map((role) => (
                                            <tr key={role.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.map(p => (
                                                            <span key={p.id} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                                                                {formatPermission(p.name)}
                                                            </span>
                                                        ))}
                                                        {role.permissions.length === 0 && (
                                                            <span className="text-gray-500 text-xs italic">Tidak ada akses khusus</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(role)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                        </svg>
                                                    </button>
                                                    {role.name !== 'admin' && (
                                                        <button
                                                            onClick={() => confirmRoleDeletion(role)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                            title="Hapus"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreatingRole} onClose={closeModal}>
                <form onSubmit={storeRole} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Tambah Peran Baru
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Nama Peran" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            required
                            isFocused
                        />
                        <InputError className="mt-2" message={createForm.errors.name} />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3" disabled={createForm.processing} title="Simpan">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                            </svg>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditingRole} onClose={closeModal}>
                <form onSubmit={updateRole} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Edit Peran & Hak Akses
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="edit_name" value="Nama Peran" />
                        <TextInput
                            id="edit_name"
                            className="mt-1 block w-full"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            required
                            disabled={selectedRole?.name === 'admin'}
                        />
                        <InputError className="mt-2" message={editForm.errors.name} />
                    </div>

                    <div className="mt-6">
                        <InputLabel value="Hak Akses (Permissions)" />
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {permissions.map(permission => (
                                <label key={permission.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        value={permission.name}
                                        checked={editForm.data.permissions.includes(permission.name)}
                                        onChange={handlePermissionChange}
                                    />
                                    <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                        {formatPermission(permission.name)}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <InputError className="mt-2" message={editForm.errors.permissions} />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3" disabled={editForm.processing} title="Simpan Perubahan">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                            </svg>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={confirmingRoleDeletion} onClose={closeModal}>
                <form onSubmit={deleteRole} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Apakah Anda yakin ingin menghapus peran "{selectedRole?.name}"?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Pengguna yang memiliki peran ini mungkin kehilangan akses ke beberapa fitur.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <DangerButton type="submit" className="ms-3" disabled={false} title="Hapus Peran">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
