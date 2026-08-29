import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  evaluateAndApplyAppIcon,
  syncCurrentIconFromNative,
} from '../utils/appIconManager';

export const useDynamicAppIcon = () => {
  useEffect(() => {
    // 1. App Launch check: sync current native icon state first to prevent duplicate alerts
    syncCurrentIconFromNative().finally(() => {
      evaluateAndApplyAppIcon();
    });

    // 2. Background-to-Foreground AppState listener check
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          syncCurrentIconFromNative().finally(() => {
            evaluateAndApplyAppIcon();
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
};
