import { Coordinates, TravelSegment } from '../types';

// Haversine formula to compute distance in km between two lat/lng points
function haversineKm(a: Coordinates, b: Coordinates): number {
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

// Estimate transit mode and minutes
export function estimateTravelSegment(
  from: Coordinates,
  to: Coordinates,
  fromId: string,
  toId: string
): TravelSegment {
  const distKm = haversineKm(from, to);

  let mode: TravelSegment['mode'];
  let travelMinutes: number;

  if (distKm < 0.5) {
    mode = 'walk';
    travelMinutes = Math.round((distKm / 5) * 60); // 5 km/h walking
  } else if (distKm < 5) {
    mode = 'walk';
    travelMinutes = Math.round((distKm / 4.5) * 60);
  } else if (distKm < 15) {
    mode = 'transit';
    travelMinutes = Math.round(8 + (distKm / 25) * 60); // transit avg 25 km/h + boarding
  } else {
    mode = 'taxi';
    travelMinutes = Math.round(5 + (distKm / 35) * 60); // taxi avg 35 km/h + pickup
  }

  return { fromId, toId, travelMinutes: Math.max(2, travelMinutes), mode };
}

// Determine visual state of a travel line
export type TravelLineState = 'knot' | 'stretch' | 'fray';

export function getTravelLineState(
  travelMinutes: number,
  availableGapMinutes: number
): TravelLineState {
  if (travelMinutes <= 10) return 'knot';
  if (travelMinutes <= availableGapMinutes) return 'stretch';
  return 'fray';
}

// Convert minutes-from-midnight to display string
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Determine time-of-day band for background gradient
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'golden' | 'dusk' | 'midnight';

export function getTimeOfDay(minutesFromMidnight: number): TimeOfDay {
  if (minutesFromMidnight < 360) return 'dawn'; // 00:00–06:00
  if (minutesFromMidnight < 660) return 'morning'; // 06:00–11:00
  if (minutesFromMidnight < 960) return 'afternoon'; // 11:00–16:00
  if (minutesFromMidnight < 1140) return 'golden'; // 16:00–19:00
  if (minutesFromMidnight < 1320) return 'dusk'; // 19:00–22:00
  return 'midnight'; // 22:00–24:00
}
