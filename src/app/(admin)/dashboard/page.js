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
import { LuUsers } from "react-icons/lu";   
import { TbActivityHeartbeat } from "react-icons/tb";
import { GoTrophy } from "react-icons/go";
import { LiaDumbbellSolid } from "react-icons/lia";



import RevenueChart from "./components/RevenueChart";
import TransactionsChart from "./components/TransactionsChart";
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

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "may", "jun"],
    datasets: [
      {
        label: "Revenue",
        data: [4000, 5000, 4500, 7000, 3200, 5200],
        borderColor: "#4f46e5",
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(79,70,229,0.3)");
          gradient.addColorStop(1, "rgba(79,70,229,0)");
          return gradient;
        },
        pointBackgroundColor: "#4f46e5",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const txData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Transactions",
        data: [200, 350, 300, 400, 703, 120],
        backgroundColor: "#388df9",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const guardianData = {
    labels: ["Active", "Pending", "Blocked"],
    datasets: [
      {
        data: [500, 100, 50],
        backgroundColor: ["#155dfc", "#388df9", "#1c408c"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const patientData = {
    labels: ["Active", "Pending", "Blocked"],
    datasets: [
      {
        data: [400, 80, 20],
        backgroundColor: ["#155dfc", "#388df9", "#1c408c"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const caretakerData = {
    labels: ["Active", "Pending", "Blocked"],
    datasets: [
      {
        data: [150, 40, 10],
        backgroundColor: ["#155dfc", "#388df9", "#1c408c"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // User Growth Chart Data (Monthly new user registrations)
  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [250, 300, 450, 550, 700, 850],
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

  // Active Users This Week Chart Data (Daily active user count)
  const activeUsersWeekData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active Users",
        data: [550, 620, 590, 730, 660, 800, 700],
        backgroundColor: "#0A3161",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="my-10 min-h-[80vh] h-auto">
      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-4">
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
          title="Total Programs"
          amount={320}
          percentage={5}
          isIncrease={true}
          para="from last month"
          icon={GoTrophy}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <Card
          title="Exercises"
          amount={156}
          percentage={15}
          isIncrease={true}
          para="from last month"
          icon={LiaDumbbellSolid}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
        />
       
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 my-10">
        <UserGrowthChart data={userGrowthData} baseOptions={baseOptions} />
        <ActiveUsersWeekChart data={activeUsersWeekData} baseOptions={baseOptions} />
      </div>
      {/* <div className="grid gap-6 md:grid-cols-3 my-10">
        <UserDistributionChart data={userData} baseOptions={baseOptions} />
        <StatusDoughnut
          title="Guardians Status"
          chartData={guardianData}
          baseOptions={baseOptions}
        />
        <StatusDoughnut
          title="Patients Status"
          chartData={patientData}
          baseOptions={baseOptions}
        />
        <StatusDoughnut
          title="Caretakers Status"
          chartData={caretakerData}
          baseOptions={baseOptions}
        />
      </div> */}
    </div>
  );
}
