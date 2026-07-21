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
                        @if($schoolLogo)
                            <img src="{{ $schoolLogo }}" class="absolute top-[8px] left-[12px] w-8 h-8 object-contain drop-shadow z-20" alt="Logo Sekolah">
                        @endif
                        
                        <!-- KARTU SISWA Box: White background, purple border, dark blue text for maximum contrast & visibility -->
                        <div class="absolute top-[28px] left-1/2 -translate-x-1/2 border-2 border-[#8b5cf6] bg-white px-4 py-0.5 rounded shadow-sm z-10 shrink-0">
                            <h2 class="text-[10px] font-extrabold tracking-widest uppercase text-[#0b3370]">KARTU SISWA</h2>
                        </div>
                    </div>

                    <!-- School Name Text -->
                    <div class="absolute top-[56px] left-0 right-0 text-center z-10">
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#0b3370] drop-shadow-sm">{{ $schoolName }}</span>
                    </div>

                    <!-- Student Photo -->
                    <div class="absolute top-[76px] left-1/2 -translate-x-1/2 z-10 shrink-0">
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
                    <div class="absolute top-[174px] left-1/2 -translate-x-1/2 w-[90%] z-10 flex flex-col justify-center">
                        <div class="bg-[#0b3370] text-white p-2.5 rounded-xl border border-blue-900 flex flex-col gap-1.5 shadow-md text-[8.5px] leading-tight select-none">
                            <div class="flex">
                                <span class="w-[84px] text-blue-200/90 font-bold tracking-wider uppercase">Nama</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black truncate flex-1 uppercase tracking-wide text-white" title="{{ $student->name }}">{{ $student->name }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-[84px] text-blue-200/90 font-bold tracking-wider uppercase">NISN</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black font-mono flex-1 text-white">{{ $student->nis }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-[84px] text-blue-200/90 font-bold tracking-wider uppercase">Kelas</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black flex-1 uppercase text-white">{{ $student->schoolClass->name ?? '-' }}</span>
                            </div>
                            <div class="flex">
                                <span class="w-[84px] text-blue-200/90 font-bold tracking-wider uppercase">Akun Email Belajar</span>
                                <span class="mr-2 text-blue-400 font-bold">:</span>
                                <span class="font-black font-mono flex-1 truncate text-blue-100">{{ $student->learning_email ?? '' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer (Google Logo & QR Code) -->
                    <div class="absolute bottom-[10px] left-[14px] right-[14px] flex items-end justify-between z-10">
                        <!-- Google Logo: Loaded dynamically from upload only, no fallbacks -->
                        <div class="flex items-center">
                            @if($googleLogo)
                                <img src="{{ $googleLogo }}" class="h-9 max-w-[100px] object-contain object-left" alt="Google for Education">
                            @endif
                        </div>

                        <!-- QR Code -->
                        <div class="p-1 bg-white rounded-xl shadow-md border border-gray-150 flex items-center justify-center shrink-0">
                            {!! \SimpleSoftwareIO\QrCode\Facades\QrCode::size(58)->generate($student->nis . '-' . $student->unique_id) !!}
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
