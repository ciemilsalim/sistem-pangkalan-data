<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Display a listing of academic calendar events.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        
        $query = Calendar::query();
        
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $calendars = $query->orderBy('start_date', 'desc')
                           ->paginate(10)
                           ->withQueryString();

        return Inertia::render('Calendars/Index', [
            'calendars' => $calendars,
            'filters' => [
                'search' => $search
            ],
            'flash' => [
                'message' => session('message'),
            ]
        ]);
    }

    /**
     * Store a newly created academic event in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_holiday' => 'required|boolean',
            'is_self_study' => 'required|boolean',
        ]);

        Calendar::create([
            'title' => $request->title,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description,
            'is_holiday' => $request->is_holiday,
            'is_self_study' => $request->is_self_study,
        ]);

        return redirect()->route('calendars.index')->with('message', 'Agenda Kalender Akademik berhasil ditambahkan.');
    }

    /**
     * Update the specified academic event in storage.
     */
    public function update(Request $request, Calendar $calendar): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_holiday' => 'required|boolean',
            'is_self_study' => 'required|boolean',
        ]);

        $calendar->update([
            'title' => $request->title,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description,
            'is_holiday' => $request->is_holiday,
            'is_self_study' => $request->is_self_study,
        ]);

        return redirect()->route('calendars.index')->with('message', 'Agenda Kalender Akademik berhasil diperbarui.');
    }

    /**
     * Remove the specified academic event from storage.
     */
    public function destroy(Calendar $calendar): RedirectResponse
    {
        $calendar->delete();

        return redirect()->route('calendars.index')->with('message', 'Agenda Kalender Akademik berhasil dihapus.');
    }
}
