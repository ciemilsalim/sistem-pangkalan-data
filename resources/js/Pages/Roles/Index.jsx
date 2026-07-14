import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
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
                                <PrimaryButton onClick={openCreateModal}>
                                    + Tambah Peran
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
                                                    >
                                                        Edit
                                                    </button>
                                                    {role.name !== 'admin' && (
                                                        <button
                                                            onClick={() => confirmRoleDeletion(role)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                        >
                                                            Hapus
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
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3" disabled={createForm.processing}>
                            Simpan
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
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3" disabled={editForm.processing}>
                            Simpan Perubahan
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
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton type="submit" className="ms-3 bg-red-600 hover:bg-red-500" disabled={false}>
                            Hapus Peran
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
