<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Conversation::with(['parent.user', 'teacher.user', 'student']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('parent', function($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('teacher', function($tq) use ($search) {
                    $tq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('student', function($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                });
            });
        }

        $conversations = $query->get()->map(function ($conv) {
            $lastMessage = Message::where('conversation_id', $conv->id)
                ->latest()
                ->first();

            $totalMessages = Message::where('conversation_id', $conv->id)->count();

            return [
                'id' => $conv->id,
                'parent' => $conv->parent,
                'teacher' => $conv->teacher,
                'student' => $conv->student,
                'total_messages' => $totalMessages,
                'last_message' => $lastMessage ? [
                    'body' => $lastMessage->body,
                    'created_at' => $lastMessage->created_at->toISOString(),
                ] : null,
                'last_message_time' => $lastMessage ? $lastMessage->created_at : $conv->updated_at,
            ];
        })
        ->sortByDesc('last_message_time')
        ->values();

        return Inertia::render('Chat/Monitoring', [
            'conversations' => $conversations,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function show(Conversation $conversation)
    {
        $conversation->load(['parent.user', 'teacher.user', 'student']);

        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($msg) {
                return [
                    'id' => $msg->id,
                    'user_id' => $msg->user_id,
                    'body' => $msg->body,
                    'created_at' => $msg->created_at->toISOString(),
                ];
            });

        return Inertia::render('Chat/MonitoringDetail', [
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function destroyMessage(Message $message)
    {
        $conversationId = $message->conversation_id;
        $message->delete();

        return redirect()->route('monitoring.chats.show', $conversationId)
            ->with('success', 'Pesan berhasil dihapus.');
    }

    public function destroyConversation(Conversation $conversation)
    {
        // Delete all messages in the conversation first
        $conversation->messages()->delete();
        $conversation->delete();

        return redirect()->route('monitoring.chats.index')
            ->with('success', 'Percakapan berhasil dihapus.');
    }
}
