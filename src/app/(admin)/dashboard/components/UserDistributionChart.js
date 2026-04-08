"use client";
import { Doughnut } from "react-chartjs-2";

export default function StatusDoughnut({ title, chartData, baseOptions }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#C8D7E9] shadow-sm h-72 md:h-96">
      <Doughnut
        data={chartData}
        options={{
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            title: { ...baseOptions.plugins.title, text: title },
          },
          // Doughnut charts shouldn't render cartesian axes
          scales: {},
          cutout: "70%",
        }}
      />
    </div>
  );
}
