package com.ecommerce

import android.content.ComponentName
import android.content.pm.PackageManager
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

    private var pendingDisableComponent: ComponentName? = null

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "RNDynamicAppIcon"
    }

    private fun isPromoEnabled(pm: PackageManager, promoComponent: ComponentName): Boolean {
        val state = pm.getComponentEnabledSetting(promoComponent)
        return state == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
    }

    override fun onHostResume() {
        // DEFENSIVE SWEEPER: When the user returns to the app, verify if One UI 
        // failed to process the background disable flag and left a duplicate icon.
        cleanGhostAliases()
    }

    override fun onHostPause() {
        flushPendingDisable()
    }

    override fun onHostDestroy() {
        flushPendingDisable()
    }

    /**
     * Loops through all known components to ensure that if a Samsung launcher cache glitch 
     * happened, the inactive alias is aggressively disabled.
     */
    private fun cleanGhostAliases() {
        try {
            val context = reactApplicationContext
            val packageName = context.packageName
            val pm = context.packageManager

            val defaultComponent = ComponentName(packageName, "$packageName.MainActivityDefault")
            val promoComponent = ComponentName(packageName, "$packageName.MainActivityPromotional")

            // Determine what the ground-truth target should be based on current state
            val currentIsPromo = isPromoEnabled(pm, promoComponent)
            
            // If nothing is pending, double-check that the unused one is strictly shut down
            if (pendingDisableComponent == null) {
                val componentToDisable = if (currentIsPromo) defaultComponent else promoComponent
                val state = pm.getComponentEnabledSetting(componentToDisable)
                
                if (state != PackageManager.COMPONENT_ENABLED_STATE_DISABLED) {
                    pm.setComponentEnabledSetting(
                        componentToDisable,
                        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                        PackageManager.DONT_KILL_APP
                    )
                    Log.w(TAG, "cleanGhostAliases: Cleared a stuck duplicate alias: ${componentToDisable.shortClassName}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed during defensive ghost alias cleanup loop", e)
        }
    }

    private fun flushPendingDisable() {
        val component = pendingDisableComponent ?: return
        pendingDisableComponent = null
        try {
            val pm = reactApplicationContext.packageManager
            pm.setComponentEnabledSetting(
                component,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
            Log.d(TAG, "onHostPause: disabled old alias ${component.shortClassName}")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to disable old alias", e)
        }
    }

    @ReactMethod
    fun setAppIcon(name: String?) {
        val context = reactApplicationContext
        val packageName = context.packageName
        val pm = context.packageManager

        val defaultComponent = ComponentName(packageName, "$packageName.MainActivityDefault")
        val promoComponent = ComponentName(packageName, "$packageName.MainActivityPromotional")

        val targetIsPromo = name != null && name.equals("promotional", ignoreCase = true)
        val componentToEnable = if (targetIsPromo) promoComponent else defaultComponent
        val componentToDisable = if (targetIsPromo) defaultComponent else promoComponent

        val currentIsPromo = isPromoEnabled(pm, promoComponent)

        if (currentIsPromo == targetIsPromo && pendingDisableComponent == null) {
            Log.d(TAG, "setAppIcon: already in desired state ($name), skipping")
            return
        }

        Log.d(TAG, "setAppIcon: switching to $name (currentIsPromo=$currentIsPromo, targetIsPromo=$targetIsPromo)")

        // 1. IMMEDIATELY enable the new alias.
        pm.setComponentEnabledSetting(
            componentToEnable,
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
        )
        Log.d(TAG, "setAppIcon: enabled ${componentToEnable.shortClassName}")

        // 2. Handle disabling the old alias
        val activity = reactApplicationContext.currentActivity
        if (activity != null && !activity.isFinishing) {
            pendingDisableComponent = componentToDisable
            Log.d(TAG, "setAppIcon: deferred disable of ${componentToDisable.shortClassName} to onHostPause")
        } else {
            pm.setComponentEnabledSetting(
                componentToDisable,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
            pendingDisableComponent = null
            Log.d(TAG, "setAppIcon: immediately disabled ${componentToDisable.shortClassName}")
        }
    }

    @ReactMethod
    fun supportsDynamicAppIcon(promise: Promise) {
        promise.resolve(true)
    }

    @ReactMethod
    fun getIconName(callback: Callback) {
        val context = reactApplicationContext
        val packageName = context.packageName
        val pm = context.packageManager

        val promoComponent = ComponentName(packageName, "$packageName.MainActivityPromotional")
        val activeIcon = if (isPromoEnabled(pm, promoComponent)) "promotional" else "default"

        val map = Arguments.createMap()
        map.putString("iconName", activeIcon)
        callback.invoke(map)
    }
}
