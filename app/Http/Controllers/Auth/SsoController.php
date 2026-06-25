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
     * Redirect the authenticated admin to another app in the ecosystem with a secure SSO token.
     */
    public function redirect(Request $request, string $app)
    {
        $user = $request->user();

        // 1. Generate a secure random token
        $token = Str::random(60);

        // 2. Store the token in the shared database with a 1-minute expiration
        DB::table('sso_tokens')->insert([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => Carbon::now('UTC')->addMinute(),
            'created_at' => Carbon::now('UTC'),
            'updated_at' => Carbon::now('UTC'),
        ]);

        // 3. Determine the target base URL
        $targetUrl = '';
        if ($app === 'lms') {
            $targetUrl = env('SSO_LMS_URL', 'http://localhost:8002');
        } elseif ($app === 'absensi') {
            $targetUrl = env('SSO_ABSENSI_URL', 'http://localhost:8000');
        } else {
            abort(404, 'Aplikasi tidak dikenal dalam ekosistem.');
        }

        // 4. Redirect the user to the target's SSO login endpoint with the token
        return redirect()->away(rtrim($targetUrl, '/') . '/sso/login?token=' . $token);
    }
}
