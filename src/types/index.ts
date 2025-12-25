export interface ResonanceData {
  timestamp: Date;
  frequency: number; // fundamental frequency in Hz
  amplitude: number; // power level
  harmonics: {
    first: number; // ~14.3 Hz
    second: number; // ~20.8 Hz
    third: number; // ~27.3 Hz
    fourth: number; // ~33.8 Hz
  };
}

export interface NotableEvent {
  id: string;
  date: Date;
  intensity: number;
  peakAmplitude: number;
  peakFrequency: number;
  duration: number; // in minutes
  category: EventCategory;
  description: string;
  cause?: string;
  solarActivity?: {
    flareClass?: string;
    kpIndex?: number;
    cmeSpeed?: number;
  };
}

export type EventCategory =
  | "solar-storm"
  | "q-burst"
  | "geomagnetic"
  | "seasonal"
  | "ionospheric";

export interface DailySummary {
  date: Date;
  avgAmplitude: number;
  peakAmplitude: number;
  avgFrequency: number;
  eventCount: number;
  intensity: "low" | "moderate" | "high" | "extreme";
}

export interface HistoricalDataPoint {
  timestamp: Date;
  frequency: number;
  amplitude: number;
}

export type TimeRange = "24h" | "7d" | "30d" | "90d";

export interface SpectrogramData {
  timestamp: Date;
  frequencies: number[]; // frequency bins
  intensities: number[][]; // 2D array of intensity values
}
