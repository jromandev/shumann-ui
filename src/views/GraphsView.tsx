import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import type { TimeRange } from "../types";
import { fetchPowerData } from "../services/api";
import { format, subDays, subHours } from "date-fns";

export function GraphsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const now = new Date();
      let startDate: Date;
      let interval: string;

      switch (timeRange) {
        case "24h":
          startDate = subHours(now, 24);
          interval = "hour";
          break;
        case "7d":
          startDate = subDays(now, 7);
          interval = "hour";
          break;
        case "30d":
          startDate = subDays(now, 30);
          interval = "day";
          break;
        case "90d":
          startDate = subDays(now, 90);
          interval = "day";
          break;
      }

      try {
        const response = await fetchPowerData(
          "GCI001",
          startDate,
          now,
          interval
        );
        setApiData(response.data || response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Failed to fetch power data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const historicalData = useMemo(() => {
    if (!apiData || apiData.length === 0) return [];

    return apiData.map((d: any) => ({
      timestamp: new Date(d.time_bucket || d.timestamp).getTime(),
      time: format(
        new Date(d.time_bucket || d.timestamp),
        timeRange === "24h" ? "HH:mm" : "MMM dd"
      ),
      frequency: d.avg_frequency || d.frequency || 7.83,
      amplitude: d.avg_power || d.avg_amplitude || d.amplitude || 1.0,
    }));
  }, [apiData, timeRange]);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
  ];

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

  if (loading) {
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
        <h1 className="view-title">Historical Data</h1>
        <p className="view-subtitle">Interactive Charts & Analysis</p>
      </div>

      <div className="time-range-selector">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            className={`range-button ${
              timeRange === range.value ? "active" : ""
            }`}
            onClick={() => setTimeRange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="chart-section">
        <h2 className="section-title">
          <TrendingUp size={18} />
          Amplitude Over Time
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient
                id="amplitudeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#00FF88" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00FF88" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
            <XAxis
              dataKey="time"
              stroke="#ffffff60"
              tick={{ fill: "#ffffff80", fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : "preserveStart"}
            />
            <YAxis
              stroke="#ffffff60"
              tick={{ fill: "#ffffff80", fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 35 : 45}
              label={!isMobile ? {
                value: "Amplitude",
                angle: -90,
                position: "insideLeft",
                fill: "#ffffff80",
              } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B1F3Fcc",
                border: "1px solid #00D9FF40",
                borderRadius: "8px",
                color: "#fff",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="amplitude"
              stroke="#00FF88"
              strokeWidth={2}
              fill="url(#amplitudeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h2 className="section-title">
          <Calendar size={18} />
          Frequency Variations
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
            <XAxis
              dataKey="time"
              stroke="#ffffff60"
              tick={{ fill: "#ffffff80", fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : "preserveStart"}
            />
            <YAxis
              stroke="#ffffff60"
              tick={{ fill: "#ffffff80", fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 35 : 45}
              domain={[7, 9]}
              label={!isMobile ? {
                value: "Frequency (Hz)",
                angle: -90,
                position: "insideLeft",
                fill: "#ffffff80",
              } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B1F3Fcc",
                border: "1px solid #00D9FF40",
                borderRadius: "8px",
                color: "#fff",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            />
            <Legend 
              wrapperStyle={{ 
                color: "#fff",
                fontSize: isMobile ? "0.75rem" : "0.875rem"
              }} 
            />
            <Line
              type="monotone"
              dataKey="frequency"
              stroke="#00D9FF"
              strokeWidth={2}
              dot={false}
              name="Fundamental Frequency"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="info-card">
        <h3 className="info-title">Chart Insights</h3>
        <p className="info-text">
          The amplitude chart shows the strength of the Schumann Resonance
          signal, which typically peaks during periods of high global
          thunderstorm activity (usually afternoon UTC). The frequency chart
          displays subtle variations around the fundamental 7.83 Hz, influenced
          by ionospheric conditions and solar activity.
        </p>
      </div>
    </motion.div>
  );
}
