import { t } from "i18next";
import React, { useState } from "react";
import { PredictionEngineOutput, DiseasePrediction } from "../types";
import { Activity, ShieldAlert, BadgeCheck, Clock, Layers, ArrowUpRight, TrendingUp, HelpCircle } from "lucide-react";

interface AIPredictionsProps {
  evaluation: PredictionEngineOutput | null;
}

export default function AIPredictions({ evaluation }: AIPredictionsProps) {
  const [selectedDiseaseTimeline, setSelectedDiseaseTimeline] = useState<string>("");

  if (!evaluation) {
    return (
      <div id="ai-predictions-empty" className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[400px]">
        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-full animate-pulse border border-emerald-500/15">
          <Activity className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-white">{t("auto.no_risk_intel_loaded", "No Risk Intel Loaded")}</h3>
        <p className="text-sm text-slate-500 max-w-sm">{t("auto.modify_the_baseline_vital_metrics_on_the", "Modify the baseline vital metrics on the left, then trigger \"Simulate Prognosis Prediction Index\" to construct your predictive twin profile!")}

        </p>
      </div>);

  }

  const { healthScore, predictions, timelineForecasts } = evaluation;

  // Sync state with first available disease key if empty or invalid
  const diseaseKeys = Object.keys(timelineForecasts || {});
  const activeTimelineKey = selectedDiseaseTimeline && diseaseKeys.includes(selectedDiseaseTimeline) ?
  selectedDiseaseTimeline :
  diseaseKeys[0] || "";

  const activeForecast = activeTimelineKey ? timelineForecasts[activeTimelineKey] : null;

  // Custom colors based on health score category
  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: "text-emerald-500", border: "border-emerald-500", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10" };
    if (score >= 75) return { text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500", lightBg: "bg-blue-500/10" };
    if (score >= 60) return { text: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500", lightBg: "bg-amber-500/10" };
    if (score >= 40) return { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500", lightBg: "bg-orange-500/10" };
    return { text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500", lightBg: "bg-red-500/10" };
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Severe":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "Moderate":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const healthColors = getScoreColor(healthScore.score);

  return (
    <div id="ai-predictions-panel" className="space-y-6">
      {/* 1. Health Score Ring Overview card */}
      <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl shadow-black/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Radial score gauge */}
          <div className="flex flex-col items-center text-center p-3 border-r border-[#151515] md:col-span-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t("auto.overall_health_score", "Overall Health Score")}</span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-[#1D1D1D] fill-none" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className={`${healthColors.text} fill-none transition-all duration-1000`}
                  strokeWidth="10"
                  strokeDasharray="339"
                  strokeDashoffset={339 - 339 * healthScore.score / 100}
                  strokeLinecap="round" />
                
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{healthScore.score}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">/ 100</span>
              </div>
            </div>
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/10 ${healthColors.lightBg} ${healthColors.text}`}>
              {healthScore.category}{t("auto.state", "State")}
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">{t("auto.resilience_index_indicators", "Resilience Index Indicators")}</h3>
              <span className="text-xs text-slate-500">{t("auto.target_range_75", "Target Range: > 75")}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#050505] border border-[#1A1A1A] rounded-xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">{t("auto.cardiovascular_index", "Cardiovascular Index")}</span>
                  <span className="font-mono font-bold text-slate-300">{healthScore.breakdown.cardio}%</span>
                </div>
                <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-750" style={{ width: `${healthScore.breakdown.cardio}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#050505] border border-[#1A1A1A] rounded-xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">{t("auto.metabolic_clearance", "Metabolic Clearance")}</span>
                  <span className="font-mono font-bold text-slate-300">{healthScore.breakdown.metabolic}%</span>
                </div>
                <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-750" style={{ width: `${healthScore.breakdown.metabolic}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#050505] border border-[#1A1A1A] rounded-xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">{t("auto.lifestyle_resilience", "Lifestyle Resilience")}</span>
                  <span className="font-mono font-bold text-slate-300">{healthScore.breakdown.lifestyle}%</span>
                </div>
                <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-550 h-full rounded-full transition-all duration-750" style={{ width: `${healthScore.breakdown.lifestyle}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#050505] border border-[#1A1A1A] rounded-xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-medium">{t("auto.allostatic_stress_balance", "Allostatic Stress Balance")}</span>
                  <span className="font-mono font-bold text-slate-300">{healthScore.breakdown.stress}%</span>
                </div>
                <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-750" style={{ width: `${healthScore.breakdown.stress}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Predicted Diseases register */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />{t("auto.predicted_disease_prognosis_index", "Predicted Disease Prognosis Index")}

          </h2>
          <span className="text-xs text-emerald-400 font-medium font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {predictions.length}{t("auto.high_hazard_vectors", "High-Hazard Vectors")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((p, index) => {
            const levelStyle = getSeverityStyle(p.severity);
            const sliderColor =
            p.probability >= 70 ?
            "bg-red-500" :
            p.probability >= 45 ?
            "bg-orange-500" :
            p.probability >= 25 ?
            "bg-amber-500" :
            "bg-emerald-500";

            return (
              <div
                key={index}
                id={`disease-card-${index}`}
                className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#222] hover:shadow-lg hover:shadow-black/60 transition-all space-y-4 relative overflow-hidden group">
                
                {/* Horizontal status line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${sliderColor}`} />

                <div className="flex items-start justify-between pt-1">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                      {p.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {p.category}{t("auto.category", "Category")}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${levelStyle}`}>
                    {p.severity}{t("auto.risk", "Risk")}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{t("auto.relative_probability", "Relative Probability")}</span>
                    <span className="font-extrabold text-white font-mono text-sm">{p.probability}%</span>
                  </div>
                  <div className="w-full bg-[#151515] h-2 rounded-full overflow-hidden">
                    <div className={`${sliderColor} h-full rounded-full transition-all duration-1000`} style={{ width: `${p.probability}%` }} />
                  </div>
                </div>

                {/* Sub data parameters */}
                <div className="grid grid-cols-2 gap-3 text-slate-400 text-[10px] bg-[#0A0A0A] border border-[#1C1C1C] p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span>{t("auto.accuracy", "Accuracy:")}<strong>{p.confidenceScore}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    <span>{t("auto.timeline", "Timeline:")}<strong>{p.timeline}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Layers className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t("auto.progression_hazard_level", "Progression hazard level:")}<strong>{p.progressionRisk}%</strong></span>
                  </div>
                </div>

                {/* Triggers */}
                {p.triggers && p.triggers.length > 0 &&
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t("auto.underlying_biomarker_triggers", "Underlying Biomarker Triggers:")}</span>
                    <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                      {p.triggers.map((trigger, tIdx) =>
                    <li key={tIdx} className="truncate">{trigger}</li>
                    )}
                    </ul>
                  </div>
                }
              </div>);

          })}
        </div>
      </div>

      {/* 3. Progression Timeline Forecast Curve */}
      {activeForecast &&
      <div className="bg-[#0A0A0A] border border-[#222] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12">
            <Activity className="h-64 w-64 text-emerald-400" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-4 gap-4">
            <div>
              <h3 className="text-sm font-semibold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />{t("auto.comprehensive_disease_forecast", "COMPREHENSIVE DISEASE FORECAST")}
            </h3>
              <h2 className="text-lg font-bold text-white mt-1">{t("auto.risk_development_curve_over_5_years", "Risk Development Curve Over 5 Years")}

            </h2>
            </div>

            <div className="relative">
              <select
              id="timeline-active-disease"
              value={activeTimelineKey}
              onChange={(e) => setSelectedDiseaseTimeline(e.target.value)}
              className="bg-black/60 text-[#E0E0E0] border border-[#333] rounded-xl px-3.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              
                {diseaseKeys.map((key) =>
              <option key={key} value={key} className="bg-slate-950 text-white">
                    {key}
                  </option>
              )}
              </select>
            </div>
          </div>

          {/* Forecast intervals visual cards line */}
          <div className="grid grid-cols-5 gap-3 mt-6 relative z-10">
            {[
          { label: "30 Days", val: activeForecast.days30, sub: "Micro-phase" },
          { label: "90 Days", val: activeForecast.days90, sub: "Early warning" },
          { label: "6 Months", val: activeForecast.months6, sub: "Compounding" },
          { label: "1 Year", val: activeForecast.year1, sub: "Onset stage" },
          { label: "5 Years", val: activeForecast.years5, sub: "Severe plaque" }].
          map((node, nIdx) => {
            const bgPercent =
            node.val >= 70 ?
            "bg-red-500" :
            node.val >= 45 ?
            "bg-orange-500" :
            node.val >= 25 ?
            "bg-amber-500" :
            "bg-emerald-500";

            return (
              <div key={nIdx} className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2 relative">
                  {/* Connection lines between steps */}
                  {nIdx < 4 &&
                <div className="absolute top-1/2 -right-2 w-4 h-[1px] bg-[#222] hidden md:block" />
                }
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{node.label}</span>
                  <div className={`text-sm md:text-lg font-extrabold font-mono rounded-full px-2 py-0.5 ${node.val >= 45 ? "text-rose-100" : "text-emerald-100"}`}>
                    {node.val}%
                  </div>
                  <div className="w-10 bg-[#151515] h-1 rounded-full overflow-hidden">
                    <div className={`${bgPercent} h-full`} style={{ width: `${node.val}%` }} />
                  </div>
                  <span className="text-[8px] text-slate-500 font-medium truncate w-full">{node.sub}</span>
                </div>);

          })}
          </div>

          <div className="mt-5 text-xs text-slate-300 bg-[#0F0F0F] border border-[#1A1A1A] p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-emerald-450 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />{t("auto.progression_trajectory_commentary", "Progression Trajectory Commentary:")}
          </span>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed text-slate-400">
              {activeForecast.reasons?.map((r, rIdx) =>
            <li key={rIdx}>{r}</li>
            )}
            </ul>
          </div>
        </div>
      }
    </div>);

} 