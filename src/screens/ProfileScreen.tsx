import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme';
import { useAuraStore } from '../store/useAuraStore';

interface ProfileScreenProps {}

export function ProfileScreen({}: ProfileScreenProps) {
  const { user, setUser, vault } = useAuraStore();

  const handleGoogleSignIn = () => {
    // In production: use expo-auth-session with Google OAuth
    // For MVP, simulate a sign-in
    Alert.alert(
      'Google Sign-In',
      'In production this opens the Google OAuth flow via expo-auth-session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mock Sign In',
          onPress: () => {
            setUser({
              id: 'mock_user_001',
              name: 'Alex Traveller',
              email: 'alex@example.com',
              avatarUrl: 'https://picsum.photos/seed/avatar/100/100',
            });
          },
        },
      ]
    );
  };

  const handleAppleSignIn = () => {
    Alert.alert('Apple Sign-In', 'In production this uses expo-apple-authentication.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mock Sign In',
        onPress: () => {
          setUser({
            id: 'mock_apple_001',
            name: 'Alex Traveller',
            email: 'alex@privaterelay.appleid.com',
          });
        },
      },
    ]);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <LinearGradient colors={[Colors.obsidian, Colors.ink]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.authContainer}>
            <Text style={styles.authLogo}>AURA</Text>
            <Text style={styles.authTagline}>Sign in to save your journeys across devices.</Text>

            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
                <Text style={styles.appleIcon}>🍎</Text>
                <Text style={styles.appleText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.authDisclaimer}>
              By continuing you agree to Aura's Terms of Service and Privacy Policy.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.obsidian, Colors.ink]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.profileContent}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user.name[0]}</Text>
              </View>
            )}
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{vault.length}</Text>
              <Text style={styles.statLabel}>Journeys</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {vault.reduce((acc, p) => acc + p.duration, 0)}
              </Text>
              <Text style={styles.statLabel}>Days Planned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{new Set(vault.map((v) => v.destination)).size}</Text>
              <Text style={styles.statLabel}>Destinations</Text>
            </View>
          </View>

          {/* Settings rows */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionLabel}>PREFERENCES</Text>

            {[
              { label: 'Notifications', value: 'On' },
              { label: 'Default Vibe', value: 'Explorer' },
              { label: 'Units', value: 'Metric' },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Text style={styles.settingsValue}>{item.value} ›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionLabel}>ACCOUNT</Text>
            {[
              { label: 'Export all plans' },
              { label: 'Delete account', destructive: true },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.settingsRow}>
                <Text
                  style={[styles.settingsLabel, item.destructive && { color: Colors.fray }]}
                >
                  {item.label}
                </Text>
                <Text style={styles.settingsValue}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  // Auth
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 24,
  },
  authLogo: {
    fontSize: 44,
    fontWeight: '200',
    letterSpacing: 14,
    color: Colors.ivory,
  },
  authTagline: {
    color: Colors.smoke,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
  },
  authButtons: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: 16,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleText: {
    color: Colors.obsidian,
    fontSize: 15,
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.obsidian,
    borderRadius: Radius.md,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  appleIcon: { fontSize: 18 },
  appleText: {
    color: Colors.ivory,
    fontSize: 15,
    fontWeight: '500',
  },
  authDisclaimer: {
    color: Colors.fog,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Profile
  profileContent: {
    padding: 24,
    gap: 24,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  avatarInitial: {
    color: Colors.ivory,
    fontSize: 32,
    fontWeight: '200',
  },
  userName: {
    color: Colors.ivory,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  userEmail: {
    color: Colors.smoke,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.slate,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.fog,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.fog,
    marginVertical: 4,
  },
  statNumber: {
    color: Colors.ivory,
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: -1,
  },
  statLabel: {
    color: Colors.smoke,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Settings
  settingsSection: {
    gap: 2,
  },
  settingsSectionLabel: {
    ...Typography.label,
    color: Colors.smoke,
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.slate,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.mist,
    marginBottom: 1,
  },
  settingsLabel: {
    color: Colors.pearl,
    fontSize: 15,
  },
  settingsValue: {
    color: Colors.smoke,
    fontSize: 14,
  },

  // Sign out
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.fog,
    borderRadius: Radius.md,
    marginTop: 8,
  },
  signOutText: {
    color: Colors.ash,
    fontSize: 15,
  },
});
