import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function DocumentsIndex({ auth, requests, isWakasek }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        deadline: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('documents.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Berkas & Arsip</h2>}
        >
            <Head title="Berkas & Arsip" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar Permintaan Berkas</h3>
                        {isWakasek && (
                            <PrimaryButton onClick={() => setIsCreateModalOpen(true)}>
                                Buat Permintaan Baru
                            </PrimaryButton>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Judul Permintaan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Batas Waktu</th>
                                    {isWakasek ? (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Terkumpul</th>
                                    ) : (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status Pengumpulan</th>
                                    )}
                                    <th className="px-6 py-3 relative"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada permintaan berkas.</td>
                                    </tr>
                                ) : (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{req.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{req.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {req.deadline ? new Date(req.deadline).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            {isWakasek ? (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {req.submissions_count} Guru
                                                    </span>
                                                </td>
                                            ) : (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {req.submissions && req.submissions.length > 0 ? (
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                            req.submissions[0].status === 'verified' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                            req.submissions[0].status === 'revision_needed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                            'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                        }`}>
                                                            {req.submissions[0].status.toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">BELUM MENGUMPULKAN</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('documents.show', req.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                    Lihat Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Buat Permintaan Berkas Baru
                    </h2>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="title" value="Judul Permintaan" />
                        <TextInput
                            id="title"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Deskripsi / Instruksi" />
                        <textarea
                            id="description"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows="3"
                        ></textarea>
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="deadline" value="Batas Waktu (Opsional)" />
                        <TextInput
                            id="deadline"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.deadline}
                            onChange={(e) => setData('deadline', e.target.value)}
                        />
                        <InputError message={errors.deadline} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
