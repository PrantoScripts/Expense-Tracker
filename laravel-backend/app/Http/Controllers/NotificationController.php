<?php

namespace App\Http\Controllers;

use App\Models\SystemNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display list of notifications belonging to authenticated user.
     */
    public function index(Request $request)
    {
        $notifications = SystemNotification::where('userId', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($notifications, 200);
    }

    /**
     * Mark all notifications of current user as read.
     */
    public function markAllRead(Request $request)
    {
        SystemNotification::where('userId', $request->user()->id)
            ->update(['read' => true]);

        return response()->json(['success' => true], 200);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markSingleRead(Request $request, $id)
    {
        $notification = SystemNotification::where('id', $id)
            ->where('userId', $request->user()->id)
            ->first();

        if ($notification) {
            $notification->read = true;
            $notification->save();
        }

        return response()->json(['success' => true], 200);
    }
}
