import React, { useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import { Activity } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius, Spacing, CardDimensions } from '../theme';
import { minutesToTime } from '../utils/travelTime';

interface ActivityCardProps {
  activity: Activity;
  isGhost?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: object;
  compact?: boolean;
}

export function ActivityCard({
  activity,
  isGhost = false,
  onPress,
  onLongPress,
  style,
  compact = false,
}: ActivityCardProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation on mount
  React.useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 120,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFlick = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      damping: 15,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const cardWidth = compact ? CardDimensions.dockWidth : CardDimensions.width;
  const cardHeight = compact ? CardDimensions.dockHeight : CardDimensions.height;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: cardWidth,
          height: cardHeight,
          opacity: enterAnim,
          transform: [
            { scale: enterAnim },
            { translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        },
        isGhost && styles.ghostWrapper,
        style,
      ]}
    >
      {/* Front face */}
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          {
            width: cardWidth,
            height: cardHeight,
            backfaceVisibility: 'hidden',
            transform: [{ rotateY: frontInterpolate }],
          },
        ]}
      >
        <Pressable
          onPress={onPress ?? handleFlick}
          onLongPress={onLongPress}
          style={styles.pressable}
        >
          {/* Hero image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: activity.imageUrl || 'https://picsum.photos/seed/activity/400/300' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />

            {/* Time badge */}
            {activity.startTime !== undefined && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{minutesToTime(activity.startTime)}</Text>
              </View>
            )}

            {/* Flick hint */}
            <Text style={styles.flickHint}>↓ flick to reveal</Text>
          </View>

          {/* Card body */}
          <View style={styles.cardBody}>
            <Text style={styles.poeticHook} numberOfLines={1}>
              {activity.poeticHook.toUpperCase()}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {activity.title}
            </Text>
            {!compact && (
              <Text style={styles.district} numberOfLines={1}>
                {activity.district} · {activity.duration}m
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>

      {/* Back face */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          {
            width: cardWidth,
            height: cardHeight,
            backfaceVisibility: 'hidden',
            transform: [{ rotateY: backInterpolate }],
          },
        ]}
      >
        <Pressable onPress={handleFlick} style={[styles.pressable, styles.backContent]}>
          <Text style={styles.backTitle}>{activity.title}</Text>
          <Text style={styles.backDistrict}>{activity.district}</Text>

          {activity.queueWarning && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>⚠ {activity.queueWarning}</Text>
            </View>
          )}

          <View style={styles.needsContainer}>
            {activity.needToKnows.map((note, i) => (
              <Text key={i} style={styles.needItem}>
                — {note}
              </Text>
            ))}
          </View>

          <View style={styles.backMeta}>
            <Text style={styles.durationBadge}>{activity.duration} min</Text>
            {activity.bookingUrl && (
              <TouchableOpacity
                onPress={() => Linking.openURL(activity.bookingUrl!)}
                style={styles.bookButton}
              >
                <Text style={styles.bookText}>Book →</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  ghostWrapper: {
    opacity: 0.65,
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFront: {},
  cardBack: {
    backgroundColor: Colors.slate,
  },
  pressable: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.25)',
  },
  timeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.pearl,
    fontSize: 10,
  },
  flickHint: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    letterSpacing: 1,
  },
  cardBody: {
    padding: 12,
    paddingBottom: 14,
    minHeight: 80,
  },
  poeticHook: {
    ...Typography.poeticHook,
    color: Colors.smoke,
    fontSize: 8,
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    ...Typography.cardTitle,
    color: Colors.ivory,
    fontSize: 15,
    marginBottom: 4,
  },
  district: {
    ...Typography.caption,
    color: Colors.ash,
    fontSize: 10,
  },

  // Back face
  backContent: {
    padding: 16,
    gap: 8,
  },
  backTitle: {
    ...Typography.cardTitle,
    color: Colors.ivory,
    fontSize: 16,
    marginBottom: 2,
  },
  backDistrict: {
    ...Typography.caption,
    color: Colors.smoke,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  warningBadge: {
    backgroundColor: 'rgba(244,162,74,0.15)',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(244,162,74,0.3)',
  },
  warningText: {
    color: Colors.warning,
    fontSize: 10,
    lineHeight: 14,
  },
  needsContainer: {
    gap: 4,
    flex: 1,
  },
  needItem: {
    color: Colors.pearl,
    fontSize: 11,
    lineHeight: 16,
  },
  backMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  durationBadge: {
    color: Colors.ash,
    fontSize: 10,
    letterSpacing: 1,
  },
  bookButton: {
    backgroundColor: Colors.fog,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bookText: {
    color: Colors.ivory,
    fontSize: 11,
    fontWeight: '600',
  },
});
