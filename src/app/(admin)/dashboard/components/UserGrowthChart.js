"use client";
import { Line } from "react-chartjs-2";

export default function UserGrowthChart({ data, baseOptions }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#C8D7E9] shadow-md h-72 md:h-96 flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-base font-semibold text-[#0A3161]">User Growth</h3>
        <p className="text-xs text-[#2158A3] mt-1">Monthly new user registrations</p>
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
              max: 1000,
              ticks: {
                stepSize: 250,
                color: "#4b5563",
                maxTicksLimit: 5,
              },
              grid: { color: "rgba(156,163,175,0.15)" },
            },
            x: {
              ...baseOptions.scales.x,
              grid: { 
                display: false,
                color: "rgba(156,163,175,0.15)" 
              },
              ticks: { color: "#4b5563" },
            },
          },
        }}
        />
      </div>
    </div>
  );
}
