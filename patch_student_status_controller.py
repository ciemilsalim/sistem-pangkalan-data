import sys

file_path = r"d:\laragon\www\siasek\sistem-pangkalan-data\app\Http\Controllers\PeopleController.php"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update index method filter
old_filter = """            if ($studentStatus === 'aktif') {
                $query->where('status', 'aktif');
            } else {
                $query->whereIn('status', ['lulus', 'pindah', 'keluar']);
            }"""
new_filter = """            if ($studentStatus === 'aktif') {
                $query->where('status', 'aktif');
            } elseif ($studentStatus === 'lulus_pindah') {
                $query->whereIn('status', ['lulus', 'pindah']);
            } elseif ($studentStatus === 'berhenti') {
                $query->where('status', 'keluar');
            } else {
                // If somehow it's something else, fall back to aktif
                $query->where('status', 'aktif');
            }"""
content = content.replace(old_filter, new_filter)

# 2. Update updateStudent method
old_validation = """            'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id,
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:parents,id',
        ]);

        if ($request->filled('password')) {"""
new_validation = """            'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id,
            'status' => 'required|in:aktif,lulus,pindah,keluar',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:parents,id',
        ]);

        if ($request->filled('password')) {"""
content = content.replace(old_validation, new_validation)

old_update = """            // Update Student
            $student->update([
                'name' => $request->name,
                'nis' => $request->nis,
                'school_class_id' => $request->school_class_id,
            ]);

            // Update User login details
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];"""
new_update = """            // Update Student
            $student->update([
                'name' => $request->name,
                'nis' => $request->nis,
                'school_class_id' => $request->school_class_id,
                'status' => $request->status,
            ]);

            // Update User login details
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->status !== 'aktif') {
                $userData['is_active'] = false;
            }"""
content = content.replace(old_update, new_update)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
