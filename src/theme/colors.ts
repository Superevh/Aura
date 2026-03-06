export const Colors = {
  // Core palette
  obsidian: '#0A0A0F',
  ink: '#12121A',
  slate: '#1E1E2E',
  mist: '#2A2A3E',
  fog: '#3D3D58',
  smoke: '#6B6B8A',
  ash: '#9B9BB8',
  pearl: '#C8C8E0',
  ivory: '#F0F0F8',
  white: '#FFFFFF',

  // Time-of-day gradients
  dawn: {
    top: '#1A1A3E',
    mid: '#2D1B69',
    bottom: '#6B4C9A',
  },
  morning: {
    top: '#1E3A5F',
    mid: '#2E6B9E',
    bottom: '#7EC8E3',
  },
  afternoon: {
    top: '#1A2F5A',
    mid: '#2B4A8A',
    bottom: '#4A90D9',
  },
  golden: {
    top: '#3D1F00',
    mid: '#8B4513',
    bottom: '#F4A24A',
  },
  dusk: {
    top: '#1A0A2E',
    mid: '#4A1942',
    bottom: '#C8507A',
  },
  midnight: {
    top: '#050508',
    mid: '#0A0A15',
    bottom: '#12121F',
  },

  // Vibe orb colors
  vibes: {
    gourmand: {
      primary: '#C8773A',
      secondary: '#8B3A1F',
      glow: 'rgba(200, 119, 58, 0.4)',
    },
    explorer: {
      primary: '#2E8B6B',
      secondary: '#1A5C45',
      glow: 'rgba(46, 139, 107, 0.4)',
    },
    sprinter: {
      primary: '#5A4A9E',
      secondary: '#3A2A7A',
      glow: 'rgba(90, 74, 158, 0.4)',
    },
    flaneur: {
      primary: '#C8A050',
      secondary: '#8B6B2A',
      glow: 'rgba(200, 160, 80, 0.4)',
    },
  },

  // Status / feedback
  warning: '#F4A24A',
  warningGlow: 'rgba(244, 162, 74, 0.3)',
  fray: '#FF4A6B',
  frayGlow: 'rgba(255, 74, 107, 0.4)',
  success: '#2E8B6B',
  travelLine: 'rgba(200, 200, 255, 0.6)',
  travelLineKnot: 'rgba(100, 255, 200, 0.8)',

  // Cards
  cardBackground: 'rgba(30, 30, 46, 0.92)',
  cardBorder: 'rgba(100, 100, 160, 0.3)',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  ghostCard: 'rgba(30, 30, 46, 0.6)',

  // Dock
  dockBackground: 'rgba(18, 18, 26, 0.85)',
  dockBorder: 'rgba(100, 100, 160, 0.2)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
};

export type ColorName = keyof typeof Colors;
