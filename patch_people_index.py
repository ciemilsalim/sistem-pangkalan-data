import sys
import re

file_path = r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\People\Index.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State Variables
state_old = """    const [studentStatus, setStudentStatus] = useState(filters.student_status || 'aktif');
    const [schoolClassId, setSchoolClassId] = useState(filters.school_class_id || '');
    const pageProps = usePage().props;

    // Modal States"""
state_new = """    const [studentStatus, setStudentStatus] = useState(filters.student_status || 'aktif');
    const [schoolClassId, setSchoolClassId] = useState(filters.school_class_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [selectedItems, setSelectedItems] = useState([]);
    const pageProps = usePage().props;

    // Modal States
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');"""
content = content.replace(state_old, state_new)

# 2. Update Handlers
handlers_old = """    // Handle Tab Switch (reloads page via Inertia with new tab param)
    const handleTabSwitch = (newTab) => {
        router.get(route('people.index'), {
            tab: newTab,
            search: '', // clear search when switching tabs
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('people.index'), {
            tab: activeTab,
            search: search,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        setStudentStatus('aktif');
        setSchoolClassId('');
        router.get(route('people.index'), {
            tab: activeTab,
            student_status: 'aktif',
            school_class_id: ''
        }, {
            preserveState: true,
            replace: true
        });
    };"""

handlers_new = """    // Handle Tab Switch (reloads page via Inertia with new tab param)
    const handleTabSwitch = (newTab) => {
        setSelectedItems([]); // Clear selection when switching tabs
        router.get(route('people.index'), {
            tab: newTab,
            search: '', // clear search when switching tabs
            per_page: perPage,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        if(e) e.preventDefault();
        router.get(route('people.index'), {
            tab: activeTab,
            search: search,
            per_page: perPage,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        setStudentStatus('aktif');
        setSchoolClassId('');
        setPerPage('10');
        setSelectedItems([]);
        router.get(route('people.index'), {
            tab: activeTab,
            student_status: 'aktif',
            school_class_id: ''
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        router.get(route('people.index'), {
            tab: activeTab,
            search: search,
            per_page: newPerPage,
            student_status: studentStatus,
            school_class_id: schoolClassId
        }, { preserveState: true, replace: true });
    };

    const handleSelectAll = (e, items) => {
        if (e.target.checked) {
            setSelectedItems(items.map(i => i.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (e, id) => {
        if (e.target.checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleBulkDeleteSubmit = (e) => {
        e.preventDefault();
        if (deleteConfirmationText !== 'DELETE') return;
        
        router.delete(route('people.bulkDestroy'), {
            data: { ids: selectedItems, type: activeTab },
            onSuccess: () => {
                setIsBulkDeleteOpen(false);
                setSelectedItems([]);
                setDeleteConfirmationText('');
            }
        });
    };"""
content = content.replace(handlers_old, handlers_new)

# 3. Add perPage filter dropdown to the filter section
filter_old = """                            <div className="flex gap-2">
                                <PrimaryButton type="submit" className="px-4 py-2 text-xs" title="Cari">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </PrimaryButton>
                                {(filters.search || filters.student_status !== 'aktif' || filters.school_class_id || search || studentStatus !== 'aktif' || schoolClassId) && ("""
filter_new = """                            <div>
                                <select
                                    id="per-page-filter"
                                    value={perPage}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    onChange={handlePerPageChange}
                                >
                                    <option value="10">10 Data</option>
                                    <option value="20">20 Data</option>
                                    <option value="50">50 Data</option>
                                    <option value="100">100 Data</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton type="submit" className="px-4 py-2 text-xs" title="Cari">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </PrimaryButton>
                                {(filters.search || filters.student_status !== 'aktif' || filters.school_class_id || search || studentStatus !== 'aktif' || schoolClassId || perPage !== '10') && ("""
content = content.replace(filter_old, filter_new)

# 4. Add Bulk Delete Button in the action row
action_old = """                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                            {activeTab === 'students' && (
                                <>"""
action_new = """                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                            {selectedItems.length > 0 && (
                                <DangerButton
                                    onClick={() => {
                                        setDeleteConfirmationText('');
                                        setIsBulkDeleteOpen(true);
                                    }}
                                    className="w-full sm:w-auto text-xs"
                                    title="Hapus Terpilih"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline-block">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                    Hapus ({selectedItems.length})
                                </DangerButton>
                            )}
                            {activeTab === 'students' && (
                                <>"""
content = content.replace(action_old, action_new)

# 5. Add Checkboxes to Students Table
student_th_old = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama & NIS
                                        </th>"""
student_th_new = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={students.data && students.data.length > 0 && selectedItems.length === students.data.length}
                                                onChange={(e) => handleSelectAll(e, students.data || [])}
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama & NIS
                                        </th>"""
content = content.replace(student_th_old, student_th_new)

student_td_old = """                                        <tr key={student.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 mr-3">"""
student_td_new = """                                        <tr key={student.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    checked={selectedItems.includes(student.id)}
                                                    onChange={(e) => handleSelectItem(e, student.id)}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 mr-3">"""
content = content.replace(student_td_old, student_td_new)

# 6. Add Checkboxes to Teachers Table
teacher_th_old = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama & NIP
                                        </th>"""
teacher_th_new = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={teachers.data && teachers.data.length > 0 && selectedItems.length === teachers.data.length}
                                                onChange={(e) => handleSelectAll(e, teachers.data || [])}
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama & NIP
                                        </th>"""
content = content.replace(teacher_th_old, teacher_th_new)

teacher_td_old = """                                        <tr key={teacher.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 mr-3">"""
teacher_td_new = """                                        <tr key={teacher.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    checked={selectedItems.includes(teacher.id)}
                                                    onChange={(e) => handleSelectItem(e, teacher.id)}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 mr-3">"""
content = content.replace(teacher_td_old, teacher_td_new)

# 7. Add Checkboxes to Parents Table
parent_th_old = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama Wali
                                        </th>"""
parent_th_new = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={parents.data && parents.data.length > 0 && selectedItems.length === parents.data.length}
                                                onChange={(e) => handleSelectAll(e, parents.data || [])}
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama Wali
                                        </th>"""
content = content.replace(parent_th_old, parent_th_new)

parent_td_old = """                                        <tr key={parent.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{parent.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{parent.user?.email}</div>
                                            </td>"""
parent_td_new = """                                        <tr key={parent.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    checked={selectedItems.includes(parent.id)}
                                                    onChange={(e) => handleSelectItem(e, parent.id)}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{parent.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{parent.user?.email}</div>
                                            </td>"""
content = content.replace(parent_td_old, parent_td_new)

# 8. Pagination icons update
pagination_sm_old = """                    <Link
                        href={paginator.prev_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.prev_page_url && 'pointer-events-none opacity-50'}`}
                    >
                        Sebelumnya
                    </Link>
                    <Link
                        href={paginator.next_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.next_page_url && 'pointer-events-none opacity-50'}`}
                    >
                        Berikutnya
                    </Link>"""
pagination_sm_new = """                    <Link
                        href={paginator.prev_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.prev_page_url && 'pointer-events-none opacity-50'}`}
                        title="Sebelumnya"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <Link
                        href={paginator.next_page_url || '#'}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!paginator.next_page_url && 'pointer-events-none opacity-50'}`}
                        title="Berikutnya"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </Link>"""
content = content.replace(pagination_sm_old, pagination_sm_new)

pagination_lg_old = """                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${"""
pagination_lg_new = """                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label.includes('Previous') ? '&laquo;' : (link.label.includes('Next') ? '&raquo;' : link.label) }}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${"""
content = content.replace(pagination_lg_old, pagination_lg_new)

# 9. Add Bulk Delete Modal at the end of the file, inside the component return but before </AuthenticatedLayout>
modal_injection = """            </Modal>
        </AuthenticatedLayout>"""
bulk_delete_modal = """            </Modal>

            {/* Bulk Delete Confirmation Modal */}
            <Modal show={isBulkDeleteOpen} onClose={() => setIsBulkDeleteOpen(false)}>
                <form onSubmit={handleBulkDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Massal Data</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p className="mb-2">Anda akan menghapus <strong>{selectedItems.length}</strong> {activeTab === 'students' ? 'siswa' : (activeTab === 'teachers' ? 'guru' : 'wali murid')} secara permanen.</p>
                        <p className="text-red-600 dark:text-red-400 font-semibold mb-4">Tindakan ini sangat berisiko dan tidak dapat dibatalkan!</p>
                        <p className="mb-2">Untuk melanjutkan, silakan ketik <strong>DELETE</strong> pada kolom di bawah ini:</p>
                        <TextInput
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="Ketik DELETE"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsBulkDeleteOpen(false)} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <DangerButton type="submit" disabled={deleteConfirmationText !== 'DELETE'} title="Hapus Massal Permanen">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>"""
content = content.replace(modal_injection, bulk_delete_modal)

# Check colspans in empty states
student_empty_old = '<td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">'
student_empty_new = '<td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">'
content = content.replace(student_empty_old, student_empty_new)

teacher_empty_old = '<td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">'
teacher_empty_new = '<td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">'
content = content.replace(teacher_empty_old, teacher_empty_new)

parent_empty_old = '<td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">'
parent_empty_new = '<td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">'
content = content.replace(parent_empty_old, parent_empty_new)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
