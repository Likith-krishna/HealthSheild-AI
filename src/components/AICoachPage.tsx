import { t } from "i18next";
import React from "react";
import { PredictionEngineOutput } from "../types";
import AICoach from "./AICoach";
import { MessageSquare, Bot, Sparkles, AlertCircle, HelpCircle } from "lucide-react";

interface AICoachPageProps {
  evaluation: PredictionEngineOutput | null;
  selectedRecord: any;
}

export default function AICoachPage({ evaluation, selectedRecord }: AICoachPageProps) {
  if (!evaluation || !selectedRecord) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">{t("auto.no_profile_data_loaded", "No Profile Data Loaded")}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("auto.please_complete_your_clinical_vital_entr", "Please complete your clinical vital entry inside the \"Clinical Intake\" page to synchronize the AI clinical companion's memory context.")}

        </p>
      </div>);

  }

  // Construct active profile values from record
  const basicInfo = selectedRecord.basicInfo;
  const lifestyle = selectedRecord.lifestyle;

  const profile = {
    age: basicInfo.age,
    gender: basicInfo.gender,
    height: basicInfo.height || 175,
    weight: basicInfo.weight,
    systolicBP: basicInfo.systolicBP || 120,
    diastolicBP: basicInfo.diastolicBP || 80,
    bloodSugar: basicInfo.bloodSugar || 100,
    cholesterolTotal: basicInfo.cholesterolTotal || 190,
    heartRate: selectedRecord.wearableDetails?.heartRate || 72,
    sleepHours: lifestyle.sleepDuration || 7,
    stressLevel: lifestyle.stressLevel || 5,
    exerciseDays: lifestyle.physicalActivity === "None" ? 0 : 3,
    smoking: lifestyle.smoking || "Never",
    alcohol: lifestyle.alcohol || "Social",
    dietType: "Standard",
    waterIntake: (selectedRecord.nutrition?.water || 2) * 1000,
    familyHistory: [selectedRecord.medicalHistory?.familyHistory || ""],
    existingConditions: [selectedRecord.medicalHistory?.existingDiseases || ""]
  };

  const currentPredictions = evaluation.predictions || [];

  return (
    <div className="space-y-6" id="clinical-companion-tab-panel">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Bot className="h-4 w-4 animate-pulse text-emerald-400" />{t("auto.vascular_longevity_consultation_chamber", "Vascular & Longevity Consultation Chamber")}

          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{t("auto.ai_proactive_clinical_companion", "AI Proactive Clinical Companion")}</h2>
          <p className="text-xs text-slate-500 font-sans">{t("auto.have_private_instant_clinical_conversati", "Have private, instant clinical conversations about your biomarkers, lipid panels, and preventative roadmap milestones.")}

          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        
        {/* Chat Component - takes full width */}
        <div className="w-full">
          <AICoach profile={profile as any} currentPredictions={currentPredictions} evaluation={evaluation} />
        </div>

      </div>

    </div>);

} 