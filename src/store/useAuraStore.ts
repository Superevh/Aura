import { create } from 'zustand';
import { Activity, AuraPlan, User, VibeType, VaultPlan, TravelSegment } from '../types';
import { generateItinerary } from '../services/aiService';
import { enrichActivitiesWithImages } from '../services/placesService';
import { estimateTravelSegment } from '../utils/travelTime';
import { optimiseDayOrder, clusterActivitiesByDistrict } from '../utils/clustering';
import { VIBE_CONFIGS } from '../utils/vibeConfig';

let _idCounter = 1;
function uid(prefix = 'act'): string {
  return `${prefix}_${Date.now()}_${_idCounter++}`;
}

function buildStartTimes(activities: Activity[]): Activity[] {
  let cursor = 8 * 60; // start at 08:00
  return activities.map((a) => {
    const updated = { ...a, startTime: cursor };
    cursor += a.duration + 30; // 30-min buffer between activities
    return updated;
  });
}

function computeTravelSegments(activities: Activity[]): TravelSegment[] {
  const segments: TravelSegment[] = [];
  for (let i = 0; i < activities.length - 1; i++) {
    const from = activities[i];
    const to = activities[i + 1];
    if (from.coordinates && to.coordinates) {
      segments.push(estimateTravelSegment(from.coordinates, to.coordinates, from.id, to.id));
    }
  }
  return segments;
}

function checkDayOverfill(activities: Activity[], vibe: VibeType): boolean {
  const config = VIBE_CONFIGS[vibe];
  return activities.length > config.maxActivitiesPerDay;
}

interface AuraState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Current plan
  currentPlan: AuraPlan | null;
  isGenerating: boolean;
  generationError: string | null;

  // Vault
  vault: VaultPlan[];

  // Active day scroll (for dock re-ranking)
  activeDayIndex: number;
  setActiveDayIndex: (idx: number) => void;

  // Actions
  generatePlan: (destination: string, vibe: VibeType, days: number) => Promise<void>;
  moveCardToDay: (activityId: string, targetDay: number, insertAfterIndex?: number) => void;
  moveCardToDock: (activityId: string) => void;
  reorderWithinDay: (day: number, fromIndex: number, toIndex: number) => void;
  addCustomActivity: (activity: Omit<Activity, 'id'>) => void;
  savePlanToVault: () => void;
  loadPlanFromVault: (planId: string) => void;
  clearCurrentPlan: () => void;
}

export const useAuraStore = create<AuraState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentPlan: null,
  isGenerating: false,
  generationError: null,

  vault: [],
  activeDayIndex: 0,
  setActiveDayIndex: (idx) => set({ activeDayIndex: idx }),

  generatePlan: async (destination, vibe, days) => {
    set({ isGenerating: true, generationError: null });

    try {
      const { activities: rawActivities, dockActivities: rawDock } = await generateItinerary(
        destination,
        vibe,
        days
      );

      // Assign IDs and normalise coordinates
      const activities: Activity[] = rawActivities.map((a, i) => ({
        ...a,
        id: uid('act'),
        imageUrl: '',
        coordinates: { lat: (a as any).lat ?? 0, lng: (a as any).lng ?? 0 },
        day: Math.floor(i / VIBE_CONFIGS[vibe].maxActivitiesPerDay) + 1,
      }));

      const dockActivities: Activity[] = rawDock.map((a) => ({
        ...a,
        id: uid('dock'),
        imageUrl: '',
        coordinates: { lat: (a as any).lat ?? 0, lng: (a as any).lng ?? 0 },
        isGhost: true,
      }));

      // Enrich images in parallel
      const allActivities = [...activities, ...dockActivities];
      const imageUrls = await enrichActivitiesWithImages(
        allActivities.map((a) => ({ title: a.title, district: a.district })),
        destination
      );
      allActivities.forEach((a, i) => {
        a.imageUrl = imageUrls[i];
      });

      // Build day plans with geographic optimisation
      const dayPlans = [];
      const segments: TravelSegment[] = [];

      for (let d = 1; d <= days; d++) {
        const dayActs = activities.filter((a) => a.day === d);
        const optimised = optimiseDayOrder(dayActs);
        const withTimes = buildStartTimes(optimised);
        const daySegments = computeTravelSegments(withTimes);
        segments.push(...daySegments);

        dayPlans.push({
          day: d,
          date: new Date(Date.now() + (d - 1) * 86400000).toISOString().split('T')[0],
          activities: withTimes,
          isOverfilled: checkDayOverfill(withTimes, vibe),
        });
      }

      const plan: AuraPlan = {
        id: uid('plan'),
        destination,
        duration: days,
        vibe,
        createdAt: new Date().toISOString(),
        coverImageUrl: activities[0]?.imageUrl ?? '',
        days: dayPlans,
        dockActivities: dockActivities,
        travelSegments: segments,
      };

      set({ currentPlan: plan, isGenerating: false });
    } catch (err) {
      set({ isGenerating: false, generationError: String(err) });
    }
  },

  moveCardToDay: (activityId, targetDay, insertAfterIndex) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    // Find activity (from any day or dock)
    let activity: Activity | undefined;
    let sourceDayIndex = -1;

    const updatedDays = currentPlan.days.map((d, idx) => {
      const found = d.activities.find((a) => a.id === activityId);
      if (found) {
        activity = found;
        sourceDayIndex = idx;
        return { ...d, activities: d.activities.filter((a) => a.id !== activityId) };
      }
      return d;
    });

    const updatedDock = currentPlan.dockActivities.filter((a) => {
      if (a.id === activityId) {
        activity = a;
        return false;
      }
      return true;
    });

    if (!activity) return;

    const movedActivity: Activity = { ...activity, day: targetDay, isGhost: false };

    const finalDays = updatedDays.map((d) => {
      if (d.day !== targetDay) return d;
      const newActivities = [...d.activities];
      const insertAt = insertAfterIndex !== undefined ? insertAfterIndex + 1 : newActivities.length;
      newActivities.splice(insertAt, 0, movedActivity);
      const withTimes = buildStartTimes(optimiseDayOrder(newActivities));
      return {
        ...d,
        activities: withTimes,
        isOverfilled: checkDayOverfill(withTimes, currentPlan.vibe),
      };
    });

    // Recompute all travel segments
    const segments: TravelSegment[] = [];
    finalDays.forEach((d) => segments.push(...computeTravelSegments(d.activities)));

    set({
      currentPlan: {
        ...currentPlan,
        days: finalDays,
        dockActivities: updatedDock,
        travelSegments: segments,
      },
    });
  },

  moveCardToDock: (activityId) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    let activity: Activity | undefined;

    const updatedDays = currentPlan.days.map((d) => {
      const found = d.activities.find((a) => a.id === activityId);
      if (found) {
        activity = { ...found, day: undefined, startTime: undefined, isGhost: true };
        const remaining = d.activities.filter((a) => a.id !== activityId);
        const withTimes = buildStartTimes(remaining);
        return {
          ...d,
          activities: withTimes,
          isOverfilled: checkDayOverfill(withTimes, currentPlan.vibe),
        };
      }
      return d;
    });

    if (!activity) return;

    const segments: TravelSegment[] = [];
    updatedDays.forEach((d) => segments.push(...computeTravelSegments(d.activities)));

    set({
      currentPlan: {
        ...currentPlan,
        days: updatedDays,
        dockActivities: [...currentPlan.dockActivities, activity],
        travelSegments: segments,
      },
    });
  },

  reorderWithinDay: (day, fromIndex, toIndex) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedDays = currentPlan.days.map((d) => {
      if (d.day !== day) return d;
      const activities = [...d.activities];
      const [moved] = activities.splice(fromIndex, 1);
      activities.splice(toIndex, 0, moved);
      const withTimes = buildStartTimes(activities);
      return { ...d, activities: withTimes };
    });

    const segments: TravelSegment[] = [];
    updatedDays.forEach((d) => segments.push(...computeTravelSegments(d.activities)));

    set({ currentPlan: { ...currentPlan, days: updatedDays, travelSegments: segments } });
  },

  addCustomActivity: (activityData) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const activity: Activity = { ...activityData, id: uid('custom'), isGhost: true };
    set({
      currentPlan: {
        ...currentPlan,
        dockActivities: [...currentPlan.dockActivities, activity],
      },
    });
  },

  savePlanToVault: () => {
    const { currentPlan, vault } = get();
    if (!currentPlan) return;

    const vaultEntry: VaultPlan = {
      id: currentPlan.id,
      destination: currentPlan.destination,
      vibe: currentPlan.vibe,
      coverImageUrl: currentPlan.coverImageUrl,
      duration: currentPlan.duration,
      createdAt: currentPlan.createdAt,
    };

    const deduplicated = vault.filter((v) => v.id !== vaultEntry.id);
    set({ vault: [vaultEntry, ...deduplicated] });
  },

  loadPlanFromVault: (planId) => {
    // In a real app, plans would be persisted to storage and loaded by ID.
    // For MVP this is a no-op (vault entries are summaries, full plans need persistence).
    console.log('[store] loadPlanFromVault:', planId);
  },

  clearCurrentPlan: () => set({ currentPlan: null }),
}));
