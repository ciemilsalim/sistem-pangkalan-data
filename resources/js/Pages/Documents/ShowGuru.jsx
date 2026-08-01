import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';


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

const getUrlIcon = (url) => {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('docs.google.com/document') || lowerUrl.includes('docs.google.com/presentation') || lowerUrl.includes('docs.google.com/form')) {
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    } else if (lowerUrl.includes('docs.google.com/spreadsheets')) {
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    } else if (lowerUrl.includes('drive.google.com')) {
        return <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
    } else if (lowerUrl.includes('.pdf')) {
        return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1.5m-1.5 3h3m-3 3h3" /></svg>;
    }
    
    // Default link icon
    return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
};

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
                            {submission.file_name && <p className="text-sm mb-1 flex items-center gap-2">File Terkirim: {getFileIcon(submission.file_name)} <strong>{submission.file_name}</strong></p>}
                            {submission.submitted_url && <p className="text-sm mb-1 flex items-center gap-2">Link Terkirim: {getUrlIcon(submission.submitted_url)} <a href={submission.submitted_url} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate max-w-[200px]">{submission.submitted_url}</a></p>}
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
