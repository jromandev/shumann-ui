import { motion } from "framer-motion";
import type { NotableEvent } from "../types";
import { format } from "date-fns";
import { Zap, Sun, Activity, Cloud, Radio } from "lucide-react";

interface EventCardProps {
  event: NotableEvent;
}

const categoryIcons = {
  "solar-storm": Sun,
  "q-burst": Zap,
  geomagnetic: Activity,
  seasonal: Cloud,
  ionospheric: Radio,
};

const categoryColors = {
  "solar-storm": "#FF6B35",
  "q-burst": "#FFD700",
  geomagnetic: "#00D9FF",
  seasonal: "#00FF88",
  ionospheric: "#8A2BE2",
};

export function EventCard({ event }: EventCardProps) {
  const Icon = categoryIcons[event.category];
  const color = categoryColors[event.category];

  return (
    <motion.div
      className="event-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="event-card-header">
        <div
          className="event-icon"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={24} />
        </div>
        <div className="event-meta">
          <h3 className="event-title">
            {event.category.replace("-", " ").toUpperCase()}
          </h3>
          <span className="event-date">
            {format(event.date, "MMM dd, yyyy HH:mm")}
          </span>
        </div>
      </div>

      <p className="event-description">{event.description}</p>

      <div className="event-metrics">
        <div className="event-metric">
          <span className="metric-label">Peak Amplitude</span>
          <span className="metric-value" style={{ color }}>
            {event.peakAmplitude.toFixed(2)}
          </span>
        </div>
        <div className="event-metric">
          <span className="metric-label">Frequency</span>
          <span className="metric-value">
            {event.peakFrequency.toFixed(2)} Hz
          </span>
        </div>
        <div className="event-metric">
          <span className="metric-label">Duration</span>
          <span className="metric-value">{event.duration} min</span>
        </div>
      </div>

      {event.solarActivity && (
        <div className="solar-activity">
          <h4>Solar Activity</h4>
          {event.solarActivity.flareClass && (
            <div className="solar-metric">
              <span>Flare Class:</span>
              <strong>{event.solarActivity.flareClass}</strong>
            </div>
          )}
          {event.solarActivity.kpIndex && (
            <div className="solar-metric">
              <span>Kp Index:</span>
              <strong>{event.solarActivity.kpIndex}</strong>
            </div>
          )}
          {event.solarActivity.cmeSpeed && (
            <div className="solar-metric">
              <span>CME Speed:</span>
              <strong>{event.solarActivity.cmeSpeed} km/s</strong>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
