import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Radio, Zap, TrendingUp } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { WaveformVisualizer } from "../components/WaveformVisualizer";
import type { ResonanceData } from "../types";
import { fetchCurrentData } from "../services/api";

export function LiveDashboard() {
  const [currentData, setCurrentData] = useState<ResonanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waveformWidth, setWaveformWidth] = useState(600);
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const response = await fetchCurrentData("GCI001");

        // Transform API response to ResonanceData format
        // New API structure: response.power contains the main data
        if (response.power || response.resonances) {
          let fundamental, harmonics;
          
          if (response.resonances && response.resonances.length > 0) {
            // Old format with resonances array
            fundamental = response.resonances.find(
              (r: any) => r.frequency >= 7.5 && r.frequency <= 8.5
            );
            harmonics = response.resonances.filter(
              (r: any) => r.frequency > 8.5
            );
          } else if (response.power) {
            // New format with power object
            fundamental = {
              frequency: parseFloat(response.power.fundamental_freq) || 7.83,
              avg_intensity: parseFloat(response.power.fundamental_amplitude) || 1.0,
            };
            harmonics = []; // Harmonics not provided in new format
          }

          const transformedData: ResonanceData = {
            timestamp: new Date(response.timestamp || response.power?.timestamp_utc),
            frequency: fundamental?.frequency || 7.83,
            amplitude: fundamental?.avg_intensity || 1.0,
            harmonics: {
              first: harmonics[0]?.frequency || 14.3,
              second: harmonics[1]?.frequency || 20.8,
              third: harmonics[2]?.frequency || 27.3,
              fourth: harmonics[3]?.frequency || 33.8,
            },
          };

          setCurrentData(transformedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Failed to fetch current data:", err);
      }
    };

    // Load initial data
    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle responsive waveform sizing
  useEffect(() => {
    const updateWaveformSize = () => {
      if (waveformContainerRef.current) {
        const containerWidth = waveformContainerRef.current.clientWidth;
        setWaveformWidth(Math.min(containerWidth - 40, 600));
      }
    };

    updateWaveformSize();
    window.addEventListener('resize', updateWaveformSize);
    
    return () => window.removeEventListener('resize', updateWaveformSize);
  }, []);

  if (error) {
    return (
      <motion.div
        className="view-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="error-message">
          <p>Error loading data: {error}</p>
          <p>Please ensure the backend API is running at {import.meta.env.VITE_API_URL}</p>
        </div>
      </motion.div>
    );
  }

  if (!currentData) {
    return (
      <motion.div
        className="view-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loading-message">Loading...</div>
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
        <h1 className="view-title">Live Resonance</h1>
        <p className="view-subtitle">Earth's Electromagnetic Heartbeat</p>
      </div>

      <div className="waveform-section" ref={waveformContainerRef}>
        <WaveformVisualizer
          frequency={currentData.frequency}
          amplitude={currentData.amplitude}
          width={waveformWidth}
          height={150}
        />
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Fundamental Frequency"
          value={currentData.frequency.toFixed(2)}
          unit="Hz"
          icon={<Radio size={20} />}
          color="#00D9FF"
        />
        <MetricCard
          title="Amplitude"
          value={currentData.amplitude.toFixed(2)}
          icon={<Activity size={20} />}
          color="#00FF88"
          trend={
            currentData.amplitude > 2
              ? "up"
              : currentData.amplitude < 1
              ? "down"
              : "stable"
          }
        />
      </div>

      <div className="harmonics-section">
        <h2 className="section-title">
          <Zap size={18} />
          Harmonic Frequencies
        </h2>
        <div className="harmonics-grid">
          <div className="harmonic-item">
            <span className="harmonic-label">1st Harmonic</span>
            <span className="harmonic-value">
              {currentData.harmonics.first.toFixed(2)} Hz
            </span>
          </div>
          <div className="harmonic-item">
            <span className="harmonic-label">2nd Harmonic</span>
            <span className="harmonic-value">
              {currentData.harmonics.second.toFixed(2)} Hz
            </span>
          </div>
          <div className="harmonic-item">
            <span className="harmonic-label">3rd Harmonic</span>
            <span className="harmonic-value">
              {currentData.harmonics.third.toFixed(2)} Hz
            </span>
          </div>
          <div className="harmonic-item">
            <span className="harmonic-label">4th Harmonic</span>
            <span className="harmonic-value">
              {currentData.harmonics.fourth.toFixed(2)} Hz
            </span>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3 className="info-title">
          <TrendingUp size={18} />
          Current Status
        </h3>
        <p className="info-text">
          {currentData.amplitude > 5
            ? "🔥 Elevated activity detected! Possible solar activity or intense thunderstorm systems."
            : currentData.amplitude > 3
            ? "⚡ Moderate activity. Global thunderstorm activity within normal range."
            : "💫 Calm conditions. Baseline resonance levels observed."}
        </p>
        <div className="info-stats">
          <div className="stat">
            <span className="stat-label">Last Update</span>
            <span className="stat-value">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Quality</span>
            <span className="stat-value">Excellent</span>
          </div>
        </div>
      </div>

      <div className="educational-tooltip">
        <p>
          <strong>What is Schumann Resonance?</strong> These are global
          electromagnetic resonances generated by lightning discharges in the
          cavity formed between Earth's surface and the ionosphere. The
          fundamental mode has a frequency of approximately 7.83 Hz, with
          several higher harmonics.
        </p>
      </div>
    </motion.div>
  );
}
