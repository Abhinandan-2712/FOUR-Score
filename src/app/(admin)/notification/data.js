export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Welcome to FOUR Score",
    message: "Welcome to FOUR Score! Start exploring workouts, nutrition, and recovery content today.",
    recipientMode: "all", // 'active' | 'all' | 'custom'
    selectedUserIds: [],
    type: "General",
    status: "Scheduled",
    scheduledAt: "2025-12-10 10:00 AM",
    createdAt: "2025-12-08",
  },
  {
    id: 2,
    title: "New Workout Program Launched",
    message: "We have launched a new 12-week strength program. Check it out in the app now.",
    recipientMode: "active",
    selectedUserIds: [],
    type: "Promotion",
    status: "Sent",
    scheduledAt: "2025-12-05 09:00 AM",
    createdAt: "2025-12-03",
  },
  {
    id: 3,
    title: "Maintenance Notice",
    message: "The app will be under maintenance on 20 Dec, 2:00–4:00 AM IST. We apologize for any inconvenience.",
    recipientMode: "all",
    selectedUserIds: [],
    type: "System",
    status: "Draft",
    scheduledAt: "2025-12-20 02:00 AM",
    createdAt: "2025-12-15",
  },
];

// Helper function to get audience label from recipientMode
export const getAudienceLabel = (recipientMode, selectedUserIds = []) => {
  if (recipientMode === "active") return "Active Users Only";
  if (recipientMode === "all") return "All Users";
  if (recipientMode === "custom") return `Custom Selection (${selectedUserIds.length} users)`;
  return "All Users";
};

