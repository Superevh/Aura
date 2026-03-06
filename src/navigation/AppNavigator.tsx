import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GenesisScreen } from '../screens/GenesisScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Colors } from '../theme/colors';
import { useAuraStore } from '../store/useAuraStore';

type Screen = 'genesis' | 'timeline' | 'vault' | 'profile';

type TabScreen = 'genesis' | 'vault' | 'profile';
const TAB_ITEMS: { id: TabScreen; label: string; emoji: string }[] = [
  { id: 'genesis', label: 'Plan', emoji: '✦' },
  { id: 'vault', label: 'Vault', emoji: '◈' },
  { id: 'profile', label: 'Profile', emoji: '◎' },
];

export function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('genesis');
  const { currentPlan } = useAuraStore();

  const handlePlanGenerated = () => {
    setCurrentScreen('timeline');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'genesis':
        return <GenesisScreen onPlanGenerated={handlePlanGenerated} />;
      case 'timeline':
        return currentPlan ? (
          <TimelineScreen onBack={() => setCurrentScreen('genesis')} />
        ) : (
          <GenesisScreen onPlanGenerated={handlePlanGenerated} />
        );
      case 'vault':
        return (
          <VaultScreen
            onNewPlan={() => setCurrentScreen('genesis')}
            onSelectPlan={() => {
              if (currentPlan) setCurrentScreen('timeline');
            }}
          />
        );
      case 'profile':
        return <ProfileScreen />;
      default:
        return <GenesisScreen onPlanGenerated={handlePlanGenerated} />;
    }
  };

  // Don't show tabs on timeline (full-screen experience)
  const showTabs = currentScreen !== 'timeline';

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {showTabs && (
          <View style={styles.tabBar}>
            {TAB_ITEMS.map((tab) => {
              const isActive = currentScreen === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.tabItem}
                  onPress={() => setCurrentScreen(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabEmoji, isActive && styles.tabEmojiActive]}>
                    {tab.emoji}
                  </Text>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Active plan indicator */}
            {currentPlan && (currentScreen as Screen) !== 'timeline' && (
              <TouchableOpacity
                style={styles.activePlanPill}
                onPress={() => setCurrentScreen('timeline')}
              >
                <Text style={styles.activePlanText}>
                  {currentPlan.destination} →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.obsidian,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.ink,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 24, // safe area
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 0,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabEmoji: {
    fontSize: 18,
    color: Colors.fog,
  },
  tabEmojiActive: {
    color: Colors.pearl,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.fog,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: Colors.ash,
  },
  activePlanPill: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    backgroundColor: Colors.slate,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  activePlanText: {
    color: Colors.pearl,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
