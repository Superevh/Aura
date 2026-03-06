# Aura — Visual Travel Planning Engine

> *A journey begins with a mood.*

Aura is a visual-first travel planning app that replaces the cognitive load of logistics with a tactile, mood-board experience. It uses spatial intelligence to ensure itineraries are geographically realistic—without requiring users to look at a map.

---

## The Experience

### 1. Genesis — Choose Your Vibe
Enter a destination and duration, then select one of four **Vibe Orbs**:

| Orb | Personality | Focus |
|-----|-------------|-------|
| 🍷 **The Gourmand** | Culinary journey | Restaurants, markets, bars |
| 🗺️ **The Explorer** | Off the beaten path | Hidden spots, local neighborhoods |
| ⚡ **The Sprinter** | Iconic highlights | Landmarks, museums, key sites |
| 🌿 **The Flâneur** | Leisurely drift | Cafés, galleries, parks |

### 2. The Timeline — Visual Itinerary
Cards **cascade** onto a horizontal timeline — days as columns, activities as cards. Each card has:
- **Front**: Hero image + 3-word Poetic Hook + title
- **Back** (flick to reveal): Need-to-Knows, booking links, queue warnings

Background gradients shift from **dawn-blue → golden-hour amber → midnight-obsidian** as you scroll through a day.

### 3. Spatial Intelligence — The Travel Gap
Every card is connected by a glowing **Travel Line** showing real transit time:
- **Knot** (≤10m): Tight green line — activities are walkable
- **Stretch** (11m–gap): Pulsing blue line — transit needed
- **Fray** (>gap): Red breaking line — itinerary is broken ⚠️

### 4. The Dock — Living Backlog
A translucent tray of **Ghost Cards** — activities that fit your vibe but aren't yet in the plan. The Dock re-ranks itself based on your current scroll position, surfacing geographically nearby options first.

---

## Technical Architecture

```
src/
├── components/
│   ├── ActivityCard.tsx     # Flip card with hero image + need-to-knows
│   ├── DayColumn.tsx        # Vertical day column with time-of-day gradient
│   ├── Dock.tsx             # Translucent ghost card reservoir
│   ├── TravelLine.tsx       # Knot / stretch / fray spatial indicator
│   └── VibeOrb.tsx          # Animated vibe selection orb
├── screens/
│   ├── GenesisScreen.tsx    # Entry: destination + duration + vibe
│   ├── TimelineScreen.tsx   # Main horizontal timeline view
│   ├── VaultScreen.tsx      # Plan history as gallery of postcards
│   └── ProfileScreen.tsx    # Auth + settings
├── services/
│   ├── aiService.ts         # GPT-4o-mini itinerary generation
│   ├── placesService.ts     # Google Places API / Unsplash imagery
│   └── exportService.ts     # Gallery Guide PDF (A4, 12-column)
├── store/
│   └── useAuraStore.ts      # Zustand global state
├── utils/
│   ├── clustering.ts        # Geographic clustering + dock ranking
│   ├── travelTime.ts        # Haversine distance + transit estimates
│   ├── timeOfDay.ts         # Gradient interpolation by time-of-day
│   └── vibeConfig.ts        # Vibe personality definitions
└── theme/
    ├── colors.ts            # Full dark palette + time-of-day gradients
    ├── typography.ts        # Variable sans-serif type scale
    └── animations.ts        # Spring physics constants
```

**Stack:**
- **Framework**: Expo (React Native) + TypeScript
- **State**: Zustand
- **Animations**: React Native Animated (spring-physics)
- **Intelligence**: OpenAI GPT-4o-mini
- **Imagery**: Google Places API (New) / Unsplash fallback
- **Export**: expo-print → PDF
- **Blur/Gradients**: expo-blur + expo-linear-gradient

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API keys
```bash
cp .env.example .env
# Edit .env with your keys
```

Required keys:
- `EXPO_PUBLIC_OPENAI_API_KEY` — [OpenAI API](https://platform.openai.com)
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` — [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service)
- `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY` — [Unsplash Developer API](https://unsplash.com/developers)

> The app runs in **mock mode** if no API keys are set — you'll see sample data for Paris.

### 3. Run
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (limited gesture support)
npm run web
```

---

## Key Features (MVP v1.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Vibe Orb selection | ✅ | Spring-animated, 4 personalities |
| AI itinerary generation | ✅ | GPT-4o-mini with mock fallback |
| Visual Timeline | ✅ | Horizontal, day-column layout |
| Activity Card flip | ✅ | Front/back with spring animation |
| Time-of-day gradients | ✅ | Dawn → midnight progression |
| Travel Line (Knot/Stretch/Fray) | ✅ | Haversine distance calculation |
| Overfill warning | ✅ | Amber pulse when day is too full |
| The Dock | ✅ | Ghost cards with proximity ranking |
| Custom activity add | ✅ | Manual title → auto-searches image |
| Gallery Guide PDF export | ✅ | A4, 12-column grid |
| The Vault | ✅ | Plan history as postcard gallery |
| Auth (Google / Apple) | ✅ | UI + hooks (OAuth flow stub) |
| Geographic clustering | ✅ | Nearest-neighbour day optimisation |

---

## Design Principles

- **Negative space**: UI hides secondary details unless requested
- **Spring physics**: All animations use spring damping — no linear easing
- **Materiality**: Cards have physical weight; the dock is translucent glass
- **Friction feedback**: Overfilling a day pulses amber; a broken itinerary frays red
