package com.ecommerce

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BroadcastReceiver triggered by AlarmManager even when the app is completely closed or killed.
 * Immediately applies the scheduled icon change in the background.
 */
class AppIconAlarmReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AppIconAlarmReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val targetIcon = intent.getStringExtra(AppIconAlarmScheduler.EXTRA_TARGET_ICON)
        Log.d(TAG, "onReceive: Background alarm triggered! Target icon = $targetIcon")

        if (!targetIcon.isNullOrEmpty()) {
            val success = AppIconHelper.applyIcon(context, targetIcon)
            AppIconHelper.cleanGhostAliases(context)
            Log.d(TAG, "onReceive: applyIcon completed. Success = $success")
        } else {
            Log.w(TAG, "onReceive: Triggered without EXTRA_TARGET_ICON")
        }
    }
}
