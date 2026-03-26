
import { Platform } from 'react-native';
// =============================================
// TalentStd - Design System / Theme Constants
// =============================================

const isWeb = Platform.OS === 'web';

export const COLORS = {
  // Backgrounds
  background:    '#F4F7FB',
  surface:       '#FFFFFF',
  surfaceAlt:    '#EEF2F7',
  border:        '#D8E0EA',
  borderLight:   '#E8EDF4',

  // Brand
  primary:       '#2563EB',
  primaryLight:  '#DBEAFE',
  primaryDark:   '#1E40AF',
  secondary:     '#0D9488',
  accent:        '#7C3AED',

  // Text
  text:          '#0F172A',
  textSecondary: '#334155',
  textMuted:     '#64748B',
  textOnDark:    '#F8FAFC',

  // Status
  error:         '#DC2626',
  errorLight:    '#FEE2E2',
  warning:       '#D97706',
  warningLight:  '#FEF3C7',
  success:       '#16A34A',
  successLight:  '#DCFCE7',
  info:          '#0284C7',
  infoLight:     '#E0F2FE',

  // Navigation
  drawerBg:      '#0F172A',
  drawerItem:    '#1E293B',
  drawerActive:  '#2563EB',
  drawerText:    '#CBD5E1',
  drawerTextActive: '#FFFFFF',

  // Misc
  white:         '#FFFFFF',
  black:         '#0F172A',
  overlay:       'rgba(15, 23, 42, 0.55)',
  transparent:   'transparent',
};

export const FONTS = {
  thin:         'Sarabun_100Thin',
  light:        'Sarabun_300Light',
  regular:      'Sarabun_400Regular',
  medium:       'Sarabun_500Medium',
  semiBold:     'Sarabun_600SemiBold',
  bold:         'Sarabun_700Bold',
  extraBold:    'Sarabun_800ExtraBold',
};

export const FONT_SIZES = {
  xs:    12,
  sm:    14,
  md:    16,
  lg:    18,
  xl:    20,
  xxl:   24,
  xxxl:  30,
  huge:  38,
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const BORDER_RADIUS = {
  xs:     3,
  sm:     6,
  md:     10,
  lg:     14,
  xl:     20,
  round:  999,
};

export const SHADOWS = {
  none: {},
  small: {
    ...(isWeb
      ? { boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }
      : {
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        }
    ),
    elevation: 2,
  },
  medium: {
    ...(isWeb
      ? { boxShadow: '0 6px 24px rgba(15,23,42,0.12)' }
      : {
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }
    ),
    elevation: 4,
  },
  large: {
    ...(isWeb
      ? { boxShadow: '0 10px 48px rgba(15,23,42,0.16)' }
      : {
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.16,
          shadowRadius: 24,
        }
    ),
    elevation: 8,
  },
};

export const NAV_THEME = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.borderLight,
    notification: COLORS.accent,
  },
};

export const DRAWER_WIDTH = 80;
export const MOBILE_BREAKPOINT = 768;

// Common reusable style objects
export const commonStyles = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
};
