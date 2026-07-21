<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the settings dashboard.
     */
    public function index(): Response
    {
        // Pluck key-value pairs from settings table
        $settings = Setting::pluck('value', 'key')->all();

        // Ensure default keys exist in the array so React doesn't complain about undefined values
        $defaultKeys = [
            'school_name' => '',
            'school_address' => '',
            'school_headmaster_name' => '',
            'school_headmaster_nip' => '',
            'jam_masuk' => '07:00',
            'jam_pulang' => '13:00',
            'jam_masuk_guru' => '07:00',
            'jam_pulang_guru' => '16:00',
            'school_latitude' => '0.0',
            'school_longitude' => '0.0',
            'school_radius' => '100',
            'send_absent_notification' => 'off',
            'dark_mode' => 'off',
            'school_logo' => '',
            'google_education_logo' => '',
        ];

        $settings = array_merge($defaultKeys, $settings);

        // Add logo URL if logo exists
        $settings['school_logo_url'] = $settings['school_logo'] 
            ? asset('storage/' . $settings['school_logo']) 
            : null;

        $settings['google_education_logo_url'] = $settings['google_education_logo'] 
            ? asset('storage/' . $settings['google_education_logo']) 
            : null;

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'flash' => [
                'message' => session('message'),
            ]
        ]);
    }

    /**
     * Update all settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'school_address' => 'required|string',
            'school_headmaster_name' => 'nullable|string|max:255',
            'school_headmaster_nip' => 'nullable|string|max:100',
            'jam_masuk' => 'required|string|max:5', // HH:MM format
            'jam_pulang' => 'required|string|max:5',
            'jam_masuk_guru' => 'required|string|max:5',
            'jam_pulang_guru' => 'required|string|max:5',
            'school_latitude' => 'required|numeric',
            'school_longitude' => 'required|numeric',
            'school_radius' => 'required|integer|min:10',
            'send_absent_notification' => 'required|string|in:on,off',
            'dark_mode' => 'required|string|in:on,off',
            'school_logo' => 'nullable|image|max:2048',
            'google_education_logo' => 'nullable|image|max:2048',
        ]);

        $settingsData = $request->only([
            'school_name',
            'school_address',
            'school_headmaster_name',
            'school_headmaster_nip',
            'jam_masuk',
            'jam_pulang',
            'jam_masuk_guru',
            'jam_pulang_guru',
            'school_latitude',
            'school_longitude',
            'school_radius',
            'send_absent_notification',
            'dark_mode',
        ]);

        // Also update attendance_radius key to match school_radius for backward compatibility
        $settingsData['attendance_radius'] = $settingsData['school_radius'];

        foreach ($settingsData as $key => $value) {
            // Treat null values as empty strings
            $value = $value ?? '';
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Handle Google Education logo upload
        if ($request->hasFile('google_education_logo')) {
            $oldGoogleLogo = Setting::where('key', 'google_education_logo')->value('value');
            if ($oldGoogleLogo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldGoogleLogo);
            }
            
            $googleLogoPath = $request->file('google_education_logo')->store('school_logos', 'public');
            Setting::updateOrCreate(
                ['key' => 'google_education_logo'],
                ['value' => $googleLogoPath]
            );
        }

        // Handle school logo upload
        if ($request->hasFile('school_logo')) {
            $oldLogo = Setting::where('key', 'school_logo')->value('value');
            if ($oldLogo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldLogo);
            }
            
            $logoPath = $request->file('school_logo')->store('school_logos', 'public');
            Setting::updateOrCreate(
                ['key' => 'school_logo'],
                ['value' => $logoPath]
            );
        }

        return redirect()->route('settings.index')->with('message', 'Pengaturan aplikasi berhasil disimpan.');
    }
}
