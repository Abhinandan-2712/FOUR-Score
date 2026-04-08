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
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { LuApple, LuUsers } from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LiaDumbbellSolid } from "react-icons/lia";
import { toast } from "react-hot-toast";
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
  const [timeframe, setTimeframe] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [rawApiPayload, setRawApiPayload] = useState(null);
  const timeframeLabelMap = {
    all: "All time",
    last_week: "Last week",
    last_3_months: "Last months",
  };

  const normalizeArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.items)) return val.items;
    if (val && Array.isArray(val.data)) return val.data;
    if (val && Array.isArray(val.results)) return val.results;
    return null;
  };

  const firstDefined = (...vals) => {
    for (const v of vals) if (v !== undefined && v !== null) return v;
    return undefined;
  };

  const makeLineDataset = (label, data, color) => ({
    label,
    data,
    borderColor: color,
    backgroundColor: (ctx) => {
      const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
      const rgba =
        color === "#0A3161"
          ? ["rgba(10,49,97,0.3)", "rgba(10,49,97,0)"]
          : color === "#16a34a"
            ? ["rgba(22,163,74,0.28)", "rgba(22,163,74,0)"]
            : ["rgba(21,93,252,0.22)", "rgba(21,93,252,0)"];
      gradient.addColorStop(0, rgba[0]);
      gradient.addColorStop(1, rgba[1]);
      return gradient;
    },
    pointBackgroundColor: color,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.35,
    fill: true,
  });

  const coerceChartJs = (raw, kind) => {
    // If backend already returns Chart.js compatible object, use it as-is.
    if (raw && Array.isArray(raw.labels) && Array.isArray(raw.datasets)) return raw;

    const labels = raw?.labels ?? raw?.xAxis ?? raw?.x ?? raw?.categories;
    const values =
      raw?.data ??
      raw?.values ??
      raw?.yAxis ??
      raw?.y ??
      raw?.counts ??
      raw?.series;

    // series array support: [{ label, data/values }]
    if (Array.isArray(labels) && Array.isArray(raw?.series)) {
      return {
        labels,
        datasets: raw.series.map((s, idx) => {
          const sData = s?.data ?? s?.values ?? [];
          const sLabel = s?.label ?? `Series ${idx + 1}`;
          const color = idx === 0 ? "#0A3161" : idx === 1 ? "#16a34a" : "#155dfc";
          return kind === "line"
            ? makeLineDataset(sLabel, sData, color)
            : {
              label: sLabel,
              data: sData,
              backgroundColor: color,
              borderRadius: 6,
              barThickness: 40,
            };
        }),
      };
    }

    if (!Array.isArray(labels)) return undefined;
    if (!Array.isArray(values)) return undefined;

    if (kind === "doughnut") {
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: raw?.backgroundColor ?? ["#155dfc", "#388df9", "#7fb6ff", "#cfe4ff"],
            borderColor: "#fff",
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      };
    }

    if (kind === "bar") {
      return {
        labels,
        datasets: [
          {
            label: raw?.label ?? "Count",
            data: values,
            backgroundColor: raw?.backgroundColor ?? "#0A3161",
            borderRadius: 6,
            barThickness: 40,
          },
        ],
      };
    }

    // line
    return {
      labels,
      datasets: [makeLineDataset(raw?.label ?? "Value", values, raw?.borderColor ?? "#0A3161")],
    };
  };

  const emptyLineChart = (label = "Value", color = "#0A3161") => ({
    labels: [],
    datasets: [makeLineDataset(label, [], color)],
  });

  const emptyBarChart = (label = "Count", color = "#0A3161") => ({
    labels: [],
    datasets: [
      {
        label,
        data: [],
        backgroundColor: color,
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  });

  const emptyDoughnutChart = () => ({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ["#155dfc", "#388df9", "#7fb6ff", "#cfe4ff"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  });

  const kvArrayToDoughnut = (arr) => {
    if (!Array.isArray(arr)) return undefined;
    return {
      labels: arr.map((x) => x?.label ?? x?.name ?? ""),
      datasets: [
        {
          data: arr.map((x) => Number(x?.value ?? x?.count ?? 0)),
          backgroundColor: ["#16a34a", "#f59e0b", "#ef4444", "#155dfc", "#388df9"],
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  };

  const seriesToLine = (arr, { labelKey = "label", valueKey = "value", datasetLabel = "Value", color = "#0A3161" } = {}) => {
    if (!Array.isArray(arr)) return undefined;
    const labels = arr.map((x) => x?.[labelKey] ?? x?.month ?? x?.date ?? x?.day ?? "");
    const values = arr.map((x) => Number(x?.[valueKey] ?? x?.count ?? x?.total ?? 0));
    return { labels, datasets: [makeLineDataset(datasetLabel, values, color)] };
  };

  const seriesToBar = (arr, { labelKey = "label", valueKey = "value", datasetLabel = "Count", color = "#0A3161" } = {}) => {
    if (!Array.isArray(arr)) return undefined;
    const labels = arr.map((x) => x?.[labelKey] ?? x?.month ?? x?.date ?? x?.day ?? "");
    const values = arr.map((x) => Number(x?.[valueKey] ?? x?.count ?? x?.total ?? 0));
    return {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data: values,
          backgroundColor: color,
          borderRadius: 6,
          barThickness: 40,
        },
      ],
    };
  };

  const isDev = process.env.NODE_ENV !== "production";

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse rounded-xl bg-[#EEF4FF] ${className}`} />
  );

  const SkeletonCard = () => (
    <div className="w-full rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-8 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <div className="my-4 h-px w-full bg-gray-100" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );

  const SkeletonPanel = ({ title }) => (
    <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#0A3161]">{title}</p>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-44 w-full" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );

  const SkeletonDoughnut = ({ title }) => (
    <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm h-72 md:h-96">
      <p className="text-sm font-semibold text-[#0A3161]">{title}</p>
      <div className="mt-6 flex items-center justify-center">
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );

  const shouldShowSkeleton = isLoading && !apiData;

  const timeframeChips = useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Last Week", value: "last_week" },
      { label: "Last months", value: "last_3_months" },
    ],
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

  const usersStatusData =
    apiData?.doughnuts?.usersStatus ??
    (apiData ? emptyDoughnutChart() : {
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
    });

  const exerciseTypesData =
    apiData?.doughnuts?.exerciseTypes ??
    (apiData ? emptyDoughnutChart() : {
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
    });

  const nutritionLoggingData =
    apiData?.doughnuts?.nutritionLogging ??
    (apiData ? emptyDoughnutChart() : {
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
    });

  const quickActions = [
    { label: "Manage Users", href: "/users" },
    { label: "Exercise Library", href: "/exercise-library" },
    { label: "Nutrition & Macros", href: "/nutrition-macros" },
    { label: "Content Management", href: "/content-management" },
    { label: "Settings", href: "/settings" },
  ];

  const recentActivity =
    normalizeArray(apiData?.recentActivity) ?? [
      { time: "2m ago", event: "New user registered", meta: "Email verified" },
      { time: "18m ago", event: "Exercise completed", meta: "Program: Beginner" },
      { time: "1h ago", event: "Nutrition log added", meta: "Macros updated" },
      { time: "3h ago", event: "FAQ updated", meta: "Content team" },
    ];

  const topExercises =
    normalizeArray(apiData?.topExercises) ?? [
      { name: "Squat", completions: 1420, change: "+8%" },
      { name: "Push-up", completions: 1180, change: "+5%" },
      { name: "Plank", completions: 940, change: "+3%" },
      { name: "Jumping Jacks", completions: 760, change: "+2%" },
      { name: "Lunges", completions: 690, change: "-1%" },
    ];

  // Users (monthly)
  const newUsersMonthlyData =
    apiData?.charts?.newUsersMonthly ??
    (apiData ? emptyLineChart("New Users", "#0A3161") : {
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
    });

  // Active users trend (monthly)
  const activeUsersMonthlyData =
    apiData?.charts?.activeUsersMonthly ??
    (apiData ? emptyLineChart("Active Users", "#16a34a") : {
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
    });

  // Exercise completions (this week)
  const exerciseCompletionsWeekData =
    apiData?.charts?.exerciseCompletionsWeek ??
    (apiData ? emptyBarChart("Exercises Completed", "#0A3161") : {
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
    });

  // Nutrition adherence (this week, %)
  const nutritionAdherenceWeekData =
    apiData?.charts?.nutritionAdherenceWeek ??
    (apiData ? emptyBarChart("Adherence (%)", "#155dfc") : {
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
    });

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

      if (!baseUrl) {
        toast.error("API base URL is missing (NEXT_PUBLIC_API_BASE_URL).");
        return;
      }
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      setIsLoading(true);
      try {
        const endpoints = [`${baseUrl}/api/admin/dashboard`];
        let res = null;

        for (const url of endpoints) {
          try {
            res = await axios.get(url, {
              headers: { token },
              params: { timeframe },
            });
            break;
          } catch (e) {
            // Try next endpoint
            res = null;
          }
        }
        console.log(res);
        if (!res) throw new Error("Dashboard API not reachable.");

        const payload = res?.data?.result ?? res?.data ?? {};
        setRawApiPayload(payload);

        // Backend response (your sample) uses: cards, charts, donuts, tables, recentActivity
        const cards = payload?.cards ?? {};
        const charts = payload?.charts ?? {};
        const donuts = payload?.donuts ?? {};
        const tables = payload?.tables ?? {};
        const recent = payload?.recentActivity ?? {};

        const recentUsers = normalizeArray(recent?.users) ?? [];
        const recentWorkouts = normalizeArray(recent?.workouts) ?? [];
        const recentMeals = normalizeArray(recent?.meals) ?? [];

        const recentActivityUnified = [
          ...recentUsers.map((u) => ({
            time: u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
            event: "New user registered",
            meta: u?.email ?? u?.name ?? "",
          })),
          ...recentWorkouts.map((w) => ({
            time: w?.createdAt ? new Date(w.createdAt).toLocaleDateString() : "",
            event: "Workout completed",
            meta: w?.programName ?? w?.title ?? "",
          })),
          ...recentMeals.map((m) => ({
            time: m?.createdAt ? new Date(m.createdAt).toLocaleDateString() : "",
            event: "Meal logged",
            meta: m?.name ?? m?.title ?? "",
          })),
        ].slice(0, 8);

        setApiData({
          cards: {
            totalUsers: cards.totalUsers,
            activeToday: cards.activeToday,
            exercisesToday: cards.exercisesToday,
            nutritionLogsToday: cards.nutritionLogsToday,
          },
          charts: {
            newUsersMonthly:
              coerceChartJs(charts.newUsersMonthly, "line") ??
              seriesToLine(charts.usersCreatedByMonth, {
                labelKey: "month",
                valueKey: "count",
                datasetLabel: "New Users",
                color: "#0A3161",
              }),
            activeUsersMonthly:
              coerceChartJs(charts.activeUsersMonthly, "line") ??
              seriesToLine(charts.monthlyActiveUsers, {
                labelKey: "month",
                valueKey: "count",
                datasetLabel: "Active Users",
                color: "#16a34a",
              }),
            exerciseCompletionsWeek:
              coerceChartJs(charts.exerciseCompletionsWeek, "bar") ??
              seriesToBar(charts.exerciseCompletionsByDay, {
                labelKey: "day",
                valueKey: "count",
                datasetLabel: "Exercises Completed",
                color: "#0A3161",
              }),
            nutritionAdherenceWeek:
              coerceChartJs(charts.nutritionAdherenceWeek, "bar") ??
              seriesToBar(charts.nutritionLogsByDay, {
                labelKey: "day",
                valueKey: "count",
                datasetLabel: "Nutrition Logs",
                color: "#155dfc",
              }),
          },
          doughnuts: {
            usersStatus: kvArrayToDoughnut(donuts.userStatus),
            // More useful than "Other:0" — show library categories if available
            exerciseTypes:
              kvArrayToDoughnut(donuts.exerciseLibraryCategories) ??
              kvArrayToDoughnut(donuts.exerciseTypesThisWeek),
            nutritionLogging:
              kvArrayToDoughnut(donuts.nutritionLoggingStatus) ??
              kvArrayToDoughnut(donuts.nutritionLogsThisWeek),
          },
          recentActivity: recentActivityUnified,
          topExercises: normalizeArray(tables.topExercisesThisWeek) ?? [],
        });
      } catch (e) {
        toast.error(e?.message || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [timeframe]);

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
            {timeframeChips.map((chip) => {
              const active = timeframe === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setTimeframe(chip.value)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-[#0A3161] bg-[#0A3161] text-white"
                      : "border-[#C8D7E9] bg-white text-[#0A3161] hover:bg-[#EEF4FF]",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* {isDev && rawApiPayload && (
          <div className="mt-4 rounded-2xl border border-[#C8D7E9] bg-white p-4 shadow-sm mx-4">
            <details>
              <summary className="cursor-pointer select-none text-sm font-semibold text-[#0A3161]">
                API Debug (dev only)
              </summary>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-[#E6EEF9] bg-[#F6F9FF] p-3">
                  <p className="text-xs font-semibold text-gray-600">Top-level keys</p>
                  <p className="mt-1 text-xs text-gray-700 break-words">
                    {Object.keys(rawApiPayload || {}).join(", ") || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6EEF9] bg-[#F6F9FF] p-3">
                  <p className="text-xs font-semibold text-gray-600">Recent activity items</p>
                  <p className="mt-1 text-xs font-semibold text-gray-900">
                    {normalizeArray(rawApiPayload?.recentActivity) ||
                    normalizeArray(rawApiPayload?.activity) ||
                    normalizeArray(rawApiPayload?.recent_activity)
                      ? (
                          normalizeArray(rawApiPayload?.recentActivity) ||
                          normalizeArray(rawApiPayload?.activity) ||
                          normalizeArray(rawApiPayload?.recent_activity)
                        ).length
                      : 0}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6EEF9] bg-[#F6F9FF] p-3">
                  <p className="text-xs font-semibold text-gray-600">Top exercises items</p>
                  <p className="mt-1 text-xs font-semibold text-gray-900">
                    {normalizeArray(rawApiPayload?.topExercises) ||
                    normalizeArray(rawApiPayload?.top_exercises)
                      ? (
                          normalizeArray(rawApiPayload?.topExercises) ||
                          normalizeArray(rawApiPayload?.top_exercises)
                        ).length
                      : 0}
                  </p>
                </div>
              </div>
              <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-[#E6EEF9] bg-[#0B1220] p-3 text-xs text-[#E5E7EB]">
{JSON.stringify(rawApiPayload, null, 2)}
              </pre>
            </details>
          </div>
        )} */}

        {/* Cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Total Users"
            amount={apiData?.cards?.totalUsers ?? 1232}
            percentage={12}
            isIncrease={false}
            para={`${timeframeLabelMap[timeframe]} users` ?? "All time users"}
            icon={LuUsers}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <Card
            title="Active Users"
            amount={apiData?.cards?.activeToday ?? 980}
            percentage={8}
            isIncrease={true}
            para={`${timeframeLabelMap[timeframe]} active users` ?? "All time active users"}
            icon={TbActivityHeartbeat}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <Card
            title="Total Exercises"
            amount={apiData?.cards?.exercisesToday ?? 610}
            percentage={11}
            isIncrease={true}
            para={`${timeframeLabelMap[timeframe]} exercises` ?? "All time exercises"}
            icon={LiaDumbbellSolid}
            iconBg="bg-rose-100"
            iconColor="text-rose-600"
          />
          <Card
            title="Total Nutrition Logs"
            amount={apiData?.cards?.nutritionLogsToday ?? 420}
            percentage={6}
            isIncrease={true}
            para={`${timeframeLabelMap[timeframe]} nutrition logs` ?? "All time nutrition logs"}
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
            subtitle={`${timeframeLabelMap[timeframe]} new users` ?? "All time new users"}
            yMax={400}
            yStep={100}
          />
          <UserGrowthChart
            data={activeUsersMonthlyData}
            baseOptions={baseOptions}
            title="Active Users"
            subtitle={`${timeframeLabelMap[timeframe]} active users` ?? "All time active users"}
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
            subtitle={`${timeframeLabelMap[timeframe]} adherence` ?? "All time adherence"}
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
                title="Exercise Types"
                chartData={exerciseTypesData}
                baseOptions={baseOptions}
              />
              <StatusDoughnut
                title="Nutrition Logging"
                chartData={nutritionLoggingData}
                baseOptions={baseOptions}
              />
            </div>

            {/* Fills the left-side blank space */}
            <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0A3161]">
                    Top Exercises ({timeframeLabelMap[timeframe]} exercises)
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
