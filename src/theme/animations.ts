// Spring physics constants for spring-based animations (Reanimated)
export const Springs = {
  // Gentle spring for card reveals
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 0.8,
  },
  // Snappy spring for interactive feedback
  snappy: {
    damping: 15,
    stiffness: 250,
    mass: 0.6,
  },
  // Bouncy spring for orb interactions
  bouncy: {
    damping: 10,
    stiffness: 150,
    mass: 1.0,
  },
  // Heavy spring for collision feedback
  heavy: {
    damping: 30,
    stiffness: 400,
    mass: 1.2,
  },
  // Slow float for dock animations
  float: {
    damping: 25,
    stiffness: 80,
    mass: 1.0,
  },
};

export const Timing = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  verySlow: 800,
};

export const Delays = {
  // Cascade delays for card reveal
  cardCascade: (index: number) => index * 80,
  // Stagger for orb animations
  orbStagger: (index: number) => index * 120,
};
