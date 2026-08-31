import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  evaluateAndApplyAppIcon,
  scheduleBackgroundAlarms,
  syncCurrentIconFromNative,
} from '../utils/appIconManager';
import { getAppIconSchedule } from '../utils/appIconStorage';

export const useDynamicAppIcon = () => {
  useEffect(() => {
    const syncScheduleAndIcon = () => {
      syncCurrentIconFromNative().finally(() => {
        evaluateAndApplyAppIcon();
        const { startDate, endDate } = getAppIconSchedule();
        if (startDate && endDate) {
          scheduleBackgroundAlarms(startDate, endDate);
        }
      });
    };

    // 1. App Launch check: sync current native icon state and background alarms
    syncScheduleAndIcon();

    // 2. Background-to-Foreground AppState listener check
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          syncScheduleAndIcon();
        }
      }
    );

    // 3. Global periodic evaluation timer (runs every 1s at root level across all screens/tabs)
    // Ensures immediate real-time icon evaluation when schedule boundaries cross (e.g. 1-minute promo start/end)
    const timer = setInterval(() => {
      evaluateAndApplyAppIcon();
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, []);
};
