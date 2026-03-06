import { Colors } from '../theme/colors';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'golden' | 'dusk' | 'midnight';

export function getTimeOfDayFromMinutes(minutesFromMidnight: number): TimeOfDay {
  if (minutesFromMidnight < 360) return 'dawn';
  if (minutesFromMidnight < 660) return 'morning';
  if (minutesFromMidnight < 960) return 'afternoon';
  if (minutesFromMidnight < 1140) return 'golden';
  if (minutesFromMidnight < 1320) return 'dusk';
  return 'midnight';
}

export function getGradientForTimeOfDay(tod: TimeOfDay): string[] {
  const palette = Colors[tod];
  return [palette.top, palette.mid, palette.bottom];
}

// Interpolate gradient as user scrolls vertically through a day column
// scrollY: 0 = top of day (08:00), 1 = bottom of day (23:00)
export function interpolateTimeGradient(scrollProgress: number): string[] {
  // Map 0..1 to time bands dawn→midnight
  const bands: TimeOfDay[] = ['dawn', 'morning', 'afternoon', 'golden', 'dusk', 'midnight'];
  const idx = Math.min(Math.floor(scrollProgress * bands.length), bands.length - 1);
  return getGradientForTimeOfDay(bands[idx]);
}
