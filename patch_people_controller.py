import sys

file_path = r"d:\laragon\www\siasek\sistem-pangkalan-data\app\Http\Controllers\PeopleController.php"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add per_page capturing
old_index_start = """    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'students');
        $search = $request->input('search', '');"""
new_index_start = """    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'students');
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);"""
content = content.replace(old_index_start, new_index_start)

# 2. Update students pagination
content = content.replace("            $students = $query->orderBy('name')->paginate(10)->withQueryString();",
                          "            $students = $query->orderBy('name')->paginate($perPage)->withQueryString();")

# 3. Update teachers pagination
content = content.replace("            $teachers = $query->orderBy('name')->paginate(10)->withQueryString();",
                          "            $teachers = $query->orderBy('name')->paginate($perPage)->withQueryString();")

# 4. Update parents pagination
content = content.replace("            $parents = $query->orderBy('name')->paginate(10)->withQueryString();",
                          "            $parents = $query->orderBy('name')->paginate($perPage)->withQueryString();")

# 5. Pass per_page to filters in Inertia::render
old_filters = """            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'student_status' => $request->input('student_status', 'aktif'),
                'school_class_id' => $request->input('school_class_id', '')
            ],"""
new_filters = """            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'per_page' => $perPage,
                'student_status' => $request->input('student_status', 'aktif'),
                'school_class_id' => $request->input('school_class_id', '')
            ],"""
content = content.replace(old_filters, new_filters)

# 6. Add bulkDestroy method at the end of the class
old_end = """        return view('admin.students.qr', compact('students'));
    }
}
"""
new_end = """        return view('admin.students.qr', compact('students'));
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'type' => 'required|in:students,teachers,parents',
        ]);

        $ids = $request->input('ids');
        $type = $request->input('type');
        $userIds = [];

        DB::transaction(function () use ($ids, $type, &$userIds) {
            if ($type === 'students') {
                $students = Student::whereIn('id', $ids)->get();
                foreach ($students as $student) {
                    if ($student->user_id) $userIds[] = $student->user_id;
                    $student->parents()->detach(); // Pivot table cleanup
                    $student->delete();
                }
            } elseif ($type === 'teachers') {
                $teachers = Teacher::whereIn('id', $ids)->get();
                foreach ($teachers as $teacher) {
                    if ($teacher->user_id) $userIds[] = $teacher->user_id;
                    $teacher->subjects()->detach(); // Pivot table cleanup
                    $teacher->delete();
                }
            } elseif ($type === 'parents') {
                $parents = ParentModel::whereIn('id', $ids)->get();
                foreach ($parents as $parent) {
                    if ($parent->user_id) $userIds[] = $parent->user_id;
                    $parent->students()->detach(); // Pivot table cleanup
                    $parent->delete();
                }
            }

            // Prevent deleting oneself just in case
            $userIds = array_diff($userIds, [auth()->id()]);

            if (count($userIds) > 0) {
                User::whereIn('id', $userIds)->delete();
            }
        });

        $typeLabel = $type === 'students' ? 'Siswa' : ($type === 'teachers' ? 'Guru' : 'Wali Murid');
        return redirect()->route('people.index', ['tab' => $type])->with('message', count($ids) . ' ' . $typeLabel . ' berhasil dihapus.');
    }
}
"""
content = content.replace(old_end, new_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
