<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/sync-roles', function () {
    $users = User::all();
    $count = 0;
    foreach ($users as $user) {
        if ($user->role && !$user->hasRole($user->role)) {
            // Assign the role if it exists in Spatie
            $roleExists = \Spatie\Permission\Models\Role::where('name', $user->role)->exists();
            if ($roleExists) {
                $user->assignRole($user->role);
                $count++;
            }
        }
    }
    return "Synced {$count} users.";
});
