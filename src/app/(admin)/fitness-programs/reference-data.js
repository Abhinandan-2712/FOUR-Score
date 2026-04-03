/**
 * Content from PDFs:
 * - "PROGRAM RECOMMENDATION LOGIC" (For team 1)
 * - Program catalog table (For team 2)
 * UI reference only until product/API owns this data.
 */

/** If Location + Skill + Goal → Recommend Program */
export const RECOMMENDATION_MATRIX = [
  {
    location: "Home",
    skillLevel: "Beginner",
    primaryGoal: "Weight Lifting / Strength",
    program: "28-Day Full Body Foundations",
  },
  {
    location: "Home",
    skillLevel: "Beginner",
    primaryGoal: "HIIT / Endurance",
    program: "Low-Impact Cardio: 28-Day Ignite",
  },
  {
    location: "Home",
    skillLevel: "Beginner",
    primaryGoal: "Functional Movement / General Fitness",
    program: "Bodyweight Basics",
  },
  {
    location: "Home",
    skillLevel: "Intermediate",
    primaryGoal: "HIIT / Weight Loss",
    program: "Shred & Burn HIIT",
  },
  {
    location: "Home / Any",
    skillLevel: "Any",
    primaryGoal: "Prenatal or Postpartum",
    program: "Prenatal: The Radiant Forge",
  },
  {
    location: "Home / Any",
    skillLevel: "Any",
    primaryGoal: "QUICKIES / Limited Time",
    program: "15-Minute Quick Hits",
  },
  {
    location: "Gym",
    skillLevel: "Intermediate",
    primaryGoal: "Weight Lifting / Strength",
    program: "8-Week Intermediate Strength",
  },
  {
    location: "Gym",
    skillLevel: "Advanced",
    primaryGoal: "Weight Lifting / Strength",
    program: "8-Week Elite Strength",
  },
  {
    location: "Gym",
    skillLevel: "Advanced",
    primaryGoal: "Physique / Weight Loss",
    program: "12-Week Shred To Stage",
  },
  {
    location: "Gym",
    skillLevel: "Advanced",
    primaryGoal: "HIIT / Endurance",
    program: "Elite Metabolic",
  },
  {
    location: "Gym",
    skillLevel: "Advanced",
    primaryGoal: "Strength / Bodyweight Mastery",
    program: "Functional Strength and Mastery",
  },
  {
    location: "Gym",
    skillLevel: "Any",
    primaryGoal: "CrossFit",
    program: "Crossfit: The United Frontier",
  },
  {
    location: "Any",
    skillLevel: "Beg / Int",
    primaryGoal: "General Fitness / Yoga-Style",
    program: "Core & Flow",
  },
];

export const TIE_BREAKER_RULES = [
  {
    title: "Frequency filter (days/week)",
    body:
      "If a user selects 3 days, prioritize: Foundations, Ignite, Shred & Burn, or Bodyweight Basics.",
  },
  {
    title: "The “location” overrule",
    body:
      "If a user selects Home, the system must hide Elite Strength, Functional Strength and Mastery, CrossFit, and Shred To Stage, as these require commercial gym equipment.",
  },
  {
    title: "The “quickie” priority",
    body:
      "If the user indicates they have less than 20 minutes to train, automatically bypass all other logic and recommend 15-Minute Quick Hits, regardless of goal.",
  },
  {
    title: "The “safety” flag",
    body:
      "If the user selects Prenatal/Postpartum, prioritize Prenatal: The Radiant Forge as the primary recommendation for safety and specificity.",
  },
];

export const NO_MATCH_BACKUP =
  "If inputs are so broad they don’t trigger a specific result (e.g. Beginner + Gym + General Fitness), use 28-Day Full Body Foundations as the default starter — it covers weight loss, general fitness, and strength.";

/** Full program catalog — PDF table */
export const PROGRAM_CATALOG = [
  {
    name: "28-Day Full Body Foundations",
    primaryGoal: "Weight loss, general fitness, strength",
    locationTag: "🏠 Home Friendly",
    workoutSkills: "Beginner",
    preference: "Weight Lifting",
    frequency: "3 days/week",
  },
  {
    name: "8-Week Intermediate Strength",
    primaryGoal: "Weight loss, general fitness, strength",
    locationTag: "🏋 Commercial Gym / Home Gym",
    workoutSkills: "Intermediate",
    preference: "Weight Lifting",
    frequency: "4 days/week",
  },
  {
    name: "8-Week Elite Strength",
    primaryGoal: "Weight loss, strength",
    locationTag: "🏋 Commercial Gym Required",
    workoutSkills: "Advanced",
    preference: "Weight Lifting",
    frequency: "5–6 days/week",
  },
  {
    name: "Low-Impact Cardio: 28-Day Ignite",
    primaryGoal: "Weight loss, general fitness, endurance",
    locationTag: "🏠 Home Friendly",
    workoutSkills: "Beginner",
    preference: "HIIT",
    frequency: "3 days/week",
  },
  {
    name: "Shred & Burn HIIT",
    primaryGoal: "Weight loss, general fitness, endurance",
    locationTag: "🏠 Home Friendly / No Equipment",
    workoutSkills: "Intermediate",
    preference: "HIIT",
    frequency: "3 days/week",
  },
  {
    name: "Elite Metabolic",
    primaryGoal: "Weight loss, endurance",
    locationTag: "🏋 Commercial Gym / Outdoor",
    workoutSkills: "Advanced",
    preference: "HIIT",
    frequency: "4 days/week",
  },
  {
    name: "Bodyweight Basics",
    primaryGoal: "Weight loss, strength, general fitness",
    locationTag: "🏠 Home Friendly / No Equipment",
    workoutSkills: "Beginner",
    preference: "Functional Movement",
    frequency: "3 or 4 days/week",
  },
  {
    name: "Core & Flow",
    primaryGoal: "General fitness",
    locationTag: "🏠 Home Friendly / 🏋 Commercial Gym",
    workoutSkills: "Beginner or Intermediate",
    preference: "Functional Movement",
    frequency: "ANY",
  },
  {
    name: "Functional Strength and Mastery",
    primaryGoal: "Strength",
    locationTag: "Commercial Gym",
    workoutSkills: "Advanced",
    preference: "Functional Movement",
    frequency: "4 days/week",
  },
  {
    name: "Crossfit: The United Frontier",
    primaryGoal: "ANY",
    locationTag: "Commercial Gym",
    workoutSkills: "ANY",
    preference: "Crossfit",
    frequency: "4 days/week",
  },
  {
    name: "15-Minute Quick Hits",
    primaryGoal: "ANY",
    locationTag: "🏠 Home Friendly / No Equipment",
    workoutSkills: "ANY",
    preference: "QUICKIES",
    frequency: "ANY",
  },
  {
    name: "Prenatal: The Radiant Forge",
    primaryGoal: "ANY",
    locationTag: "🏠 Home Friendly",
    workoutSkills: "Beginner / Intermediate",
    preference: "Prenatal / Postpartum",
    frequency: "ANY",
  },
  {
    name: "12-Week Shred To Stage",
    primaryGoal: "Strength, weight loss",
    locationTag: "🏋 Commercial Gym Required",
    workoutSkills: "Intermediate or Advanced",
    preference: "Weight Lifting",
    frequency: "5–6 days/week",
  },
];
