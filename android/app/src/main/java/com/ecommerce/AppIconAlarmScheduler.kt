package com.ecommerce

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

object AppIconAlarmScheduler {
    private const val TAG = "AppIconAlarmScheduler"

    private const val PREFS_NAME = "ecommerce_app_icon_prefs"
    private const val KEY_START_MS = "key_start_ms"
    private const val KEY_END_MS = "key_end_ms"

    const val EXTRA_TARGET_ICON = "extra_target_icon"
    private const val REQUEST_CODE_START = 2001
    private const val REQUEST_CODE_END = 2002

    fun schedule(context: Context, startMs: Long, endMs: Long) {
        // 1. Save schedule to SharedPreferences for BootReceiver persistence
        saveScheduleToPrefs(context, startMs, endMs)

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
        if (alarmManager == null) {
            Log.e(TAG, "AlarmManager service not available")
            return
        }

        val now = System.currentTimeMillis()
        Log.d(TAG, "Scheduling alarms: now=$now, start=$startMs, end=$endMs")

        // 2. Schedule Start Alarm (switch to promotional icon)
        if (startMs > now) {
            val startIntent = Intent(context, AppIconAlarmReceiver::class.java).apply {
                putExtra(EXTRA_TARGET_ICON, AppIconHelper.ICON_PROMOTIONAL)
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE_START,
                startIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            scheduleExact(alarmManager, startMs, pendingIntent)
            Log.d(TAG, "Scheduled START alarm for $startMs (in ${(startMs - now) / 1000}s)")
        }

        // 3. Schedule End Alarm (switch back to default icon)
        if (endMs > now) {
            val endIntent = Intent(context, AppIconAlarmReceiver::class.java).apply {
                putExtra(EXTRA_TARGET_ICON, AppIconHelper.ICON_DEFAULT)
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE_END,
                endIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            scheduleExact(alarmManager, endMs, pendingIntent)
            Log.d(TAG, "Scheduled END alarm for $endMs (in ${(endMs - now) / 1000}s)")
        }

        // 4. If current time is ALREADY in the promo window, ensure icon is promotional immediately
        if (now in startMs..endMs) {
            Log.d(TAG, "Current time is within promotional window. Applying promotional icon immediately.")
            AppIconHelper.applyIcon(context, AppIconHelper.ICON_PROMOTIONAL)
        } else if (now > endMs) {
            Log.d(TAG, "Promotion has already ended. Applying default icon.")
            AppIconHelper.applyIcon(context, AppIconHelper.ICON_DEFAULT)
        }
    }

    fun cancel(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

        if (alarmManager != null) {
            // Cancel Start Alarm
            val startIntent = Intent(context, AppIconAlarmReceiver::class.java)
            val startPending = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE_START,
                startIntent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (startPending != null) {
                alarmManager.cancel(startPending)
                startPending.cancel()
            }

            // Cancel End Alarm
            val endIntent = Intent(context, AppIconAlarmReceiver::class.java)
            val endPending = PendingIntent.getBroadcast(
                context,
                REQUEST_CODE_END,
                endIntent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (endPending != null) {
                alarmManager.cancel(endPending)
                endPending.cancel()
            }
            Log.d(TAG, "Cancelled all pending app icon alarms")
        }

        clearScheduleFromPrefs(context)
    }

    fun rescheduleFromPrefs(context: Context) {
        val (startMs, endMs) = getScheduleFromPrefs(context)
        if (startMs > 0 && endMs > 0 && endMs >= startMs) {
            Log.d(TAG, "rescheduleFromPrefs: Restoring schedule after boot/update")
            schedule(context, startMs, endMs)
        } else {
            Log.d(TAG, "rescheduleFromPrefs: No valid schedule saved in prefs")
        }
    }

    private fun scheduleExact(alarmManager: AlarmManager, triggerAtMs: Long, pendingIntent: PendingIntent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pendingIntent)
                } else {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pendingIntent)
                }
            } else {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pendingIntent)
            }
        } catch (e: SecurityException) {
            Log.w(TAG, "SecurityException while scheduling exact alarm, falling back to setAndAllowWhileIdle", e)
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pendingIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to schedule alarm at $triggerAtMs", e)
        }
    }

    private fun saveScheduleToPrefs(context: Context, startMs: Long, endMs: Long) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putLong(KEY_START_MS, startMs)
            .putLong(KEY_END_MS, endMs)
            .apply()
    }

    private fun clearScheduleFromPrefs(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }

    private fun getScheduleFromPrefs(context: Context): Pair<Long, Long> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val start = prefs.getLong(KEY_START_MS, 0L)
        val end = prefs.getLong(KEY_END_MS, 0L)
        return Pair(start, end)
    }
}
