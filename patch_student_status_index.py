import sys

file_path = r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\People\Index.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update filter dropdown options
old_filter_options = """                                        <select
                                            className="block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={studentStatus}
                                            onChange={(e) => setStudentStatus(e.target.value)}
                                        >
                                            <option value="aktif">Status: Aktif</option>
                                            <option value="tidak_aktif">Status: Lulus / Pindah</option>
                                        </select>"""
new_filter_options = """                                        <select
                                            className="block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={studentStatus}
                                            onChange={(e) => setStudentStatus(e.target.value)}
                                        >
                                            <option value="aktif">Status: Aktif</option>
                                            <option value="lulus_pindah">Status: Lulus / Pindah</option>
                                            <option value="berhenti">Status: Berhenti / Keluar / Tidak Aktif</option>
                                        </select>"""
content = content.replace(old_filter_options, new_filter_options)

# 2. Update studentForm hook
old_student_form = """    const studentForm = useForm({
        name: '',
        nis: '',
        school_class_id: '',
        email: '',
        password: '',
        parent_ids: [],
    });"""
new_student_form = """    const studentForm = useForm({
        name: '',
        nis: '',
        school_class_id: '',
        email: '',
        password: '',
        parent_ids: [],
        status: 'aktif',
    });"""
content = content.replace(old_student_form, new_student_form)

# 3. Update openEditModal
old_open_edit_modal = """        if (entityType === 'student') {
            const linkedParentIds = record.parents ? record.parents.map(p => p.id) : [];
            studentForm.setData({
                name: record.name,
                nis: record.nis,
                school_class_id: record.school_class_id.toString(),
                email: record.user?.email || '',
                password: '', // optional on update
                parent_ids: linkedParentIds,
            });"""
new_open_edit_modal = """        if (entityType === 'student') {
            const linkedParentIds = record.parents ? record.parents.map(p => p.id) : [];
            studentForm.setData({
                name: record.name,
                nis: record.nis,
                school_class_id: record.school_class_id.toString(),
                email: record.user?.email || '',
                password: '', // optional on update
                parent_ids: linkedParentIds,
                status: record.status || 'aktif',
            });"""
content = content.replace(old_open_edit_modal, new_open_edit_modal)

# 4. Update the edit form UI to include status field (only when editing)
old_student_form_ui = """                        <div className="col-span-2">
                            <InputLabel htmlFor="parent_ids" value="Wali Murid (Opsional, bisa pilih lebih dari 1)" />
                            <select
                                id="parent_ids"
                                multiple
                                value={studentForm.data.parent_ids}
                                onChange={(e) => studentForm.setData('parent_ids', Array.from(e.target.selectedOptions, option => option.value))}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm h-32"
                            >
                                {parentsList.map(parent => (
                                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                                ))}
                            </select>
                            <InputError message={studentForm.errors.parent_ids} className="mt-2" />
                        </div>
                    </div>"""
new_student_form_ui = """                        <div className="col-span-2">
                            <InputLabel htmlFor="parent_ids" value="Wali Murid (Opsional, bisa pilih lebih dari 1)" />
                            <select
                                id="parent_ids"
                                multiple
                                value={studentForm.data.parent_ids}
                                onChange={(e) => studentForm.setData('parent_ids', Array.from(e.target.selectedOptions, option => option.value))}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm h-32"
                            >
                                {parentsList.map(parent => (
                                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                                ))}
                            </select>
                            <InputError message={studentForm.errors.parent_ids} className="mt-2" />
                        </div>

                        {modalType === 'edit' && (
                            <div className="col-span-2">
                                <InputLabel htmlFor="status" value="Status Siswa" />
                                <select
                                    id="status"
                                    value={studentForm.data.status}
                                    onChange={(e) => studentForm.setData('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="lulus">Lulus</option>
                                    <option value="pindah">Pindah Sekolah</option>
                                    <option value="keluar">Berhenti / Keluar</option>
                                </select>
                                <InputError message={studentForm.errors.status} className="mt-2" />
                            </div>
                        )}
                    </div>"""
content = content.replace(old_student_form_ui, new_student_form_ui)

# 5. Update Status badge in table row
old_status_badge = """                                        <td className="whitespace-nowrap px-6 py-4">
                                            {student.status === 'aktif' ? (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Aktif</span>
                                            ) : student.status === 'lulus' ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Lulus</span>
                                            ) : student.status === 'pindah' ? (
                                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pindah</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{student.status || '-'}</span>
                                            )}
                                        </td>"""
new_status_badge = """                                        <td className="whitespace-nowrap px-6 py-4">
                                            {student.status === 'aktif' ? (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Aktif</span>
                                            ) : student.status === 'lulus' ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Lulus</span>
                                            ) : student.status === 'pindah' ? (
                                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pindah</span>
                                            ) : student.status === 'keluar' ? (
                                                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Keluar/Berhenti</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{student.status || '-'}</span>
                                            )}
                                        </td>"""
content = content.replace(old_status_badge, new_status_badge)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
