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
        Schema::create('cocurriculars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->foreignId('level_id')->constrained('levels')->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->string('title');
            $table->enum('activity_type', ['pembelajaran_kolaboratif', '7kaih', 'cara_lainnya']);
            $table->json('dimensions')->nullable();
            $table->integer('time_allocation')->default(0);
            $table->text('learning_objectives')->nullable();
            $table->timestamps();
        });

        Schema::create('cocurricular_teacher', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cocurricular_id')->constrained('cocurriculars')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('cocurricular_school_class', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cocurricular_id')->constrained('cocurriculars')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cocurricular_school_class');
        Schema::dropIfExists('cocurricular_teacher');
        Schema::dropIfExists('cocurriculars');
    }
};
