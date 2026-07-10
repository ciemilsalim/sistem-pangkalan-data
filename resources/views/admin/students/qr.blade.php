<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak QR Siswa</title>
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
                <div class="student-card-container break-inside-avoid relative" style="width: 53.98mm; height: 85.6mm; border: 1px solid #e5e7eb; background: #fff; display: flex; flex-direction: column; text-align: center; overflow: hidden;">
                    <div style="background-color: #0284c7; color: white; padding: 10px;">
                        <p style="font-weight: bold; font-size: 14px; margin: 0;">{{ config('app.name', 'Sipada') }}</p>
                    </div>
                    <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 10px;">
                        <div style="padding: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            {!! \SimpleSoftwareIO\QrCode\Facades\QrCode::size(120)->generate($student->nis . '-' . $student->unique_id) !!}
                        </div>
                    </div>
                    <div style="padding: 10px; border-top: 1px solid #eee;">
                        <p style="font-weight: bold; font-size: 14px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="{{ $student->name }}">{{ $student->name }}</p>
                        <p style="font-size: 11px; color: #666; margin: 4px 0 0;">NIS: {{ $student->nis }} | {{ $student->schoolClass->name ?? 'Tanpa Kelas' }}</p>
                    </div>
                </div>
            @empty
                <p class="text-gray-500">Belum ada data siswa untuk dicetak.</p>
            @endforelse
        </div>
    </div>

    <style>
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
            .student-card-container { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
    </style>
</body>
</html>
