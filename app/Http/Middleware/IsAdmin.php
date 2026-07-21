<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedRoles = [
            'admin', 
            'wakasek_kurikulum', 
            'wakasek_kesiswaan', 
            'wakasek_sarana', 
            'kepala_lab', 
            'kepala_perpustakaan', 
            'kepala_tata_usaha', 
            'operator',
            'teacher'
        ];

        if (!Auth::check() || !Auth::user()->hasAnyRole($allowedRoles)) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Anda tidak memiliki hak akses sebagai administrator.',
            ]);
        }

        return $next($request);
    }
}
