"use client";
import { Doughnut } from "react-chartjs-2";

export default function StatusDoughnut({ title, chartData, baseOptions }) {
  return (
    <div className="surface-card flex h-72 flex-col p-6 md:h-96">
      <div className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Distribution for selected timeframe</p>
      </div>
      <div className="relative min-h-0 flex-1">
        <Doughnut
          data={chartData}
          options={{
            ...baseOptions,
            plugins: {
              ...baseOptions.plugins,
              title: { ...baseOptions.plugins.title, display: false },
              legend: {
                ...baseOptions.plugins?.legend,
                labels: {
                  ...baseOptions.plugins?.legend?.labels,
                  font: { size: 12, family: "Inter, sans-serif" },
                  boxWidth: 14,
                  padding: 10,
                },
              },
            },
            // Doughnut charts shouldn't render cartesian axes
            scales: {},
            cutout: "70%",
          }}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
