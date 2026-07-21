import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';


const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(ext)) {
        return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1.5m-1.5 3h3m-3 3h3" /></svg>;
    } else if (['doc', 'docx'].includes(ext)) {
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
        return <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
        return <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    }
    
    // Default file icon
    return <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
};

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
                                                    <a href={route('documents.download', submission.id)} className="text-indigo-600 hover:underline flex items-center gap-2" title={submission.file_name}>
                                                        {getFileIcon(submission.file_name)}
                                                        <span className="truncate max-w-[150px]">{submission.file_name}</span>
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
