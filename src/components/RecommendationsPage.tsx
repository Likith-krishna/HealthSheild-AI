import { t } from "i18next";
import React, { useState } from "react";
import { PredictionEngineOutput } from "../types";
import { CheckCircle2, Circle, Dumbbell, Flame, Droplet, ArrowUpRight, ShieldCheck, Heart, Sparkles } from "lucide-react";

interface RecommendationsPageProps {
  evaluation: PredictionEngineOutput | null;
  selectedRecord: any;
}

export default function RecommendationsPage({ evaluation, selectedRecord }: RecommendationsPageProps) {
  const roadmap = evaluation?.preventiveRoadmap;
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [currentWaterLog, setCurrentWaterLog] = useState<number>(0);

  if (!roadmap || !selectedRecord) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">{t("auto.no_active_recommendations", "No Active Recommendations")}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("auto.please_input_baseline_data_in_the_clinic", "Please input baseline data in the \"Clinical Intake\" page to configure your preventive workout & lifestyle recommendations.")}

        </p>
      </div>);

  }

  const toggleHabit = (title: string) => {
    setCompletedHabits((prev) =>
    prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const addWater = (amount: number) => {
    setCurrentWaterLog((prev) => Math.min(roadmap.dailyHydrationTarget * 1.5, prev + amount));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Challenging":return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
      case "Medium":return "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20";
      default:return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Urgent":return "text-red-450 border-red-500/20 bg-red-500/10";
      case "High":return "text-indigo-400 border-indigo-500/20 bg-indigo-500/10";
      default:return "text-slate-400 border-[#222] bg-[#111]";
    }
  };

  const waterProgressPct = Math.round(Math.min(100, currentWaterLog / roadmap.dailyHydrationTarget * 100));

  return (
    <div className="space-y-6" id="recommendations-tab-panel">
      
      {/* Target Title Headers */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Dumbbell className="h-4.5 w-4.5 animate-pulse text-indigo-400" />{t("auto.empathetic_preventive_life_planners", "Empathetic Preventive Life-Planners")}

          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{t("auto.active_recommendations", "Active Recommendations")}</h2>
          <p className="text-xs text-slate-500 font-sans">{t("auto.personalized_lifestyle_tasks_cardiorespi", "Personalized lifestyle tasks, cardiorespiratory objectives, and vital target completions.")}

          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Habits Checklist: 8 cols */}
        <div className="lg:col-span-8 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-1">{t("auto.clinical_prevention_milestones", "Clinical Prevention Milestones")}

            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{t("auto.check_off_daily_target_actions_outlined", "Check off daily target actions outlined by your biological profiles.")}

            </p>
          </div>

          <div className="space-y-3">
            {roadmap.habits.map((h, idx) => {
              const isCompleted = completedHabits.includes(h.title);
              return (
                <div
                  key={idx}
                  onClick={() => toggleHabit(h.title)}
                  className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex gap-3.5 items-start ${
                  isCompleted ?
                  "border-emerald-500 bg-emerald-500/5 shadow-sm" :
                  "border-[#1A1A1A] bg-[#050505] hover:bg-[#0C0C0C]"}`
                  }>
                  
                  <div className="mt-0.5">
                    {isCompleted ?
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" /> :

                    <Circle className="h-4.5 w-4.5 text-[#333] shrink-0 hover:text-emerald-500" />
                    }
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <span className={`text-xs font-bold ${isCompleted ? "text-slate-500 line-through" : "text-[#E0E0E0]"}`}>
                        {h.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getDifficultyColor(h.difficulty)}`}>
                          {h.difficulty}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${getImpactColor(h.impact)}`}>
                          {h.impact}{t("auto.impact", "Impact")}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{h.description}</p>
                  </div>
                </div>);

            })}
          </div>
        </div>

        {/* Fluids logging & Side targets: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Caloric & Fluids Targets */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest font-mono">{t("auto.dynamic_targets_tracker", "Dynamic Targets Tracker")}</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Calories Target */}
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                  <Flame className="h-16 w-16 text-rose-500" />
                </div>
                <span className="text-[9px] text-rose-400 font-bold uppercase">{t("auto.calorie_target", "Calorie Target")}</span>
                <div className="text-lg font-extrabold text-white font-mono mt-0.5">{roadmap.dailyCalorieTarget}</div>
                <span className="text-[8px] text-slate-550 block mt-0.5 font-mono">{t("auto.kcal_daily", "kcal / daily")}</span>
              </div>

              {/* Water Target */}
              <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                  <Droplet className="h-16 w-16 text-sky-500" />
                </div>
                <span className="text-[9px] text-sky-400 font-bold uppercase">{t("auto.water_target", "Water Target")}</span>
                <div className="text-lg font-extrabold text-white font-mono mt-0.5">{roadmap.dailyHydrationTarget}</div>
                <span className="text-[8px] text-slate-550 block mt-0.5 font-mono">{t("auto.ml_daily", "ml / daily")}</span>
              </div>
            </div>

            {/* Drink logger progress */}
            <div className="bg-[#050505] border border-[#1A1A1A] rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold uppercase font-sans">{t("auto.fluid_compliance_tracker", "Fluid Compliance Tracker")}</span>
                <span className="text-emerald-400 font-bold font-mono">{waterProgressPct}% ({currentWaterLog}{t("auto.ml", "ml)")}</span>
              </div>

              <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-750" style={{ width: `${waterProgressPct}%` }} />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => addWater(250)}
                  className="flex-1 bg-[#101010] hover:bg-[#181818] border border-[#222] text-[10px] py-2 rounded-lg font-bold text-slate-300 hover:text-white cursor-pointer transition-all uppercase">{t("auto.250ml_glass", "+250ml Glass")}


                </button>
                <button
                  type="button"
                  onClick={() => addWater(500)}
                  className="flex-1 bg-[#101010] hover:bg-[#181818] border border-[#222] text-[10px] py-2 rounded-lg font-bold text-slate-300 hover:text-white cursor-pointer transition-all uppercase">{t("auto.500ml_bottle", "+500ml Bottle")}


                </button>
              </div>
            </div>
          </div>

          {/* Clinical insights */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 space-y-3.5">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />{t("auto.preventative_reminders", "Preventative Reminders")}
            </span>
            <p className="text-[11px] text-slate-400 leading-normal">{t("auto.active_resistance_exercises_such_as_ligh", "Active resistance exercises (such as lightweight sets or walking steps) recruits GLUT-4 glucose cellular receptors. This directly decreases systemic pre-diabetic risk markers. Keep hydration metrics high to protect filtering systems.")}

            </p>
          </div>

        </div>

      </div>

    </div>);

}