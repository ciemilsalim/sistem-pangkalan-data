<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = App\Models\User::whereHas('roles', function($q) {
    $q->where('name', 'teacher');
})->with('roles')->get();

echo json_encode($users->toArray(), JSON_PRETTY_PRINT);
