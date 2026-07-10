<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak QR Siswa</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-900">
    <div class="p-6">
        <div class="flex flex-wrap gap-4 justify-between items-center mb-6 print-hidden">
            <div>
                <h3 class="text-lg font-medium">Pratinjau Kartu Siswa</h3>
                <p class="text-sm text-gray-500">Gunakan Ctrl+P atau tombol di bawah untuk mencetak.</p>
            </div>
            <button onclick="window.print()" class="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
                Cetak Halaman
            </button>
        </div>

        <div id="card-grid" class="flex flex-wrap gap-4">
            @forelse ($students as $student)
                <div class="student-card-container break-inside-avoid relative rounded-xl bg-white border border-gray-300 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow" style="width: 53.98mm; height: 85.6mm;">
                    
                    <!-- Header Portrait (Space for lanyard at top) -->
                    <div class="bg-gradient-to-b from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center pt-5 pb-3 px-2 relative shrink-0">
                        <div class="absolute -left-2 -top-2 w-10 h-10 bg-white opacity-10 rounded-full"></div>
                        <div class="absolute -right-2 -bottom-2 w-8 h-8 bg-white opacity-10 rounded-full"></div>
                        <div class="text-center w-full z-10">
                            <h1 class="font-extrabold text-[12px] tracking-widest uppercase drop-shadow-sm leading-tight">SIASEK</h1>
                            <p class="text-[8px] text-indigo-100 font-semibold tracking-widest mt-0.5">PRESENSI</p>
                        </div>
                    </div>
                    
                    <!-- Body (QR Code) -->
                    <div class="flex-grow flex items-center justify-center bg-slate-50 relative">
                        <div class="p-1.5 bg-white rounded-xl shadow-sm border border-purple-200 z-10">
                            {!! \SimpleSoftwareIO\QrCode\Facades\QrCode::size(95)->generate($student->nis . '-' . $student->unique_id) !!}
                        </div>
                        
                        <!-- Watermark -->
                        <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] text-[80px] pointer-events-none transform -rotate-12 z-0">
                            🎓
                        </div>
                    </div>

                    <!-- Footer (Student Info) -->
                    <div class="bg-white flex flex-col items-center justify-center px-2 py-3 text-center border-t border-gray-100 shrink-0">
                        <p class="font-bold text-[12px] text-gray-800 leading-tight w-full mb-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" title="{{ $student->name }}">{{ $student->name }}</p>
                        <p class="font-semibold text-[9px] text-gray-500 mb-1.5">NIS: <span class="text-gray-700 font-bold">{{ $student->nis }}</span></p>
                        
                        <div class="inline-block px-3 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[9px] font-bold border border-purple-200">
                            Kelas {{ $student->schoolClass->name ?? '-' }}
                        </div>
                    </div>
                    
                </div>
            @empty
                <p class="text-gray-500">Belum ada data siswa untuk dicetak.</p>
            @endforelse
        </div>
    </div>

    <style>
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
</body>
</html>
