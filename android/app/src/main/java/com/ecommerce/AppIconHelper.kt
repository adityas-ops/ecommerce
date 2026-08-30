package com.ecommerce

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log

object AppIconHelper {
    private const val TAG = "AppIconHelper"

    const val ICON_DEFAULT = "default"
    const val ICON_PROMOTIONAL = "promotional"

    fun getComponents(context: Context): Pair<ComponentName, ComponentName> {
        val packageName = context.packageName
        val defaultComponent = ComponentName(packageName, "$packageName.MainActivityDefault")
        val promoComponent = ComponentName(packageName, "$packageName.MainActivityPromotional")
        return Pair(defaultComponent, promoComponent)
    }

    /**
     * Safely applies the target icon using atomic settings on Android 13+ (API 33+)
     * to eliminate Samsung One UI duplicate launcher icons.
     *
     * Returns true if a state change was applied or already correct, false on error.
     */
    fun applyIcon(context: Context, name: String?): Boolean {
        try {
            val pm = context.packageManager
            val (defaultComponent, promoComponent) = getComponents(context)

            val targetIsPromo = name != null && name.equals(ICON_PROMOTIONAL, ignoreCase = true)
            val componentToEnable = if (targetIsPromo) promoComponent else defaultComponent
            val componentToDisable = if (targetIsPromo) defaultComponent else promoComponent

            val promoState = pm.getComponentEnabledSetting(promoComponent)
            val defaultState = pm.getComponentEnabledSetting(defaultComponent)

            val currentIsPromo = promoState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
            val currentIsDefault = (defaultState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED ||
                    (defaultState == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && promoState != PackageManager.COMPONENT_ENABLED_STATE_ENABLED))

            // If already in target state and the other component is strictly disabled, no change needed
            if (targetIsPromo && currentIsPromo && defaultState == PackageManager.COMPONENT_ENABLED_STATE_DISABLED) {
                Log.d(TAG, "applyIcon: already in promotional state, skipping")
                return true
            }
            if (!targetIsPromo && currentIsDefault && promoState == PackageManager.COMPONENT_ENABLED_STATE_DISABLED) {
                Log.d(TAG, "applyIcon: already in default state, skipping")
                return true
            }

            Log.d(TAG, "applyIcon: switching to ${if (targetIsPromo) ICON_PROMOTIONAL else ICON_DEFAULT}")

            // On Android 13+ (API 33+), setComponentEnabledSettings performs atomic batch update.
            // This prevents Samsung launcher from seeing both aliases enabled at the same time.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val disableSetting = PackageManager.ComponentEnabledSetting(
                    componentToDisable,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                )
                val enableSetting = PackageManager.ComponentEnabledSetting(
                    componentToEnable,
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
                )
                pm.setComponentEnabledSettings(listOf(disableSetting, enableSetting))
                Log.d(TAG, "applyIcon: atomic batch update applied successfully (API >= 33)")
            } else {
                // For older Android versions: disable old first, then enable new with DONT_KILL_APP
                pm.setComponentEnabledSetting(
                    componentToDisable,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                )
                pm.setComponentEnabledSetting(
                    componentToEnable,
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
                )
                Log.d(TAG, "applyIcon: sequential update applied (disable old -> enable new)")
            }

            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to apply icon: $name", e)
            return false
        }
    }

    /**
     * Defensive sweeper: cleans up any stuck ghost/duplicate alias if One UI or another launcher
     * left both enabled.
     */
    fun cleanGhostAliases(context: Context) {
        try {
            val pm = context.packageManager
            val (defaultComponent, promoComponent) = getComponents(context)

            val promoState = pm.getComponentEnabledSetting(promoComponent)
            val defaultState = pm.getComponentEnabledSetting(defaultComponent)

            val promoEnabled = promoState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
            val defaultEnabled = defaultState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED ||
                    (defaultState == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && !promoEnabled)

            // If BOTH are currently marked enabled, enforce only one is active
            if (promoEnabled && defaultEnabled) {
                Log.w(TAG, "cleanGhostAliases: Both aliases were detected enabled! Disabling default alias.")
                pm.setComponentEnabledSetting(
                    defaultComponent,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "cleanGhostAliases failed", e)
        }
    }

    fun getCurrentIconName(context: Context): String {
        return try {
            val pm = context.packageManager
            val (_, promoComponent) = getComponents(context)
            val promoState = pm.getComponentEnabledSetting(promoComponent)
            if (promoState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) {
                ICON_PROMOTIONAL
            } else {
                ICON_DEFAULT
            }
        } catch (e: Exception) {
            ICON_DEFAULT
        }
    }
}
