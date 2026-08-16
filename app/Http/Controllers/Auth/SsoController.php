<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SsoController extends Controller
{
    /**
     * Menentukan URL target aplikasi ekosistem secara adaptif (Lokal vs cPanel).
     */
    public function getTargetUrl(Request $request, string $app): string
    {
        $host = $request->getHost();
        $isLocalHost = in_array($host, ['localhost', '127.0.0.1', '::1'])
            || str_starts_with($host, '192.168.')
            || str_starts_with($host, '10.')
            || str_ends_with($host, '.test')
            || str_ends_with($host, '.local');

        if ($app === 'lms') {
            return $isLocalHost
                ? (config('services.lms.local_url') ?: env('SSO_LMS_LOCAL_URL', env('SSO_LMS_URL', 'http://localhost:8001')))
                : (config('services.lms.production_url') ?: env('SSO_LMS_PRODUCTION_URL', env('SSO_LMS_URL', 'https://mokopani-smpn1biau.zahradev.id')));
        }

        if ($app === 'absensi') {
            return $isLocalHost
                ? (config('services.absensi.local_url') ?: env('SSO_ABSENSI_LOCAL_URL', env('SSO_ABSENSI_URL', 'http://localhost:8000')))
                : (config('services.absensi.production_url') ?: env('SSO_ABSENSI_PRODUCTION_URL', env('SSO_ABSENSI_URL', 'https://presensi-smpn1biau.zahradev.id')));
        }

        return '';
    }

    /**
     * Redirect the authenticated admin to another app in the ecosystem with a secure SSO token.
     */
    public function redirect(Request $request, string $app)
    {
        $user = $request->user();

        // 1. Generate a secure random token
        $token = Str::random(60);

        // 2. Store the token in the shared database with a 10-minute expiration
        DB::table('sso_tokens')->insert([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Check authorization & determine the target base URL
        if ($app === 'lms') {
            if (!$user->hasRole('admin') && !$user->hasPermissionTo('access_sso_lms')) {
                abort(403, 'Anda tidak memiliki hak akses untuk Jalur Cepat LMS Mokopani.');
            }
        } elseif ($app === 'absensi') {
            if (!$user->hasRole('admin') && !$user->hasPermissionTo('access_sso_attendance')) {
                abort(403, 'Anda tidak memiliki hak akses untuk Jalur Cepat Aplikasi Absensi.');
            }
        } else {
            abort(404, 'Aplikasi tidak dikenal dalam ekosistem.');
        }

        $targetUrl = $this->getTargetUrl($request, $app);

        // 4. Redirect the user to the target's SSO login endpoint with the token
        return redirect()->away(rtrim($targetUrl, '/') . '/sso/login?token=' . $token);
    }
}
