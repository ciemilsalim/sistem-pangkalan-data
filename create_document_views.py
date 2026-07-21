import os

# Create directories
os.makedirs(r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Documents", exist_ok=True)

index_jsx = """import React, { useState } from 'react';
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
"""

show_guru_jsx = """import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ShowGuru({ auth, documentRequest, submission }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        file: null,
        url: submission?.submitted_url || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('documents.submit', documentRequest.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengumpulan Berkas</h2>}>
            <Head title="Pengumpulan Berkas" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Detail Permintaan */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{documentRequest.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{documentRequest.description || 'Tidak ada deskripsi.'}</p>
                        <div className="flex gap-4 text-sm font-medium">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                                Batas Waktu: {documentRequest.deadline ? new Date(documentRequest.deadline).toLocaleDateString('id-ID') : '-'}
                            </span>
                        </div>
                    </div>

                    {/* Status Saat Ini */}
                    {submission && (
                        <div className={`p-4 rounded-lg border ${
                            submission.status === 'verified' ? 'bg-green-50 border-green-200' :
                            submission.status === 'revision_needed' ? 'bg-red-50 border-red-200' :
                            'bg-yellow-50 border-yellow-200'
                        }`}>
                            <h4 className="font-semibold mb-2">Status Pengumpulan: {submission.status.toUpperCase()}</h4>
                            {submission.file_name && <p className="text-sm mb-1">File Terkirim: <strong>{submission.file_name}</strong></p>}
                            {submission.submitted_url && <p className="text-sm mb-1">Link Terkirim: <a href={submission.submitted_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{submission.submitted_url}</a></p>}
                            <p className="text-sm">Waktu Kirim: {new Date(submission.submitted_at).toLocaleString('id-ID')}</p>
                            
                            {submission.feedback && (
                                <div className="mt-3 p-3 bg-white/60 rounded text-sm text-gray-800 italic border-l-4 border-red-400">
                                    Catatan Wakasek: "{submission.feedback}"
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Upload */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Kirim Berkas Baru</h3>
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <InputLabel value="Upload File (Maksimal 5MB, format bebas)" className="mb-2" />
                                <input
                                    type="file"
                                    onChange={e => setData('file', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                                />
                                <InputError message={errors.file} className="mt-2" />
                            </div>

                            <div className="text-center font-bold text-gray-400">ATAU</div>

                            <div>
                                <InputLabel htmlFor="url" value="Lampirkan Link (Contoh: Google Drive, Canva, dll)" />
                                <TextInput
                                    id="url"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.url}
                                    onChange={e => setData('url', e.target.value)}
                                    placeholder="https://..."
                                />
                                <InputError message={errors.url} className="mt-2" />
                            </div>

                            {progress && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                </div>
                            )}

                            <PrimaryButton disabled={processing}>
                                {processing ? 'Mengirim...' : 'Kirim Berkas'}
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
"""

show_wakasek_jsx = """import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ShowWakasek({ auth, documentRequest, teachers }) {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        status: 'verified',
        feedback: '',
    });

    const openReviewModal = (submission) => {
        setSelectedSubmission(submission);
        setData({
            status: submission.status === 'pending' || submission.status === 'submitted' ? 'verified' : submission.status,
            feedback: submission.feedback || '',
        });
        setIsReviewModalOpen(true);
    };

    const submitReview = (e) => {
        e.preventDefault();
        post(route('documents.review', selectedSubmission.id), {
            onSuccess: () => {
                setIsReviewModalOpen(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Permintaan Berkas</h2>}>
            <Head title="Detail Permintaan Berkas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{documentRequest.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{documentRequest.description}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium">
                                    Deadline: {documentRequest.deadline ? new Date(documentRequest.deadline).toLocaleDateString('id-ID') : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Table Guru */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Guru</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">File / Link</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {teachers.map((teacher) => {
                                    const submission = teacher.document_submissions && teacher.document_submissions.length > 0 
                                        ? teacher.document_submissions[0] 
                                        : null;
                                        
                                    return (
                                        <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {teacher.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {submission ? (
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                        submission.status === 'verified' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        submission.status === 'revision_needed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                        'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                    }`}>
                                                        {submission.status.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">BELUM MENGUMPULKAN</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {submission && submission.file_path && (
                                                    <a href={route('documents.download', submission.id)} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        Download File
                                                    </a>
                                                )}
                                                {submission && submission.submitted_url && (
                                                    <a href={submission.submitted_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        Buka Link
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {submission && (
                                                    <button onClick={() => openReviewModal(submission)} className="text-indigo-600 hover:text-indigo-900">
                                                        Review Status
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <Modal show={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}>
                <form onSubmit={submitReview} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                        Ubah Status Pengumpulan Berkas
                    </h2>
                    
                    <div className="mb-4">
                        <InputLabel htmlFor="status" value="Status" />
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="submitted">Submitted (Menunggu)</option>
                            <option value="verified">Verified (Diterima)</option>
                            <option value="revision_needed">Revision Needed (Perlu Revisi)</option>
                        </select>
                        <InputError message={errors.status} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="feedback" value="Catatan / Feedback (Wajib jika revisi)" />
                        <textarea
                            id="feedback"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.feedback}
                            onChange={(e) => setData('feedback', e.target.value)}
                            rows="3"
                        ></textarea>
                        <InputError message={errors.feedback} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setIsReviewModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan Status</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
"""

with open(r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Documents\Index.jsx", "w", encoding="utf-8") as f:
    f.write(index_jsx)

with open(r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Documents\ShowGuru.jsx", "w", encoding="utf-8") as f:
    f.write(show_guru_jsx)

with open(r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Documents\ShowWakasek.jsx", "w", encoding="utf-8") as f:
    f.write(show_wakasek_jsx)

print("Views created successfully!")
