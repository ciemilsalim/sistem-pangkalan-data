import os

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    icon_helper = """
const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(ext)) {
        return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1.5m-1.5 3h3m-3 3h3" /></svg>;
    } else if (['doc', 'docx'].includes(ext)) {
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
        return <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
        return <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    }
    
    // Default file icon
    return <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
};
"""
    if "const getFileIcon" not in content:
        # insert helper function after imports
        import_end = content.find("export default")
        new_content = content[:import_end] + icon_helper + "\n" + content[import_end:]
        content = new_content

    if "ShowWakasek" in filepath:
        old_download_block = """                                                {submission && submission.file_path && (
                                                    <a href={route('documents.download', submission.id)} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        Download File
                                                    </a>
                                                )}"""
        new_download_block = """                                                {submission && submission.file_path && (
                                                    <a href={route('documents.download', submission.id)} className="text-indigo-600 hover:underline flex items-center gap-2" title={submission.file_name}>
                                                        {getFileIcon(submission.file_name)}
                                                        <span className="truncate max-w-[150px]">{submission.file_name}</span>
                                                    </a>
                                                )}"""
        content = content.replace(old_download_block, new_download_block)
    
    elif "ShowGuru" in filepath:
        old_file_block = """{submission.file_name && <p className="text-sm mb-1">File Terkirim: <strong>{submission.file_name}</strong></p>}"""
        new_file_block = """{submission.file_name && <p className="text-sm mb-1 flex items-center gap-2">File Terkirim: {getFileIcon(submission.file_name)} <strong>{submission.file_name}</strong></p>}"""
        content = content.replace(old_file_block, new_file_block)
        
        old_link_block = """{submission.submitted_url && <p className="text-sm mb-1">Link Terkirim: <a href={submission.submitted_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{submission.submitted_url}</a></p>}"""
        new_link_block = """{submission.submitted_url && <p className="text-sm mb-1 flex items-center gap-2">Link Terkirim: <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> <a href={submission.submitted_url} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate max-w-[200px]">{submission.submitted_url}</a></p>}"""
        content = content.replace(old_link_block, new_link_block)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

wakasek = r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Documents\ShowWakasek.jsx"
guru = r"d:\laragon\www\siasek\sistem-pangkalan-data\resources\js\Pages\Documents\ShowGuru.jsx"

patch_file(wakasek)
patch_file(guru)
print("Patched icons!")
