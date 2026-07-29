import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import WeeklyGrid from './WeeklyGrid';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SchedulesIndex({ auth, schoolClasses, teachers, schedules, teachingAssignments }) {
    const [viewMode, setViewMode] = useState('class'); // 'class' or 'teacher'
    const [selectedClassId, setSelectedClassId] = useState(schoolClasses.length > 0 ? schoolClasses[0].id : '');
    const [selectedTeacherId, setSelectedTeacherId] = useState(teachers.length > 0 ? teachers[0].id : '');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        teaching_assignment_id: '',
        school_class_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: '1',
        start_time: '07:00',
        end_time: '08:30',
    });

    const filteredSchedules = useMemo(() => {
        return schedules.filter(s => {
            if (viewMode === 'class') {
                return s.teaching_assignment?.school_class_id == selectedClassId;
            } else {
                return s.teaching_assignment?.teacher_id == selectedTeacherId;
            }
        });
    }, [schedules, viewMode, selectedClassId, selectedTeacherId]);

    const availableAssignments = useMemo(() => {
        // Only show assignments relevant to the current filter to make adding easier
        if (viewMode === 'class') {
            return teachingAssignments.filter(ta => ta.school_class_id == selectedClassId);
        } else {
            return teachingAssignments.filter(ta => ta.teacher_id == selectedTeacherId);
        }
    }, [teachingAssignments, viewMode, selectedClassId, selectedTeacherId]);

    const openAddModal = () => {
        setEditingSchedule(null);
        reset();
        clearErrors();
        // pre-fill teaching assignment if there's any available
        if (availableAssignments.length > 0) {
            const ta = availableAssignments[0];
            setData({
                teaching_assignment_id: ta.id,
                school_class_id: ta.school_class_id,
                subject_id: ta.subject_id,
                teacher_id: ta.teacher_id,
                day_of_week: '1',
                start_time: '07:00',
                end_time: '08:30',
            });
        }
        setIsFormModalOpen(true);
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setData({
            teaching_assignment_id: schedule.teaching_assignment_id,
            school_class_id: schedule.teaching_assignment?.school_class_id || '',
            subject_id: schedule.teaching_assignment?.subject_id || '',
            teacher_id: schedule.teaching_assignment?.teacher_id || '',
            day_of_week: schedule.day_of_week.toString(),
            start_time: schedule.start_time.substring(0, 5),
            end_time: schedule.end_time.substring(0, 5),
        });
        clearErrors();
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (schedule) => {
        setEditingSchedule(schedule);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setTimeout(() => {
            setEditingSchedule(null);
            reset();
            clearErrors();
        }, 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingSchedule) {
            put(route('curriculum.schedules.update', editingSchedule.id), {
                onSuccess: () => closeModals(),
            });
        } else {
            post(route('curriculum.schedules.store'), {
                onSuccess: () => closeModals(),
            });
        }
    };

    const deleteSchedule = () => {
        destroy(route('curriculum.schedules.destroy', editingSchedule.id), {
            onSuccess: () => closeModals(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Jadwal Pelajaran</h2>}
        >
            <Head title="Jadwal Pelajaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Filters & Actions */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('class')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'class' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Per Kelas
                                </button>
                                <button
                                    onClick={() => setViewMode('teacher')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'teacher' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Per Guru
                                </button>
                            </div>
                            
                            {viewMode === 'class' ? (
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm min-w-[200px]"
                                >
                                    <option value="" disabled>Pilih Kelas</option>
                                    {schoolClasses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm min-w-[200px]"
                                >
                                    <option value="" disabled>Pilih Guru</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        <PrimaryButton onClick={openAddModal} className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Tambah Jadwal
                        </PrimaryButton>
                    </div>

                    {/* Schedule Grid */}
                    <WeeklyGrid 
                        schedules={filteredSchedules} 
                        viewMode={viewMode}
                        onScheduleClick={openEditModal} 
                    />

                </div>
            </div>

            {/* Add / Edit Form Modal */}
            <Modal show={isFormModalOpen} onClose={closeModals}>
                <form onSubmit={submitForm} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingSchedule ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="teaching_assignment_id" value="Penugasan Mengajar (Mapel & Guru)" />
                            <select
                                id="teaching_assignment_id"
                                value={data.teaching_assignment_id}
                                onChange={(e) => {
                                    const ta = availableAssignments.find(a => a.id == e.target.value);
                                    if(ta) {
                                        setData(prev => ({
                                            ...prev,
                                            teaching_assignment_id: ta.id,
                                            school_class_id: ta.school_class_id,
                                            subject_id: ta.subject_id,
                                            teacher_id: ta.teacher_id
                                        }));
                                    }
                                }}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="" disabled>Pilih Penugasan</option>
                                {availableAssignments.map(ta => (
                                    <option key={ta.id} value={ta.id}>
                                        {ta.subject?.name} - {ta.teacher?.name} (Kelas {ta.school_class?.name})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.teaching_assignment_id} className="mt-2" />
                            {availableAssignments.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">Belum ada penugasan mengajar untuk {viewMode === 'class' ? 'kelas' : 'guru'} ini. Silakan tambahkan di menu Kurikulum terlebih dahulu.</p>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="day_of_week" value="Hari" />
                            <select
                                id="day_of_week"
                                value={data.day_of_week}
                                onChange={(e) => setData('day_of_week', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                required
                            >
                                {DAYS.map((day, idx) => (
                                    <option key={day} value={idx + 1}>{day}</option>
                                ))}
                            </select>
                            <InputError message={errors.day_of_week} className="mt-2" />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <InputLabel htmlFor="start_time" value="Waktu Mulai" />
                                <TextInput
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.start_time} className="mt-2" />
                            </div>
                            <div className="flex-1">
                                <InputLabel htmlFor="end_time" value="Waktu Selesai" />
                                <TextInput
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.end_time} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                        {editingSchedule ? (
                            <button
                                type="button"
                                onClick={() => { setIsFormModalOpen(false); openDeleteModal(editingSchedule); }}
                                className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Hapus
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={closeModals}>Batal</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>Simpan</PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeModals} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Konfirmasi Hapus</h2>
                    <p className="mt-3 text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus jadwal <strong>{editingSchedule?.teaching_assignment?.subject?.name}</strong> pada hari <strong>{editingSchedule?.day_of_week}</strong> jam <strong>{editingSchedule?.start_time?.substring(0,5)}</strong>?
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Batal</SecondaryButton>
                        <DangerButton onClick={deleteSchedule} disabled={processing}>Hapus</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
