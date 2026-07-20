import sys
import re

file_path = r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Users\Index.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add states
state_addition = """    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);"""

content = re.sub(r"    const \[search, setSearch\] = useState\(filters\.search \|\| ''\);\n    const \[roleFilter, setRoleFilter\] = useState\(filters\.role \|\| ''\);\n    \n    // Modal states\n    const \[isCreateOpen, setIsCreateOpen\] = useState\(false\);\n    const \[isEditOpen, setIsEditOpen\] = useState\(false\);\n    const \[isDeleteOpen, setIsDeleteOpen\] = useState\(false\);\n    const \[selectedUser, setSelectedUser\] = useState\(null\);", state_addition, content)


# 2. Update handlers
handlers_old = """    // Handle Search & Filter submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('users.index'), {
            search: search,
            role: roleFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset filters
    const handleReset = () => {
        setSearch('');
        setRoleFilter('');
        router.get(route('users.index'), {}, {
            preserveState: true,
            replace: true
        });
    };"""

handlers_new = """    // Handle Search & Filter submit
    const handleSearchSubmit = (e) => {
        if(e) e.preventDefault();
        router.get(route('users.index'), {
            search: search,
            role: roleFilter,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset filters
    const handleReset = () => {
        setSearch('');
        setRoleFilter('');
        setPerPage('10');
        setSelectedUsers([]);
        router.get(route('users.index'), {}, {
            preserveState: true,
            replace: true
        });
    };
    
    const handlePerPageChange = (e) => {
        const newPerPage = e.target.value;
        setPerPage(newPerPage);
        router.get(route('users.index'), {
            search: search,
            role: roleFilter,
            per_page: newPerPage
        }, { preserveState: true, replace: true });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.data.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (e, id) => {
        if (e.target.checked) {
            setSelectedUsers([...selectedUsers, id]);
        } else {
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        }
    };

    const handleBulkDeleteSubmit = (e) => {
        e.preventDefault();
        if (deleteConfirmationText !== 'DELETE') return;
        
        router.delete(route('users.bulkDestroy'), {
            data: { ids: selectedUsers },
            onSuccess: () => {
                setIsBulkDeleteOpen(false);
                setSelectedUsers([]);
                setDeleteConfirmationText('');
            }
        });
    };"""

content = content.replace(handlers_old, handlers_new)


# 3. Add perPage select and Bulk Delete button
filter_old = """                            <div>
                                <select
                                    id="role-filter"
                                    value={roleFilter}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Semua Peran</option>
                                    {availableRoles && availableRoles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton type="submit" className="px-4 py-2 text-xs" title="Cari">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </PrimaryButton>
                                {(filters.search || filters.role || search || roleFilter) && ("""

filter_new = """                            <div>
                                <select
                                    id="role-filter"
                                    value={roleFilter}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Semua Peran</option>
                                    {availableRoles && availableRoles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
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
                                {(filters.search || filters.role || search || roleFilter || perPage !== '10') && ("""
                                
content = content.replace(filter_old, filter_new)


# 4. Add Bulk delete header button
bulk_btn_old = """                        <div>
                            <PrimaryButton
                                onClick={() => {"""
                                
bulk_btn_new = """                        <div className="flex gap-2">
                            {selectedUsers.length > 0 && (
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
                                    Hapus ({selectedUsers.length})
                                </DangerButton>
                            )}
                            <PrimaryButton
                                onClick={() => {"""
content = content.replace(bulk_btn_old, bulk_btn_new)


# 5. Table headers and cells
th_old = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama
                                        </th>"""
th_new = """                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={users.data.length > 0 && selectedUsers.length === users.data.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama
                                        </th>"""
content = content.replace(th_old, th_new)

td_old = """                                            <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                                                </td>"""
td_new = """                                            <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={(e) => handleSelectUser(e, user.id)}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                                                </td>"""
content = content.replace(td_old, td_new)


# 6. Pagination SVG icons
pagination_sm_old = """                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!users.prev_page_url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Sebelumnya
                                    </Link>
                                    <Link
                                        href={users.next_page_url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!users.next_page_url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Berikutnya
                                    </Link>"""
pagination_sm_new = """                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!users.prev_page_url && 'pointer-events-none opacity-50'}`}
                                        title="Sebelumnya"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href={users.next_page_url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 ${!users.next_page_url && 'pointer-events-none opacity-50'}`}
                                        title="Berikutnya"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </Link>"""
content = content.replace(pagination_sm_old, pagination_sm_new)

# For the numbered pagination buttons, replace the raw Previous and Next labels from Laravel
# Laravel usually provides &laquo; Previous and Next &raquo; which render as HTML.
pagination_lg_old = """                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${"""
pagination_lg_new = """                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    dangerouslySetInnerHTML={{ __html: link.label.includes('Previous') ? '&laquo;' : (link.label.includes('Next') ? '&raquo;' : link.label) }}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${"""
content = content.replace(pagination_lg_old, pagination_lg_new)


# 7. Add Bulk Delete Modal
modal_addition = """            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <form onSubmit={handleDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Akun Pengguna</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Apakah Anda yakin ingin menghapus akun milik <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
                        Tindakan ini tidak dapat dibatalkan dan semua data terkait akun ini akan terpengaruh.
                    </p>
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsDeleteOpen(false)} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <DangerButton type="submit" title="Hapus Permanen">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </DangerButton>
                    </div>
                </form>
            </Modal>
            
            {/* Bulk Delete Confirmation Modal */}
            <Modal show={isBulkDeleteOpen} onClose={() => setIsBulkDeleteOpen(false)}>
                <form onSubmit={handleBulkDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Massal Akun Pengguna</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p className="mb-2">Anda akan menghapus <strong>{selectedUsers.length}</strong> pengguna secara permanen.</p>
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
            </Modal>"""
            
content = content.replace("""            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <form onSubmit={handleDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Akun Pengguna</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Apakah Anda yakin ingin menghapus akun milik <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
                        Tindakan ini tidak dapat dibatalkan dan semua data terkait akun ini akan terpengaruh.
                    </p>
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsDeleteOpen(false)} title="Batal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </SecondaryButton>
                        <DangerButton type="submit" title="Hapus Permanen">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </DangerButton>
                    </div>
                </form>
            </Modal>""", modal_addition)


with open("temp.jsx", "w", encoding="utf-8") as f:
    f.write(content)
