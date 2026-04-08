"use client";
import Card from "@/components/CardGen";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useMemo, useState } from "react";
import Link from "next/link";
import { LuApple, LuUsers } from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LiaDumbbellSolid } from "react-icons/lia";
import StatusDoughnut from "./components/UserDistributionChart";
import UserGrowthChart from "./components/UserGrowthChart";
import ActiveUsersWeekChart from "./components/ActiveUsersWeekChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState("Today");

  const timeframeChips = useMemo(
    () => ["Today", "7D", "30D"],
    []
  );

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151",
          font: { size: 14, family: "Inter, sans-serif" },
          boxWidth: 20,
          padding: 16,
        },
      },
      title: {
        display: true,
        color: "#111827",
        font: { size: 18, weight: "600", family: "Inter, sans-serif" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(156,163,175,0.15)" },
        ticks: { color: "#4b5563" },
      },
      y: {
        grid: { color: "rgba(156,163,175,0.15)" },
        ticks: { color: "#4b5563" },
      },
    },
  };

  const usersStatusData = {
    labels: ["Active", "Inactive", "Blocked"],
    datasets: [
      {
        data: [980, 210, 42],
        backgroundColor: ["#16a34a", "#f59e0b", "#ef4444"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const exerciseTypesData = {
    labels: ["Strength", "Cardio", "Mobility", "Recovery"],
    datasets: [
      {
        data: [420, 310, 180, 90],
        backgroundColor: ["#155dfc", "#388df9", "#7fb6ff", "#cfe4ff"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const nutritionLoggingData = {
    labels: ["On track", "Partial", "Missed"],
    datasets: [
      {
        data: [640, 220, 120],
        backgroundColor: ["#0ea5e9", "#a3e635", "#fb7185"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const quickActions = [
    { label: "Manage Users", href: "/users" },
    { label: "Exercise Library", href: "/exercise-library" },
    { label: "Nutrition & Macros", href: "/nutrition-macros" },
    { label: "Content Management", href: "/content-management" },
    { label: "Settings", href: "/settings" },
  ];

  const recentActivity = [
    { time: "2m ago", event: "New user registered", meta: "Email verified" },
    { time: "18m ago", event: "Exercise completed", meta: "Program: Beginner" },
    { time: "1h ago", event: "Nutrition log added", meta: "Macros updated" },
    { time: "3h ago", event: "FAQ updated", meta: "Content team" },
  ];

  const topExercises = [
    { name: "Squat", completions: 1420, change: "+8%" },
    { name: "Push-up", completions: 1180, change: "+5%" },
    { name: "Plank", completions: 940, change: "+3%" },
    { name: "Jumping Jacks", completions: 760, change: "+2%" },
    { name: "Lunges", completions: 690, change: "-1%" },
  ];

  // Users (monthly)
  const newUsersMonthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [120, 180, 260, 210, 320, 290],
        borderColor: "#0A3161",
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(10,49,97,0.3)");
          gradient.addColorStop(1, "rgba(10,49,97,0)");
          return gradient;
        },
        pointBackgroundColor: "#0A3161",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Active users trend (monthly)
  const activeUsersMonthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Active Users",
        data: [620, 710, 780, 740, 860, 820],
        borderColor: "#16a34a",
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(22,163,74,0.28)");
          gradient.addColorStop(1, "rgba(22,163,74,0)");
          return gradient;
        },
        pointBackgroundColor: "#16a34a",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  // Exercise completions (this week)
  const exerciseCompletionsWeekData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Exercises Completed",
        data: [320, 410, 380, 520, 450, 610, 560],
        backgroundColor: "#0A3161",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  // Nutrition adherence (this week, %)
  const nutritionAdherenceWeekData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Adherence (%)",
        data: [62, 68, 65, 71, 69, 75, 73],
        backgroundColor: "#155dfc",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  // (Removed FOUR Score component distributions; dashboard is admin modules focused)

  return (
    <div className="min-h-[80vh] h-auto bg-[#F6F9FF]">
      <div className="mx-auto w-full py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className=" px-4">
            <h1 className="text-2xl font-semibold text-[#0A3161]">Dashboard</h1>
            <p className="mt-1 text-sm text-[#2158A3]">
              Admin overview for users, exercise, and nutrition.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-4">
            <span className="text-xs font-medium text-gray-500 mr-1">Timeframe</span>
            {timeframeChips.map((label) => {
              const active = timeframe === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTimeframe(label)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-[#0A3161] bg-[#0A3161] text-white"
                      : "border-[#C8D7E9] bg-white text-[#0A3161] hover:bg-[#EEF4FF]",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

      {/* Cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Total Users"
          amount={1232}
          percentage={12}
          isIncrease={false}
          para="from last month"
          icon={LuUsers}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
          <Card
          title="Active Today"
          amount={980}
          percentage={8}
          isIncrease={true}
          para="from last month"
          icon={TbActivityHeartbeat}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
          <Card
          title="Exercises Today"
          amount={610}
          percentage={11}
          isIncrease={true}
          para="vs yesterday"
          icon={LiaDumbbellSolid}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
        />
          <Card
          title="Nutrition Logs Today"
          amount={420}
          percentage={6}
          isIncrease={true}
          para="vs yesterday"
          icon={LuApple}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        </div>

      {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <UserGrowthChart
          data={newUsersMonthlyData}
          baseOptions={baseOptions}
          title="Users"
          subtitle="New users per month"
          yMax={400}
          yStep={100}
        />
          <UserGrowthChart
          data={activeUsersMonthlyData}
          baseOptions={baseOptions}
          title="Active Users"
          subtitle="Monthly active users"
          yMax={1000}
          yStep={250}
        />
          {/* <ActiveUsersWeekChart
          data={exerciseCompletionsWeekData}
          baseOptions={baseOptions}
          title="Exercise"
          subtitle="Exercises completed (this week)"
          yMax={700}
          yStep={100}
        /> */}
          <ActiveUsersWeekChart
          data={nutritionAdherenceWeekData}
          baseOptions={baseOptions}
          title="Nutrition"
          subtitle="Adherence (this week)"
          yMax={100}
          yStep={20}
        />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Doughnuts */}
          <div className="lg:col-span-8 grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatusDoughnut
          title="Users Status"
          chartData={usersStatusData}
          baseOptions={baseOptions}
        />
              <StatusDoughnut
          title="Exercise Types (This Week)"
          chartData={exerciseTypesData}
          baseOptions={baseOptions}
        />
              <StatusDoughnut
          title="Nutrition Logging (This Week)"
          chartData={nutritionLoggingData}
          baseOptions={baseOptions}
        />
            </div>

            {/* Fills the left-side blank space */}
            <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0A3161]">
                    Top Exercises (This Week)
                  </h2>
                  <p className="mt-1 text-xs text-[#2158A3]">
                    Highest completions across all users.
                  </p>
                </div>
                <button className="shrink-0 rounded-xl border border-[#C8D7E9] bg-white px-4 py-2 text-sm font-semibold text-[#0A3161] hover:bg-[#EEF4FF]">
                  View details
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#C8D7E9]">
                <div className="grid grid-cols-12 bg-[#F6F9FF] px-4 py-3 text-xs font-semibold text-gray-600">
                  <div className="col-span-6">Exercise</div>
                  <div className="col-span-4 text-right">Completions</div>
                  <div className="col-span-2 text-right">Change</div>
                </div>
                <div className="divide-y divide-[#E6EEF9]">
                  {topExercises.map((row) => {
                    const down = row.change.startsWith("-");
                    return (
                      <div
                        key={row.name}
                        className="grid grid-cols-12 items-center px-4 py-3"
                      >
                        <div className="col-span-6 text-sm font-semibold text-gray-900">
                          {row.name}
                        </div>
                        <div className="col-span-4 text-right text-sm font-semibold text-gray-900">
                          {row.completions.toLocaleString()}
                        </div>
                        <div
                          className={[
                            "col-span-2 text-right text-sm font-semibold",
                            down ? "text-red-600" : "text-green-700",
                          ].join(" ")}
                        >
                          {row.change}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Side panels */}
          <div className="lg:col-span-4 grid gap-6">
            <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#0A3161]">Quick Actions</h2>
              <p className="mt-1 text-xs text-[#2158A3]">
                Jump to the most used admin sections.
              </p>
              <div className="mt-4 grid gap-2">
                {quickActions.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center justify-between rounded-xl border border-[#C8D7E9] bg-[#F6F9FF] px-4 py-3 text-sm font-semibold text-[#0A3161] hover:bg-[#EEF4FF] transition"
                  >
                    <span>{a.label}</span>
                    <span className="text-[#2158A3]">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#0A3161]">Recent Activity</h2>
              <p className="mt-1 text-xs text-[#2158A3]">Latest events across modules.</p>
              <div className="mt-4 space-y-3">
                {recentActivity.map((row, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {row.event}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{row.meta}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-gray-500">
                      {row.time}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="w-full rounded-xl border border-[#C8D7E9] bg-white px-4 py-2.5 text-sm font-semibold text-[#0A3161] hover:bg-[#EEF4FF]">
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
