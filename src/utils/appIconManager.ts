import { NativeModules, Platform } from 'react-native';
import { getAppIconSchedule } from './appIconStorage';

export type AppIconName = 'default' | 'promotional';

export type ScheduleStatus =
  | 'ACTIVE'
  | 'UPCOMING'
  | 'EXPIRED'
  | 'NOT_CONFIGURED'
  | 'INVALID';

/**
 * Module-level tracking of the last icon we successfully applied via native API.
 * This prevents redundant native calls that cause:
 *  - iOS: Repeated system "You have changed the icon" dialogs
 *  - Android: Unnecessary component toggles that can crash/restart the app
 */
let lastAppliedIcon: AppIconName | null = null;

/**
 * Pure evaluation function for icon calculation based on start date, end date, and current time.
 */
export const evaluateAppIcon = (
  startDateStr: string | null,
  endDateStr: string | null,
  now: Date = new Date()
): AppIconName => {
  if (!startDateStr || !endDateStr) {
    return 'default';
  }

  const startMs = Date.parse(startDateStr);
  const endMs = Date.parse(endDateStr);

  if (isNaN(startMs) || isNaN(endMs)) {
    return 'default';
  }

  if (startMs > endMs) {
    return 'default';
  }

  const currentMs = now.getTime();

  if (currentMs >= startMs && currentMs <= endMs) {
    return 'promotional';
  }

  return 'default';
};

/**
 * Computes status indicator for UI display.
 */
export const getScheduleStatus = (
  startDateStr: string | null,
  endDateStr: string | null,
  now: Date = new Date()
): ScheduleStatus => {
  if (!startDateStr || !endDateStr) {
    return 'NOT_CONFIGURED';
  }

  const startMs = Date.parse(startDateStr);
  const endMs = Date.parse(endDateStr);

  if (isNaN(startMs) || isNaN(endMs) || startMs > endMs) {
    return 'INVALID';
  }

  const currentMs = now.getTime();

  if (currentMs < startMs) {
    return 'UPCOMING';
  } else if (currentMs >= startMs && currentMs <= endMs) {
    return 'ACTIVE';
  } else {
    return 'EXPIRED';
  }
};

/**
 * Applies native app icon change ONLY if the target icon differs from what's currently applied.
 *
 * @param targetIcon - The icon to switch to ('default' or 'promotional')
 * @param force - If true, bypasses the JS-side cache and always calls native.
 *                Use this when the user explicitly triggers an icon change (Save/Clear/Preset).
 *
 * Platform behavior:
 * - iOS: Uses react-native-dynamic-app-icon (setAlternateIconName). iOS ALWAYS shows a
 *   system confirmation alert when the icon changes — this cannot be suppressed.
 *   We minimize alerts by only calling when the icon actually needs to change.
 * - Android: Uses our custom RNDynamicAppIcon native module (activity-alias toggling).
 *   The native module has its own guard, but we also guard at JS level for safety.
 */
export const applyNativeAppIcon = (targetIcon: AppIconName, force: boolean = false): void => {
  // JS-side guard: skip if we've already applied this icon
  if (!force && lastAppliedIcon === targetIcon) {
    return;
  }

  try {
    if (Platform.OS === 'android') {
      const { RNDynamicAppIcon } = NativeModules;
      if (RNDynamicAppIcon && typeof RNDynamicAppIcon.setAppIcon === 'function') {
        RNDynamicAppIcon.setAppIcon(targetIcon);
        lastAppliedIcon = targetIcon;
      } else {
        console.warn('[AppIcon] RNDynamicAppIcon native module not found on Android');
      }
    } else if (Platform.OS === 'ios') {
      // The react-native-dynamic-app-icon package exports RNDynamicAppIcon with setAppIcon(name)
      // Pass the icon key for alternate icons, or null to revert to default
      const { RNDynamicAppIcon } = NativeModules;
      if (RNDynamicAppIcon && typeof RNDynamicAppIcon.setAppIcon === 'function') {
        RNDynamicAppIcon.setAppIcon(targetIcon === 'promotional' ? 'promotional' : null);
        lastAppliedIcon = targetIcon;
      } else {
        console.warn('[AppIcon] RNDynamicAppIcon native module not found on iOS');
      }
    }
  } catch (error) {
    console.error('[AppIcon] Failed to change native app icon:', error);
  }
};


/**
 * Queries the native platform for the currently active icon and syncs our JS cache.
 * On iOS, this queries UIApplication.shared.alternateIconName.
 * On Android, this queries PackageManager for the enabled alias.
 */
export const syncCurrentIconFromNative = (): Promise<AppIconName> => {
  return new Promise((resolve) => {
    try {
      const { RNDynamicAppIcon } = NativeModules;
      if (RNDynamicAppIcon && typeof RNDynamicAppIcon.getIconName === 'function') {
        RNDynamicAppIcon.getIconName((response: { iconName?: string }) => {
          const current = response?.iconName === 'promotional' ? 'promotional' : 'default';
          lastAppliedIcon = current;
          resolve(current);
        });
      } else {
        resolve(lastAppliedIcon ?? 'default');
      }
    } catch {
      resolve(lastAppliedIcon ?? 'default');
    }
  });
};

// Seed current icon state immediately on JS bundle evaluation
syncCurrentIconFromNative();

/**
 * Schedules exact native background alarms on Android so the icon switches
 * at the exact scheduled moment even if the app is closed or minimized.
 *
 * @param startDateIso ISO 8601 start date string (parsed to UTC epoch ms)
 * @param endDateIso ISO 8601 end date string (parsed to UTC epoch ms)
 */
export const scheduleBackgroundAlarms = (
  startDateIso: string | null,
  endDateIso: string | null
): void => {
  if (Platform.OS !== 'android') {
    return;
  }
  if (!startDateIso || !endDateIso) {
    cancelBackgroundAlarms();
    return;
  }

  const startMs = Date.parse(startDateIso);
  const endMs = Date.parse(endDateIso);

  if (isNaN(startMs) || isNaN(endMs) || startMs > endMs) {
    return;
  }

  try {
    const { RNDynamicAppIcon } = NativeModules;
    if (
      RNDynamicAppIcon &&
      typeof RNDynamicAppIcon.scheduleIconAlarms === 'function'
    ) {
      RNDynamicAppIcon.scheduleIconAlarms(startMs, endMs);
      console.log(
        `[AppIcon] Scheduled background alarms for startMs=${startMs}, endMs=${endMs}`
      );
    }
  } catch (error) {
    console.error('[AppIcon] Failed to schedule background alarms:', error);
  }
};

/**
 * Cancels pending native background alarms on Android.
 */
export const cancelBackgroundAlarms = (): void => {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    const { RNDynamicAppIcon } = NativeModules;
    if (
      RNDynamicAppIcon &&
      typeof RNDynamicAppIcon.cancelIconAlarms === 'function'
    ) {
      RNDynamicAppIcon.cancelIconAlarms();
      console.log('[AppIcon] Cancelled native background alarms');
    }
  } catch (error) {
    console.error('[AppIcon] Failed to cancel background alarms:', error);
  }
};

/**
 * Reads MMKV schedule, evaluates current target icon, and applies it if needed.
 *
 * @param force - Pass true when the user explicitly triggers a change (Save/Clear/Preset)
 *                to bypass the JS-side dedup guard.
 */
export const evaluateAndApplyAppIcon = (force: boolean = false): AppIconName => {
  const { startDate, endDate } = getAppIconSchedule();
  const targetIcon = evaluateAppIcon(startDate, endDate);
  applyNativeAppIcon(targetIcon, force);
  return targetIcon;
};

/**
 * Evaluate schedule status for UI display only — does NOT trigger any native icon change.
 * Use this for periodic UI refresh (status badges, etc.)
 */
export const evaluateScheduleForUI = (): {
  icon: AppIconName;
  status: ScheduleStatus;
  startDate: string | null;
  endDate: string | null;
} => {
  const { startDate, endDate } = getAppIconSchedule();
  const icon = evaluateAppIcon(startDate, endDate);
  const status = getScheduleStatus(startDate, endDate);
  return { icon, status, startDate, endDate };
};

/**
 * Resets the JS-side icon tracking cache.
 * Call this when the user explicitly clears the schedule so the next
 * evaluateAndApplyAppIcon call will always call native even if target is 'default'.
 */
export const resetIconTrackingCache = (): void => {
  lastAppliedIcon = null;
};

/**
 * Format a Date or ISO string into human readable string: e.g. "01-Dec-2026 12:00 AM"
 */
export const formatDisplayDate = (
  dateOrIsoStr: Date | string | null
): string => {
  if (!dateOrIsoStr) return 'Not set';
  const d =
    typeof dateOrIsoStr === 'string' ? new Date(dateOrIsoStr) : dateOrIsoStr;
  if (isNaN(d.getTime())) return 'Invalid date';

  const day = String(d.getDate()).padStart(2, '0');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${strHours}:${minutes} ${ampm}`;
};

