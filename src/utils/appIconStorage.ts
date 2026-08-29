import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'app-icon-storage' });

const KEYS = {
  START_DATE: 'app_icon_start_date',
  END_DATE: 'app_icon_end_date',
};

export interface AppIconSchedule {
  startDate: string | null;
  endDate: string | null;
}

export const getAppIconSchedule = (): AppIconSchedule => {
  try {
    const startDate = storage.getString(KEYS.START_DATE) ?? null;
    const endDate = storage.getString(KEYS.END_DATE) ?? null;
    return { startDate, endDate };
  } catch (error) {
    console.error('Error reading app icon schedule from MMKV:', error);
    return { startDate: null, endDate: null };
  }
};

export const setAppIconSchedule = (
  startDateIso: string,
  endDateIso: string
): void => {
  try {
    storage.set(KEYS.START_DATE, startDateIso);
    storage.set(KEYS.END_DATE, endDateIso);
  } catch (error) {
    console.error('Error saving app icon schedule to MMKV:', error);
  }
};

export const clearAppIconSchedule = (): void => {
  try {
    storage.remove(KEYS.START_DATE);
    storage.remove(KEYS.END_DATE);
  } catch (error) {
    console.error('Error clearing app icon schedule from MMKV:', error);
  }
};
