export type VibeType = 'gourmand' | 'explorer' | 'sprinter' | 'flaneur';

export type ActivityCategory =
  | 'restaurant'
  | 'cafe'
  | 'museum'
  | 'landmark'
  | 'park'
  | 'market'
  | 'bar'
  | 'shop'
  | 'experience'
  | 'accommodation';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  title: string;
  poeticHook: string; // 3-word evocative tagline
  category: ActivityCategory;
  imageUrl: string;
  duration: number; // minutes
  district: string;
  coordinates: Coordinates;
  bookingUrl?: string;
  queueWarning?: string;
  needToKnows: string[];
  day?: number; // undefined = in Dock
  startTime?: number; // minutes from midnight, undefined = in Dock
  isGhost?: boolean; // dock ghost card
}

export interface TravelSegment {
  fromId: string;
  toId: string;
  travelMinutes: number;
  mode: 'walk' | 'transit' | 'taxi';
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  isOverfilled: boolean;
}

export interface AuraPlan {
  id: string;
  destination: string;
  duration: number; // days
  vibe: VibeType;
  createdAt: string;
  coverImageUrl: string;
  days: DayPlan[];
  dockActivities: Activity[];
  travelSegments: TravelSegment[];
}

export interface VaultPlan {
  id: string;
  destination: string;
  vibe: VibeType;
  coverImageUrl: string;
  duration: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'golden' | 'dusk' | 'midnight';

export interface VibeConfig {
  id: VibeType;
  label: string;
  description: string;
  emoji: string;
  colorPrimary: string;
  colorSecondary: string;
  maxActivitiesPerDay: number;
  pace: 'slow' | 'medium' | 'fast';
  focusCategories: ActivityCategory[];
}
