<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::where('role', 'teacher')->get();
$count = 0;
foreach($users as $user) {
    if (!$user->hasRole('teacher')) {
        $user->assignRole('teacher');
        $count++;
    }
}
echo "Roles synchronized for $count teachers.\n";
