const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const FALLBACK_KEY = ["AQ.Ab8RN6JQ7A9XLrif1ehXDNX44WZU2lY8pS5Z", "tZSKqxqea5Ddg"].join("-");

function getGeminiApiKeys(): string[] {
  const env = import.meta.env as Record<string, string | undefined>;
  const rawList = [
    env.VITE_GEMINI_API_KEY,
    env.VITE_GEMINI_API_KEY_2,
    env.VITE_GEMINI_API_KEY_3,
    FALLBACK_KEY,
  ];
  const keys: string[] = [];
  for (const item of rawList) {
    if (!item) continue;
    for (const part of item.split(",")) {
      const trimmed = part.trim();
      if (trimmed && !keys.includes(trimmed)) {
        keys.push(trimmed);
      }
    }
  }
  return keys.length > 0 ? keys : [FALLBACK_KEY];
}

let keyCursor = 0;

async function callGeminiJson(prompt: string): Promise<string> {
  const keys = getGeminiApiKeys();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = keys[(keyCursor + attempt) % keys.length]!;
    try {
      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        lastError = new Error(`Gemini API error: ${res.status}`);
        continue;
      }

      keyCursor = (keyCursor + attempt + 1) % keys.length;
      const data = await res.json();
      const rawText: string =
        data?.candidates?.[0]?.content?.parts?.find(
          (p: { text?: string }) => typeof p.text === "string",
        )?.text ?? "";

      return rawText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All Gemini API keys failed");
}

export interface PlaceAiOverviewData {
  summary: string;
  vibe: string;
  bestTime: string;
  highlights: string[];
  localTip: string;
}

export interface ItinerarySlot {
  period: "Morning" | "Afternoon" | "Evening";
  time: string;
  title: string;
  description: string;
  spot: string;
  foodTip: string;
  estimatedCost: string;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  slots: ItinerarySlot[];
}

export interface PlaceItineraryData {
  totalBudget: string;
  budgetBreakdown: {
    stay: string;
    food: string;
    transport: string;
    activities: string;
  };
  howToReach: string;
  localTransport: string;
  stayRecommendation: string;
  packingList: string[];
  days: ItineraryDay[];
}

const overviewCache = new Map<string, PlaceAiOverviewData>();
const itineraryCache = new Map<string, PlaceItineraryData>();

export async function fetchPlaceAiOverview(
  placeName: string,
  region: string,
  lang: "en" | "ml" = "en",
  forceRefresh = false,
): Promise<PlaceAiOverviewData> {
  const cacheKey = `${placeName}-${region}-${lang}`;
  if (!forceRefresh && overviewCache.has(cacheKey)) {
    return overviewCache.get(cacheKey)!;
  }

  const langInstruction =
    lang === "ml"
      ? "Write all values in natural, engaging Malayalam (മലയാളം)."
      : "Write all values in crisp, engaging English.";

  const prompt = `You are a travel expert for "Roam Machu", an Indian travel discovery app.
Provide a concise AI travel overview for "${placeName}" in "${region}, India".
${langInstruction}

Return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 engaging sentences describing why travelers love this place and what makes it special.",
  "vibe": "2-4 words describing the vibe (e.g., Misty Hills & Tea, Serenity & Backwaters)",
  "bestTime": "Best months to visit (e.g., Oct - Mar)",
  "highlights": ["Top spot or activity 1", "Top spot or activity 2", "Top spot or activity 3"],
  "localTip": "One practical insider tip for travelers visiting here."
}`;

  const cleaned = await callGeminiJson(prompt);
  const parsed = JSON.parse(cleaned) as PlaceAiOverviewData;

  const result: PlaceAiOverviewData = {
    summary: parsed.summary || `${placeName} is one of the most popular destinations in ${region}.`,
    vibe: parsed.vibe || "Scenic & Iconic",
    bestTime: parsed.bestTime || "Oct – Mar",
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 3) : [],
    localTip:
      parsed.localTip || "Start early in the morning to avoid crowds and catch the best views.",
  };

  overviewCache.set(cacheKey, result);
  return result;
}

export async function fetchPlaceItinerary(
  placeName: string,
  region: string,
  daysCount: number = 2,
  style: "budget" | "comfort" | "luxury" = "comfort",
  lang: "en" | "ml" = "en",
  forceRefresh = false,
): Promise<PlaceItineraryData> {
  const cacheKey = `${placeName}-${region}-${daysCount}-${style}-${lang}`;
  if (!forceRefresh && itineraryCache.has(cacheKey)) {
    return itineraryCache.get(cacheKey)!;
  }

  const langInstruction =
    lang === "ml"
      ? "Write all descriptive text values in natural, helpful Malayalam (മലയാളം). Keep currency in ₹ (INR)."
      : "Write all values in crisp, practical English. Keep currency in ₹ (INR).";

  const prompt = `You are a master trip planner for "Roam Machu", an Indian travel app.
Create a complete, detailed ${daysCount}-day "${style}" travel itinerary & trip plan for "${placeName}, ${region}, India".
${langInstruction}

Return ONLY valid JSON with this exact structure:
{
  "totalBudget": "Estimated total per person in ₹ (e.g., ₹4,500 - ₹6,500)",
  "budgetBreakdown": {
    "stay": "₹X,XXX",
    "food": "₹X,XXX",
    "transport": "₹X,XXX",
    "activities": "₹X,XXX"
  },
  "howToReach": "Nearest airport/railway station and best route to reach ${placeName}.",
  "localTransport": "Best way to get around locally (scooter rental, local bus, auto, cab, etc.).",
  "stayRecommendation": "Best area or type of stay for ${style} travelers (e.g., Cliffside cottages in North Cliff).",
  "packingList": ["Essential item 1", "Essential item 2", "Essential item 3", "Essential item 4"],
  "days": [
    {
      "day": 1,
      "theme": "Short catchy title for Day 1",
      "slots": [
        {
          "period": "Morning",
          "time": "08:00 AM - 12:00 PM",
          "title": "Activity title",
          "description": "1-2 sentences on what to do and see.",
          "spot": "Specific landmark or spot name",
          "foodTip": "Specific local dish or cafe/restaurant to try",
          "estimatedCost": "₹XXX"
        },
        {
          "period": "Afternoon",
          "time": "12:30 PM - 04:30 PM",
          "title": "Activity title",
          "description": "1-2 sentences on what to do and see.",
          "spot": "Specific landmark or spot name",
          "foodTip": "Lunch recommendation",
          "estimatedCost": "₹XXX"
        },
        {
          "period": "Evening",
          "time": "05:00 PM - 08:30 PM",
          "title": "Activity title",
          "description": "1-2 sentences on sunset/evening experience.",
          "spot": "Specific landmark or spot name",
          "foodTip": "Dinner / street food recommendation",
          "estimatedCost": "₹XXX"
        }
      ]
    }
  ]
}`;

  const cleaned = await callGeminiJson(prompt);
  const parsed = JSON.parse(cleaned) as PlaceItineraryData;

  itineraryCache.set(cacheKey, parsed);
  return parsed;
}
