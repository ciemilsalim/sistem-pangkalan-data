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
        Schema::table('schedules', function (Blueprint $table) {
            $table->unsignedBigInteger('teaching_assignment_id')->nullable()->change();
            $table->foreignId('cocurricular_id')->nullable()->constrained('cocurriculars')->cascadeOnDelete();
            $table->enum('schedule_type', ['regular', 'cocurricular'])->default('regular');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->unsignedBigInteger('teaching_assignment_id')->nullable(false)->change();
            $table->dropForeign(['cocurricular_id']);
            $table->dropColumn('cocurricular_id');
            $table->dropColumn('schedule_type');
        });
    }
};
