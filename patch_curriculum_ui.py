with open(r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Curriculum\Index.jsx", 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add permission helpers and modify useState for activeTab
old_useState = "    const [activeTab, setActiveTab] = useState('academicYears');"
new_useState = """    const hasRole = (role) => auth.user.roles?.includes(role);
    const hasPermission = (permission) => auth.user.permissions?.includes(permission);
    const isAdmin = hasRole('admin');
    const canManageCurriculum = isAdmin || hasPermission('manage_curriculum');
    const canManageCp = isAdmin || hasPermission('manage_cp');

    const [activeTab, setActiveTab] = useState(() => {
        if (!canManageCurriculum && canManageCp) {
            return 'subjects';
        }
        return 'academicYears';
    });"""

content = content.replace(old_useState, new_useState)

# 2. Update renderAcademicYearsTab
old_ay_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Tahun Akademik</h3>
                    <PrimaryButton onClick={() => openCreateModal('academicYear')} className="text-xs" title="Tambah Tahun Akademik">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </PrimaryButton>
                </div>"""

new_ay_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Tahun Akademik</h3>
                    {canManageCurriculum && (
                        <PrimaryButton onClick={() => openCreateModal('academicYear')} className="text-xs" title="Tambah Tahun Akademik">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>"""

content = content.replace(old_ay_header, new_ay_header)

old_ay_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_ay_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_ay_table_th, new_ay_table_th)

old_ay_table_td = """                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ay.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">Tidak Aktif</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('academicYear', ay)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('academicYear', ay)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>"""

new_ay_table_td = """                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ay.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">Tidak Aktif</span>
                                            )}
                                        </td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('academicYear', ay)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('academicYear', ay)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}"""

content = content.replace(old_ay_table_td, new_ay_table_td)


# 3. Update renderSemestersTab
old_sem_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Semester</h3>
                    {academicYears.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tahun Akademik terlebih dahulu sebelum membuat Semester.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('semester')} className="text-xs" title="Tambah Semester">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>"""

new_sem_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Semester</h3>
                    {canManageCurriculum && (academicYears.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tahun Akademik terlebih dahulu sebelum membuat Semester.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('semester')} className="text-xs" title="Tambah Semester">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    ))}
                </div>"""

content = content.replace(old_sem_header, new_sem_header)

old_sem_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_sem_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tahun Akademik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_sem_table_th, new_sem_table_th)

old_sem_table_td = """                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sem.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">Tidak Aktif</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('semester', sem)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('semester', sem)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>"""

new_sem_table_td = """                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sem.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">Aktif</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">Tidak Aktif</span>
                                            )}
                                        </td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('semester', sem)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('semester', sem)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}"""

content = content.replace(old_sem_table_td, new_sem_table_td)


# 4. Update renderLevelsTab
old_lvl_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Tingkat Kelas</h3>
                    <PrimaryButton onClick={() => openCreateModal('level')} className="text-xs" title="Tambah Tingkat Kelas">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </PrimaryButton>
                </div>"""

new_lvl_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Tingkat Kelas</h3>
                    {canManageCurriculum && (
                        <PrimaryButton onClick={() => openCreateModal('level')} className="text-xs" title="Tambah Tingkat Kelas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>"""

content = content.replace(old_lvl_header, new_lvl_header)

old_lvl_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_lvl_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_lvl_table_th, new_lvl_table_th)

old_lvl_table_td = """                                    <tr key={lvl.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{lvl.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('level', lvl)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('level', lvl)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>"""

new_lvl_table_td = """                                    <tr key={lvl.id} className="hover:bg-gray-50 dark:bg-gray-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">{lvl.name}</td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('level', lvl)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('level', lvl)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
                                    </tr>"""

content = content.replace(old_lvl_table_td, new_lvl_table_td)


# 5. Update renderSchoolClassesTab
old_cls_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Kelas</h3>
                    {levels.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tingkat Kelas terlebih dahulu sebelum membuat Kelas.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schoolClass')} className="text-xs" title="Tambah Kelas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>"""

new_cls_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Kelas</h3>
                    {canManageCurriculum && (levels.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold">Tambahkan Tingkat Kelas terlebih dahulu sebelum membuat Kelas.</p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schoolClass')} className="text-xs" title="Tambah Kelas">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    ))}
                </div>"""

content = content.replace(old_cls_header, new_cls_header)

old_cls_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wali Kelas</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_cls_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Kelas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wali Kelas</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_cls_table_th, new_cls_table_th)

old_cls_table_td = """                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                            {cls.homeroom_teacher ? (
                                                <span>{cls.homeroom_teacher.name} <span className="text-xs text-gray-400">({cls.homeroom_teacher.nip || 'NIP -'})</span></span>
                                            ) : (
                                                <span className="text-gray-400 font-normal italic">Belum ditentukan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('schoolClass', cls)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('schoolClass', cls)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>"""

new_cls_table_td = """                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                            {cls.homeroom_teacher ? (
                                                <span>{cls.homeroom_teacher.name} <span className="text-xs text-gray-400">({cls.homeroom_teacher.nip || 'NIP -'})</span></span>
                                            ) : (
                                                <span className="text-gray-400 font-normal italic">Belum ditentukan</span>
                                            )}
                                        </td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('schoolClass', cls)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('schoolClass', cls)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}"""

content = content.replace(old_cls_table_td, new_cls_table_td)


# 6. Update renderSubjectsTab
old_sub_header = """                <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Mata Pelajaran</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        {auth.user.permissions?.includes('manage_cp') && (
                            <Link href={route('curriculum.capaian-pembelajaran.index')} className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-md font-semibold text-xs text-indigo-700 uppercase tracking-widest shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 w-full md:w-auto justify-center">
                                Kelola Capaian Pembelajaran (CP)
                            </Link>
                        )}
                        <PrimaryButton onClick={() => openCreateModal('subject')} className="text-xs w-full md:w-auto justify-center" title="Tambah Mata Pelajaran">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    </div>
                </div>"""

new_sub_header = """                <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Mata Pelajaran</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        {canManageCp && (
                            <Link href={route('curriculum.capaian-pembelajaran.index')} className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-md font-semibold text-xs text-indigo-700 uppercase tracking-widest shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 w-full md:w-auto justify-center">
                                Kelola Capaian Pembelajaran (CP)
                            </Link>
                        )}
                        {canManageCurriculum && (
                            <PrimaryButton onClick={() => openCreateModal('subject')} className="text-xs w-full md:w-auto justify-center" title="Tambah Mata Pelajaran">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </PrimaryButton>
                        )}
                    </div>
                </div>"""

content = content.replace(old_sub_header, new_sub_header)

old_sub_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kode</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_sub_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kode</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_sub_table_th, new_sub_table_th)

old_sub_table_td = """                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{sub.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('subject', sub)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('subject', sub)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>"""

new_sub_table_td = """                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{sub.description || '-'}</td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('subject', sub)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('subject', sub)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}"""

content = content.replace(old_sub_table_td, new_sub_table_td)


# 7. Update renderSchedulesTab
old_sch_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Jadwal Pelajaran</h3>
                    {schoolClasses.length === 0 || subjects.length === 0 || teachers.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 p-2 border border-red-200 rounded">
                            Pastikan data Kelas, Mata Pelajaran, dan Guru sudah tersedia sebelum membuat jadwal.
                        </p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schedule')} className="text-xs" title="Tambah Jadwal Pelajaran">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>"""

new_sch_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Jadwal Pelajaran</h3>
                    {canManageCurriculum && (schoolClasses.length === 0 || subjects.length === 0 || teachers.length === 0 ? (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 p-2 border border-red-200 rounded">
                            Pastikan data Kelas, Mata Pelajaran, dan Guru sudah tersedia sebelum membuat jadwal.
                        </p>
                    ) : (
                        <PrimaryButton onClick={() => openCreateModal('schedule')} className="text-xs" title="Tambah Jadwal Pelajaran">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    ))}
                </div>"""

content = content.replace(old_sch_header, new_sch_header)

old_sch_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Guru Pengampu</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_sch_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mata Pelajaran</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Guru Pengampu</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_sch_table_th, new_sch_table_th)

old_sch_table_td = """                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                                {sch.teaching_assignment?.teacher?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('schedule', sch)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('schedule', sch)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>"""

new_sch_table_td = """                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                                {sch.teaching_assignment?.teacher?.name || '-'}
                                            </td>
                                            {canManageCurriculum && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal('schedule', sch)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => openDeleteModal('schedule', sch)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}"""

content = content.replace(old_sch_table_td, new_sch_table_td)


# 8. Update renderExtracurricularsTab
old_extra_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Kegiatan Ekstrakurikuler</h3>
                        <PrimaryButton onClick={() => openCreateModal('extracurricular')} className="text-xs" title="Tambah Ekstrakurikuler">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                </div>"""

new_extra_header = """                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Daftar Kegiatan Ekstrakurikuler</h3>
                    {canManageCurriculum && (
                        <PrimaryButton onClick={() => openCreateModal('extracurricular')} className="text-xs" title="Tambah Ekstrakurikuler">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </PrimaryButton>
                    )}
                </div>"""

content = content.replace(old_extra_header, new_extra_header)

old_extra_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Anggota</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>"""

new_extra_table_th = """                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Anggota</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                {canManageCurriculum && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>}"""

content = content.replace(old_extra_table_th, new_extra_table_th)

old_extra_table_td = """                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{extra.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal('extracurricular', extra)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openDeleteModal('extracurricular', extra)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>"""

new_extra_table_td = """                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{extra.description || '-'}</td>
                                        {canManageCurriculum && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal('extracurricular', extra)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.89 1.14l-2.812.93a.75.75 0 0 1-.95-.95l.93-2.811a4.5 4.5 0 0 1 1.14-1.89l11.43-11.43Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 7.125-2.625-2.625" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => openDeleteModal('extracurricular', extra)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}"""

content = content.replace(old_extra_table_td, new_extra_table_td)

with open(r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Curriculum\Index.jsx", 'w', encoding='utf-8') as f:
    f.write(content)

print("Curriculum Index.jsx patched successfully!")
