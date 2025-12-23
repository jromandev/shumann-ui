import type {
  ResonanceData,
  NotableEvent,
  DailySummary,
  HistoricalDataPoint,
  EventCategory,
} from "../types";

const BASE_FREQUENCY = 7.83; // Hz
const FREQUENCY_VARIATION = 0.5; // +/- Hz
const BASE_AMPLITUDE = 1.0;
const MAX_AMPLITUDE = 10.0;

// Simulate realistic variations based on time of day (UTC thunderstorm activity)
function getTimeBasedAmplitude(date: Date): number {
  const hour = date.getUTCHours();
  // Peak activity around 14:00-16:00 UTC (global thunderstorm maximum)
  const peakHour = 15;
  const hourDiff = Math.abs(hour - peakHour);
  const dampening = Math.cos((hourDiff / 12) * Math.PI) * 0.5 + 0.5;
  return BASE_AMPLITUDE + dampening * 0.5;
}

// Generate random Q-burst events (sudden spikes)
function shouldGenerateQBurst(): boolean {
  return Math.random() < 0.02; // 2% chance
}

// Generate solar activity correlation
function getSolarActivity(amplitude: number):
  | {
      flareClass?: string;
      kpIndex?: number;
      cmeSpeed?: number;
    }
  | undefined {
  if (amplitude > 5) {
    const classes = ["C", "M", "X"];
    const classIndex = amplitude > 8 ? 2 : amplitude > 6 ? 1 : 0;
    return {
      flareClass: `${classes[classIndex]}${(Math.random() * 9 + 1).toFixed(1)}`,
      kpIndex: Math.floor(amplitude / 1.5) + Math.floor(Math.random() * 2),
      cmeSpeed:
        amplitude > 7 ? Math.floor(800 + Math.random() * 1200) : undefined,
    };
  }
  return undefined;
}

export function generateCurrentResonance(): ResonanceData {
  const now = new Date();
  const baseAmp = getTimeBasedAmplitude(now);
  const isQBurst = shouldGenerateQBurst();

  const amplitude = isQBurst
    ? baseAmp * (5 + Math.random() * 5)
    : baseAmp + (Math.random() - 0.5) * 0.3;

  const frequency =
    BASE_FREQUENCY + (Math.random() - 0.5) * FREQUENCY_VARIATION;

  return {
    timestamp: now,
    frequency,
    amplitude: Math.min(amplitude, MAX_AMPLITUDE),
    harmonics: {
      first: 14.3 + (Math.random() - 0.5) * 0.3,
      second: 20.8 + (Math.random() - 0.5) * 0.3,
      third: 27.3 + (Math.random() - 0.5) * 0.3,
      fourth: 33.8 + (Math.random() - 0.5) * 0.3,
    },
  };
}

export function generateHistoricalData(
  startDate: Date,
  endDate: Date,
  intervalMinutes: number = 5
): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const baseAmp = getTimeBasedAmplitude(current);
    const isQBurst = shouldGenerateQBurst();

    const amplitude = isQBurst
      ? baseAmp * (5 + Math.random() * 5)
      : baseAmp + (Math.random() - 0.5) * 0.3;

    data.push({
      timestamp: new Date(current),
      frequency: BASE_FREQUENCY + (Math.random() - 0.5) * FREQUENCY_VARIATION,
      amplitude: Math.min(amplitude, MAX_AMPLITUDE),
    });

    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return data;
}

export function generateNotableEvents(days: number = 30): NotableEvent[] {
  const events: NotableEvent[] = [];
  const now = new Date();
  const categories: EventCategory[] = [
    "solar-storm",
    "q-burst",
    "geomagnetic",
    "seasonal",
    "ionospheric",
  ];

  const eventDescriptions: Record<EventCategory, string[]> = {
    "solar-storm": [
      "Strong solar flare detected, resulting in elevated resonance amplitude",
      "Coronal mass ejection impact on Earth's magnetosphere",
      "X-class solar flare causing significant ionospheric disturbance",
    ],
    "q-burst": [
      "Intense lightning activity in tropical regions",
      "Major thunderstorm complex over central Africa",
      "Severe weather system generating exceptionally strong Q-bursts",
    ],
    geomagnetic: [
      "Geomagnetic storm enhancing global resonance cavity",
      "Substorm activity in polar regions affecting resonance",
      "Magnetic field perturbations from solar wind pressure",
    ],
    seasonal: [
      "Seasonal peak in global thunderstorm activity",
      "Monsoon season driving increased lightning frequency",
      "Winter storm enhancement in northern hemisphere",
    ],
    ionospheric: [
      "Ionospheric anomaly detected in D-region",
      "Unusual electron density variations affecting propagation",
      "Sporadic E-layer formation influencing resonance modes",
    ],
  };

  // Generate 10-20 notable events over the period
  const eventCount = 10 + Math.floor(Math.random() * 10);

  for (let i = 0; i < eventCount; i++) {
    const daysAgo = Math.floor(Math.random() * days);
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() - daysAgo);
    eventDate.setHours(Math.floor(Math.random() * 24));
    eventDate.setMinutes(Math.floor(Math.random() * 60));

    const category = categories[Math.floor(Math.random() * categories.length)];
    const peakAmplitude = 3 + Math.random() * 7;
    const duration = 15 + Math.floor(Math.random() * 180); // 15-195 minutes

    const descriptions = eventDescriptions[category];
    const description =
      descriptions[Math.floor(Math.random() * descriptions.length)];

    events.push({
      id: `event-${i}-${eventDate.getTime()}`,
      date: eventDate,
      peakAmplitude,
      peakFrequency: BASE_FREQUENCY + (Math.random() - 0.5) * 1.0,
      duration,
      category,
      description,
      cause:
        category === "solar-storm"
          ? "Solar activity"
          : category === "q-burst"
          ? "Lightning activity"
          : undefined,
      solarActivity: getSolarActivity(peakAmplitude),
    });
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function generateDailySummaries(days: number = 30): DailySummary[] {
  const summaries: DailySummary[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const avgAmplitude = 1.0 + Math.random() * 1.5;
    const peakAmplitude = avgAmplitude + Math.random() * 3;
    const eventCount = Math.floor(Math.random() * 5);

    let intensity: DailySummary["intensity"] = "low";
    if (peakAmplitude > 6) intensity = "extreme";
    else if (peakAmplitude > 4) intensity = "high";
    else if (peakAmplitude > 2.5) intensity = "moderate";

    summaries.push({
      date,
      avgAmplitude,
      peakAmplitude,
      avgFrequency: BASE_FREQUENCY + (Math.random() - 0.5) * 0.3,
      eventCount,
      intensity,
    });
  }

  return summaries;
}

// Simulate real-time updates
export function subscribeToResonanceUpdates(
  callback: (data: ResonanceData) => void,
  intervalMs: number = 1000
): () => void {
  const interval = setInterval(() => {
    callback(generateCurrentResonance());
  }, intervalMs);

  return () => clearInterval(interval);
}
