import { Platform } from 'react-native';

export const FontFamily = {
  light: Platform.select({ ios: 'System', android: 'sans-serif-light', default: 'System' }),
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif-condensed', default: 'System' }),
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  hero: 48,
};

export const LineHeight = {
  tight: 1.1,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
};

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.8,
  wider: 1.5,
  widest: 3,
};

export const Typography = {
  hero: {
    fontFamily: FontFamily.light,
    fontSize: FontSize.hero,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.hero * LineHeight.tight,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.xxl * LineHeight.snug,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.lg * LineHeight.snug,
  },
  poeticHook: {
    fontFamily: FontFamily.light,
    fontSize: FontSize.sm,
    letterSpacing: LetterSpacing.widest,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  caption: {
    fontFamily: FontFamily.light,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.widest,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
};
