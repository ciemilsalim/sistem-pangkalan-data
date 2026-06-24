import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, settings }) {
    const pageProps = usePage().props;

    // Initialize form with existing setting values from database
    const { data, setData, put, processing, errors } = useForm({
        school_name: settings.school_name || '',
        school_address: settings.school_address || '',
        school_headmaster_name: settings.school_headmaster_name || '',
        school_headmaster_nip: settings.school_headmaster_nip || '',
        jam_masuk: settings.jam_masuk || '07:00',
        jam_pulang: settings.jam_pulang || '13:00',
        jam_masuk_guru: settings.jam_masuk_guru || '07:00',
        jam_pulang_guru: settings.jam_pulang_guru || '16:00',
        school_latitude: settings.school_latitude || '0.0',
        school_longitude: settings.school_longitude || '0.0',
        school_radius: settings.school_radius || '100',
        send_absent_notification: settings.send_absent_notification || 'off',
        dark_mode: settings.dark_mode || 'off',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'), {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pengaturan Aplikasi & Sekolah
                </h2>
            }
        >
            <Head title="Pengaturan Aplikasi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Flash Message */}
                    {pageProps.flash?.message && (
                        <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* SECTION 1: INFORMASI SEKOLAH */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">
                                1. Informasi Sekolah
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="school_name" value="Nama Sekolah" />
                                        <TextInput
                                            id="school_name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.school_name}
                                            onChange={(e) => setData('school_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.school_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="school_headmaster_name" value="Nama Kepala Sekolah" />
                                        <TextInput
                                            id="school_headmaster_name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.school_headmaster_name}
                                            onChange={(e) => setData('school_headmaster_name', e.target.value)}
                                        />
                                        <InputError message={errors.school_headmaster_name} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="school_address" value="Alamat Lengkap Sekolah" />
                                        <TextInput
                                            id="school_address"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.school_address}
                                            onChange={(e) => setData('school_address', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.school_address} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="school_headmaster_nip" value="NIP Kepala Sekolah" />
                                        <TextInput
                                            id="school_headmaster_nip"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.school_headmaster_nip}
                                            onChange={(e) => setData('school_headmaster_nip', e.target.value)}
                                        />
                                        <InputError message={errors.school_headmaster_nip} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: JAM KERJA & ABSENSI */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">
                                2. Jam Kerja & Batas Waktu Absensi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Timing */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-700 mb-4">Jam Absensi Siswa</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="jam_masuk" value="Jam Masuk Siswa" />
                                            <TextInput
                                                id="jam_masuk"
                                                type="time"
                                                className="mt-1 block w-full text-sm"
                                                value={data.jam_masuk}
                                                onChange={(e) => setData('jam_masuk', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.jam_masuk} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="jam_pulang" value="Jam Pulang Siswa" />
                                            <TextInput
                                                id="jam_pulang"
                                                type="time"
                                                className="mt-1 block w-full text-sm"
                                                value={data.jam_pulang}
                                                onChange={(e) => setData('jam_pulang', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.jam_pulang} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Teacher Timing */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-700 mb-4">Jam Absensi Guru</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="jam_masuk_guru" value="Jam Masuk Guru" />
                                            <TextInput
                                                id="jam_masuk_guru"
                                                type="time"
                                                className="mt-1 block w-full text-sm"
                                                value={data.jam_masuk_guru}
                                                onChange={(e) => setData('jam_masuk_guru', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.jam_masuk_guru} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="jam_pulang_guru" value="Jam Pulang Guru" />
                                            <TextInput
                                                id="jam_pulang_guru"
                                                type="time"
                                                className="mt-1 block w-full text-sm"
                                                value={data.jam_pulang_guru}
                                                onChange={(e) => setData('jam_pulang_guru', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.jam_pulang_guru} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: LOKASI SEKOLAH & GEOFENCING */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">
                                3. Koordinat & Geofencing (Radius Absensi Mobile)
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="school_latitude" value="Latitude Sekolah" />
                                        <TextInput
                                            id="school_latitude"
                                            type="text"
                                            className="mt-1 block w-full text-sm font-mono"
                                            value={data.school_latitude}
                                            onChange={(e) => setData('school_latitude', e.target.value)}
                                            required
                                            placeholder="Contoh: 1.187082"
                                        />
                                        <InputError message={errors.school_latitude} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="school_longitude" value="Longitude Sekolah" />
                                        <TextInput
                                            id="school_longitude"
                                            type="text"
                                            className="mt-1 block w-full text-sm font-mono"
                                            value={data.school_longitude}
                                            onChange={(e) => setData('school_longitude', e.target.value)}
                                            required
                                            placeholder="Contoh: 121.418227"
                                        />
                                        <InputError message={errors.school_longitude} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="school_radius" value="Radius Batas Absensi (Meter)" />
                                        <TextInput
                                            id="school_radius"
                                            type="number"
                                            className="mt-1 block w-full text-sm"
                                            value={data.school_radius}
                                            onChange={(e) => setData('school_radius', e.target.value)}
                                            required
                                            min="10"
                                        />
                                        <InputError message={errors.school_radius} className="mt-2" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 italic">
                                    * Geofencing digunakan oleh aplikasi mobile (Flutter) untuk memastikan siswa/guru berada di dalam batas radius sekolah yang telah ditentukan saat melakukan absensi mandiri.
                                </p>
                            </div>
                        </div>

                        {/* SECTION 4: SISTEM & APLIKASI */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">
                                4. Konfigurasi Sistem & Aplikasi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="send_notification" value="Kirim Notifikasi Otomatis Alpa/Tidak Hadir" />
                                    <select
                                        id="send_notification"
                                        value={data.send_absent_notification}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => setData('send_absent_notification', e.target.value)}
                                        required
                                    >
                                        <option value="on">Aktifkan (Kirim Notifikasi)</option>
                                        <option value="off">Nonaktifkan (Jangan Kirim)</option>
                                    </select>
                                    <InputError message={errors.send_absent_notification} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="dark_mode" value="Mode Tampilan Aplikasi (Mode Gelap)" />
                                    <select
                                        id="dark_mode"
                                        value={data.dark_mode}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        onChange={(e) => setData('dark_mode', e.target.value)}
                                        required
                                    >
                                        <option value="on">Mode Gelap</option>
                                        <option value="off">Mode Terang</option>
                                    </select>
                                    <InputError message={errors.dark_mode} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT PANEL */}
                        <div className="flex items-center justify-end bg-gray-50 p-4 border border-gray-200 rounded-lg">
                            <PrimaryButton type="submit" disabled={processing} className="px-6 py-2.5">
                                Simpan Semua Pengaturan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
