<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Announcement::with('user');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
        }

        $announcements = $query->orderBy('published_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'banner' => 'nullable|image|max:2048', // max 2MB
            'published_at' => 'required|date',
        ]);

        $bannerPath = null;
        if ($request->hasFile('banner')) {
            $bannerPath = $request->file('banner')->store('announcements', 'public');
        }

        Announcement::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'content' => $request->content,
            'banner' => $bannerPath,
            'published_at' => $request->published_at,
        ]);

        return redirect()->route('announcements.index')->with('message', 'Pengumuman berhasil diterbitkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'banner' => 'nullable|image|max:2048', // max 2MB
            'published_at' => 'required|date',
        ]);

        $bannerPath = $announcement->banner;

        if ($request->hasFile('banner')) {
            // Delete old banner if exists
            if ($announcement->banner) {
                Storage::disk('public')->delete($announcement->banner);
            }
            $bannerPath = $request->file('banner')->store('announcements', 'public');
        }

        $announcement->update([
            'title' => $request->title,
            'content' => $request->content,
            'banner' => $bannerPath,
            'published_at' => $request->published_at,
        ]);

        return redirect()->route('announcements.index')->with('message', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement): RedirectResponse
    {
        // Delete banner image if exists
        if ($announcement->banner) {
            Storage::disk('public')->delete($announcement->banner);
        }

        $announcement->delete();

        return redirect()->route('announcements.index')->with('message', 'Pengumuman berhasil dihapus.');
    }
}
