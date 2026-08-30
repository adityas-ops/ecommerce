package com.ecommerce

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DynamicAppIconModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    companion object {
        private const val TAG = "DynamicAppIcon"
    }

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "RNDynamicAppIcon"
    }

    override fun onHostResume() {
        // Defensive check: ensure no stuck ghost/duplicate aliases exist on Samsung / other launchers
        AppIconHelper.cleanGhostAliases(reactApplicationContext)
    }

    override fun onHostPause() {
        // No-op
    }

    override fun onHostDestroy() {
        // No-op
    }

    @ReactMethod
    fun setAppIcon(name: String?) {
        Log.d(TAG, "setAppIcon called with name: $name")
        AppIconHelper.applyIcon(reactApplicationContext, name)
    }

    @ReactMethod
    fun scheduleIconAlarms(startDateMs: Double, endDateMs: Double) {
        val startLong = startDateMs.toLong()
        val endLong = endDateMs.toLong()
        Log.d(TAG, "scheduleIconAlarms called with start=$startLong, end=$endLong")
        AppIconAlarmScheduler.schedule(reactApplicationContext, startLong, endLong)
    }

    @ReactMethod
    fun cancelIconAlarms() {
        Log.d(TAG, "cancelIconAlarms called")
        AppIconAlarmScheduler.cancel(reactApplicationContext)
    }

    @ReactMethod
    fun supportsDynamicAppIcon(promise: Promise) {
        promise.resolve(true)
    }

    @ReactMethod
    fun getIconName(callback: Callback) {
        val activeIcon = AppIconHelper.getCurrentIconName(reactApplicationContext)
        val map = Arguments.createMap()
        map.putString("iconName", activeIcon)
        callback.invoke(map)
    }
}
