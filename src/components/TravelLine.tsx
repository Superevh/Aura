import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { TravelSegment } from '../types';
import { getTravelLineState } from '../utils/travelTime';
import { Colors } from '../theme/colors';

interface TravelLineProps {
  segment: TravelSegment;
  availableGapMinutes: number;
  orientation?: 'horizontal' | 'vertical';
}

export function TravelLine({
  segment,
  availableGapMinutes,
  orientation = 'horizontal',
}: TravelLineProps) {
  const state = getTravelLineState(segment.travelMinutes, availableGapMinutes);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    // Pulse loop for fray state
    if (state === 'fray') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else if (state === 'stretch') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      // knot — bright steady glow
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [state]);

  const lineColor =
    state === 'fray'
      ? Colors.fray
      : state === 'knot'
      ? Colors.travelLineKnot
      : Colors.travelLine;

  const glowColor =
    state === 'fray'
      ? Colors.frayGlow
      : state === 'knot'
      ? 'rgba(100, 255, 200, 0.4)'
      : 'rgba(200, 200, 255, 0.2)';

  const modeIcon =
    segment.mode === 'walk' ? '🚶' : segment.mode === 'transit' ? '🚇' : '🚕';

  const isHorizontal = orientation === 'horizontal';

  return (
    <Animated.View
      style={[
        styles.container,
        isHorizontal ? styles.horizontal : styles.vertical,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* The line itself */}
      <Animated.View
        style={[
          styles.line,
          isHorizontal ? styles.lineHorizontal : styles.lineVertical,
          {
            backgroundColor: lineColor,
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
          },
          state === 'fray' && styles.lineFray,
        ]}
      />

      {/* Travel time label */}
      <View style={[styles.label, isHorizontal ? styles.labelHorizontal : styles.labelVertical]}>
        <Text style={[styles.labelText, { color: lineColor }]}>
          {modeIcon} {segment.travelMinutes}m
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  horizontal: {
    width: 40,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vertical: {
    width: 40,
    height: 32,
    flexDirection: 'column',
    alignItems: 'center',
  },
  line: {
    borderRadius: 2,
  },
  lineHorizontal: {
    width: '100%',
    height: 1.5,
  },
  lineVertical: {
    width: 1.5,
    height: '100%',
  },
  lineFray: {
    // Dashed effect via opacity flicker (handled by pulse animation)
    borderStyle: 'dashed',
  },
  label: {
    position: 'absolute',
    backgroundColor: Colors.ink,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelHorizontal: {
    top: -10,
  },
  labelVertical: {
    left: 6,
  },
  labelText: {
    fontSize: 8,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
});
