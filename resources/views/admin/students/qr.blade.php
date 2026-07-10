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
                <div class="student-card-container break-inside-avoid relative rounded-2xl bg-white border border-gray-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow" style="width: 53.98mm; height: 85.6mm;">
                    <!-- Header with Playful Modern Gradient -->
                    <div class="card-header bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white py-3 px-2 relative overflow-hidden text-center">
                        <!-- Decorative light circles -->
                        <div class="absolute -right-3 -top-3 w-10 h-10 bg-white opacity-10 rounded-full"></div>
                        <div class="absolute -left-4 -bottom-4 w-12 h-12 bg-white opacity-10 rounded-full"></div>
                        
                        <p class="font-extrabold text-[12px] tracking-wider uppercase drop-shadow-sm">SIASEK PRESENSI</p>
                        <p class="text-[9px] text-indigo-100 font-semibold tracking-widest mt-0.5">SMPN 1 BIAU</p>
                    </div>
                    
                    <!-- QR Code Container -->
                    <div class="flex-grow flex items-center justify-center p-3 bg-slate-50/50">
                        <div class="p-2 bg-white rounded-xl shadow-sm border border-purple-100/50">
                            {!! \SimpleSoftwareIO\QrCode\Facades\QrCode::size(110)->generate($student->nis . '-' . $student->unique_id) !!}
                        </div>
                    </div>
                    
                    <!-- Student Details -->
                    <div class="px-3 pb-2 pt-1 text-center">
                        <p class="font-bold text-[13px] text-gray-800 truncate" title="{{ $student->name }}">{{ $student->name }}</p>
                        <p class="text-[10px] text-gray-500 font-semibold mt-0.5">NIS: {{ $student->nis }}</p>
                        <div class="mt-1.5 inline-block px-3 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[9px] font-bold border border-purple-100">
                            Kelas {{ $student->schoolClass->name ?? '-' }}
                        </div>
                    </div>
                    
                    <!-- Footer with Developer Credit -->
                    <div class="bg-slate-100/80 border-t border-slate-100 py-1 text-center text-[8px] text-slate-400 font-medium tracking-wide">
                        Developed by <span class="text-purple-500 font-bold">Zahradev</span>
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
