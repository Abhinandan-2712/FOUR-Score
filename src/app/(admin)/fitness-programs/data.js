/** UI-only mock data until API is wired — aligned to PDF “28-Day Full Body Foundations” + catalog list */
import { PROGRAM_CATALOG } from "./reference-data";

export const FOUNDATIONS_PROGRAM_ID = "fp-28-day-foundations";

/** Only this program has full PDF detail + tabs in the admin editor (UI preview). */
export function hasProgramEditor(id) {
  if (!id) return false;
  return Boolean(MOCK_PROGRAM_DETAIL[id]);
}

function slugId(name) {
  return (
    "fp-" +
    name
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function levelFromSkills(skills) {
  if (!skills || skills === "ANY") return "All levels";
  const s = skills;
  if (s.includes("Advanced")) return "Advanced";
  if (s.includes("Intermediate") && !s.includes("Beginner")) return "Intermediate";
  if (s.includes("Beginner")) return "Beginner";
  return "Varies";
}

function weeksFromTitle(name) {
  if (name.includes("12-Week")) return 12;
  if (name.includes("8-Week")) return 8;
  if (name.includes("15-Minute")) return 4;
  if (name.includes("28-Day")) return 4;
  return 8;
}

function freqNum(freq) {
  if (!freq || freq === "ANY") return 5;
  if (freq.includes("5–6") || freq.includes("5-6")) return 6;
  if (freq.includes("3 or 4")) return 4;
  const m = freq.match(/(\d)/);
  return m ? Number(m[1]) : 5;
}

const foundationsListRow = {
  id: FOUNDATIONS_PROGRAM_ID,
  title: "28-Day Full Body Foundations",
  subHeader: "Build your base. Master the moves. Start your journey.",
  level: "Beginner",
  durationWeeks: 4,
  frequencyPerWeek: 5,
  avgSessionMinutes: 35,
  locationTag: "Workout From Home",
  status: "Active",
  updatedAt: "2026-04-03",
};

const catalogStubRows = PROGRAM_CATALOG.filter((c) => c.name !== "28-Day Full Body Foundations").map(
  (c) => ({
    id: slugId(c.name),
    title: c.name,
    subHeader: c.primaryGoal,
    level: levelFromSkills(c.workoutSkills),
    durationWeeks: weeksFromTitle(c.name),
    frequencyPerWeek: freqNum(c.frequency),
    avgSessionMinutes:
      c.name.includes("Elite Strength") || c.name.includes("Shred To Stage") ? 52 : c.name.includes("Quick Hits") ? 15 : 42,
    locationTag: c.locationTag.replace(/\s+/g, " ").trim(),
    status: "Active",
    updatedAt: "2026-04-03",
  })
);

/** All 13 PDF catalog programs — admin list/browse. Full editor payload exists only for Foundations. */
export const MOCK_FITNESS_PROGRAMS = [foundationsListRow, ...catalogStubRows];

/** Full editor payload (PDF pages 7–11) */
export const MOCK_PROGRAM_DETAIL = {
  [FOUNDATIONS_PROGRAM_ID]: {
    id: FOUNDATIONS_PROGRAM_ID,
    title: "28-Day Full Body Foundations",
    subHeader: "Build your base. Master the moves. Start your journey.",
    overview: `Ready to start your fitness journey but not sure where to begin? Full Body Foundations is designed specifically for the beginner who wants a clear, guided path to strength and confidence. Over the next 4 weeks, you'll master the fundamental movements of fitness while building a sustainable habit that fits into your life.

No "drill sergeant" vibes here—just smart, effective programming that respects your starting point and scales with your progress.`,
    whatsInside: `● 3 Strength Days: Targeted sessions for Lower Body, Upper Body, and Total Body to help you tone muscle and boost metabolism.
● 2 Active Recovery Days: Guided low-impact cardio and stretching to improve mobility and reduce soreness.
● Progressive Difficulty: We start with the basics in Week 1 and gradually increase the intensity as you get stronger.
● Sustainable Pace: 30–45 minute sessions designed to get you in, out, and on with your day.`,
    isThisForYou: `● New to the Gym? We'll teach you the "Big 6" movement patterns so you never feel lost.
● Coming Back from a Break? This is the perfect "re-entry" program to wake up your muscles safely.
● Short on Time? We focus on the most effective exercises so you don't waste a second.`,
    theGoal: `By the end of 28 days, you won't just look better—you'll move better. You'll graduate with the strength, form, and consistency needed to take on any challenge in the app.`,
    level: "Beginner",
    durationWeeks: 4,
    frequencyPerWeek: 5,
    /** PDF “Quick Stats” line for app UI */
    frequencyCaption: "5 days/week (3 strength, 2 recovery)",
    avgSessionMinutes: 35,
    locationTag: "🏠 Workout From Home (Friendly)",
    equipment: `Bodyweight (Primary)
A sturdy chair, bench, or couch (for incline push-ups and box squats)
Floor space / Yoga mat`,
    equipmentNote:
      "This program is designed to be zero-barrier. No gym membership required.",
    status: "Active",
    schedule: [
      {
        week: 1,
        mon: "2 sets × 10",
        tue: "LISS + Stretch",
        wed: "2 sets × 10",
        thu: "LISS + Stretch",
        fri: "2 sets × 10",
        weekend: "Rest",
      },
      {
        week: 2,
        mon: "3 sets × 10",
        tue: "LISS + Stretch",
        wed: "3 sets × 10",
        thu: "LISS + Stretch",
        fri: "3 sets × 10",
        weekend: "Rest",
      },
      {
        week: 3,
        mon: "3 sets × 12",
        tue: "LISS + Stretch",
        wed: "3 sets × 12",
        thu: "LISS + Stretch",
        fri: "3 sets × 12",
        weekend: "Rest",
      },
      {
        week: 4,
        mon: "3 sets × 15",
        tue: "LISS + Stretch",
        wed: "3 sets × 15",
        thu: "LISS + Stretch",
        fri: "3 sets × 15",
        weekend: "Rest",
      },
    ],
    workouts: {
      A: [
        { name: "Goblet Squat", tag: "Large Muscle" },
        { name: "Reverse Lunges", tag: "Primary Strength" },
        { name: "Glute Bridges", tag: "Primary Strength" },
        { name: "Lateral Lunges", tag: "Accessory" },
        { name: "Calf Raises", tag: "Accessory" },
        { name: "Dead Bug", tag: "Core" },
      ],
      B: [
        { name: "Incline Push-ups", tag: "Large Muscle" },
        { name: "Dumbbell Rows", tag: "Primary Strength" },
        { name: "Overhead DB Press", tag: "Primary Strength" },
        { name: "Bicep Curls", tag: "Accessory" },
        { name: "Tricep Extension", tag: "Accessory" },
        { name: "Plank Tap", tag: "Core" },
      ],
      C: [
        { name: "DB Thrusters", tag: "Large Muscle" },
        { name: "Romanian Deadlifts", tag: "Primary Strength" },
        { name: "Bird-Dogs", tag: "Primary Strength" },
        { name: "Mountain Climbers", tag: "Accessory" },
        { name: "Superman Holds", tag: "Accessory" },
        { name: "Russian Twists", tag: "Core" },
      ],
    },
    recovery: {
      lissMinutes: 20,
      lissPrompt:
        "Keep your heart rate high enough to breathe heavily, but low enough to hold a conversation.",
      lissOptions: "Brisk Walk, Incline Treadmill, Light Cycling, Elliptical",
      stretches: [
        { name: "Couch Stretch", detail: "1m per side (Hip Flexors)" },
        { name: "Child's Pose", detail: "1m (Back/Shoulders)" },
        { name: "Cat-Cow", detail: "10 slow reps (Spine)" },
        { name: "Doorway Chest Stretch", detail: "1m (Chest)" },
      ],
    },
    /** PDF implementation note for developers (shown in admin preview only) */
    implementationNote:
      "The app should iterate the sets and reps based on the 'Week' variable, while keeping the 'Exercise List' constant for the 4-week block. This ensures progressive overload without needing to code 28 unique days.",
  },
};

export function getProgramDetail(id) {
  if (!id) return null;
  return MOCK_PROGRAM_DETAIL[id] ?? null;
}

/** Full editor shape for API-backed programs (no PDF mock row). */
export function createEmptyProgramDetailForId(id) {
  const src = MOCK_PROGRAM_DETAIL[FOUNDATIONS_PROGRAM_ID];
  if (!src) return null;
  const d = JSON.parse(JSON.stringify(src));
  d.id = id;
  d.title = "";
  d.subHeader = "";
  d.overview = "";
  d.whatsInside = "";
  d.isThisForYou = "";
  d.theGoal = "";
  d.frequencyCaption = "";
  d.locationTag = "";
  d.equipment = "";
  d.equipmentNote = "";
  d.implementationNote = "";
  d.status = "Active";
  d.schedule.forEach((row) => {
    ["mon", "tue", "wed", "thu", "fri", "weekend"].forEach((k) => {
      row[k] = "";
    });
  });
  ["A", "B", "C"].forEach((letter) => {
    d.workouts[letter].forEach((ex) => {
      ex.name = "";
      ex.tag = "Large Muscle";
    });
  });
  d.recovery.lissMinutes = 20;
  d.recovery.lissPrompt = "";
  d.recovery.lissOptions = "";
  d.recovery.stretches = [{ name: "", detail: "" }];
  return d;
}
