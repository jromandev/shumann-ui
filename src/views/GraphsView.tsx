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
import { generateHistoricalData } from "../utils/dataGenerator";
import { fetchPowerData } from "../services/api";
import { format, subDays, subHours } from "date-fns";

export function GraphsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
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
        setApiData(response.data);
      } catch (error) {
        console.warn("API unavailable, using simulated data:", error);
        setApiData(null);
      }
    };

    loadData();
  }, [timeRange]);

  const historicalData = useMemo(() => {
    // If we have API data, use it
    if (apiData && apiData.length > 0) {
      return apiData.map((d: any) => ({
        timestamp: new Date(d.time_bucket).getTime(),
        time: format(
          new Date(d.time_bucket),
          timeRange === "24h" ? "HH:mm" : "MMM dd"
        ),
        frequency: d.avg_frequency || 7.83,
        amplitude: d.avg_power || d.avg_amplitude || 1.0,
      }));
    }

    // Fall back to simulated data
    const now = new Date();
    let startDate: Date;
    let intervalMinutes: number;

    switch (timeRange) {
      case "24h":
        startDate = subHours(now, 24);
        intervalMinutes = 5;
        break;
      case "7d":
        startDate = subDays(now, 7);
        intervalMinutes = 30;
        break;
      case "30d":
        startDate = subDays(now, 30);
        intervalMinutes = 120;
        break;
      case "90d":
        startDate = subDays(now, 90);
        intervalMinutes = 360;
        break;
    }

    return generateHistoricalData(startDate, now, intervalMinutes).map((d) => ({
      timestamp: d.timestamp.getTime(),
      time: format(d.timestamp, timeRange === "24h" ? "HH:mm" : "MMM dd"),
      frequency: d.frequency,
      amplitude: d.amplitude,
    }));
  }, [timeRange]);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
  ];

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
              tick={{ fill: "#ffffff80", fontSize: 12 }}
            />
            <YAxis
              stroke="#ffffff60"
              tick={{ fill: "#ffffff80", fontSize: 12 }}
              label={{
                value: "Amplitude",
                angle: -90,
                position: "insideLeft",
                fill: "#ffffff80",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B1F3Fcc",
                border: "1px solid #00D9FF40",
                borderRadius: "8px",
                color: "#fff",
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
              tick={{ fill: "#ffffff80", fontSize: 12 }}
            />
            <YAxis
              stroke="#ffffff60"
              tick={{ fill: "#ffffff80", fontSize: 12 }}
              domain={[7, 9]}
              label={{
                value: "Frequency (Hz)",
                angle: -90,
                position: "insideLeft",
                fill: "#ffffff80",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B1F3Fcc",
                border: "1px solid #00D9FF40",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />
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
