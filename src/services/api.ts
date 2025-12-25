import {
  generateCurrentResonance,
  generateHistoricalData,
  generateNotableEvents,
  generateDailySummaries,
} from "../utils/dataGenerator";
import { CapacitorHttp } from '@capacitor/core';
import type { HttpResponse } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to make HTTP requests that work both on web and native
async function apiGet(url: string): Promise<any> {
  if (Capacitor.isNativePlatform()) {
    // Use native HTTP on mobile to bypass CORS
    const response: HttpResponse = await CapacitorHttp.get({
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } else {
    // Use standard fetch on web
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
}

export async function fetchSites() {
  const json: ApiResponse<any[]> = await apiGet(`${API_BASE_URL}/sites`);
  return json.data || [];
}

export async function fetchCurrentData(siteId: string = "GCI001") {
  if (USE_MOCK_DATA) {
    const mockData = generateCurrentResonance();
    // Return in API format
    return {
      success: true,
      timestamp: mockData.timestamp.toISOString(),
      site_id: siteId,
      power: {
        id: Math.floor(Math.random() * 1000),
        site_id: siteId,
        timestamp_utc: mockData.timestamp.toISOString(),
        fundamental_freq: mockData.frequency.toString(),
        fundamental_amplitude: mockData.amplitude.toString(),
        power_sum: (mockData.amplitude * 10).toFixed(2),
        created_at: new Date().toISOString(),
      },
      resonances: [],
    };
  }
  
  return await apiGet(`${API_BASE_URL}/schumann/current?site=${siteId}`);
}

export async function fetchPowerData(
  siteId: string = "GCI001",
  startDate?: Date,
  endDate?: Date,
  interval: string = "hour"
) {
  if (USE_MOCK_DATA) {
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const end = endDate || now;
    const historicalData = generateHistoricalData(start, end, interval === "day" ? 1440 : 60);
    
    // Return in API format
    return {
      data: historicalData.map(d => ({
        time_bucket: d.timestamp.toISOString(),
        timestamp: d.timestamp.toISOString(),
        avg_frequency: d.frequency,
        avg_power: d.amplitude,
        avg_amplitude: d.amplitude,
        site_id: siteId,
      })),
    };
  }
  
  const params = new URLSearchParams({
    site: siteId,
    interval,
  });

  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  return await apiGet(`${API_BASE_URL}/schumann/power?${params}`);
}

export async function fetchFrequencyData(
  siteId: string = "GCI001",
  startDate?: Date,
  endDate?: Date,
  frequencies?: number[]
) {
  const params = new URLSearchParams({
    site: siteId,
  });

  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());
  if (frequencies && frequencies.length > 0) {
    params.append("frequencies", frequencies.join(","));
  }

  return await apiGet(`${API_BASE_URL}/schumann/frequency?${params}`);
}

export async function fetchEvents(
  limit: number = 50,
  minIntensity: number = 3,
  category?: string
) {
  if (USE_MOCK_DATA) {
    const allEvents = generateNotableEvents(90);
    let filteredEvents = allEvents.filter(e => e.intensity >= minIntensity);
    if (category && category !== "all") {
      filteredEvents = filteredEvents.filter(e => e.category === category);
    }
    // Transform to API format
    return { 
      data: filteredEvents.slice(0, limit).map(e => ({
        id: e.id,
        timestamp: e.date.toISOString(),
        event_type: e.category,
        peak_value: e.peakAmplitude,
        frequency: e.peakFrequency,
        duration_seconds: e.duration * 60,
        description: e.description,
        metadata: e.solarActivity ? {
          solar_activity: e.solarActivity
        } : undefined,
      }))
    };
  }
  
  const params = new URLSearchParams({
    limit: limit.toString(),
    minIntensity: minIntensity.toString(),
  });

  if (category && category !== "all") params.append("category", category);

  return await apiGet(`${API_BASE_URL}/schumann/events?${params}`);
}

export async function fetchEventsBySite(
  siteId: string,
  startDate?: Date,
  endDate?: Date
) {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  return await apiGet(`${API_BASE_URL}/schumann/events/${siteId}?${params}`);
}

export async function checkHealth() {
  return await apiGet(`${API_BASE_URL}/health`);
}

export async function fetchDailySummaries(
  siteId: string = "GCI001",
  days: number = 90
) {
  if (USE_MOCK_DATA) {
    return generateDailySummaries(days);
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch power data and events for the period
  const [powerResponse, eventsResponse] = await Promise.all([
    fetchPowerData(siteId, startDate, endDate, "day"),
    fetchEventsBySite(siteId, startDate, endDate),
  ]);

  // Group events by day
  const eventsByDay = new Map<string, number>();
  if (eventsResponse.data) {
    eventsResponse.data.forEach((event: any) => {
      const timestamp = event.start_time || event.timestamp;
      if (timestamp) {
        const eventDate = new Date(timestamp);
        if (!isNaN(eventDate.getTime())) {
          const day = eventDate.toISOString().split("T")[0];
          eventsByDay.set(day, (eventsByDay.get(day) || 0) + 1);
        }
      }
    });
  }

  // Transform power data into daily summaries
  return powerResponse.data.map((entry: any) => {
    const timestamp = entry.time_bucket || entry.timestamp || entry.timestamp_utc;
    const date = new Date(timestamp);
    const dayKey = !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    const eventCount = eventsByDay.get(dayKey) || 0;

    // Determine intensity based on power level
    let intensity: "low" | "moderate" | "high" | "extreme" = "low";
    const powerLevel = parseFloat(entry.power_level || entry.avg_power || entry.power_sum) || 0;
    if (powerLevel >= 10) intensity = "extreme";
    else if (powerLevel >= 7) intensity = "high";
    else if (powerLevel >= 4) intensity = "moderate";

    return {
      date,
      avgAmplitude: powerLevel,
      peakAmplitude: powerLevel,
      avgFrequency: parseFloat(entry.frequency || entry.avg_frequency) || 7.83,
      eventCount,
      intensity,
    };
  });
}
