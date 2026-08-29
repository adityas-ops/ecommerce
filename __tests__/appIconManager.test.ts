import {
  evaluateAppIcon,
  getScheduleStatus,
  formatDisplayDate,
} from '../src/utils/appIconManager';

jest.mock('react-native-dynamic-app-icon', () => ({
  setAppIcon: jest.fn(),
  getIconName: jest.fn(),
  supportsDynamicAppIcon: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn().mockReturnValue({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

describe('appIconManager - evaluateAppIcon & getScheduleStatus', () => {
  const startDate = '2026-12-01T00:00:00.000Z'; // 01-Dec-2026 12:00 AM UTC
  const endDate = '2026-12-31T23:59:00.000Z'; // 31-Dec-2026 11:59 PM UTC

  it('should return "default" when dates are not configured (null or empty)', () => {
    expect(evaluateAppIcon(null, null)).toBe('default');
    expect(evaluateAppIcon(startDate, null)).toBe('default');
    expect(evaluateAppIcon(null, endDate)).toBe('default');
    expect(getScheduleStatus(null, null)).toBe('NOT_CONFIGURED');
  });

  it('should return "default" when date strings are invalid', () => {
    expect(evaluateAppIcon('invalid-date', '2026-12-31')).toBe('default');
    expect(evaluateAppIcon('2026-12-01', 'invalid-date')).toBe('default');
    expect(getScheduleStatus('invalid', 'invalid')).toBe('INVALID');
  });

  it('should return "default" when start date is after end date', () => {
    const invalidStart = '2026-12-31T23:59:00.000Z';
    const invalidEnd = '2026-12-01T00:00:00.000Z';
    expect(evaluateAppIcon(invalidStart, invalidEnd)).toBe('default');
    expect(getScheduleStatus(invalidStart, invalidEnd)).toBe('INVALID');
  });

  it('should return "default" when current date is before start date', () => {
    const beforeStart = new Date('2026-11-30T23:59:59.000Z');
    expect(evaluateAppIcon(startDate, endDate, beforeStart)).toBe('default');
    expect(getScheduleStatus(startDate, endDate, beforeStart)).toBe('UPCOMING');
  });

  it('should return "promotional" when current date is within start and end range', () => {
    const duringPromo1 = new Date('2026-12-01T00:00:00.000Z'); // Exact start
    const duringPromo2 = new Date('2026-12-15T12:00:00.000Z'); // Mid promo
    const duringPromo3 = new Date('2026-12-31T23:59:00.000Z'); // Exact end

    expect(evaluateAppIcon(startDate, endDate, duringPromo1)).toBe(
      'promotional'
    );
    expect(evaluateAppIcon(startDate, endDate, duringPromo2)).toBe(
      'promotional'
    );
    expect(evaluateAppIcon(startDate, endDate, duringPromo3)).toBe(
      'promotional'
    );

    expect(getScheduleStatus(startDate, endDate, duringPromo2)).toBe('ACTIVE');
  });

  it('should return "default" when current date is after end date', () => {
    const afterEnd = new Date('2027-01-01T00:00:01.000Z');
    expect(evaluateAppIcon(startDate, endDate, afterEnd)).toBe('default');
    expect(getScheduleStatus(startDate, endDate, afterEnd)).toBe('EXPIRED');
  });

  it('should format dates for display accurately', () => {
    const testDate = new Date(Date.UTC(2026, 11, 1, 0, 0)); // 01 Dec 2026
    const formatted = formatDisplayDate(testDate);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Dec');
  });
});
