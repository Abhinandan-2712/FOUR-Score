"use client";
import { Line } from "react-chartjs-2";

export default function UserGrowthChart({
  data,
  baseOptions,
  title = "New Users",
  subtitle = "Monthly new user registrations",
  yMax = 1000,
  yStep = 250,
}) {
  return (
    <div className="surface-card flex h-72 flex-col p-6 md:h-96">
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <Line
        data={data}
        options={{
          ...baseOptions,
          clip: true,
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            },
          },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
          },
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              beginAtZero: true,
              max: yMax,
              ticks: {
                stepSize: yStep,
                color: "#64748b",
                maxTicksLimit: 5,
              },
              grid: { color: "rgba(148,163,184,0.18)" },
            },
            x: {
              ...baseOptions.scales.x,
              grid: { 
                display: false,
                color: "rgba(148,163,184,0.18)" 
              },
              ticks: { color: "#64748b" },
            },
          },
        }}
        />
      </div>
    </div>
  );
}
