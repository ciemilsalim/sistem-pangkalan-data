import re

def update_web_routes():
    filepath = r"d:\laragon\www\siasek\sistem-pangkalan-data\routes\web.php"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to wrap store/update/delete routes for curriculum in a group with middleware 'can:manage_curriculum'
    # Currently the block is:
    # Route::post('/curriculum/academic-years', ...
    # up to:
    # Route::delete('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'destroyExtracurricular'])->name('curriculum.extracurriculars.destroy');
    
    target_start = "    Route::post('/curriculum/academic-years', [CurriculumController::class, 'storeAcademicYear'])->name('curriculum.academic-years.store');"
    target_end = "    Route::delete('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'destroyExtracurricular'])->name('curriculum.extracurriculars.destroy');"
    
    # We find the start index and end index
    start_idx = content.find(target_start)
    end_idx = content.find(target_end) + len(target_end)
    
    if start_idx != -1 and end_idx != -1:
        middle_routes = content[start_idx:end_idx]
        # We need to preserve CP routes because they have their own middleware group.
        # But wait, in web.php, the CP middleware group is between subjects and schedules!
        # Let's inspect the exact routes block in web.php.
        # We saw earlier:
        # Route::post('/curriculum/subjects'...
        # // Capaian Pembelajaran
        # Route::middleware('can:manage_cp')->group(function () { ... });
        # Route::post('/curriculum/schedules'...
        
        # So it is better to wrap the specific route definitions in Route::middleware('can:manage_curriculum')->group(function () { ... });
        # But we need to split it:
        # Part 1: before Capaian Pembelajaran
        # Part 2: Capaian Pembelajaran
        # Part 3: after Capaian Pembelajaran (schedules, extracurriculars)
        
        # Let's reconstruct the route block.
        new_route_block = """    // Curriculum Management Routes (restricted)
    Route::middleware('can:manage_curriculum')->group(function () {
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
    });

    // Capaian Pembelajaran
    Route::middleware('can:manage_cp')->group(function () {
        Route::get('/curriculum/capaian-pembelajaran', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'index'])->name('curriculum.capaian-pembelajaran.index');
        Route::post('/curriculum/capaian-pembelajaran', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'store'])->name('curriculum.capaian-pembelajaran.store');
        Route::put('/curriculum/capaian-pembelajaran/{capaianPembelajaran}', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'update'])->name('curriculum.capaian-pembelajaran.update');
        Route::delete('/curriculum/capaian-pembelajaran/{capaianPembelajaran}', [App\Http\Controllers\LmsCapaianPembelajaranController::class, 'destroy'])->name('curriculum.capaian-pembelajaran.destroy');
    });

    Route::middleware('can:manage_curriculum')->group(function () {
        Route::post('/curriculum/schedules', [CurriculumController::class, 'storeSchedule'])->name('curriculum.schedules.store');
        Route::put('/curriculum/schedules/{schedule}', [CurriculumController::class, 'updateSchedule'])->name('curriculum.schedules.update');
        Route::delete('/curriculum/schedules/{schedule}', [CurriculumController::class, 'destroySchedule'])->name('curriculum.schedules.destroy');

        Route::post('/curriculum/extracurriculars', [CurriculumController::class, 'storeExtracurricular'])->name('curriculum.extracurriculars.store');
        Route::put('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'updateExtracurricular'])->name('curriculum.extracurriculars.update');
        Route::delete('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'destroyExtracurricular'])->name('curriculum.extracurriculars.destroy');
    });"""

        # Replace from target_start to target_end (including target_end) and also the CP block that is in between
        # The CP block starts with `    // Capaian Pembelajaran`
        cp_start_str = "    // Capaian Pembelajaran"
        extracurricular_end_str = "Route::delete('/curriculum/extracurriculars/{extracurricular}', [CurriculumController::class, 'destroyExtracurricular'])->name('curriculum.extracurriculars.destroy');"
        
        real_start_idx = content.find(target_start)
        real_end_idx = content.find(extracurricular_end_str) + len(extracurricular_end_str)
        
        if real_start_idx != -1 and real_end_idx != -1:
            replaced_content = content[:real_start_idx] + new_route_block + content[real_end_idx:]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(replaced_content)
            print("web.php updated successfully")
        else:
            print("Failed to find route indexes")
    else:
        print("Failed to find targets in web.php")

def update_authenticated_layout():
    filepath = r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Layouts\AuthenticatedLayout.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to change:
    # if (isAdmin || hasPermission('manage_curriculum')) {
    # To:
    # if (isAdmin || hasPermission('manage_curriculum') || hasPermission('manage_cp')) {
    
    old_line = "if (isAdmin || hasPermission('manage_curriculum')) {"
    new_line = "if (isAdmin || hasPermission('manage_curriculum') || hasPermission('manage_cp')) {"
    
    if old_line in content:
        content = content.replace(old_line, new_line)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("AuthenticatedLayout.jsx updated")
    else:
        print("AuthenticatedLayout.jsx already updated or old line not found")

update_web_routes()
update_authenticated_layout()
