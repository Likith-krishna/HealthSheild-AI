export interface UserProfile {
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number; // mg/dL fasting
  hba1c?: number; // %
  cholesterolTotal: number; // mg/dL
  ldlCholesterol?: number; // mg/dL
  hdlCholesterol?: number; // mg/dL
  heartRate: number; // bpm
  smoking: "Never" | "Former" | "Active";
  alcohol: "Never" | "Social" | "Heavy";
  sleepHours: number;
  exerciseDays: number; // per week
  waterIntake: number; // ml per day
  stressLevel: number; // 1 to 10
  dietType: "Standard" | "Mediterranean" | "Keto" | "Vegan" | "Low-Carb";
  familyHistory: string[]; // ['Heart Disease', 'Diabetes', etc.]
  existingConditions: string[]; // ['Hypertension', 'Asthma', etc.]
}

export interface DiseasePrediction {
  name: string;
  category: "Cardiovascular" | "Metabolic" | "Respiratory" | "Kidney" | "Liver" | "Neurological" | "Mental Health" | "Cancer Indicators";
  probability: number; // 0 to 100
  severity: "Mild" | "Moderate" | "Severe" | "Critical";
  confidenceScore: number; // 0 to 100
  progressionRisk: number; // 0 to 100
  timeline: string; // e.g. "12-18 Months"
  triggers: string[];
}

export interface TimelineIntervalForecast {
  days30: number; // probability score 0-100
  days90: number;
  months6: number;
  year1: number;
  years5: number;
  reasons: string[];
}

export interface HealthyHabitAction {
  category: "Fitness" | "Nutrition" | "Sleep" | "Stress Management" | "Medical Avoidance";
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Challenging";
  impact: "High" | "Medium" | "Urgent";
}

export interface HealthScoreStructure {
  score: number;
  category: "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
  breakdown: {
    cardio: number;
    metabolic: number;
    lifestyle: number;
    stress: number;
  };
}

export interface DiagnosticAlert {
  id: string;
  level: "Green" | "Yellow" | "Orange" | "Red";
  category: "Vitals" | "Biomarkers" | "Habits";
  message: string;
  remediation: string;
  timestamp: string;
}

export interface PredictionEngineOutput {
  healthScore: HealthScoreStructure;
  predictions: DiseasePrediction[];
  timelineForecasts: {
    [diseaseName: string]: TimelineIntervalForecast;
  };
  preventiveRoadmap: {
    habits: HealthyHabitAction[];
    dietToInclude: string[];
    dietToAvoid: string[];
    dailyCalorieTarget: number;
    dailyHydrationTarget: number;
  };
  alerts: DiagnosticAlert[];
  coachingInsights: string[];
}

export interface DynamicDigitalTwinScenario {
  id: string;
  name: string;
  updates: Partial<UserProfile>;
  impact: {
    diseaseName: string;
    beforeProbability: number;
    afterProbability: number;
  }[];
  overallHealthScoreBefore: number;
  overallHealthScoreAfter: number;
  timelineEstimate: string;
}

export interface MedicalReportExtraction {
  filename: string;
  patientName?: string;
  dateOfReport?: string;
  extractedVitals: Partial<UserProfile>;
  clinicalImpression: string;
  biomarkersFound: {
    name: string;
    value: string;
    normalRange: string;
    status: "Normal" | "Elevated" | "Low" | "Critical";
  }[];
}

export interface Medication {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: "Once Daily" | "Twice Daily" | "Three Times Daily" | "Every 6 Hours" | "Every 8 Hours" | "Weekly" | "Custom";
  times: string[]; // e.g., ["08:00", "20:00"]
  foodRelation: "Before Food" | "After Food" | "With Food" | "Any Time";
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  purpose: string; // e.g., "Blood Pressure", "Diabetes", "Heart Health", "Cholesterol", "Kidney Care", "Other"
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  userId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // e.g., "08:00"
  date: string; // YYYY-MM-DD
  status: "Taken" | "Skipped" | "Snoozed" | "Pending";
  actionTime?: string; // ISO timestamp
}

export interface MedicationAdherenceStats {
  userId: string;
  totalDosesScheduled: number;
  dosesTaken: number;
  dosesMissed: number;
  dosesDelayed: number;
  adherenceScore: number; // percentage 0-100
  adherenceClassification: "Excellent" | "Good" | "Poor" | "Critical";
}

