import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import WeeklyGrid from './WeeklyGrid';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function SchedulesIndex({ auth, schoolClasses, teachers, subjects, schedules, teachingAssignments, cocurriculars = [], existingConflicts = [], canManageSchedules }) {
    const pageProps = usePage().props;
    const [viewMode, setViewMode] = useState('class'); // 'class' or 'teacher'
    const [selectedClassId, setSelectedClassId] = useState(schoolClasses.length > 0 ? schoolClasses[0].id : '');
    const [selectedTeacherId, setSelectedTeacherId] = useState(teachers.length > 0 ? teachers[0].id : '');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [conflictError, setConflictError] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        schedule_type: 'regular',
        cocurricular_id: '',
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
                // Regular: match by teaching assignment class
                if (s.schedule_type === 'regular' || !s.schedule_type) {
                    return s.teaching_assignment?.school_class_id == selectedClassId;
                }
                // Cocurricular: match if target class matches
                if (s.schedule_type === 'cocurricular') {
                    return s.school_class_id == selectedClassId;
                }
                return false;
            } else {
                // Regular: match by teaching assignment teacher
                if (s.schedule_type === 'regular' || !s.schedule_type) {
                    return s.teaching_assignment?.teacher_id == selectedTeacherId;
                }
                // Cocurricular: match if facilitator teacher matches
                if (s.schedule_type === 'cocurricular') {
                    return s.teacher_id == selectedTeacherId;
                }
                return false;
            }
        });
    }, [schedules, viewMode, selectedClassId, selectedTeacherId]);

    const availableAssignments = useMemo(() => {
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
        setConflictError(null);
        setData({
            schedule_type: 'regular',
            cocurricular_id: '',
            teaching_assignment_id: '',
            school_class_id: viewMode === 'class' ? selectedClassId : '',
            subject_id: '',
            teacher_id: viewMode === 'teacher' ? selectedTeacherId : '',
            day_of_week: '1',
            start_time: '07:00',
            end_time: '08:30',
        });
        setIsFormModalOpen(true);
    };

    const handleResetForm = () => {
        clearErrors();
        setConflictError(null);
        setData({
            schedule_type: 'regular',
            cocurricular_id: '',
            teaching_assignment_id: '',
            school_class_id: viewMode === 'class' ? selectedClassId : '',
            subject_id: '',
            teacher_id: viewMode === 'teacher' ? selectedTeacherId : '',
            day_of_week: '1',
            start_time: '07:00',
            end_time: '08:30',
        });
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setData({
            schedule_type: schedule.schedule_type || 'regular',
            cocurricular_id: schedule.cocurricular_id ? schedule.cocurricular_id.toString() : (cocurriculars.length > 0 ? cocurriculars[0].id.toString() : ''),
            teaching_assignment_id: schedule.teaching_assignment_id || '',
            school_class_id: schedule.schedule_type === 'cocurricular' 
                ? (schedule.school_class_id?.toString() || '') 
                : (schedule.teaching_assignment?.school_class_id?.toString() || ''),
            subject_id: schedule.teaching_assignment?.subject_id?.toString() || '',
            teacher_id: schedule.schedule_type === 'cocurricular' 
                ? (schedule.teacher_id?.toString() || '') 
                : (schedule.teaching_assignment?.teacher_id?.toString() || ''),
            day_of_week: schedule.day_of_week.toString(),
            start_time: schedule.start_time.substring(0, 5),
            end_time: schedule.end_time.substring(0, 5),
        });
        clearErrors();
        setConflictError(null);
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
            setConflictError(null);
        }, 200);
    };

    const submitForm = (e) => {
        e.preventDefault();
        setConflictError(null);

        // Validasi Waktu
        const startTime = data.start_time;
        const endTime = data.end_time;
        
        if (startTime >= endTime) {
            setConflictError("Waktu mulai harus lebih awal dari waktu selesai.");
            return;
        }
        if (startTime < "07:00" || endTime > "15:00") {
            setConflictError("Jadwal harus berada dalam jam operasional sekolah (07:00 - 15:00).");
            return;
        }

        const options = {
            onSuccess: () => closeModals(),
            onError: (errs) => {
                if (errs.error) setConflictError(errs.error);
            },
            preserveScroll: true,
        };
        if (editingSchedule) {
            put(route('curriculum.schedules.update', editingSchedule.id), options);
        } else {
            post(route('curriculum.schedules.store'), options);
        }
    };

    const deleteSchedule = () => {
        destroy(route('curriculum.schedules.destroy', editingSchedule.id), {
            onSuccess: () => closeModals(),
        });
    };

    // Helper to get display name for the delete modal
    const getScheduleDisplayName = () => {
        if (!editingSchedule) return '';
        if (editingSchedule.schedule_type === 'cocurricular' && editingSchedule.cocurricular) {
            return editingSchedule.cocurricular.title;
        }
        return editingSchedule.teaching_assignment?.subject?.name || 'Jadwal';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Jadwal Pelajaran</h2>}
        >
            <Head title="Jadwal Pelajaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Flash Message */}
                    {pageProps.flash?.message && (
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {pageProps.flash.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        
                        {canManageSchedules && (
                            <PrimaryButton onClick={openAddModal} className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Tambah Jadwal
                            </PrimaryButton>
                        )}
                    </div>

                    {/* Existing Conflict Warnings */}
                    {existingConflicts.length > 0 && canManageSchedules && (
                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 shadow-sm">
                            <div className="flex items-start gap-3 mb-3">
                                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <h3 className="text-amber-800 font-bold text-sm">Terdeteksi {existingConflicts.length} Jadwal Bentrok</h3>
                                    <p className="text-amber-700 text-xs mt-1">Hapus salah satu jadwal dari setiap pasangan yang bentrok berikut agar tidak terjadi tabrakan.</p>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {existingConflicts.map((conflict, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-amber-200 rounded-md px-4 py-3 text-sm">
                                        <span className="text-amber-900 font-medium flex-1 mr-3">{conflict.description}</span>
                                        <div className="flex gap-1 flex-shrink-0">
                                            {conflict.schedule_ids.map(sid => {
                                                const sch = schedules.find(s => s.id === sid);
                                                const label = sch?.schedule_type === 'cocurricular'
                                                    ? (sch?.cocurricular?.title || 'Proyek')
                                                    : (sch?.teaching_assignment?.subject?.name || 'Jadwal');
                                                return (
                                                    <button
                                                        key={sid}
                                                        onClick={() => {
                                                            const found = schedules.find(s => s.id === sid);
                                                            if (found) openDeleteModal(found);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                                                        title={`Hapus: ${label}`}
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        Hapus "{label}"
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Schedule Grid */}
                    <WeeklyGrid 
                        schedules={filteredSchedules} 
                        viewMode={viewMode}
                        onScheduleClick={canManageSchedules ? openEditModal : undefined} 
                    />

                </div>
            </div>

            {/* Add / Edit Form Modal */}
            <Modal show={isFormModalOpen} onClose={closeModals}>
                <form onSubmit={submitForm} className="p-6 max-h-[85vh] overflow-y-auto">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingSchedule ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
                    </h2>

                    {/* Error display */}
                    {conflictError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                            <span>{conflictError}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Schedule Type Toggle */}
                        <div>
                            <InputLabel value="Tipe Jadwal" />
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="schedule_type"
                                        value="regular"
                                        checked={data.schedule_type === 'regular'}
                                        onChange={(e) => setData('schedule_type', e.target.value)}
                                        className="mr-2 border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Mapel Reguler</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="schedule_type"
                                        value="cocurricular"
                                        checked={data.schedule_type === 'cocurricular'}
                                        onChange={(e) => setData('schedule_type', e.target.value)}
                                        className="mr-2 border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">Proyek Kokurikuler</span>
                                </label>
                            </div>
                            <InputError message={errors.schedule_type} className="mt-2" />
                        </div>

                        {/* Conditional Fields based on Type */}
                        {data.schedule_type === 'cocurricular' ? (
                            <>
                                <div>
                                    <InputLabel htmlFor="cocurricular_id" value="Proyek Kokurikuler" />
                                    <select
                                        id="cocurricular_id"
                                        value={data.cocurricular_id}
                                        onChange={(e) => setData({
                                            ...data,
                                            cocurricular_id: e.target.value,
                                            teacher_id: ''
                                        })}
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Proyek Kokurikuler --</option>
                                        {cocurriculars.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.code ? `[${c.code}] ` : ''}{c.title}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.cocurricular_id} className="mt-2" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <InputLabel htmlFor="cocurricular_class_id" value="Pilih Kelas" />
                                        <select
                                            id="cocurricular_class_id"
                                            value={data.school_class_id}
                                            onChange={(e) => setData('school_class_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                            required={data.schedule_type === 'cocurricular'}
                                        >
                                            <option value="">-- Pilih Kelas --</option>
                                            {schoolClasses.map((cls) => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_class_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="cocurricular_teacher_id" value="Pilih Guru Fasilitator" />
                                        <select
                                            id="cocurricular_teacher_id"
                                            value={data.teacher_id}
                                            onChange={(e) => setData('teacher_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                            required={data.schedule_type === 'cocurricular'}
                                            disabled={!data.cocurricular_id}
                                        >
                                            <option value="">-- Pilih Guru --</option>
                                            {data.cocurricular_id && cocurriculars.find(c => c.id == data.cocurricular_id)?.teachers?.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.teacher_id} className="mt-2" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="school_class_id" value="Kelas" />
                                    <select
                                        id="school_class_id"
                                        value={data.school_class_id}
                                        onChange={(e) => setData('school_class_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="" disabled>Pilih Kelas</option>
                                        {schoolClasses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.school_class_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                    <select
                                        id="subject_id"
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="" disabled>Pilih Mapel</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.subject_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="teacher_id" value="Guru Pengampu" />
                                    <select
                                        id="teacher_id"
                                        value={data.teacher_id}
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="" disabled>Pilih Guru</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.teacher_id} className="mt-2" />
                                </div>
                            </div>
                        )}

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
                                    min="07:00"
                                    max="15:00"
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
                                    min="07:00"
                                    max="15:00"
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
                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-1 transition-colors"
                                title="Kembalikan form ke isian awal"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Reset
                            </button>
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
                        Apakah Anda yakin ingin menghapus jadwal <strong>{getScheduleDisplayName()}</strong> pada hari <strong>{editingSchedule?.day_of_week}</strong> jam <strong>{editingSchedule?.start_time?.substring(0,5)}</strong>?
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
