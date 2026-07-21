<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak QR Siswa</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <!-- Google Fonts Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;950&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .student-card-container {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        @media print {
            body > * { visibility: hidden; }
            #card-grid, #card-grid * { visibility: visible; }
            #card-grid {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 10mm;
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 5mm !important;
            }
            .print-hidden { display: none !important; }
            body { background-color: #fff !important; }
            .student-card-container { 
                box-shadow: none !important; 
                border: 1px solid #e2e8f0 !important; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
            }
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-900">
    <div class="p-6">
        <div class="flex flex-wrap gap-4 justify-between items-center mb-6 print-hidden">
            <div>
                <h3 class="text-lg font-bold text-gray-800">Pratinjau Kartu Siswa</h3>
                <p class="text-sm text-gray-500">Gunakan Ctrl+P atau tombol cetak untuk mencetak kartu.</p>
            </div>
            <button onclick="window.print()" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 shadow transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.115-.465-1.12-1.08L6.34 18m11.32 0h-11.32m9.495-8.81a3.97 3.97 0 0 0-3.663-2.91 3.97 3.97 0 0 0-3.663 2.91m7.325 0a3 3 0 1 1-6 0m6 0v-.025a1.214 1.214 0 0 0-1.025-1.196L14.25 7.5m-4.5 1.479-.175-.854a1.214 1.214 0 0 0-1.025-1.196v.025" />
                </svg>
                Cetak Halaman
            </button>
        </div>

        <div id="card-grid" class="flex flex-wrap gap-6 justify-start">
            @forelse ($students as $student)
                <div class="student-card-container break-inside-avoid relative rounded-2xl bg-white border border-gray-200/90 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl transition duration-300" style="width: 53.98mm; height: 85.6mm;">
                    
                    <!-- Decorative Background & Wave Header -->
                    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-white">
                        <!-- Concentric lines pattern matching mockup -->
                        <svg class="absolute top-[30%] -left-12 w-32 h-32 text-blue-900/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="50" cy="50" r="45" />
                            <circle cx="50" cy="50" r="35" />
                            <circle cx="50" cy="50" r="25" />
                            <circle cx="50" cy="50" r="15" />
                        </svg>
                        <svg class="absolute top-[30%] -right-12 w-32 h-32 text-blue-900/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="50" cy="50" r="45" />
                            <circle cx="50" cy="50" r="35" />
                            <circle cx="50" cy="50" r="25" />
                            <circle cx="50" cy="50" r="15" />
                        </svg>

                        <!-- Top dark blue wave decoration -->
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute top-0 left-0 w-full h-[22%] text-[#0b3370] fill-current">
                            <path d="M0,0 L100,0 L100,60 Q80,100 50,65 T0,85 Z"></path>
                        </svg>
                        <!-- Wave accent overlay -->
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute top-[1.5%] left-0 w-full h-[22%] text-blue-400/20 fill-none stroke-current stroke-[2px]">
                            <path d="M0,0 L100,0 L100,60 Q80,100 50,65 T0,85 Z"></path>
                        </svg>
                    </div>

                    <!-- Header Text and School Logo -->
                    <div class="relative pt-3.5 px-3.5 text-center z-10 shrink-0">
                        <div class="flex items-center justify-center gap-1.5 mb-1.5">
                            @if($schoolLogo)
                                <img src="{{ $schoolLogo }}" class="w-6 h-6 object-contain drop-shadow" alt="Logo Sekolah">
                            @else
                                <span class="text-sm">🏫</span>
                            @endif
                            <span class="text-[8px] font-extrabold uppercase tracking-wider text-blue-50/90 drop-shadow-sm truncate max-w-[130px]">{{ $schoolName }}</span>
                        </div>
                        <div class="inline-block border-2 border-purple-400/60 bg-white/10 backdrop-blur-sm px-3.5 py-0.5 rounded-md shadow-sm">
                            <h2 class="text-[10px] font-extrabold tracking-widest uppercase text-white drop-shadow">KARTU SISWA</h2>
                        </div>
                    </div>

                    <!-- Student Photo -->
                    <div class="relative flex flex-col items-center justify-center -mt-3 z-10 shrink-0">
                        <div class="w-[72px] h-[88px] rounded-xl overflow-hidden border-4 border-white shadow-[0_4px_8px_rgba(0,0,0,0.12)] bg-slate-50 flex items-center justify-center">
                            @php
                                $photoPath = null;
                                if ($student->photo) {
                                    $photoPath = asset('storage/' . $student->photo);
                                } else {
                                    $extensions = ['jpg', 'jpeg', 'png'];
                                    foreach ($extensions as $ext) {
                                        if (file_exists(public_path('storage/student_photos/' . $student->nis . '.' . $ext))) {
                                            $photoPath = asset('storage/student_photos/' . $student->nis . '.' . $ext);
                                            break;
                                        }
                                    }
                                }
                            @endphp
                            @if($photoPath)
                                <img src="{{ $photoPath }}" class="w-full h-full object-cover" alt="Foto Siswa">
                            @else
                                <!-- Modern elegant placeholder matching blue theme -->
                                <div class="w-full h-full bg-blue-50 flex items-center justify-center">
                                    <svg class="w-10 h-10 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Student Information Box -->
                    <div class="relative px-3.5 py-1 z-10 flex-grow flex flex-col justify-center">
                        <div class="bg-[#0b3370] text-white p-2.5 rounded-xl border border-blue-900 flex flex-col gap-1.5 shadow-md text-[8.5px] leading-tight select-none">
                            <div class="flex">
                                <span class="w-[64px] text-blue-200/90 font-bold tracking-wider uppercase">Nama Lengkap</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black truncate flex-1 uppercase tracking-wide text-white" title="{{ $student->name }}">{{ $student->name }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-[64px] text-blue-200/90 font-bold tracking-wider uppercase">NIS</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black font-mono flex-1 text-white">{{ $student->nis }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-[64px] text-blue-200/90 font-bold tracking-wider uppercase">Kelas</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black flex-1 uppercase text-white">{{ $student->schoolClass->name ?? '-' }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-[64px] text-blue-200/90 font-bold tracking-wider uppercase">Email</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black font-mono flex-1 truncate text-blue-100">{{ $student->learning_email ?? ($student->user->email ?? '-') }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer (Google Logo & QR Code) -->
                    <div class="relative px-3.5 pb-3.5 flex items-end justify-between gap-4 z-10 shrink-0 bg-slate-50/50 border-t border-gray-100/50">
                        <!-- Google Logo -->
                        <div class="flex flex-col justify-center">
                            @if($googleLogo)
                                <img src="{{ $googleLogo }}" class="h-9 max-w-[95px] object-contain object-left" alt="Google for Education">
                            @else
                                <!-- Dynamic styled fallback partner badge -->
                                <div class="flex items-center gap-1.5 bg-white border border-gray-200 p-1.5 rounded-lg shadow-sm">
                                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    <div class="flex flex-col">
                                        <span class="text-[5.5px] font-extrabold text-gray-500 uppercase leading-none">Google for Education</span>
                                        <span class="text-[4.5px] text-gray-400 font-semibold leading-none mt-0.5">Kandidat Rujukan</span>
                                    </div>
                                </div>
                            @endif
                        </div>

                        <!-- QR Code -->
                        <div class="p-1 bg-white rounded-xl shadow-md border border-gray-150 flex items-center justify-center shrink-0">
                            {!! \SimpleSoftwareIO\QrCode\Facades\QrCode::size(64)->generate($student->nis . '-' . $student->unique_id) !!}
                        </div>
                    </div>
                    
                </div>
            @empty
                <p class="text-gray-500">Belum ada data siswa untuk dicetak.</p>
            @endforelse
        </div>
    </div>
</body>
</html>
