import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';

export default function PromotionsIndex({ auth, schoolClasses }) {
    const [originClassId, setOriginClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_ids: [],
        action_type: 'promote',
        destination_class_id: '',
    });

    // Fetch students when origin class changes
    useEffect(() => {
        if (originClassId) {
            setLoading(true);
            axios.get(route('promotions.students'), { params: { school_class_id: originClassId } })
                .then(res => {
                    setStudents(res.data);
                    const allIds = res.data.map(s => s.id);
                    setSelectedStudents(allIds);
                    setData('student_ids', allIds);
                })
                .catch(err => {
                    console.error(err);
                    alert("Gagal memuat data siswa");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setStudents([]);
            setSelectedStudents([]);
            setData('student_ids', []);
        }
    }, [originClassId]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = students.map(s => s.id);
            setSelectedStudents(allIds);
            setData('student_ids', allIds);
        } else {
            setSelectedStudents([]);
            setData('student_ids', []);
        }
    };

    const handleSelectStudent = (id) => {
        let newSelected = [...selectedStudents];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter(sId => sId !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedStudents(newSelected);
        setData('student_ids', newSelected);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (selectedStudents.length === 0) {
            alert('Pilih setidaknya satu siswa!');
            return;
        }

        if (data.action_type === 'promote' && !data.destination_class_id) {
            alert('Pilih kelas tujuan!');
            return;
        }

        if (confirm('Apakah Anda yakin ingin memproses data ini? Pastikan data sudah benar.')) {
            post(route('promotions.process'), {
                onSuccess: () => {
                    // Refresh student list
                    setOriginClassId('');
                    reset();
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kenaikan Kelas & Kelulusan</h2>}
        >
            <Head title="Kenaikan Kelas & Kelulusan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">1. Pilih Kelas Asal</h3>
                            <div className="max-w-md">
                                <InputLabel htmlFor="origin_class" value="Kelas Saat Ini" />
                                <select
                                    id="origin_class"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    value={originClassId}
                                    onChange={(e) => setOriginClassId(e.target.value)}
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {schoolClasses.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} {cls.level ? `(Tingkat ${cls.level.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {originClassId && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Pilih Siswa & Tujuan</h3>
                                
                                {loading ? (
                                    <p className="text-gray-500 dark:text-gray-400">Memuat data siswa...</p>
                                ) : students.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">Tidak ada siswa aktif di kelas ini.</p>
                                ) : (
                                    <form onSubmit={submit}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Kolom Kiri: Daftar Siswa */}
                                            <div className="col-span-2">
                                                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                                                                        checked={selectedStudents.length === students.length && students.length > 0}
                                                                        onChange={handleSelectAll}
                                                                    />
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    NIS
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Nama Siswa
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                            {students.map((student) => (
                                                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                                                                            checked={selectedStudents.includes(student.id)}
                                                                            onChange={() => handleSelectStudent(student.id)}
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        {student.nis}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {student.name}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    Terpilih: {selectedStudents.length} dari {students.length} siswa
                                                </div>
                                                {errors.student_ids && <p className="text-red-500 text-xs mt-1">{errors.student_ids}</p>}
                                            </div>

                                            {/* Kolom Kanan: Aksi */}
                                            <div className="col-span-1">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-24">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Tindakan</h4>
                                                    
                                                    <div className="mb-4">
                                                        <InputLabel htmlFor="action_type" value="Pilih Aksi" />
                                                        <select
                                                            id="action_type"
                                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm text-sm"
                                                            value={data.action_type}
                                                            onChange={(e) => setData('action_type', e.target.value)}
                                                        >
                                                            <option value="promote">Naik/Pindah Kelas</option>
                                                            <option value="graduate">Lulus (Alumni)</option>
                                                        </select>
                                                        {errors.action_type && <p className="text-red-500 text-xs mt-1">{errors.action_type}</p>}
                                                    </div>

                                                    {data.action_type === 'promote' && (
                                                        <div className="mb-6">
                                                            <InputLabel htmlFor="destination_class" value="Kelas Tujuan" />
                                                            <select
                                                                id="destination_class"
                                                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm text-sm"
                                                                value={data.destination_class_id}
                                                                onChange={(e) => setData('destination_class_id', e.target.value)}
                                                            >
                                                                <option value="">-- Pilih Kelas Tujuan --</option>
                                                                {schoolClasses
                                                                    .filter(cls => cls.id.toString() !== originClassId)
                                                                    .map(cls => (
                                                                    <option key={cls.id} value={cls.id}>
                                                                        {cls.name} {cls.level ? `(Tingkat ${cls.level.name})` : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.destination_class_id && <p className="text-red-500 text-xs mt-1">{errors.destination_class_id}</p>}
                                                        </div>
                                                    )}

                                                    {data.action_type === 'graduate' && (
                                                        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400">
                                                            <strong>Perhatian:</strong> Siswa yang diluluskan akan dilepas dari kelas ini, statusnya menjadi "Lulus", dan akun mereka akan dinonaktifkan.
                                                        </div>
                                                    )}

                                                    <PrimaryButton className="w-full justify-center" disabled={processing || selectedStudents.length === 0}>
                                                        {processing ? 'Memproses...' : 'Proses Sekarang'}
                                                    </PrimaryButton>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
