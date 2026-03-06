import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayColumn } from '../components/DayColumn';
import { Dock } from '../components/Dock';
import { ActivityCard } from '../components/ActivityCard';
import { Activity } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { DayColumnWidth, Spacing, Radius, DockHeight } from '../theme';
import { useAuraStore } from '../store/useAuraStore';
import { VIBE_CONFIGS } from '../utils/vibeConfig';
import { exportPlanToPDF } from '../services/exportService';

interface TimelineScreenProps {
  onBack: () => void;
}

export function TimelineScreen({ onBack }: TimelineScreenProps) {
  const { currentPlan, moveCardToDock, moveCardToDay, reorderWithinDay, addCustomActivity, savePlanToVault, setActiveDayIndex } =
    useAuraStore();

  const scrollRef = useRef<ScrollView>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customDuration, setCustomDuration] = useState('60');
  const [isExporting, setIsExporting] = useState(false);

  if (!currentPlan) return null;

  const vibe = VIBE_CONFIGS[currentPlan.vibe];

  const handleCardLongPress = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleMoveCardToDock = () => {
    if (!selectedActivity) return;
    moveCardToDock(selectedActivity.id);
    setSelectedActivity(null);
  };

  // Derive current day/index for the selected activity
  const selectedDayPlan = selectedActivity
    ? currentPlan?.days.find((d) => d.activities.some((a) => a.id === selectedActivity.id)) ?? null
    : null;
  const selectedIndex = selectedDayPlan
    ? selectedDayPlan.activities.findIndex((a) => a.id === selectedActivity?.id)
    : -1;

  const handleMoveUp = () => {
    if (!selectedDayPlan || selectedIndex <= 0) return;
    reorderWithinDay(selectedDayPlan.day, selectedIndex, selectedIndex - 1);
    setSelectedActivity(null);
  };

  const handleMoveDown = () => {
    if (!selectedDayPlan || selectedIndex < 0 || selectedIndex >= selectedDayPlan.activities.length - 1) return;
    reorderWithinDay(selectedDayPlan.day, selectedIndex, selectedIndex + 1);
    setSelectedActivity(null);
  };

  const handleMoveToDay = (targetDay: number) => {
    if (!selectedActivity) return;
    moveCardToDay(selectedActivity.id, targetDay);
    setSelectedActivity(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      savePlanToVault();
      await exportPlanToPDF(currentPlan);
    } catch (err) {
      Alert.alert('Export failed', 'Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddCustom = () => {
    if (!customTitle.trim()) return;

    addCustomActivity({
      title: customTitle.trim(),
      poeticHook: 'My custom find',
      category: 'experience',
      imageUrl: '',
      duration: parseInt(customDuration, 10) || 60,
      district: customDistrict.trim() || 'Custom',
      coordinates: currentPlan.days[0]?.activities[0]?.coordinates ?? { lat: 0, lng: 0 },
      needToKnows: [],
    });

    setCustomTitle('');
    setCustomDistrict('');
    setCustomDuration('60');
    setShowCustomAdd(false);
  };

  const handleScroll = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const dayIndex = Math.round(offsetX / (DayColumnWidth + Spacing.md));
    setActiveDayIndex(Math.max(0, Math.min(dayIndex, currentPlan.days.length - 1)));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.obsidian, Colors.ink]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.destination} numberOfLines={1}>
              {currentPlan.destination}
            </Text>
            <Text style={styles.vibeBadge}>{vibe.label}</Text>
          </View>

          <TouchableOpacity
            onPress={handleExport}
            style={styles.exportButton}
            disabled={isExporting}
          >
            <Text style={styles.exportText}>{isExporting ? '…' : 'Export'}</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Timeline */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineContent}
          snapToInterval={DayColumnWidth + Spacing.md}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.timeline}
        >
          {currentPlan.days.map((dayPlan, idx) => (
            <DayColumn
              key={dayPlan.day}
              dayPlan={dayPlan}
              travelSegments={currentPlan.travelSegments}
              onCardPress={(a) => setSelectedActivity(a)}
              onCardLongPress={handleCardLongPress}
              onCardFlickDown={(a) => moveCardToDock(a.id)}
              onCardDrop={(actId) => moveCardToDay(actId, dayPlan.day)}
              isActive={idx === useAuraStore.getState().activeDayIndex}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* The Dock */}
      <Dock
        plan={currentPlan}
        onAddCustomActivity={() => setShowCustomAdd(true)}
      />

      {/* Activity action sheet */}
      <Modal
        visible={!!selectedActivity}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedActivity(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSelectedActivity(null)}
          activeOpacity={1}
        >
          <View style={styles.actionSheet}>
            {selectedActivity && (
              <>
                <Text style={styles.actionTitle}>{selectedActivity.title}</Text>
                <Text style={styles.actionDistrict}>{selectedActivity.district}</Text>

                {/* Reorder within day */}
                {selectedDayPlan && (
                  <View style={styles.moveRow}>
                    <TouchableOpacity
                      style={[styles.moveButton, selectedIndex <= 0 && styles.moveButtonDisabled]}
                      onPress={handleMoveUp}
                      disabled={selectedIndex <= 0}
                    >
                      <Text style={styles.moveButtonText}>↑ Move Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.moveButton, selectedIndex >= selectedDayPlan.activities.length - 1 && styles.moveButtonDisabled]}
                      onPress={handleMoveDown}
                      disabled={selectedIndex >= selectedDayPlan.activities.length - 1}
                    >
                      <Text style={styles.moveButtonText}>↓ Move Down</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Move to another day */}
                {currentPlan && currentPlan.days.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPickerScroll}>
                    {currentPlan.days
                      .filter((d) => d.day !== selectedDayPlan?.day)
                      .map((d) => (
                        <TouchableOpacity
                          key={d.day}
                          style={styles.dayChip}
                          onPress={() => handleMoveToDay(d.day)}
                        >
                          <Text style={styles.dayChipText}>→ Day {d.day}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}

                <TouchableOpacity style={styles.actionButton} onPress={handleMoveCardToDock}>
                  <Text style={styles.actionButtonText}>Park in Dock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDestructive]}
                  onPress={() => setSelectedActivity(null)}
                >
                  <Text style={styles.actionButtonTextDestructive}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom activity add modal */}
      <Modal
        visible={showCustomAdd}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomAdd(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowCustomAdd(false)}
          activeOpacity={1}
        >
          <View style={[styles.actionSheet, styles.addSheet]}>
            <Text style={styles.addSheetTitle}>ADD CUSTOM ACTIVITY</Text>

            <TextInput
              style={styles.addInput}
              placeholder="Activity name"
              placeholderTextColor={Colors.fog}
              value={customTitle}
              onChangeText={setCustomTitle}
            />
            <TextInput
              style={styles.addInput}
              placeholder="District / neighbourhood"
              placeholderTextColor={Colors.fog}
              value={customDistrict}
              onChangeText={setCustomDistrict}
            />
            <TextInput
              style={styles.addInput}
              placeholder="Duration (minutes)"
              placeholderTextColor={Colors.fog}
              value={customDuration}
              onChangeText={setCustomDuration}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.slate }]}
              onPress={handleAddCustom}
            >
              <Text style={styles.actionButtonText}>Add to Dock →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.obsidian,
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    color: Colors.ash,
    fontSize: 14,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  destination: {
    color: Colors.ivory,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  vibeBadge: {
    color: Colors.smoke,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 2,
  },
  exportButton: {
    paddingLeft: 16,
  },
  exportText: {
    color: Colors.ash,
    fontSize: 14,
  },

  // Timeline
  timeline: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: DockHeight + 20,
    gap: Spacing.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: Colors.slate,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  addSheet: {
    paddingTop: 28,
  },
  addSheetTitle: {
    ...Typography.label,
    color: Colors.smoke,
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 4,
  },
  actionTitle: {
    color: Colors.ivory,
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  actionDistrict: {
    color: Colors.smoke,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: Colors.mist,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  actionButtonDestructive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  actionButtonText: {
    color: Colors.ivory,
    fontSize: 15,
    fontWeight: '500',
  },
  actionButtonTextDestructive: {
    color: Colors.smoke,
    fontSize: 15,
  },
  addInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.fog,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.ivory,
    fontSize: 15,
  },
  moveRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  moveButtonText: {
    color: Colors.ivory,
    fontSize: 14,
    fontWeight: '500',
  },
  dayPickerScroll: {
    flexGrow: 0,
  },
  dayChip: {
    backgroundColor: 'rgba(100,100,255,0.15)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(100,100,255,0.3)',
  },
  dayChipText: {
    color: Colors.ivory,
    fontSize: 13,
    fontWeight: '500',
  },
});
