import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { EventCard } from "../components/EventCard";
import type { EventCategory } from "../types";
import { generateNotableEvents } from "../utils/dataGenerator";
import { fetchEvents } from "../services/api";

export function EventsView() {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");
  const [apiEvents, setApiEvents] = useState<any[] | null>(null);
  const events = useMemo(() => {
    // Use API data if available, otherwise fall back to simulated data
    if (apiEvents) {
      // Transform API events to match the expected format
      return apiEvents.map((e) => ({
        id: e.id,
        date: new Date(e.timestamp),
        category: e.event_type as EventCategory,
        peakAmplitude: e.peak_value,
        peakFrequency: e.frequency || 7.83,
        duration: Math.round(e.duration_seconds / 60), // convert to minutes
        description: e.description,
        solarActivity: e.metadata?.solar_activity
          ? {
              flareClass: e.metadata.solar_activity.flare_class,
              kpIndex: e.metadata.solar_activity.kp_index,
              cmeSpeed: e.metadata.solar_activity.cme_speed,
            }
          : undefined,
      }));
    }
    return generateNotableEvents(90);
  }, [apiEvents]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchEvents(90);
        setApiEvents(response.events);
      } catch (error) {
        console.warn("API unavailable, using simulated events:", error);
        setApiEvents(null);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "all") return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const categories: { value: EventCategory | "all"; label: string }[] = [
    { value: "all", label: "All Events" },
    { value: "solar-storm", label: "Solar Storms" },
    { value: "q-burst", label: "Q-Bursts" },
    { value: "geomagnetic", label: "Geomagnetic" },
    { value: "seasonal", label: "Seasonal" },
    { value: "ionospheric", label: "Ionospheric" },
  ];

  return (
    <motion.div
      className="view-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="dashboard-header">
        <h1 className="view-title">Notable Events</h1>
        <p className="view-subtitle">Historical Anomalies & Peak Activity</p>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <Filter size={18} />
          <span>Filter by Category</span>
        </div>
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-chip ${
                selectedCategory === cat.value ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="events-stats">
        <div className="stat-box">
          <span className="stat-number">{filteredEvents.length}</span>
          <span className="stat-label">Events Found</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">
            {Math.max(...filteredEvents.map((e) => e.peakAmplitude)).toFixed(1)}
          </span>
          <span className="stat-label">Peak Amplitude</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">
            {filteredEvents.filter((e) => e.solarActivity).length}
          </span>
          <span className="stat-label">Solar Related</span>
        </div>
      </div>

      <div className="events-list">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="empty-state">
            <Search size={48} />
            <p>No events found for this category</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
