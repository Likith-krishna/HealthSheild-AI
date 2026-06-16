import React from "react";
import { PredictionEngineOutput } from "../types";
import { Carrot, Apple, AlertTriangle, ShieldCheck, Flame, Droplet, Check, Sparkles, HelpCircle, Target } from "lucide-react";

interface NutritionGuidePageProps {
  evaluation: PredictionEngineOutput | null;
  selectedRecord: any;
}

export default function NutritionGuidePage({ evaluation, selectedRecord }: NutritionGuidePageProps) {
  if (!evaluation || !selectedRecord) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
          <Carrot className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">No Nutrition Metrics Loaded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Commit baseline assessment parameters inside the "Clinical Intake" screen to load your customized nutrition plan.
        </p>
      </div>
    );
  }

  const roadmap = evaluation.preventiveRoadmap;
  const basicInfo = selectedRecord.basicInfo;

  // Derive target preemptive biomarkers based on user profiles:
  const targetFastingGlucose = "70 - 100 mg/dL";
  const targetHbA1c = "< 5.7 %";
  const targetLDL = "< 100 mg/dL";
  const targetBP = "110/70 - 120/80 mmHg";

  // Detailed rationale for each nutritional category
  const inclusionReasons: Record<string, string> = {
    "Leafy Greens": "Supplies absolute dietary nitrates which enhance vascular dilation (nitric oxide pathway) lowering arteriole BP heights.",
    "Olive Oil / Omega-3": "Contains dense monounsaturated lipids which lower LDL particles while keeping HDL clearance curves healthy.",
    "High-Fiber Grains": "Slows gastric emptying and carbohydrate loading, maintaining a flat fasting glucose and insulin schedule.",
    "Avocado Fats": "Furnishes high potassium counts which balance biological sodium loading to mitigate cell fluid strain.",
    "Lean Proteins": "Replenishes essential recovery aminos, maintaining cellular protein transcription weights.",
    "Antioxidants / Berries": "Suppresses localized arteriole inflammation and arterial plaque formation markers."
  };

  const exclusionReasons: Record<string, string> = {
    "Refined Sugar / Soda": "Causes rapid systemic glucose rushes, stressing pancreatic beta-cells and creating advanced glycation end-products.",
    "High Sodium Snacks": "Directly elevates osmotic arterial blood volume, compounding hypertension risks.",
    "Trans / Saturated Fats": "Damages liver LDL receptor clearance channels, leading to rapid vascular plaque deposits.",
    "Processed Meats": "Contains inflammatory preservatives which strain hepatic filtration systems.",
    "Excess Alcohol": "Disrupts deep circadian sleep architecture, elevating average resting pulse rates.",
    "High Glycemic Carbs": "Provokes insulin resistance by depleting insulin receptor binding sensitivity."
  };

  const continueReasons = [
    { title: "Hydration Compliance", reason: "Sustaining fluid inputs above 2 Liters daily protects kidney glomerular filtration rates." },
    { title: "Low-Sugar baseline profile", reason: "Avoiding concentrated syrup preserves cellular insulin receptor sensitivity long-term." },
    { title: "Structured meal scheduling", reason: "Minimizing midnight caloric intakes maintains healthy digestive clearing cycles." }
  ];

  return (
    <div className="space-y-6" id="nutrition-guide-tab-panel">
      
      {/* Page Title */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Apple className="h-4 w-4 animate-pulse text-amber-500" />
            Vascular & Insulin Sensitizing Dietary Guide
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Clinical Nutrition Suggestion</h2>
          <p className="text-xs text-slate-500">
            Precision dietary schedules oriented to reduce metabolic, cardiac, and arterial vascular hazard vectors.
          </p>
        </div>
      </div>

      {/* Preemptive Biomarker Goals section */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#151515] pb-3">
          <Target className="h-4.5 w-4.5 text-emerald-400" />
          <h3 className="text-xs font-black uppercase text-white tracking-widest">Pre-emptive Biomarker Goals</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
          <div className="bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Daily Calories</span>
            <span className="text-sm font-extrabold text-rose-400 font-mono mt-1">{roadmap.dailyCalorieTarget} kcal</span>
          </div>

          <div className="bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Fluid Intake Target</span>
            <span className="text-sm font-extrabold text-sky-400 font-mono mt-1">{roadmap.dailyHydrationTarget} ml</span>
          </div>

          <div className="bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Target Fasting Glucose</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono mt-1">{targetFastingGlucose}</span>
          </div>

          <div className="bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Target HbA1c</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono mt-1">{targetHbA1c}</span>
          </div>

          <div className="bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Target LDL Cholesterol</span>
            <span className="text-sm font-extrabold text-[#90E090] font-mono mt-1">{targetLDL}</span>
          </div>

          <div className="bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500">Target Blood Pressure</span>
            <span className="text-sm font-extrabold text-indigo-400 font-mono mt-1">{targetBP}</span>
          </div>
        </div>
      </div>

      {/* Grid: What to Include, Avoid, Continue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INCLUDE CARD */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#151515]">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center">
              <Check className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">Include / Introduce</h3>
              <p className="text-[9px] text-slate-550">Recommended nutrients to improve biological scores</p>
            </div>
          </div>

          <div className="space-y-4">
            {roadmap.dietToInclude.map((food, fIdx) => (
              <div key={fIdx} className="bg-[#050505] border border-[#161616] p-3 rounded-xl space-y-1 hover:border-emerald-500/30 transition-all">
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase block">{food}</span>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  {inclusionReasons[food] || "Incorporate to reinforce essential micronutrient counts, stabilizing metabolic clear paths and protecting cellular functions."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AVOID / EXCLUDE CARD */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#151515]">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono text-rose-400">Exclude / Avoid</h3>
              <p className="text-[9px] text-slate-550">Remove to alleviate cardiac & vascular bottlenecks</p>
            </div>
          </div>

          <div className="space-y-4">
            {roadmap.dietToAvoid.map((food, fIdx) => (
              <div key={fIdx} className="bg-[#050505] border border-[#161616] p-3 rounded-xl space-y-1 hover:border-rose-500/30 transition-all">
                <span className="text-xs font-bold text-rose-400 font-mono uppercase block">{food}</span>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  {exclusionReasons[food] || "Restricting this item reduces inflammatory stress variables, allowing liver LDL and arterial filtration rules to normalize."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTINUE CARD */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#151515]">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">Continue / Maintain</h3>
              <p className="text-[9px] text-slate-555">Active positive habits and clinical compliance notes</p>
            </div>
          </div>

          <div className="space-y-4">
            {continueReasons.map((item, idx) => (
              <div key={idx} className="bg-[#050505] border border-[#161616] p-3 rounded-xl space-y-1 hover:border-indigo-500/30 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-450 font-mono uppercase block">{item.title}</span>
                  <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 rounded uppercase font-black">Active</span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}

            <div className="border border-dashed border-[#1C1C1C] rounded-xl p-4 text-[10px] text-slate-500 leading-relaxed font-medium bg-[#030303]">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 mb-1.5" />
              <strong className="text-slate-300 block mb-0.5">Clinical Note:</strong>
              These specific nutritional structures act as key genetic stabilizers. Adhering to these targets helps prevent systemic pre-diabetic shifts.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
