import { VibeConfig, VibeType } from '../types';

export const VIBE_CONFIGS: Record<VibeType, VibeConfig> = {
  gourmand: {
    id: 'gourmand',
    label: 'The Gourmand',
    description: 'A journey told through taste. From hole-in-the-wall finds to storied dining rooms.',
    emoji: '🍷',
    colorPrimary: '#C8773A',
    colorSecondary: '#8B3A1F',
    maxActivitiesPerDay: 6,
    pace: 'slow',
    focusCategories: ['restaurant', 'cafe', 'market', 'bar', 'experience'],
  },
  explorer: {
    id: 'explorer',
    label: 'The Explorer',
    description: 'The roads less travelled. Hidden courtyards, local neighbourhoods, unexpected finds.',
    emoji: '🗺️',
    colorPrimary: '#2E8B6B',
    colorSecondary: '#1A5C45',
    maxActivitiesPerDay: 7,
    pace: 'medium',
    focusCategories: ['park', 'landmark', 'experience', 'market', 'shop'],
  },
  sprinter: {
    id: 'sprinter',
    label: 'The Sprinter',
    description: 'The iconic edit. Hit every landmark that defines a city, efficiently and beautifully.',
    emoji: '⚡',
    colorPrimary: '#5A4A9E',
    colorSecondary: '#3A2A7A',
    maxActivitiesPerDay: 9,
    pace: 'fast',
    focusCategories: ['landmark', 'museum', 'experience', 'restaurant', 'park'],
  },
  flaneur: {
    id: 'flaneur',
    label: 'The Flâneur',
    description: 'Wander with intention. Linger at cafés, drift through galleries, let the city reveal itself.',
    emoji: '🌿',
    colorPrimary: '#C8A050',
    colorSecondary: '#8B6B2A',
    maxActivitiesPerDay: 4,
    pace: 'slow',
    focusCategories: ['cafe', 'museum', 'park', 'shop', 'landmark'],
  },
};

export function getVibeConfig(vibe: VibeType): VibeConfig {
  return VIBE_CONFIGS[vibe];
}
