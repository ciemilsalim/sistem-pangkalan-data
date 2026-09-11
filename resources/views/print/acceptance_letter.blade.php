<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Surat Keterangan Kesiapan Menerima (Lolos Butuh) - {{ $data['student_name'] ?: 'Calon Siswa' }}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 20mm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            background-color: #f3f4f6;
        }
        .paper {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            box-sizing: border-box;
        }
        .kop-border {
            border-bottom: 3px double #000;
            margin-bottom: 20px;
            padding-bottom: 8px;
        }
        @media print {
            body {
                background: white !important;
            }
            .paper {
                width: 100% !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
            .print-hidden {
                display: none !important;
            }
        }
    </style>
</head>
<body class="text-black antialiased">

    <!-- Action Toolbar (Hidden in Print) -->
    <div class="max-w-4xl mx-auto my-6 px-4 flex justify-between items-center print-hidden">
        <div>
            <a href="{{ route('student-mutations.index', ['tab' => 'masuk']) }}" class="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg shadow-sm transition">
                &larr; Kembali ke Daftar Mutasi
            </a>
        </div>
        <div class="flex items-center gap-3">
            <button onclick="window.print()" class="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-md transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.115-.465-1.12-1.08L6.34 18m11.32 0h-11.32m9.495-8.81a3.97 3.97 0 0 0-3.663-2.91 3.97 3.97 0 0 0-3.663 2.91m7.325 0a3 3 0 1 1-6 0m6 0v-.025a1.214 1.214 0 0 0-1.025-1.196L14.25 7.5m-4.5 1.479-.175-.854a1.214 1.214 0 0 0-1.025-1.196v.025" />
                </svg>
                Cetak Surat Kesiapan Menerima (Print / PDF)
            </button>
        </div>
    </div>

    <!-- Letter Container -->
    <div class="paper">
        
        <!-- Kop Surat -->
        <div class="kop-border">
            <table class="w-full">
                <tr>
                    <td class="w-24 text-center align-middle" style="width: 85px;">
                        @if($schoolLogo)
                            <img src="{{ $schoolLogo }}" alt="Logo Sekolah" class="w-20 h-20 object-contain mx-auto">
                        @else
                            <div class="w-16 h-16 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 mx-auto">
                                LOGO
                            </div>
                        @endif
                    </td>
                    <td class="text-center align-middle px-4">
                        <div class="text-base uppercase tracking-wider font-semibold">PEMERINTAH KABUPATEN BUOL</div>
                        <div class="text-base uppercase tracking-wider font-semibold">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
                        <div class="text-xl uppercase font-bold tracking-tight text-gray-950 mt-0.5">{{ $schoolName }}</div>
                        <div class="text-xs text-gray-700 mt-1 italic leading-tight">
                            {{ $schoolAddress }}
                        </div>
                    </td>
                    <td style="width: 85px;"></td>
                </tr>
            </table>
        </div>

        <!-- Judul & Nomor Surat -->
        <div class="text-center my-6">
            <h1 class="text-lg font-bold underline tracking-wide uppercase">SURAT KETERANGAN KESIAPAN MENERIMA SISWA PINDAHAN</h1>
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-600">(SURAT LOLOS BUTUH)</p>
            <p class="text-sm mt-1">Nomor: {{ $data['letter_number'] }}</p>
        </div>

        <!-- Paragraf Pembuka -->
        <div class="text-justify leading-relaxed text-sm my-4">
            <p>
                Yang bertanda tangan di bawah ini, Kepala <strong>{{ $schoolName }}</strong>, menerangkan bahwa setelah memperhatikan ketersediaan formasi dan daya tampung rombongan belajar pada Tahun Ajaran <strong>{{ $data['academic_year'] }}</strong>, dengan ini memberikan keterangan mengenai:
            </p>
        </div>

        <!-- Identitas Calon Siswa -->
        <table class="w-full text-sm my-3 ml-4 leading-relaxed" style="width: 95%;">
            <tr>
                <td class="w-48 py-1">1. Nama Lengkap Siswa</td>
                <td class="w-4 py-1">:</td>
                <td class="py-1 font-bold uppercase">{{ $data['student_name'] ?: '..........................................................' }}</td>
            </tr>
            <tr>
                <td class="py-1">2. NISN</td>
                <td class="py-1">:</td>
                <td class="py-1">{{ $data['nisn'] ?: '..........................................................' }}</td>
            </tr>
            <tr>
                <td class="py-1">3. Sekolah Asal</td>
                <td class="py-1">:</td>
                <td class="py-1 font-semibold">{{ $data['origin_school'] ?: '..........................................................' }}</td>
            </tr>
            <tr>
                <td class="py-1">4. Kelas yang Dituju</td>
                <td class="py-1">:</td>
                <td class="py-1 font-semibold">{{ $data['target_class'] ?: '..........................................................' }}</td>
            </tr>
            <tr>
                <td class="py-1">5. Nama Orang Tua / Wali</td>
                <td class="py-1">:</td>
                <td class="py-1">{{ $data['parent_name'] ?: '..........................................................' }}</td>
            </tr>
            <tr>
                <td class="py-1">6. Alasan Kepindahan</td>
                <td class="py-1">:</td>
                <td class="py-1 italic">{{ $data['reason'] ?: 'Mengikuti Orang Tua / Pindah Domisili' }}</td>
            </tr>
        </table>

        <!-- Pernyataan Kesediaan Menerima -->
        <div class="text-justify leading-relaxed text-sm my-4">
            <p>
                Menyatakan bahwa sekolah kami pada prinsipnya <strong>BERSEDIA MENERIMA</strong> peserta didik tersebut untuk masuk dan belajar di <strong>{{ $schoolName }}</strong> pada <strong>{{ $data['target_class'] }}</strong>, dengan ketentuan sebagai berikut:
            </p>
            <ol class="list-decimal ml-6 mt-2 space-y-1">
                <li>Sekolah asal telah menerbitkan <em>Surat Keterangan Pindah Sekolah</em> resmi dan menyerahkan Buku Rapor Asli beserta kelengkapannya.</li>
                <li>Data siswa yang bersangkutan telah diproses keluar/dimutasikan dari sistem aplikasi <strong>Dapodik</strong> sekolah asal.</li>
                <li>Memenuhi seluruh berkas persyaratan administrasi perpindahan peserta didik sesuai regulasi Dinas Pendidikan.</li>
            </ol>
        </div>

        <!-- Paragraf Penutup -->
        <div class="text-justify leading-relaxed text-sm my-4">
            <p>
                Demikian Surat Keterangan Kesiapan Menerima ini diterbitkan untuk digunakan sebagai salah satu kelengkapan persyaratan mutasi di sekolah asal dan instansi terkait.
            </p>
        </div>

        <!-- Tanda Tangan -->
        <div class="mt-12 flex justify-end">
            <div class="text-left w-72 text-sm leading-normal">
                <p>Buol, {{ $data['print_date'] }}</p>
                <p class="font-medium mt-1">Kepala Sekolah,</p>
                
                <!-- Ruang Tanda Tangan & Stempel -->
                <div class="h-24 flex items-end">
                    <span class="text-xs text-gray-300 italic">[Tanda Tangan & Stempel]</span>
                </div>

                <p class="font-bold underline uppercase">{{ $headmasterName }}</p>
                <p>NIP. {{ $headmasterNip }}</p>
            </div>
        </div>

    </div>

</body>
</html>
