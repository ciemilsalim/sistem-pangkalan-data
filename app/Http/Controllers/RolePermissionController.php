<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        
        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        Role::create(['name' => $request->name, 'guard_name' => 'web']);

        return redirect()->back()->with('message', 'Peran berhasil ditambahkan.');
    }

    public function updateRole(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $request->name]);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->back()->with('message', 'Peran berhasil diperbarui.');
    }

    public function destroyRole(Role $role)
    {
        // Cegah penghapusan role admin bawaan jika diperlukan
        if ($role->name === 'admin') {
            return redirect()->back()->withErrors(['error' => 'Role admin tidak dapat dihapus.']);
        }
        
        $role->delete();

        return redirect()->back()->with('message', 'Peran berhasil dihapus.');
    }
}
