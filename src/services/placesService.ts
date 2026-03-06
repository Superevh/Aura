/**
 * Places Service — Google Places API (New) for high-quality location imagery.
 * Falls back to Unsplash query if Places API key unavailable.
 */

const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ?? '';

const PLACES_PHOTO_BASE = 'https://places.googleapis.com/v1';
const UNSPLASH_BASE = 'https://api.unsplash.com';

interface PlacesPhotoResult {
  name: string; // places/{placeId}/photos/{photoReference}
}

// Search for a place and get its best photo URI
export async function getPlaceHeroImage(
  placeName: string,
  location: string
): Promise<string> {
  if (PLACES_API_KEY) {
    try {
      return await fetchFromGooglePlaces(placeName, location);
    } catch (err) {
      console.warn('[placesService] Google Places failed, falling back to Unsplash:', err);
    }
  }

  if (UNSPLASH_ACCESS_KEY) {
    try {
      return await fetchFromUnsplash(placeName, location);
    } catch (err) {
      console.warn('[placesService] Unsplash failed:', err);
    }
  }

  // Final fallback: deterministic placeholder via picsum
  return getPlaceholderImage(placeName);
}

async function fetchFromGooglePlaces(placeName: string, location: string): Promise<string> {
  // Text Search
  const searchRes = await fetch(`${PLACES_API_BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.name,places.photos',
    },
    body: JSON.stringify({ textQuery: `${placeName} ${location}` }),
  });

  if (!searchRes.ok) throw new Error(`Places search ${searchRes.status}`);
  const data = await searchRes.json();

  const photo: PlacesPhotoResult | undefined = data.places?.[0]?.photos?.[0];
  if (!photo) throw new Error('No photos in response');

  // Get photo URI
  const photoRes = await fetch(
    `${PLACES_API_BASE_URL}/${photo.name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${PLACES_API_KEY}`
  );
  if (!photoRes.ok) throw new Error(`Photo fetch ${photoRes.status}`);
  return photoRes.url; // redirected URL contains the image
}

const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';

async function fetchFromUnsplash(placeName: string, location: string): Promise<string> {
  const query = encodeURIComponent(`${placeName} ${location} travel`);
  const res = await fetch(
    `${UNSPLASH_BASE}/photos/random?query=${query}&orientation=landscape&content_filter=high`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
  );
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const data = await res.json();
  return data.urls?.regular ?? getPlaceholderImage(placeName);
}

function getPlaceholderImage(seed: string): string {
  // Deterministic placeholder using a hash of the name
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const id = Math.abs(hash) % 1000;
  return `https://picsum.photos/seed/${id}/800/600`;
}

// Batch-fetch images for a list of activities
export async function enrichActivitiesWithImages(
  activities: Array<{ title: string; district: string; imageUrl?: string }>,
  destination: string
): Promise<string[]> {
  return Promise.all(
    activities.map(async (a) => {
      if (a.imageUrl && a.imageUrl.startsWith('http')) return a.imageUrl;
      return getPlaceHeroImage(a.title, `${a.district}, ${destination}`);
    })
  );
}
