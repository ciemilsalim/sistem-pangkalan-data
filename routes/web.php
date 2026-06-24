<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\SettingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('users', UserController::class);

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

    // People (Siswa, Guru, Wali) Routes
    Route::get('/people', [PeopleController::class, 'index'])->name('people.index');
    
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
});

require __DIR__.'/auth.php';
