<?php

namespace App\Http\Controllers;

use App\Models\AdminConversation;
use App\Models\AdminMessage;
use App\Models\ParentModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminChatController extends Controller
{
    public function index($selectedParentId = null)
    {
        $adminId = Auth::id();

        // 1. Pastikan setiap orang tua memiliki baris AdminConversation dengan admin aktif ini
        $existingParentIds = AdminConversation::where('admin_id', $adminId)->pluck('parent_id')->toArray();
        $allParents = ParentModel::all();
        $missingParentIds = $allParents->pluck('id')->diff($existingParentIds);

        if ($missingParentIds->isNotEmpty()) {
            $insertData = [];
            foreach ($missingParentIds as $parentId) {
                $insertData[] = [
                    'parent_id' => $parentId,
                    'admin_id' => $adminId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            AdminConversation::insert($insertData);
        }

        // 2. Muat semua percakapan dengan relasi parent.user
        $conversations = AdminConversation::with(['parent.user'])
            ->where('admin_id', $adminId)
            ->get()
            ->map(function ($conv) use ($adminId) {
                // Ambil pesan terakhir
                $lastMessage = AdminMessage::where('admin_conversation_id', $conv->id)
                    ->latest()
                    ->first();

                // Hitung pesan unread dari ortu (user_id != adminId)
                $unreadCount = AdminMessage::where('admin_conversation_id', $conv->id)
                    ->where('user_id', '!=', $adminId)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id' => $conv->id,
                    'parent_id' => $conv->parent_id,
                    'parent' => $conv->parent,
                    'last_message' => $lastMessage ? [
                        'body' => $lastMessage->body,
                        'created_at' => $lastMessage->created_at->toISOString(),
                    ] : null,
                    'unread_count' => $unreadCount,
                    'last_message_time' => $lastMessage ? $lastMessage->created_at : $conv->updated_at,
                ];
            })
            ->sortByDesc('last_message_time')
            ->values();

        // 3. Muat detail percakapan jika ada parent yang dipilih
        $activeConversation = null;
        $messages = [];

        if ($selectedParentId) {
            $activeConversation = AdminConversation::with(['parent.user'])
                ->where('admin_id', $adminId)
                ->where('parent_id', $selectedParentId)
                ->first();

            if ($activeConversation) {
                // Tandai pesan dari orang tua sebagai sudah dibaca
                AdminMessage::where('admin_conversation_id', $activeConversation->id)
                    ->where('user_id', '!=', $adminId)
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);

                // Ambil semua pesan
                $messages = AdminMessage::where('admin_conversation_id', $activeConversation->id)
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function($msg) {
                        return [
                            'id' => $msg->id,
                            'user_id' => $msg->user_id,
                            'body' => $msg->body,
                            'read_at' => $msg->read_at ? $msg->read_at->toISOString() : null,
                            'created_at' => $msg->created_at->toISOString(),
                        ];
                    });
            }
        }

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'selectedParentId' => $selectedParentId ? (int)$selectedParentId : null,
            'activeConversation' => $activeConversation,
            'messages' => $messages,
        ]);
    }

    public function storeMessage(Request $request, AdminConversation $conversation)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        return redirect()->route('chat.index', ['selectedParent' => $conversation->parent_id]);
    }
}
