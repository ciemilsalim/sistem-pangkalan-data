import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, settings }) {
    const pageProps = usePage().props;

    // Initialize form with existing setting values from database
    const { data, setData, post, processing, errors } = useForm({
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
        school_logo: null,
        google_education_logo: null,
        student_card_background: null,
        global_ai_provider: settings.global_ai_provider || 'openrouter',
        global_ai_api_key: settings.global_ai_api_key || '',
        global_ai_model: settings.global_ai_model || 'openrouter/free',
        _method: 'PUT',
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [googleLogoPreview, setGoogleLogoPreview] = useState(null);
    const [cardBgPreview, setCardBgPreview] = useState(null);

    useEffect(() => {
        if (!data.google_education_logo) {
            setGoogleLogoPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(data.google_education_logo);
        setGoogleLogoPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [data.google_education_logo]);

    useEffect(() => {
        if (!data.school_logo) {
            setLogoPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(data.school_logo);
        setLogoPreview(objectUrl);

        // free memory when ever this component is unmounted or logo is changed
        return () => URL.revokeObjectURL(objectUrl);
    }, [data.school_logo]);

    useEffect(() => {
        if (!data.student_card_background) {
            setCardBgPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(data.student_card_background);
        setCardBgPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [data.student_card_background]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
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
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 pb-3 mb-6">
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

                                <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo Sekolah */}
                                    <div>
                                        <InputLabel htmlFor="school_logo" value="Logo Sekolah" className="mb-2" />
                                        <div className="flex items-center gap-6">
                                            {/* Logo Preview */}
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Preview Logo"
                                                        className="h-full w-full object-contain p-1.5"
                                                    />
                                                ) : settings.school_logo_url ? (
                                                    <img
                                                        src={settings.school_logo_url}
                                                        alt="Logo Sekolah"
                                                        className="h-full w-full object-contain p-1.5"
                                                    />
                                                ) : (
                                                    <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Upload Controls */}
                                            <div className="flex flex-col gap-1.5">
                                                <input
                                                    id="school_logo"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            setData('school_logo', e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('school_logo').click()}
                                                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 cursor-pointer"
                                                >
                                                    Pilih File Logo
                                                </button>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Format: PNG, JPG, JPEG (Maks. 2MB)
                                                </p>
                                            </div>
                                        </div>
                                        <InputError message={errors.school_logo} className="mt-2" />
                                    </div>

                                    {/* Logo Google for Education */}
                                    <div>
                                        <InputLabel htmlFor="google_education_logo" value="Logo Google for Education" className="mb-2" />
                                        <div className="flex items-center gap-6">
                                            {/* Logo Preview */}
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                                                {googleLogoPreview ? (
                                                    <img
                                                        src={googleLogoPreview}
                                                        alt="Preview Google Logo"
                                                        className="h-full w-full object-contain p-1.5"
                                                    />
                                                ) : settings.google_education_logo_url ? (
                                                    <img
                                                        src={settings.google_education_logo_url}
                                                        alt="Logo Google for Education"
                                                        className="h-full w-full object-contain p-1.5"
                                                    />
                                                ) : (
                                                    <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Upload Controls */}
                                            <div className="flex flex-col gap-1.5">
                                                <input
                                                    id="google_education_logo"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            setData('google_education_logo', e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('google_education_logo').click()}
                                                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 cursor-pointer"
                                                >
                                                    Pilih File Logo Google
                                                </button>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Format: PNG, JPG, JPEG (Maks. 2MB)
                                                </p>
                                            </div>
                                        </div>
                                        <InputError message={errors.google_education_logo} className="mt-2" />
                                    </div>
                                    
                                    {/* Background Kartu Siswa */}
                                    <div>
                                        <InputLabel htmlFor="student_card_background" value="Background Kartu Siswa" className="mb-2" />
                                        <div className="flex flex-col gap-4">
                                            {/* Preview */}
                                            <div className="relative h-40 w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                                                {cardBgPreview ? (
                                                    <img
                                                        src={cardBgPreview}
                                                        alt="Preview Background Kartu"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : settings.student_card_background_url ? (
                                                    <img
                                                        src={settings.student_card_background_url}
                                                        alt="Background Kartu Siswa"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Upload Controls */}
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <input
                                                    id="student_card_background"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            setData('student_card_background', e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('student_card_background').click()}
                                                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 cursor-pointer"
                                                >
                                                    Pilih File Background
                                                </button>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Disarankan: Lebar 638px x Tinggi 1011px (Format: PNG/JPG)
                                                </p>
                                            </div>
                                        </div>
                                        <InputError message={errors.student_card_background} className="mt-2" />
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: JAM KERJA & ABSENSI */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 pb-3 mb-6">
                                2. Jam Kerja & Batas Waktu Absensi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Timing */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Jam Absensi Siswa</h4>
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
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Jam Absensi Guru</h4>
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
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 pb-3 mb-6">
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
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 pb-3 mb-6">
                                4. Konfigurasi Sistem & Aplikasi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="send_notification" value="Kirim Notifikasi Otomatis Alpa/Tidak Hadir" />
                                    <select
                                        id="send_notification"
                                        value={data.send_absent_notification}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
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

                        {/* SECTION 5: PENGATURAN KECERDASAN BUATAN (AI) */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 pb-3 mb-6">
                                5. Pengaturan Kecerdasan Buatan (AI)
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="global_ai_provider" value="Penyedia AI Default Sekolah" />
                                        <select
                                            id="global_ai_provider"
                                            value={data.global_ai_provider}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => setData('global_ai_provider', e.target.value)}
                                        >
                                            <option value="openrouter">OpenRouter AI (Gratis/Pro)</option>
                                            <option value="gemini">Google Gemini</option>
                                            <option value="openai">OpenAI (ChatGPT)</option>
                                            <option value="claude">Anthropic Claude</option>
                                        </select>
                                        <InputError message={errors.global_ai_provider} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="global_ai_api_key" value="API Key Default (Opsional, tapi disarankan)" />
                                        <TextInput
                                            id="global_ai_api_key"
                                            type="text"
                                            className="mt-1 block w-full text-sm font-mono"
                                            value={data.global_ai_api_key}
                                            onChange={(e) => setData('global_ai_api_key', e.target.value)}
                                            placeholder={data.global_ai_provider === 'openrouter' ? 'sk-or-v1-...' : 'API Key...'}
                                        />
                                        <InputError message={errors.global_ai_api_key} className="mt-2" />
                                    </div>
                                </div>

                                {data.global_ai_provider === 'openrouter' && (
                                    <div>
                                        <InputLabel htmlFor="global_ai_model" value="Model OpenRouter Default" />
                                        <select
                                            id="global_ai_model"
                                            value={data.global_ai_model}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => setData('global_ai_model', e.target.value)}
                                        >
                                            <option value="openrouter/free">Auto-Select Free Model (Paling Stabil)</option>
                                            <option value="google/gemma-4-31b-it:free">Google Gemma 4 (Gratis)</option>
                                            <option value="openai/gpt-oss-20b:free">OpenAI OSS (Gratis)</option>
                                            <option value="poolside/laguna-s-2.1:free">Laguna S 2.1 (Gratis)</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Model ini akan digunakan oleh seluruh guru saat men-generate RPP atau soal.
                                        </p>
                                        <InputError message={errors.global_ai_model} className="mt-2" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SUBMIT PANEL */}
                        <div className="flex items-center justify-end bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <PrimaryButton type="submit" disabled={processing} className="px-6 py-2.5" title="Simpan Semua Pengaturan">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" />`r`n                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                                </svg>
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
