import { motion } from "framer-motion";
import type { NotableEvent } from "../types";
import { format } from "date-fns";
import { Zap, Sun, Activity, Cloud, Radio, Share2 } from "lucide-react";
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

interface EventCardProps {
  event: NotableEvent;
}

const categoryIcons = {
  "solar-storm": Sun,
  "q-burst": Zap,
  geomagnetic: Activity,
  seasonal: Cloud,
  ionospheric: Radio,
  extreme: Zap, // fallback for event_type categories
  moderate: Activity,
  low: Activity,
};

const categoryColors = {
  "solar-storm": "#FF6B35",
  "q-burst": "#FFD700",
  geomagnetic: "#00D9FF",
  seasonal: "#00FF88",
  ionospheric: "#8A2BE2",
  extreme: "#FF3366",
  moderate: "#FFD700",
  low: "#00D9FF",
};

export function EventCard({ event }: EventCardProps) {
  const Icon = categoryIcons[event.category] || Activity; // fallback icon
  const color = categoryColors[event.category] || "#00D9FF"; // fallback color

  const handleShare = async () => {
    // Haptic feedback on native
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    const shareText = `${event.category.replace("-", " ").toUpperCase()}\n${event.description}\nPeak: ${(typeof event.peakAmplitude === 'number' ? event.peakAmplitude : parseFloat(event.peakAmplitude) || 0).toFixed(2)}\n${format(event.date, "MMM dd, yyyy HH:mm")}`;
    
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: 'Schumann Resonance Event',
          text: shareText,
          dialogTitle: 'Share Event',
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Schumann Resonance Event',
          text: shareText,
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

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
        <button 
          className="share-button" 
          onClick={handleShare}
          aria-label="Share event"
          style={{ color }}
        >
          <Share2 size={20} />
        </button>
      </div>

      <p className="event-description">{event.description}</p>

      <div className="event-metrics">
        <div className="event-metric">
          <span className="metric-label">Peak Amplitude</span>
          <span className="metric-value" style={{ color }}>
            {(typeof event.peakAmplitude === 'number' ? event.peakAmplitude : parseFloat(event.peakAmplitude) || 0).toFixed(2)}
          </span>
        </div>
        <div className="event-metric">
          <span className="metric-label">Frequency</span>
          <span className="metric-value">
            {(typeof event.peakFrequency === 'number' ? event.peakFrequency : parseFloat(event.peakFrequency) || 7.83).toFixed(2)} Hz
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
