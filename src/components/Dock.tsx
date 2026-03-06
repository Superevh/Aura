import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Activity, AuraPlan } from '../types';
import { ActivityCard } from './ActivityCard';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { DockHeight, Spacing, Radius, CardDimensions } from '../theme';
import { rankDockByProximity } from '../utils/clustering';
import { useAuraStore } from '../store/useAuraStore';

interface DockProps {
  plan: AuraPlan;
  onDragCardToDay?: (activity: Activity, dayNumber: number) => void;
  onAddCustomActivity?: () => void;
}

export function Dock({ plan, onDragCardToDay, onAddCustomActivity }: DockProps) {
  const { moveCardToDock, moveCardToDay, activeDayIndex } = useAuraStore();
  const translateY = useRef(new Animated.Value(DockHeight)).current;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 25,
      stiffness: 80,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  // Re-rank dock by proximity to active day's activities
  const activeDay = plan.days[activeDayIndex];
  const viewCoords = activeDay?.activities[0]?.coordinates ?? { lat: 0, lng: 0 };
  const rankedDock = rankDockByProximity(plan.dockActivities, viewCoords);

  const filteredDock = searchText
    ? rankedDock.filter(
        (a) =>
          a.title.toLowerCase().includes(searchText.toLowerCase()) ||
          a.district.toLowerCase().includes(searchText.toLowerCase())
      )
    : rankedDock;

  const handleAddToDay = (activity: Activity) => {
    const targetDay = plan.days[activeDayIndex]?.day ?? 1;
    moveCardToDay(activity.id, targetDay);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const dockHeight = isExpanded ? DockHeight * 1.8 : DockHeight;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <BlurView intensity={60} tint="dark" style={[styles.blurContainer, { height: dockHeight }]}>
        {/* Handle bar */}
        <TouchableOpacity onPress={handleToggleExpand} style={styles.handleContainer}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.dockLabel}>THE DOCK</Text>
            <Text style={styles.dockCount}>{plan.dockActivities.length} activities</Text>
            <TouchableOpacity onPress={onAddCustomActivity} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search the dock…"
            placeholderTextColor={Colors.fog}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Ghost cards horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
        >
          {filteredDock.length === 0 ? (
            <View style={styles.emptyDock}>
              <Text style={styles.emptyDockText}>
                {searchText ? 'No results' : 'All activities are in your plan'}
              </Text>
            </View>
          ) : (
            filteredDock.map((activity) => (
              <View key={activity.id} style={styles.cardWrapper}>
                <ActivityCard
                  activity={activity}
                  isGhost
                  compact
                  onPress={() => handleAddToDay(activity)}
                  style={styles.ghostCard}
                />
                {/* Quick-add button */}
                <TouchableOpacity
                  style={styles.quickAdd}
                  onPress={() => handleAddToDay(activity)}
                >
                  <Text style={styles.quickAddText}>
                    + Day {plan.days[activeDayIndex]?.day ?? 1}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.dockBorder,
    paddingBottom: 32, // safe area
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.fog,
    marginBottom: 12,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  dockLabel: {
    ...Typography.label,
    color: Colors.ash,
    fontSize: 10,
    letterSpacing: 3,
    flex: 1,
  },
  dockCount: {
    ...Typography.caption,
    color: Colors.smoke,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: Colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  addButtonText: {
    color: Colors.pearl,
    fontSize: 11,
    fontWeight: '600',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: Colors.ivory,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  cardWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  ghostCard: {},
  quickAdd: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  quickAddText: {
    color: Colors.ash,
    fontSize: 10,
    letterSpacing: 1,
  },
  emptyDock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyDockText: {
    ...Typography.caption,
    color: Colors.smoke,
    textAlign: 'center',
  },
});
