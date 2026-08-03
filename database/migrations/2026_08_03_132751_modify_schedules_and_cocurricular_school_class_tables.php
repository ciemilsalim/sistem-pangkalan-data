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
        Schema::dropIfExists('cocurricular_school_class');

        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['school_class_id']);
            $table->dropColumn('school_class_id');
            $table->dropForeign(['teacher_id']);
            $table->dropColumn('teacher_id');
        });

        Schema::create('cocurricular_school_class', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cocurricular_id')->constrained('cocurriculars')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->timestamps();
        });
    }
};
