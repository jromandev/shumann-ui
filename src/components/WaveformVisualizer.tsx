import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  frequency: number;
  amplitude: number;
  width?: number;
  height?: number;
}

export function WaveformVisualizer({
  frequency,
  amplitude,
  width,
  height,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(0);
  const [dimensions, setDimensions] = useState({
    width: width || 300,
    height: height || 120,
  });

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const isMobile = window.innerWidth < 640;
        const newWidth =
          width || Math.min(containerWidth - 32, isMobile ? 280 : 600);
        const newHeight = height || (isMobile ? 100 : 120);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, "rgba(0, 217, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(0, 255, 136, 0.6)");
      gradient.addColorStop(1, "rgba(138, 43, 226, 0.4)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = window.innerWidth < 640 ? 1.5 : 2;
      ctx.beginPath();

      const points = 200;
      const amplitudeScale = (amplitude / 10) * (dimensions.height / 3);

      for (let i = 0; i < points; i++) {
        const x = (i / points) * dimensions.width;
        const normalizedFreq = frequency / 10;
        const y =
          dimensions.height / 2 +
          Math.sin(
            (i / points) * Math.PI * 8 * normalizedFreq + phaseRef.current
          ) *
            amplitudeScale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Add glow effect
      ctx.shadowBlur = window.innerWidth < 640 ? 8 : 10;
      ctx.shadowColor = "#00D9FF";
      ctx.stroke();

      phaseRef.current += 0.05;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequency, amplitude, dimensions]);

  return (
    <motion.div
      ref={containerRef}
      className="waveform-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="waveform-canvas"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </motion.div>
  );
}
