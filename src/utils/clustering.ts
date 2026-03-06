import { Activity, Coordinates } from '../types';

// Group activities into geographic clusters (districts)
// Uses a simple greedy approach: activities within ~1km radius share a cluster
const CLUSTER_RADIUS_KM = 1.2;

function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Cluster {
  district: string;
  centroid: Coordinates;
  activities: Activity[];
}

export function clusterActivitiesByDistrict(activities: Activity[]): Cluster[] {
  const clusters: Cluster[] = [];

  for (const activity of activities) {
    let placed = false;

    for (const cluster of clusters) {
      if (distanceKm(activity.coordinates, cluster.centroid) <= CLUSTER_RADIUS_KM) {
        cluster.activities.push(activity);
        // Update centroid (running average)
        const n = cluster.activities.length;
        cluster.centroid = {
          lat: (cluster.centroid.lat * (n - 1) + activity.coordinates.lat) / n,
          lng: (cluster.centroid.lng * (n - 1) + activity.coordinates.lng) / n,
        };
        placed = true;
        break;
      }
    }

    if (!placed) {
      clusters.push({
        district: activity.district,
        centroid: { ...activity.coordinates },
        activities: [activity],
      });
    }
  }

  return clusters;
}

// Rank dock activities by proximity to current scroll position (a coordinates point)
export function rankDockByProximity(dockActivities: Activity[], viewCoords: Coordinates): Activity[] {
  return [...dockActivities].sort((a, b) => {
    const dA = distanceKm(a.coordinates, viewCoords);
    const dB = distanceKm(b.coordinates, viewCoords);
    return dA - dB;
  });
}

// Reorder activities within a day to minimise total transit distance (nearest-neighbour heuristic)
export function optimiseDayOrder(activities: Activity[]): Activity[] {
  if (activities.length <= 1) return activities;

  const remaining = [...activities];
  const ordered: Activity[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = distanceKm(last.coordinates, remaining[i].coordinates);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return ordered;
}
