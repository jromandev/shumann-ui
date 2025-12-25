import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  color?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  color = "#00D9FF",
}: MetricCardProps) {
  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "–";

  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="metric-card-header">
        {icon && <div className="metric-icon">{icon}</div>}
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value" style={{ color }}>
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {trend && (
        <div className={`metric-trend trend-${trend}`}>{trendSymbol}</div>
      )}
    </motion.div>
  );
}
