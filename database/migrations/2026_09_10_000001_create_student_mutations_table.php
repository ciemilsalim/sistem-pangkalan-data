<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->enum('type', ['masuk', 'keluar']);
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->onDelete('set null');
            $table->foreignId('semester_id')->nullable()->constrained('semesters')->onDelete('set null');
            $table->date('mutation_date');
            $table->string('reference_number')->nullable(); // Nomor Surat Mutasi / SK Pindah
            $table->string('school_name'); // Nama SMP Asal (jika masuk) atau SMP Tujuan (jika keluar)
            $table->string('school_npsn')->nullable();
            $table->string('school_city')->nullable();
            $table->string('school_province')->nullable();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('set null');
            $table->string('reason'); // Alasan mutasi
            $table->string('parent_name')->nullable();
            $table->string('parent_phone')->nullable();
            $table->string('letter_number_destination')->nullable(); // Nomor Surat Lolos Butuh / Permohonan
            $table->date('letter_date')->nullable();
            $table->string('document_file')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_mutations');
    }
};
