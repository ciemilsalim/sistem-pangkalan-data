<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'activeSemesterId' => session('active_semester_id') ?? \App\Models\Semester::where('is_active', true)->value('id'),
            'semestersList' => \App\Models\Semester::with('academicYear')->orderByDesc('id')->get()->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'academic_year' => $s->academicYear ? $s->academicYear->name : '',
                    'is_active' => $s->is_active
                ];
            }),
        ];
    }
}
