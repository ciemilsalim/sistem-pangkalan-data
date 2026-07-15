<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\AdminChatController;
use App\Http\Controllers\ChatMonitoringController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AcademicAuditController;
use App\Http\Controllers\LmsModerationController;
use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\RolePermissionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/sso/redirect/{app}', [App\Http\Controllers\Auth\SsoController::class, 'redirect'])->name('sso.redirect');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Role & Permission Management
    Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolePermissionController::class, 'storeRole'])->name('roles.store');
    Route::put('/roles/{role}', [RolePermissionController::class, 'updateRole'])->name('roles.update');
    Route::delete('/roles/{role}', [RolePermissionController::class, 'destroyRole'])->name('roles.destroy');

    Route::resource('users', UserController::class);

    // Academic Period Switch
    Route::post('/academic-periods/switch', [AcademicPeriodController::class, 'switch'])->name('academic-periods.switch');

    // Curriculum Routes
    Route::get('/curriculum', [CurriculumController::class, 'index'])->name('curriculum.index');

    Route::post('/curriculum/academic-years', [CurriculumController::class, 'storeAcademicYear'])->name('curriculum.academic-years.store');
    Route::put('/curriculum/academic-years/{academicYear}', [CurriculumController::class, 'updateAcademicYear'])->name('curriculum.academic-years.update');
    Route::delete('/curriculum/academic-years/{academicYear}', [CurriculumController::class, 'destroyAcademicYear'])->name('curriculum.academic-years.destroy');

    Route::post('/curriculum/semesters', [CurriculumController::class, 'storeSemester'])->name('curriculum.semesters.store');
    Route::put('/curriculum/semesters/{semester}', [CurriculumController::class, 'updateSemester'])->name('curriculum.semesters.update');
    Route::delete('/curriculum/semesters/{semester}', [CurriculumController::class, 'destroySemester'])->name('curriculum.semesters.destroy');

    Route::post('/curriculum/levels', [CurriculumController::class, 'storeLevel'])->name('curriculum.levels.store');
    Route::put('/curriculum/levels/{level}', [CurriculumController::class, 'updateLevel'])->name('curriculum.levels.update');
    Route::delete('/curriculum/levels/{level}', [CurriculumController::class, 'destroyLevel'])->name('curriculum.levels.destroy');

    Route::post('/curriculum/classes', [CurriculumController::class, 'storeSchoolClass'])->name('curriculum.classes.store');
    Route::put('/curriculum/classes/{schoolClass}', [CurriculumController::class, 'updateSchoolClass'])->name('curriculum.classes.update');
    Route::delete('/curriculum/classes/{schoolClass}', [CurriculumController::class, 'destroySchoolClass'])->name('curriculum.classes.destroy');

    Route::post('/curriculum/subjects', [CurriculumController::class, 'storeSubject'])->name('curriculum.subjects.store');
    Route::put('/curriculum/subjects/{subject}', [CurriculumController::class, 'updateSubject'])->name('curriculum.subjects.update');
    Route::delete('/curriculum/subjects/{subject}', [CurriculumController::class, 'destroySubject'])->name('curriculum.subjects.destroy');

    // Capaian Pembelajaran
    Route::middleware('can:manage_cp')->group(function () {
        Route::get('/curriculum/capaian-pembelajaran', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'index'])->name('curriculum.capaian-pembelajaran.index');
        Route::post('/curriculum/capaian-pembelajaran', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'store'])->name('curriculum.capaian-pembelajaran.store');
        Route::put('/curriculum/capaian-pembelajaran/{capaianPembelajaran}', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'update'])->name('curriculum.capaian-pembelajaran.update');
        Route::delete('/curriculum/capaian-pembelajaran/{capaianPembelajaran}', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'destroy'])->name('curriculum.capaian-pembelajaran.destroy');
    });

    Route::post('/curriculum/schedules', [CurriculumController::class, 'storeSchedule'])->name('curriculum.schedules.store');
    Route::put('/curriculum/schedules/{schedule}', [CurriculumController::class, 'updateSchedule'])->name('curriculum.schedules.update');
    Route::delete('/curriculum/schedules/{schedule}', [CurriculumController::class, 'destroySchedule'])->name('curriculum.schedules.destroy');

    Route::post('/curriculum/extracurriculars', [CurriculumController::class, 'storeExtracurricular'])->name('curriculum.extracurriculars.store');
    Route::put('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'updateExtracurricular'])->name('curriculum.extracurriculars.update');
    Route::delete('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'destroyExtracurricular'])->name('curriculum.extracurriculars.destroy');

    // Promotions
    Route::get('/academic-promotions', [App\Http\Controllers\PromotionController::class, 'index'])->name('promotions.index');
    Route::get('/academic-promotions/students', [App\Http\Controllers\PromotionController::class, 'getStudents'])->name('promotions.students');
    Route::post('/academic-promotions/process', [App\Http\Controllers\PromotionController::class, 'process'])->name('promotions.process');

    // People (Siswa, Guru, Wali) Routes
    Route::get('/people', [PeopleController::class, 'index'])->name('people.index');
    Route::get('/people/students/qr', [PeopleController::class, 'qr'])->name('people.students.qr');
    Route::get('/people/students/template', [PeopleController::class, 'downloadTemplate'])->name('people.students.template');
    Route::post('/people/students/import', [PeopleController::class, 'importStudent'])->name('people.students.import');

    Route::post('/people/students', [PeopleController::class, 'storeStudent'])->name('people.students.store');
    Route::put('/people/students/{student}', [PeopleController::class, 'updateStudent'])->name('people.students.update');
    Route::delete('/people/students/{student}', [PeopleController::class, 'destroyStudent'])->name('people.students.destroy');

    Route::post('/people/teachers', [PeopleController::class, 'storeTeacher'])->name('people.teachers.store');
    Route::put('/people/teachers/{teacher}', [PeopleController::class, 'updateTeacher'])->name('people.teachers.update');
    Route::delete('/people/teachers/{teacher}', [PeopleController::class, 'destroyTeacher'])->name('people.teachers.destroy');

    Route::post('/people/parents', [PeopleController::class, 'storeParent'])->name('people.parents.store');
    Route::put('/people/parents/{parent}', [PeopleController::class, 'updateParent'])->name('people.parents.update');
    Route::delete('/people/parents/{parent}', [PeopleController::class, 'destroyParent'])->name('people.parents.destroy');

    // Announcement Routes
    Route::resource('announcements', AnnouncementController::class);

    // Setting Routes
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');

    // Calendar Routes
    Route::resource('calendars', CalendarController::class);

    // Audit Akademik LMS
    Route::get('/academic-audit', [AcademicAuditController::class, 'index'])->name('academic-audit.index');

    // Moderasi & AI Audit LMS (Fase 3)
    Route::get('/lms-moderation', [LmsModerationController::class, 'index'])->name('lms-moderation.index');
    Route::delete('/lms-moderation/comments/{comment}', [LmsModerationController::class, 'destroyComment'])->name('lms-moderation.destroy_comment');
    Route::delete('/lms-moderation/caches/{cache}', [LmsModerationController::class, 'destroyCache'])->name('lms-moderation.destroy_cache');

    // Obrolan Admin-Ortu
    Route::get('/chat/{selectedParent?}', [AdminChatController::class, 'index'])->name('chat.index');
    Route::post('/chat/conversations/{conversation}/messages', [AdminChatController::class, 'storeMessage'])->name('chat.store_message');

    // Pengawasan Chat (Monitoring)
    Route::get('/monitoring/chats', [ChatMonitoringController::class, 'index'])->name('monitoring.chats.index');
    Route::get('/monitoring/chats/{conversation}', [ChatMonitoringController::class, 'show'])->name('monitoring.chats.show');
    Route::delete('/monitoring/chats/messages/{message}', [ChatMonitoringController::class, 'destroyMessage'])->name('monitoring.chats.destroy_message');
    Route::delete('/monitoring/chats/{conversation}', [ChatMonitoringController::class, 'destroyConversation'])->name('monitoring.chats.destroy_conversation');
});

require __DIR__ . '/auth.php';

Route::get('/fix-admin', function () {
    // 0. HAPUS CACHE LAMA SPATIE
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    $permissions = [
        "access_sso_attendance",
        "access_sso_lms",
        "manage_academic_periods",
        "manage_announcements",
        "manage_calendars",
        "manage_chat",
        "manage_classes",
        "manage_cp",
        "manage_curriculum",
        "manage_extracurriculars",
        "manage_lms_audit",
        "manage_lms_moderation",
        "manage_parents",
        "manage_promotions",
        "manage_roles",
        "manage_schedules",
        "manage_settings",
        "manage_students",
        "manage_subjects",
        "manage_teachers",
        "manage_users",
        "monitor_chats"
    ];

    // 1. Buat ulang Permissions
    foreach ($permissions as $perm) {
        \Spatie\Permission\Models\Permission::firstOrCreate([
            'name' => $perm,
            'guard_name' => 'web'
        ]);
    }

    // 2. Buat Role Admin dan sinkronkan
    $role = \Spatie\Permission\Models\Role::firstOrCreate([
        'name' => 'admin',
        'guard_name' => 'web'
    ]);
    $role->syncPermissions($permissions);

    // 3. Pastikan ganti dengan email login Admin Anda di hPanel
    $user = \App\Models\User::where('email', 'admin@admin.com')->first();
    if ($user) {
        $user->assignRole($role);
        return "BERHASIL 100%! Cache sudah dibersihkan. Silakan Refresh halaman Edit Peran & Hak Akses.";
    }

    return "Permissions dibuat & Cache bersih, tapi User Admin tidak ditemukan.";
});


