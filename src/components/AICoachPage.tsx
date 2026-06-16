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
        <h3 className="text-sm font-black uppercase text-white tracking-wider">No Profile Data Loaded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please complete your clinical vital entry inside the "Clinical Intake" page to synchronize the AI clinical companion's memory context.
        </p>
      </div>
    );
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
            <Bot className="h-4 w-4 animate-pulse text-emerald-400" />
            Vascular & Longevity Consultation Chamber
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">AI Proactive Clinical Companion</h2>
          <p className="text-xs text-slate-500 font-sans">
            Have private, instant clinical conversations about your biomarkers, lipid panels, and preventative roadmap milestones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Chat Component - takes 8 columns */}
        <div className="lg:col-span-8">
          <AICoach profile={profile as any} currentPredictions={currentPredictions} evaluation={evaluation} />
        </div>

        {/* Explainers and Prompts sidecard - takes 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-5 rounded-2xl space-y-4">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Coached Dialogue Rules
            </span>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Your Proactive Companion is pre-loaded with your medical twin diagnostic outputs. You can ask deep physiological queries such as:
            </p>

            <ul className="space-y-2 text-[10px] text-slate-400 leading-normal list-none">
              <li className="flex items-start gap-2 bg-[#050505] p-2 rounded-lg border border-[#121212] hover:border-emerald-500/15 transition-all">
                <span className="text-emerald-400 font-bold font-mono">1.</span>
                <span>"Why does my systolic pressure raise my cardiovascular prognosis curves?"</span>
              </li>
              <li className="flex items-start gap-2 bg-[#050505] p-2 rounded-lg border border-[#121212] hover:border-emerald-500/15 transition-all">
                <span className="text-emerald-400 font-bold font-mono">2.</span>
                <span>"Give me a detailed macro breakdown of carbohydrate items I must avoid."</span>
              </li>
              <li className="flex items-start gap-2 bg-[#050505] p-2 rounded-lg border border-[#121212] hover:border-emerald-500/15 transition-all">
                <span className="text-emerald-400 font-bold font-mono">3.</span>
                <span>"What exercises lower arterial stiffness markers fastest?"</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-5 rounded-2xl flex items-start gap-3 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 -translate-x-3 translate-y-3">
              <AlertCircle className="h-20 w-20 text-rose-500" />
            </div>
            
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-rose-400 font-mono">General Disclaimer</span>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                The Clinical Companion provides AI-driven mathematical trend twin modeling based on standard medical guidelines. Always confirm changes with blood parameters under clinical environments.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
