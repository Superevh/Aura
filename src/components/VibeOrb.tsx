import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { VibeType } from '../types';
import { VIBE_CONFIGS } from '../utils/vibeConfig';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { VibeOrbSize } from '../theme';

interface VibeOrbProps {
  vibe: VibeType;
  selected: boolean;
  onPress: (vibe: VibeType) => void;
  animationDelay?: number;
}

export function VibeOrb({ vibe, selected, onPress, animationDelay = 0 }: VibeOrbProps) {
  const config = VIBE_CONFIGS[vibe];
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mount entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: animationDelay,
      damping: 10,
      stiffness: 150,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  // Selected state: glow + gentle pulse
  useEffect(() => {
    if (selected) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [selected]);

  const handlePress = () => onPress(vibe);

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.orb,
          {
            backgroundColor: selected ? config.colorPrimary : 'rgba(30, 30, 46, 0.8)',
            borderColor: selected ? config.colorPrimary : 'rgba(100, 100, 160, 0.3)',
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        {/* Glow ring */}
        {selected && (
          <View
            style={[
              styles.glowRing,
              { borderColor: config.colorPrimary },
            ]}
          />
        )}

        {/* Inner gradient overlay */}
        <View style={[styles.orbInner, selected && styles.orbInnerSelected]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
          <Text
            style={[
              styles.label,
              { color: selected ? Colors.white : Colors.pearl },
            ]}
          >
            {config.label}
          </Text>
          <Text
            style={[
              styles.description,
              { color: selected ? 'rgba(255,255,255,0.7)' : Colors.smoke },
            ]}
            numberOfLines={2}
          >
            {config.description}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  orb: {
    width: VibeOrbSize,
    height: VibeOrbSize,
    borderRadius: VibeOrbSize / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: VibeOrbSize + 16,
    height: VibeOrbSize + 16,
    borderRadius: (VibeOrbSize + 16) / 2,
    borderWidth: 1,
    opacity: 0.4,
  },
  orbInner: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  orbInnerSelected: {},
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  label: {
    ...Typography.label,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 11,
  },
  description: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 14,
    fontSize: 9,
  },
});
