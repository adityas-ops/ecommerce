import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { clearUser } from '../../store/slices/userSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { clearCheckoutDetails } from '../../store/slices/checkoutSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigations/AppNav';
import colors from '../../theme/colors';
import {
  getAppIconSchedule,
  setAppIconSchedule,
  clearAppIconSchedule,
} from '../../utils/appIconStorage';
import {
  evaluateAndApplyAppIcon,
  getScheduleStatus,
  formatDisplayDate,
  resetIconTrackingCache,
  syncCurrentIconFromNative,
  AppIconName,
  ScheduleStatus,
} from '../../utils/appIconManager';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import DatePicker from 'react-native-date-picker';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Tabs'
>;

const Profile = () => {
  const user = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const [startDateObj, setStartDateObj] = useState<Date>(new Date());
  const [endDateObj, setEndDateObj] = useState<Date>(
    new Date(Date.now() + 60 * 1000),
  );

  const [activeIcon, setActiveIcon] = useState<AppIconName>('default');
  const [scheduleStatus, setScheduleStatus] =
    useState<ScheduleStatus>('NOT_CONFIGURED');
  const [savedStartDisplay, setSavedStartDisplay] = useState('Not set');
  const [savedEndDisplay, setSavedEndDisplay] = useState('Not set');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');

  // Periodic UI refresh: updates status badges and applies icon ONLY if target changed
  const refreshUI = useCallback(() => {
    const schedule = getAppIconSchedule();
    const icon = evaluateAndApplyAppIcon(); // Guarded: skips native if icon hasn't changed
    setActiveIcon(icon);

    const status = getScheduleStatus(schedule.startDate, schedule.endDate);
    setScheduleStatus(status);

    setSavedStartDisplay(formatDisplayDate(schedule.startDate));
    setSavedEndDisplay(formatDisplayDate(schedule.endDate));
  }, []);

  useEffect(() => {
    // Initial mount: query actual OS icon first, then evaluate schedule
    syncCurrentIconFromNative().finally(() => {
      const schedule = getAppIconSchedule();
      const icon = evaluateAndApplyAppIcon();
      setActiveIcon(icon);

      const status = getScheduleStatus(schedule.startDate, schedule.endDate);
      setScheduleStatus(status);

      setSavedStartDisplay(formatDisplayDate(schedule.startDate));
      setSavedEndDisplay(formatDisplayDate(schedule.endDate));

      if (schedule.startDate) {
        const parsedStart = new Date(schedule.startDate);
        if (!isNaN(parsedStart.getTime())) {
          setStartDateObj(parsedStart);
        }
      }
      if (schedule.endDate) {
        const parsedEnd = new Date(schedule.endDate);
        if (!isNaN(parsedEnd.getTime())) {
          setEndDateObj(parsedEnd);
        }
      }
    });

    // Auto-refresh status every 3 seconds to react smoothly when 1-minute promo expires
    const timer = setInterval(() => {
      refreshUI();
    }, 3000);
    return () => clearInterval(timer);
  }, [refreshUI]);

  const openDateTimePicker = (target: 'start' | 'end') => {
    setPickerTarget(target);
    setPickerModalVisible(true);
  };

  const handleSaveSchedule = () => {
    setErrorMessage(null);

    const startIso = startDateObj.toISOString();
    const endIso = endDateObj.toISOString();

    const startMs = startDateObj.getTime();
    const endMs = endDateObj.getTime();

    if (startMs > endMs) {
      setErrorMessage('Start Date/Time cannot be after End Date/Time.');
      Toast.show({
        type: 'error',
        text1: 'Start Date must be before End Date',
      });
      return;
    }

    setAppIconSchedule(startIso, endIso);
    const applied = evaluateAndApplyAppIcon(true);
    setActiveIcon(applied);
    setScheduleStatus(getScheduleStatus(startIso, endIso));
    setSavedStartDisplay(formatDisplayDate(startIso));
    setSavedEndDisplay(formatDisplayDate(endIso));

    Toast.show({
      type: 'success',
      text1: `Schedule Saved! Icon: ${
        applied === 'promotional' ? 'Promotional' : 'Default'
      }`,
    });
  };

  const handleClearSchedule = () => {
    clearAppIconSchedule();
    setErrorMessage(null);
    resetIconTrackingCache();
    const applied = evaluateAndApplyAppIcon(true);
    setActiveIcon(applied);
    setScheduleStatus('NOT_CONFIGURED');
    setSavedStartDisplay('Not set');
    setSavedEndDisplay('Not set');

    Toast.show({
      type: 'success',
      text1: 'Schedule cleared! Reverted to Default Icon.',
    });
  };

  const handlePreset1MinPromo = () => {
    const now = new Date();
    const oneMinLater = new Date(now.getTime() + 60 * 1000);

    setStartDateObj(now);
    setEndDateObj(oneMinLater);

    const startIso = now.toISOString();
    const endIso = oneMinLater.toISOString();

    setAppIconSchedule(startIso, endIso);
    const applied = evaluateAndApplyAppIcon(true);
    setActiveIcon(applied);
    setScheduleStatus(getScheduleStatus(startIso, endIso));
    setSavedStartDisplay(formatDisplayDate(startIso));
    setSavedEndDisplay(formatDisplayDate(endIso));

    Toast.show({
      type: 'success',
      text1: `1-Min Promo Active! Icon: ${
        applied === 'promotional' ? 'Promotional' : 'Default'
      }`,
    });
  };

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(clearCart());
    dispatch(clearCheckoutDetails());
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  };

  const getStatusBadgeStyle = () => {
    switch (scheduleStatus) {
      case 'ACTIVE':
        return { bg: '#D1FAE5', text: '#065F46', label: '● ACTIVE (PROMO)' };
      case 'UPCOMING':
        return { bg: '#DBEAFE', text: '#1E40AF', label: '● UPCOMING' };
      case 'EXPIRED':
        return { bg: '#F3F4F6', text: '#4B5563', label: '● EXPIRED' };
      case 'INVALID':
        return { bg: '#FEE2E2', text: '#991B1B', label: '● INVALID RANGE' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: '● NOT CONFIGURED' };
    }
  };

  const statusBadge = getStatusBadgeStyle();


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.emailLabel}>Logged in as</Text>
        <Text style={styles.emailText}>
          {user.email || 'No user logged in'}
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic App Icon Configuration Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Dynamic App Icon</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}
          >
            <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionSubtitle}>
          Automatically switch application icon during a configured promotional
          date window.
        </Text>

        {/* Current Active Icon Banner */}
        <View style={styles.activeIconBanner}>
          <Text style={styles.activeIconLabel}>
            Currently Applied Icon :{' '}
            <Text style={styles.activeIconValue}>
              {activeIcon === 'promotional'
                ? 'Promotional App Icon'
                : 'Default App Icon'}
            </Text>
          </Text>
        </View>

        {/* Preset Section */}
        <Text style={styles.inputLabel}>Quick Test Preset:</Text>
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={handlePreset1MinPromo}
            activeOpacity={0.7}
          >
            <Text style={styles.presetButtonText}>
              Test 1-Minute Promo (Starts Now)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Picker Buttons */}
        <View style={styles.pickerSection}>
          <Text style={styles.inputLabel}>Start Date & Time:</Text>
          <TouchableOpacity
            style={styles.datePickerSelector}
            onPress={() => openDateTimePicker('start')}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerSelectorIcon}>
              <Ionicons
                name="calendar-clear-outline"
                size={20}
                color={colors.mutedForeground}
              />
            </Text>
            <Text style={styles.datePickerSelectorText}>
              {formatDisplayDate(startDateObj)}
            </Text>
            <Text style={styles.datePickerSelectorAction}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerSection}>
          <Text style={styles.inputLabel}>End Date & Time:</Text>
          <TouchableOpacity
            style={styles.datePickerSelector}
            onPress={() => openDateTimePicker('end')}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerSelectorIcon}>
              <Ionicons
                name="calendar-clear-outline"
                size={20}
                color={colors.mutedForeground}
              />
            </Text>
            <Text style={styles.datePickerSelectorText}>
              {formatDisplayDate(endDateObj)}
            </Text>
            <Text style={styles.datePickerSelectorAction}>Change</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {/* Display Saved Schedule */}
        <View style={styles.savedScheduleBox}>
          <Text style={styles.savedScheduleTitle}>Saved Schedule (MMKV):</Text>
          <Text style={styles.savedScheduleText}>
            Start: {savedStartDisplay}
          </Text>
          <Text style={styles.savedScheduleText}>End: {savedEndDisplay}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSchedule}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSchedule}
            activeOpacity={0.8}
          >
            <Text style={styles.clearButtonText}>Clear Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date & Time Picker */}
      <DatePicker
        modal
        open={pickerModalVisible}
        date={pickerTarget === 'start' ? startDateObj : endDateObj}
        mode="datetime"
        onConfirm={(date) => {
          setPickerModalVisible(false);
          if (pickerTarget === 'start') {
            setStartDateObj(date);
          } else {
            setEndDateObj(date);
          }
          setErrorMessage(null);
        }}
        onCancel={() => {
          setPickerModalVisible(false);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  emailLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 2,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.destructive,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 16,
    lineHeight: 18,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeIconBanner: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  activeIconLabel: {
    fontSize: 14,
    color: colors.foreground,
    marginRight: 20,
  },
  activeIconValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    paddingLeft: 15,
  },
  pickerSection: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 6,
  },
  datePickerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  datePickerSelectorIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  datePickerSelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  datePickerSelectorAction: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  presetsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  presetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338CA',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  savedScheduleBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  savedScheduleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  savedScheduleText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.mutedForeground,
    marginTop: 8,
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  selectorCol: {
    flex: 1,
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  counterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.secondary,
  },
  counterBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  counterValue: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.foreground,
    minWidth: 32,
    textAlign: 'center',
  },
  ampmBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmBtnText: {
    color: colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: colors.foreground,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: colors.primaryForeground,
    fontWeight: '600',
  },
});

export default Profile;
