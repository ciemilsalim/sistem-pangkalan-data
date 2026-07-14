<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class MigrateRolesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'roles:migrate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing string roles to Spatie roles and permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting role migration...');

        // Clear cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Permissions
        $permissions = [
            'manage_curriculum',
            'manage_users',
            'manage_settings',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }
        $this->info('Permissions created.');

        // 2. Create Roles and assign permissions
        $roles = [
            'admin' => ['manage_curriculum', 'manage_users', 'manage_settings'],
            'wakasek_kurikulum' => ['manage_curriculum'],
            'teacher' => [],
            'student' => [],
            'parent' => [],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            if (!empty($rolePermissions)) {
                $role->syncPermissions($rolePermissions);
            }
        }
        $this->info('Roles created and permissions assigned.');

        // 3. Migrate Users
        $users = User::all();
        $count = 0;
        foreach ($users as $user) {
            // Check if they have a string role in the 'role' column (we assume the column still exists)
            $stringRole = $user->role ?? null;
            
            if ($stringRole) {
                // Ensure the role exists in spatie
                if (array_key_exists($stringRole, $roles)) {
                    $user->assignRole($stringRole);
                    $count++;
                }
            }
        }

        $this->info("Migrated {$count} users to Spatie roles.");
        $this->info('Role migration completed successfully.');
    }
}
