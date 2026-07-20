<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/debug-users', function () {
    return User::with('roles')->whereHas('roles', function($q) {
        $q->where('name', 'teacher');
    })->get();
});
