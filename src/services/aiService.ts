/**
 * AI Service — powered by GPT-4o-mini via OpenAI-compatible API.
 * Generates Vibe-based itinerary suggestions and activity curation.
 */
import { Activity, VibeType, ActivityCategory } from '../types';
import { VIBE_CONFIGS } from '../utils/vibeConfig';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

function getApiKey(): string {
  // In production use expo-constants or a secure env solution
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
  if (!key) console.warn('[aiService] EXPO_PUBLIC_OPENAI_API_KEY not set — using mock data');
  return key;
}

interface RawActivity {
  title: string;
  poeticHook: string;
  category: ActivityCategory;
  district: string;
  lat: number;
  lng: number;
  duration: number;
  needToKnows: string[];
  bookingUrl?: string;
  queueWarning?: string;
}

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key');

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function buildSystemPrompt(vibe: VibeType, destination: string, days: number): string {
  const config = VIBE_CONFIGS[vibe];
  return `You are Aura, a world-class travel curator. Your task is to generate a ${days}-day itinerary for "${destination}" tailored to the "${config.label}" travel personality.

Vibe description: "${config.description}"
Preferred activity categories: ${config.focusCategories.join(', ')}
Pace: ${config.pace} (max ${config.maxActivitiesPerDay} activities per day)

Return a JSON object with this exact structure:
{
  "activities": [
    {
      "title": "Short evocative name (2-5 words)",
      "poeticHook": "Exactly three evocative words, space-separated",
      "category": one of [restaurant, cafe, museum, landmark, park, market, bar, shop, experience, accommodation],
      "district": "neighbourhood name",
      "lat": numeric latitude,
      "lng": numeric longitude,
      "duration": duration in minutes (30–240),
      "needToKnows": ["up to 3 practical tips"],
      "bookingUrl": "URL or null",
      "queueWarning": "queue/booking note or null"
    }
  ],
  "dockActivities": [ same structure, 4–8 backup activities ]
}

Produce ${config.maxActivitiesPerDay * days} primary activities across all days, geographically clustered by district within each day.
All coordinates must be accurate for ${destination}. Poetichook must be exactly 3 words. Duration in minutes.`;
}

function mockActivities(destination: string, vibe: VibeType, days: number): RawActivity[] {
  // Minimal mock data for development / when API key not set
  const mock: RawActivity[] = [
    {
      title: 'Morning Market Walk',
      poeticHook: 'Spice-laced dawn',
      category: 'market',
      district: 'Old Town',
      lat: 48.8566,
      lng: 2.3522,
      duration: 90,
      needToKnows: ['Opens at 07:00', 'Cash preferred'],
    },
    {
      title: 'Hidden Courtyard Café',
      poeticHook: 'Hush and espresso',
      category: 'cafe',
      district: 'Old Town',
      lat: 48.857,
      lng: 2.353,
      duration: 60,
      needToKnows: ['No reservations', 'Try the cardamom latte'],
    },
    {
      title: 'Rooftop Panorama',
      poeticHook: 'City below, breathless',
      category: 'landmark',
      district: 'Centre',
      lat: 48.858,
      lng: 2.2945,
      duration: 120,
      needToKnows: ['Book 48h ahead', 'Last entry 18:30'],
      bookingUrl: 'https://example.com/rooftop',
      queueWarning: '45–90 min queue without pre-booking',
    },
    {
      title: 'Neighbourhood Bistro',
      poeticHook: 'Linen, butter, wine',
      category: 'restaurant',
      district: 'Le Marais',
      lat: 48.8544,
      lng: 2.3603,
      duration: 120,
      needToKnows: ['Reservations essential', 'Seasonal menu'],
      bookingUrl: 'https://example.com/bistro',
    },
    {
      title: 'Contemporary Art Museum',
      poeticHook: 'White walls, wonder',
      category: 'museum',
      district: 'Le Marais',
      lat: 48.8609,
      lng: 2.3525,
      duration: 150,
      needToKnows: ['Free Sundays', 'Audio guide recommended'],
    },
    {
      title: 'Canal-side Aperitivo',
      poeticHook: 'Slow dusk, Campari',
      category: 'bar',
      district: 'Canal Saint-Martin',
      lat: 48.8704,
      lng: 2.3616,
      duration: 90,
      needToKnows: ['No reservations', 'Arrives buzzing at 19:00'],
    },
  ];

  // Repeat/offset for multi-day mocks
  const expanded: RawActivity[] = [];
  for (let d = 0; d < days; d++) {
    mock.forEach((a) => {
      expanded.push({
        ...a,
        lat: a.lat + d * 0.002,
        lng: a.lng + d * 0.002,
      });
    });
  }
  return expanded;
}

export async function generateItinerary(
  destination: string,
  vibe: VibeType,
  days: number
): Promise<{ activities: RawActivity[]; dockActivities: RawActivity[] }> {
  try {
    const systemPrompt = buildSystemPrompt(vibe, destination, days);
    const json = await callOpenAI([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate a ${days}-day ${vibe} itinerary for ${destination}. Return valid JSON only.`,
      },
    ]);
    const parsed = JSON.parse(json);
    return {
      activities: parsed.activities ?? [],
      dockActivities: parsed.dockActivities ?? [],
    };
  } catch (err) {
    console.warn('[aiService] Falling back to mock data:', err);
    const activities = mockActivities(destination, vibe, days);
    return { activities, dockActivities: activities.slice(0, 4) };
  }
}

export async function suggestAlternative(
  destination: string,
  vibe: VibeType,
  district: string,
  excludedTitles: string[]
): Promise<RawActivity | null> {
  try {
    const config = VIBE_CONFIGS[vibe];
    const json = await callOpenAI([
      {
        role: 'system',
        content: `You are Aura. Suggest ONE backup activity for a ${config.label} traveller in the "${district}" district of "${destination}". Exclude: ${excludedTitles.join(', ')}. Return JSON matching the activity schema.`,
      },
      { role: 'user', content: 'Suggest one activity.' },
    ]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
