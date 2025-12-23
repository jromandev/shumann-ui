import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchDailySummaries } from "../services/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  subMonths,
  addMonths,
} from "date-fns";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [apiSummaries, setApiSummaries] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const summaries = useMemo(() => {
    return apiSummaries || [];
  }, [apiSummaries]);

  useEffect(() => {
    const loadSummaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDailySummaries("GCI001", 90);
        setApiSummaries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summaries");
        console.error("Failed to fetch daily summaries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "extreme":
        return "#FF3366";
      case "high":
        return "#FFD700";
      case "moderate":
        return "#00FF88";
      default:
        return "#00D9FF33";
    }
  };

  const getDaySummary = (day: Date) => {
    return summaries.find(
      (s) => format(s.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calculate starting day of week (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();
  const calendarDays = [...Array(firstDayOfWeek).fill(null), ...daysInMonth];

  if (error) {
    return (
      <motion.div
        className="view-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="error-message">
          <p>Error loading calendar data: {error}</p>
          <p>Please ensure the backend API is running at {import.meta.env.VITE_API_URL}</p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        className="view-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loading-message">Loading calendar...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="view-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="dashboard-header">
        <h1 className="view-title">Activity Calendar</h1>
        <p className="view-subtitle">Monthly Resonance Intensity</p>
      </div>

      <div className="calendar-controls">
        <button className="month-nav-button" onClick={previousMonth}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="current-month">
          <CalendarIcon size={20} />
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button className="month-nav-button" onClick={nextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-header-cell">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div key={`empty-${index}`} className="calendar-cell empty" />
            );
          }

          const summary = getDaySummary(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <motion.div
              key={format(day, "yyyy-MM-dd")}
              className={`calendar-cell ${
                !isCurrentMonth ? "other-month" : ""
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              style={{
                backgroundColor: summary
                  ? getIntensityColor(summary.intensity)
                  : "#ffffff10",
              }}
            >
              <span className="day-number">{format(day, "d")}</span>
              {summary && (
                <div className="day-summary">
                  <div className="summary-amplitude">
                    {summary.peakAmplitude.toFixed(1)}
                  </div>
                  {summary.eventCount > 0 && (
                    <div className="summary-events">
                      ⚡ {summary.eventCount}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="intensity-legend">
        <h3>Intensity Scale</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#00D9FF33" }}
            />
            <span>Low</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#00FF88" }}
            />
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#FFD700" }}
            />
            <span>High</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#FF3366" }}
            />
            <span>Extreme</span>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3 className="info-title">How to Read the Calendar</h3>
        <p className="info-text">
          Each day is color-coded based on the peak Schumann Resonance amplitude
          recorded. The number shown is the maximum amplitude value, and the
          lightning bolt indicates the count of notable events detected that
          day.
        </p>
      </div>
    </motion.div>
  );
}
