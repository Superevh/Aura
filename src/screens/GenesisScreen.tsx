import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VibeOrb } from '../components/VibeOrb';
import { VibeType } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme';
import { useAuraStore } from '../store/useAuraStore';

interface GenesisScreenProps {
  onPlanGenerated: () => void;
}

const MIN_DAYS = 1;
const MAX_DAYS = 14;

const VIBES: VibeType[] = ['gourmand', 'explorer', 'sprinter', 'flaneur'];

export function GenesisScreen({ onPlanGenerated }: GenesisScreenProps) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [selectedVibe, setSelectedVibe] = useState<VibeType | null>(null);

  const { generatePlan, isGenerating, generationError } = useAuraStore();

  const titleAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const orbsAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(titleAnim, { toValue: 1, damping: 20, stiffness: 80, useNativeDriver: true }),
      Animated.spring(inputAnim, { toValue: 1, damping: 20, stiffness: 100, useNativeDriver: true }),
      Animated.spring(orbsAnim, { toValue: 1, damping: 20, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGenerate = async () => {
    if (!destination.trim() || !selectedVibe) return;
    await generatePlan(destination.trim(), selectedVibe, days);
    onPlanGenerated();
  };

  const canGenerate = destination.trim().length > 1 && selectedVibe !== null && !isGenerating;

  const incrementDays = () => setDays((d) => Math.min(d + 1, MAX_DAYS));
  const decrementDays = () => setDays((d) => Math.max(d - 1, MIN_DAYS));

  return (
    <LinearGradient
      colors={[Colors.obsidian, Colors.ink, '#1A1A2E']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo / Title */}
            <Animated.View
              style={[
                styles.titleSection,
                {
                  opacity: titleAnim,
                  transform: [
                    {
                      translateY: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.logoText}>AURA</Text>
              <Text style={styles.tagline}>A journey begins with a mood.</Text>
            </Animated.View>

            {/* Destination Input */}
            <Animated.View
              style={[
                styles.inputSection,
                {
                  opacity: inputAnim,
                  transform: [
                    {
                      translateY: inputAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.fieldLabel}>WHERE TO?</Text>
              <TextInput
                style={styles.destinationInput}
                placeholder="Paris, Kyoto, Oaxaca…"
                placeholderTextColor={Colors.fog}
                value={destination}
                onChangeText={setDestination}
                returnKeyType="done"
                autoCorrect={false}
              />

              {/* Duration dial */}
              <Text style={styles.fieldLabel}>HOW LONG?</Text>
              <View style={styles.durationContainer}>
                <TouchableOpacity style={styles.durationButton} onPress={decrementDays}>
                  <Text style={styles.durationButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.durationDisplay}>
                  <Text style={styles.durationNumber}>{days}</Text>
                  <Text style={styles.durationUnit}>{days === 1 ? 'day' : 'days'}</Text>
                </View>
                <TouchableOpacity style={styles.durationButton} onPress={incrementDays}>
                  <Text style={styles.durationButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Vibe Orbs */}
            <Animated.View
              style={[
                styles.orbsSection,
                {
                  opacity: orbsAnim,
                  transform: [
                    {
                      translateY: orbsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.fieldLabel}>CHOOSE YOUR VIBE</Text>
              <View style={styles.orbsGrid}>
                {VIBES.map((vibe, index) => (
                  <VibeOrb
                    key={vibe}
                    vibe={vibe}
                    selected={selectedVibe === vibe}
                    onPress={setSelectedVibe}
                    animationDelay={index * 100}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Error */}
            {generationError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
              </View>
            )}

            {/* Generate CTA */}
            <TouchableOpacity
              style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
              onPress={handleGenerate}
              disabled={!canGenerate}
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.generateText}>
                  {selectedVibe && destination
                    ? `Plan ${destination} →`
                    : 'Choose destination & vibe'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    paddingBottom: 60,
  },

  // Title
  titleSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '200',
    letterSpacing: 16,
    color: Colors.ivory,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.smoke,
    letterSpacing: 2,
    textAlign: 'center',
  },

  // Input
  inputSection: {
    gap: 12,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.smoke,
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 4,
  },
  destinationInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.fog,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: Colors.ivory,
    fontSize: 24,
    fontWeight: '200',
    letterSpacing: -0.5,
  },

  // Duration dial
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.fog,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  durationButtonText: {
    color: Colors.pearl,
    fontSize: 24,
    fontWeight: '200',
  },
  durationDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  durationNumber: {
    color: Colors.ivory,
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: -2,
  },
  durationUnit: {
    ...Typography.caption,
    color: Colors.smoke,
    letterSpacing: 2,
  },

  // Orbs
  orbsSection: {
    gap: 16,
  },
  orbsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },

  // Error
  errorContainer: {
    backgroundColor: 'rgba(255, 74, 107, 0.1)',
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 74, 107, 0.3)',
  },
  errorText: {
    color: Colors.fray,
    fontSize: 13,
    textAlign: 'center',
  },

  // Generate
  generateButton: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.round,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.mist,
    shadowOpacity: 0,
  },
  generateText: {
    color: Colors.obsidian,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
