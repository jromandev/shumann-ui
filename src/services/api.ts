const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchSites() {
  const response = await fetch(`${API_BASE_URL}/sites`);
  if (!response.ok) throw new Error("Failed to fetch sites");
  const json: ApiResponse<any[]> = await response.json();
  return json.data || [];
}

export async function fetchCurrentData(siteId: string = "GCI001") {
  const response = await fetch(
    `${API_BASE_URL}/schumann/current?site=${siteId}`
  );
  if (!response.ok) throw new Error("Failed to fetch current data");
  return response.json();
}

export async function fetchPowerData(
  siteId: string = "GCI001",
  startDate?: Date,
  endDate?: Date,
  interval: string = "hour"
) {
  const params = new URLSearchParams({
    site: siteId,
    interval,
  });

  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  const response = await fetch(`${API_BASE_URL}/schumann/power?${params}`);
  if (!response.ok) throw new Error("Failed to fetch power data");
  return response.json();
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

  const response = await fetch(`${API_BASE_URL}/schumann/frequency?${params}`);
  if (!response.ok) throw new Error("Failed to fetch frequency data");
  return response.json();
}

export async function fetchEvents(
  limit: number = 50,
  minIntensity: number = 3,
  category?: string
) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    minIntensity: minIntensity.toString(),
  });

  if (category && category !== "all") params.append("category", category);

  const response = await fetch(`${API_BASE_URL}/schumann/events?${params}`);
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export async function fetchEventsBySite(
  siteId: string,
  startDate?: Date,
  endDate?: Date
) {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  const response = await fetch(
    `${API_BASE_URL}/schumann/events/${siteId}?${params}`
  );
  if (!response.ok) throw new Error("Failed to fetch site events");
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("API health check failed");
  return response.json();
}

export async function fetchDailySummaries(
  siteId: string = "GCI001",
  days: number = 90
) {
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
      const day = new Date(event.timestamp).toISOString().split("T")[0];
      eventsByDay.set(day, (eventsByDay.get(day) || 0) + 1);
    });
  }

  // Transform power data into daily summaries
  return powerResponse.data.map((entry: any) => {
    const date = new Date(entry.timestamp);
    const dayKey = date.toISOString().split("T")[0];
    const eventCount = eventsByDay.get(dayKey) || 0;

    // Determine intensity based on power level
    let intensity: "low" | "moderate" | "high" | "extreme" = "low";
    if (entry.power_level >= 10) intensity = "extreme";
    else if (entry.power_level >= 7) intensity = "high";
    else if (entry.power_level >= 4) intensity = "moderate";

    return {
      date,
      avgAmplitude: entry.power_level,
      peakAmplitude: entry.power_level,
      avgFrequency: entry.frequency || 7.83,
      eventCount,
      intensity,
    };
  });
}
