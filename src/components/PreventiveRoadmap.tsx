import React, { useState } from "react";
import { PredictionEngineOutput } from "../types";
import { Flame, Droplet, CheckCircle2, Circle, AlertTriangle, Carrot, Dumbbell, ShieldAlert } from "lucide-react";

interface PreventiveRoadmapProps {
  evaluation: PredictionEngineOutput | null;
}

export default function PreventiveRoadmap({ evaluation }: PreventiveRoadmapProps) {
  // Safe default loading state
  const roadmap = evaluation?.preventiveRoadmap;
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [currentWaterLog, setCurrentWaterLog] = useState<number>(0);

  if (!roadmap) {
    return null;
  }

  const toggleHabit = (title: string) => {
    setCompletedHabits(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const addWater = (amount: number) => {
    setCurrentWaterLog(prev => Math.min(roadmap.dailyHydrationTarget * 1.5, prev + amount));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Challenging": return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
      case "Medium": return "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20";
      default: return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Urgent": return "text-red-400 border-red-500/20 bg-red-500/10";
      case "High": return "text-indigo-400 border-indigo-500/20 bg-indigo-500/10";
      default: return "text-slate-400 border-[#222] bg-[#111]";
    }
  };

  const waterProgressPct = Math.round(Math.min(100, (currentWaterLog / roadmap.dailyHydrationTarget) * 100));

  return (
    <div id="preventive-roadmap" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Habits Check-off checklist */}
      <div className="md:col-span-2 bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl shadow-black/40 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-1.5">
            <Dumbbell className="h-4 w-5 text-emerald-400" />
            Active Clinical Prevention Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Check off daily cellular and cardiovascular targets outlined by your medical twin report.
          </p>
        </div>

        <div className="space-y-3">
          {roadmap.habits.map((h, idx) => {
            const isCompleted = completedHabits.includes(h.title);
            return (
              <div
                key={idx}
                id={`habit-card-${idx}`}
                onClick={() => toggleHabit(h.title)}
                className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex gap-3.5 items-start ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500/5 shadow-sm shadow-emerald-500/5"
                    : "border-[#1A1A1A] bg-[#0A0A0A]/60 hover:bg-[#121212] hover:border-[#222]"
                }`}
              >
                <div className="mt-0.5 text-slate-500">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 animate-pulse" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-[#333] shrink-0 hover:text-emerald-500" />
                  )}
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
                        {h.impact} Impact
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{h.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Side Panel targets & Foods bento */}
      <div className="space-y-6">
        
        {/* Dynamic Targets */}
        <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-5 shadow-xl shadow-black/40 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Pre-emptive Biomarker Goals</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Calories budget */}
            <div id="target-calories" className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Flame className="h-16 w-16 text-rose-500" />
              </div>
              <span className="text-[9px] text-rose-450 font-extrabold uppercase">Calorie Goal</span>
              <div className="text-lg font-extrabold text-white font-mono mt-0.5">{roadmap.dailyCalorieTarget}</div>
              <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">kcal / daily</span>
            </div>

            {/* Hydration tracker */}
            <div id="target-hydration" className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Droplet className="h-16 w-16 text-sky-500" />
              </div>
              <span className="text-[9px] text-sky-400 font-extrabold uppercase">Water target</span>
              <div className="text-lg font-extrabold text-white font-mono mt-0.5">{roadmap.dailyHydrationTarget}</div>
              <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">ml / daily</span>
            </div>
          </div>

          {/* Water direct logger */}
          <div className="bg-[#050505] border border-[#1A1A1A] rounded-xl p-3 space-y-2.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-bold uppercase">Fluid Compliance: {currentWaterLog}ml</span>
              <span className="text-emerald-400 font-extrabold font-mono">{waterProgressPct}%</span>
            </div>
            <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full transition-all duration-750" style={{ width: `${waterProgressPct}%` }} />
            </div>
            <div className="flex justify-between gap-2.5">
              <button
                type="button"
                id="btn-add-water-250"
                onClick={() => addWater(250)}
                className="flex-1 bg-[#101010] hover:bg-[#181818] border border-[#222] text-[10px] py-1.5 rounded-md font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                +250ml Glass
              </button>
              <button
                type="button"
                id="btn-add-water-500"
                onClick={() => addWater(500)}
                className="flex-1 bg-[#101010] hover:bg-[#181818] border border-[#222] text-[10px] py-1.5 rounded-md font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                +500ml Bottle
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional guidelines */}
        <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-5 shadow-xl shadow-black/40 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
            <Carrot className="h-4 w-4 text-emerald-400" />
            Nutritional Guidelines
          </h3>

          <div className="space-y-3.5">
            {/* Inclusions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                Cardiac & Insulin Sensitizing Inclusions:
              </span>
              <div className="flex flex-wrap gap-1">
                {roadmap.dietToInclude.map((food, fIdx) => (
                  <span
                    key={fIdx}
                    className="text-[9px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-1 rounded-md border border-emerald-500/20 font-mono"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 uppercase">
                <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />
                Vulnerable Pathological Exclusions:
              </span>
              <div className="flex flex-wrap gap-1">
                {roadmap.dietToAvoid.map((food, fIdx) => (
                  <span
                    key={fIdx}
                    className="text-[9px] bg-red-500/10 text-red-400 font-semibold px-2 py-1 rounded-md border border-red-500/20 font-mono"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
