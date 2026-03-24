// =============================================
// TalentStd - Design System / Theme Constants
// =============================================

export const COLORS = {
  // Backgrounds
  background:    '#FBFBF9',   // Warm off-white main bg
  surface:       '#F5F5F0',   // Slightly darker surface
  surfaceAlt:    '#EFECE6',   // Card bg, inputs
  border:        '#E0DDD8',   // Dividers, input borders
  borderLight:   '#ECEAE6',

  // Brand
  primary:       '#4A7C9E',   // Main blue (calm, professional)
  primaryLight:  '#D0E4F0',   // Light tint for backgrounds
  primaryDark:   '#2E5F7A',
  secondary:     '#5E8A52',   // Green for success-like accents
  accent:        '#9E6B4A',   // Warm brown for highlights

  // Text
  text:          '#2C2C2C',   // Off-black
  textSecondary: '#555550',
  textMuted:     '#909090',
  textOnDark:    '#F5F5F0',

  // Status
  error:         '#C0392B',
  errorLight:    '#FDEDEC',
  warning:       '#D68910',
  warningLight:  '#FEF9E7',
  success:       '#27824A',
  successLight:  '#EAFAF1',
  info:          '#2471A3',
  infoLight:     '#EBF5FB',

  // Navigation
  drawerBg:      '#2C3A4A',
  drawerItem:    '#3D5269',
  drawerActive:  '#4A7C9E',
  drawerText:    '#C8D8E8',
  drawerTextActive: '#FFFFFF',

  // Misc
  white:         '#FBFBF9',
  black:         '#2C2C2C',
  overlay:       'rgba(44, 44, 44, 0.55)',
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
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const DRAWER_WIDTH = 260;
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
