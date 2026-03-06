import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VaultPlan } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme';
import { VIBE_CONFIGS } from '../utils/vibeConfig';
import { useAuraStore } from '../store/useAuraStore';

interface VaultScreenProps {
  onSelectPlan?: (planId: string) => void;
  onNewPlan: () => void;
}

function PostcardTile({ plan }: { plan: VaultPlan }) {
  const vibe = VIBE_CONFIGS[plan.vibe];
  const date = new Date(plan.createdAt).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.postcard}>
      <Image
        source={{ uri: plan.coverImageUrl || 'https://picsum.photos/seed/vault/600/400' }}
        style={styles.postcardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.postcardGradient}
      />
      <View style={styles.postcardBody}>
        <View
          style={[
            styles.vibePill,
            { backgroundColor: vibe.colorPrimary + '33', borderColor: vibe.colorPrimary + '66' },
          ]}
        >
          <Text style={[styles.vibePillText, { color: vibe.colorPrimary }]}>
            {vibe.emoji} {vibe.label}
          </Text>
        </View>
        <Text style={styles.postcardDestination}>{plan.destination}</Text>
        <Text style={styles.postcardMeta}>
          {plan.duration} {plan.duration === 1 ? 'day' : 'days'} · {date}
        </Text>
      </View>
    </View>
  );
}

export function VaultScreen({ onSelectPlan, onNewPlan }: VaultScreenProps) {
  const { vault } = useAuraStore();

  return (
    <LinearGradient colors={[Colors.obsidian, Colors.ink]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>THE VAULT</Text>
            <Text style={styles.headerTitle}>Your Journeys</Text>
          </View>
          <TouchableOpacity style={styles.newButton} onPress={onNewPlan}>
            <Text style={styles.newButtonText}>+ New Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {vault.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptySubtitle}>
              Plans you create and export will be saved here as postcards.
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={onNewPlan}>
              <Text style={styles.startButtonText}>Start Planning →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>
              {vault.length} {vault.length === 1 ? 'Journey' : 'Journeys'}
            </Text>
            {vault.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => onSelectPlan?.(plan.id)}
                activeOpacity={0.9}
              >
                <PostcardTile plan={plan} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLabel: {
    ...Typography.label,
    color: Colors.smoke,
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.ivory,
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: -0.5,
  },
  newButton: {
    backgroundColor: Colors.slate,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  newButtonText: {
    color: Colors.pearl,
    fontSize: 13,
    fontWeight: '500',
  },

  // Grid
  grid: {
    padding: 24,
    gap: 16,
    paddingBottom: 60,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.smoke,
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 4,
  },

  // Postcard
  postcard: {
    height: 200,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.slate,
  },
  postcardImage: {
    width: '100%',
    height: '100%',
  },
  postcardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  postcardBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 4,
  },
  vibePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.round,
    borderWidth: 1,
    marginBottom: 4,
  },
  vibePillText: {
    fontSize: 10,
    fontWeight: '500',
  },
  postcardDestination: {
    color: Colors.ivory,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  postcardMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    letterSpacing: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    color: Colors.ivory,
    fontSize: 24,
    fontWeight: '200',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    color: Colors.smoke,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    marginTop: 8,
    backgroundColor: Colors.slate,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  startButtonText: {
    color: Colors.pearl,
    fontSize: 15,
    fontWeight: '500',
  },
});
