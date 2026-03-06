import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DayPlan, Activity, TravelSegment } from '../types';
import { ActivityCard } from './ActivityCard';
import { TravelLine } from './TravelLine';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { DayColumnWidth, Spacing, Radius } from '../theme';
import { getTimeOfDay } from '../utils/travelTime';

interface DayColumnProps {
  dayPlan: DayPlan;
  travelSegments: TravelSegment[];
  onCardPress: (activity: Activity) => void;
  onCardLongPress: (activity: Activity) => void;
  onCardFlickDown: (activity: Activity) => void;
  /** Highlight this column as a valid drop target */
  isDragTarget?: boolean;
  /** ID of the activity currently being dragged (dims its ghost in this column) */
  draggingActivityId?: string | null;
  isActive?: boolean;
}

const TIME_GRADIENTS: Record<string, [string, string, string]> = {
  dawn: ['#1A1A3E', '#2D1B69', '#6B4C9A'],
  morning: ['#1E3A5F', '#2E6B9E', '#7EC8E3'],
  afternoon: ['#1A2F5A', '#2B4A8A', '#4A90D9'],
  golden: ['#3D1F00', '#8B4513', '#F4A24A'],
  dusk: ['#1A0A2E', '#4A1942', '#C8507A'],
  midnight: ['#050508', '#0A0A15', '#12121F'],
};

function getDayGradient(activities: Activity[]): [string, string, string] {
  if (!activities.length) return TIME_GRADIENTS.morning;
  const firstStart = activities[0].startTime ?? 480;
  const lastEnd =
    (activities[activities.length - 1].startTime ?? 960) +
    (activities[activities.length - 1].duration ?? 90);
  const midpoint = (firstStart + lastEnd) / 2;
  const tod = getTimeOfDay(midpoint);
  return TIME_GRADIENTS[tod] ?? TIME_GRADIENTS.morning;
}

export function DayColumn({
  dayPlan,
  travelSegments,
  onCardPress,
  onCardLongPress,
  onCardFlickDown,
  isDragTarget = false,
  draggingActivityId,
  isActive = false,
}: DayColumnProps) {
  const overfillAnim = useRef(new Animated.Value(0)).current;
  const gradient = getDayGradient(dayPlan.activities);

  React.useEffect(() => {
    if (dayPlan.isOverfilled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(overfillAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(overfillAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
        ])
      ).start();
    } else {
      overfillAnim.stopAnimation();
      Animated.timing(overfillAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  }, [dayPlan.isOverfilled]);

  const overfillBorder = overfillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(244,162,74,0)', 'rgba(244,162,74,0.6)'],
  });

  function getSegment(fromId: string, toId: string): TravelSegment | undefined {
    return travelSegments.find((s) => s.fromId === fromId && s.toId === toId);
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isActive && styles.activeColumn,
        isDragTarget && styles.dropTargetColumn,
        { borderColor: isDragTarget ? 'rgba(100,200,255,0.8)' : overfillBorder },
      ]}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Drop target overlay */}
      {isDragTarget && (
        <View style={styles.dropHighlight} pointerEvents="none" />
      )}

      {/* Day header */}
      <View style={styles.header}>
        <Text style={styles.dayNumber}>DAY {dayPlan.day}</Text>
        <Text style={styles.date}>
          {new Date(dayPlan.date).toLocaleDateString('en-GB', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        {dayPlan.isOverfilled && (
          <View style={styles.overfillBadge}>
            <Text style={styles.overfillText}>Full</Text>
          </View>
        )}
      </View>

      {/* Activities scroll */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {dayPlan.activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Drop cards here</Text>
          </View>
        ) : (
          dayPlan.activities.map((activity, idx) => {
            const nextActivity = dayPlan.activities[idx + 1];
            const segment = nextActivity
              ? getSegment(activity.id, nextActivity.id)
              : undefined;
            const availableGap = nextActivity
              ? (nextActivity.startTime ?? 0) - ((activity.startTime ?? 0) + activity.duration)
              : 999;
            const isDragging = activity.id === draggingActivityId;

            return (
              <View key={activity.id}>
                {/*
                  nativeID becomes the DOM `id` attribute in RN Web.
                  TimelineScreen's window mousedown handler uses
                  closest('[id^="activity-card-"]') to detect which card
                  was grabbed, completely bypassing RN's event system.
                */}
                <View
                  nativeID={`activity-card-${activity.id}`}
                  style={isDragging ? { opacity: 0.3 } : undefined}
                >
                  <TouchableOpacity
                    onPress={() => onCardPress(activity)}
                    onLongPress={() => onCardLongPress(activity)}
                    activeOpacity={0.9}
                  >
                    <ActivityCard
                      activity={activity}
                      onPress={() => onCardPress(activity)}
                      onLongPress={() => onCardLongPress(activity)}
                      style={styles.card}
                    />
                  </TouchableOpacity>
                </View>

                {segment && (
                  <View style={styles.travelLineContainer}>
                    <TravelLine
                      segment={segment}
                      availableGapMinutes={availableGap}
                      orientation="vertical"
                    />
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DayColumnWidth,
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(100, 100, 160, 0.2)',
    marginRight: Spacing.md,
  },
  activeColumn: {
    borderColor: 'rgba(100, 100, 255, 0.4)',
  },
  dropTargetColumn: {
    borderWidth: 2.5,
  },
  dropHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(100, 200, 255, 0.09)',
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayNumber: {
    ...Typography.label,
    color: Colors.ash,
    fontSize: 10,
    letterSpacing: 3,
  },
  date: {
    ...Typography.caption,
    color: Colors.smoke,
    flex: 1,
  },
  overfillBadge: {
    backgroundColor: 'rgba(244,162,74,0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(244,162,74,0.4)',
  },
  overfillText: {
    color: Colors.warning,
    fontSize: 9,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
    gap: 8,
  },
  card: {
    alignSelf: 'center',
  },
  travelLineContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
  },
});
