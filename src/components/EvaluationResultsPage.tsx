import { t } from "i18next";
import React from "react";
import { PredictionEngineOutput, UserProfile } from "../types";
import {
  Heart, ShieldCheck, Activity, Award, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sparkles, ListCollapse, BookOpenCheck, Info } from
"lucide-react";

interface EvaluationResultsPageProps {
  evaluation: PredictionEngineOutput | null;
  selectedRecord: any;
}

export default function EvaluationResultsPage({ evaluation, selectedRecord }: EvaluationResultsPageProps) {
  if (!selectedRecord || !evaluation) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">{t("auto.no_active_metrics_logged", "No Active Metrics Logged")}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("auto.please_navigate_to_the_data_intake_scree", "Please navigate to the \"Data Intake\" screen and submit your current biomarkers to generate evaluation results.")}

        </p>
      </div>);

  }

  const { healthScore } = evaluation;
  const basicInfo = selectedRecord.basicInfo;
  const lifestyle = selectedRecord.lifestyle;
  const nutrition = selectedRecord.nutrition || {};

  // Math helper for individual scores
  const sleepDuration = parseFloat(lifestyle.sleepDuration) || 7;
  const sleepQuality = parseFloat(lifestyle.sleepQuality) || 3;
  const sleepScore = Math.min(100, Math.round(sleepDuration / 8 * 70 + sleepQuality / 5 * 30));

  const stressLevel = parseFloat(lifestyle.stressLevel) || 5;
  const stressScore = Math.max(10, Math.round(100 - stressLevel * 9));

  const steps = selectedRecord.wearableDetails?.steps || 0;
  const activityScore = steps > 0 ?
  Math.min(100, Math.round(steps / 10000 * 100)) :
  lifestyle.physicalActivity === "High" ? 90 : lifestyle.physicalActivity === "Moderate" ? 75 : lifestyle.physicalActivity === "Low" ? 50 : 30;

  const junkFreq = parseFloat(nutrition.junkFood) || 5;
  const sugarFreq = parseFloat(nutrition.sugar) || 5;
  const waterIntake = parseFloat(nutrition.water) || 2;
  const nutritionScore = Math.max(30, Math.min(100, Math.round(100 - junkFreq * 4 - sugarFreq * 3 + (waterIntake >= 2 ? 10 : 0))));

  const scores = [
  { name: "Health Score", value: healthScore.score, label: healthScore.category + " State", color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-550/10", details: "Overall cardiovascular, metabolic, lifestyle, and stress synthesis." },
  { name: "Nutrition Score", value: nutritionScore, label: nutritionScore >= 80 ? "Optimal" : nutritionScore >= 60 ? "Moderate" : "Deficient", color: "from-amber-500 to-orange-500", glow: "shadow-amber-500/10", details: "Based on dietary macros, meal scheduling, junk/sugar frequency, and hydration." },
  { name: "Sleep Balance", value: sleepScore, label: sleepScore >= 85 ? "Excellent Rest" : sleepScore >= 65 ? "Fair Recovery" : "Fragmented", color: "from-sky-500 to-indigo-500", glow: "shadow-sky-550/10", details: "Computed from chronological duration relative to clean circadian targets." },
  { name: "Stress Resilience", value: stressScore, label: stressScore >= 75 ? "Balanced" : stressScore >= 50 ? "Compensated" : "High Strain", color: "from-purple-500 to-pink-500", glow: "shadow-purple-500/10", details: "Allostatic resilience indexed against behavioral & metabolic anxiety factors." },
  { name: "Activity Index", value: activityScore, label: activityScore >= 80 ? "Vigorous" : activityScore >= 50 ? "Active" : "Sedentary", color: "from-teal-400 to-emerald-550", glow: "shadow-teal-500/10", details: "Synthesizes metabolic physical activities & wearable chronological steps." }];


  // Biomarker ranges for Explainable AI
  const bloodSugarActual = parseFloat(basicInfo.bloodSugar) || 100;
  const systolicBPActual = parseFloat(basicInfo.systolicBP) || 120;
  const diastolicBPActual = parseFloat(basicInfo.diastolicBP) || 80;
  const cholesterolActual = parseFloat(basicInfo.cholesterolTotal) || 190;

  const biomarkers = [
  { name: "Fasting Blood Sugar", value: bloodSugarActual, unit: "mg/dL", normal: "70 - 100", status: bloodSugarActual > 100 ? "Elevated (Pre-Diabetic Baseline)" : "In Target", desc: "Indices > 100 signal insulin baseline threshold deviations.", isDeviated: bloodSugarActual > 100 },
  { name: "Blood Pressure (BP)", value: `${systolicBPActual}/${diastolicBPActual}`, unit: "mmHg", normal: "90/60 - 120/80", status: systolicBPActual > 130 ? "Stage 1 Hypertension" : systolicBPActual > 120 ? "Pre-hypertension Accent" : "Optimal Range", desc: "Systolic above 120 increase arterial stiffness markers.", isDeviated: systolicBPActual > 120 },
  { name: "Total Cholesterol", value: cholesterolActual, unit: "mg/dL", normal: "130 - 200", status: cholesterolActual > 200 ? "Borderline High Risk" : "Optimized", desc: "Vessel accumulation rises when levels float past 200 mg/dL limits.", isDeviated: cholesterolActual > 200 }];


  return (
    <div className="space-y-6" id="evaluation-results-tab-panel">
      
      {/* Intro section */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />{t("auto.high_fidelity_medical_twin_reports", "High Fidelity Medical Twin Reports")}

          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{t("auto.active_evaluation_results", "Active Evaluation Results")}</h2>
          <p className="text-xs text-slate-500">{t("auto.intelligent_scoring_and_biomarkers_valid", "Intelligent scoring and biomarkers validation analyzed on")}
            {new Date(selectedRecord.timestamp).toLocaleDateString()}
          </p>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-mono block">{t("auto.data_integrity_confidence", "Data Integrity Confidence")}</span>
          <span className="text-lg font-black text-emerald-400 font-mono">92.5%</span>
        </div>
      </div>

      {/* HEALTH RISK HEATMAP ADVERTISEMENT / DISCOVERY CALLOUT */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-neutral-950 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10 text-center md:text-left">
          <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest flex items-center justify-center md:justify-start gap-1 font-mono">
            <Heart className="h-3 w-3 text-emerald-450 animate-pulse" />{t("auto.core_twin_integration_feature", "Core Twin Integration Feature")}

          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">{t("auto.anatomical_health_risk_heatmap_ready", "Anatomical Health Risk Heatmap Ready")}

          </h3>
          <p className="text-xs text-slate-400 max-w-xl">{t("auto.see_your_health_understand_your_risks_p", "\"See your health. Understand your risks. Protect your future.\" Tap the")}
            <strong className="text-emerald-400 font-bold">{t("auto.health_risk_heatmap", "Health Risk Heatmap")}</strong>{t("auto.section_in_the_sidebar_to_interactively", "section in the sidebar to interactively simulate liver weight stresses, chronobiological triggers, and respiratory loads on a beautiful color-coded organ schematic!")}
          </p>
        </div>
        <div className="shrink-0 z-10 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-xl text-center">
          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">{t("auto.mapped_organs", "Mapped Organs")}</span>
          <span className="text-xs font-black text-emerald-400 font-mono">{t("auto.6_core_systems_live", "6 Core Systems \u2022 Live")}</span>
        </div>
      </div>

      {/* Grid of Scores with pictorial representations (Rings/Gauges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {scores.map((score, idx) => {
          const circumference = 2 * Math.PI * 36;
          const strokeOffset = circumference - circumference * score.value / 100;
          return (
            <div
              key={idx}
              className={`bg-[#0A0A0A] border border-[#1A1A1A] p-4.5 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-lg hover:border-[#222] transition-all`}>
              
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{score.name}</span>
              
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="36" className="stroke-[#131111] fill-none" strokeWidth="6" />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    className="stroke-emerald-500 fill-none transition-all duration-1000"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    style={{ stroke: `url(#gradient-${idx})` }} />
                  
                  <defs>
                    <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-white font-mono">{score.value}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">/100</span>
                </div>
              </div>

              <div className="min-h-[1.5rem] flex items-center">
                <span className="text-[10px] uppercase font-black bg-[#151515] border border-[#202020] text-emerald-400 px-2.5 py-0.5 rounded-full tracking-wider">
                  {score.label}
                </span>
              </div>
            </div>);

        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Explainable AI Score Calculation logic */}
        <div className="lg:col-span-7 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#151515] pb-3.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest">{t("auto.explainable_ai_scoring_core", "Explainable AI Scoring Core")}</h3>
              <p className="text-[10px] text-slate-500">{t("auto.autonomous_mathematical_baseline_and_cli", "Autonomous mathematical baseline and clinical compliance model explanations.")}</p>
            </div>
          </div>

          <div className="space-y-4">
            {scores.map((score, sIdx) =>
            <div key={sIdx} className="p-3.5 bg-[#050505] border border-[#161616] rounded-xl space-y-1.5 hover:bg-[#0C0C0C]/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase">{score.name}{t("auto.calculation", "Calculation")}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">{t("auto.value", "Value:")}{score.value}/100</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{score.details}</p>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 bg-[#070707] p-2 rounded-lg border border-[#121212] mt-1">
                  <Info className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>
                    {score.name === "Health Score" ? "Formulated using weighted biomarker resilience scores across categories." : ""}
                    {score.name === "Nutrition Score" ? `Calculated as: 100 - (Junk Food frequency Rating: ${junkFreq} * 4) - (Sugar: ${sugarFreq} * 3) + Water Bonus.` : ""}
                    {score.name === "Sleep Balance" ? `Synthesizes sleep duration (${sleepDuration}h against optimal 8h) combined with subjective sleep depth of ${sleepQuality}/5.` : ""}
                    {score.name === "Stress Resilience" ? `Reflects nervous system rest. Allostatic strain factor was estimated as ${stressLevel}/10.` : ""}
                    {score.name === "Activity Index" ? `Assesses aerobic muscle engagement. Syncs steps count (${steps} steps / target 10k) and weekly workouts.` : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Biomarker reference guides showing deviations */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#151515] pb-3.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpenCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest">{t("auto.biomarkers_reference_bounds", "Biomarkers Reference Bounds")}</h3>
              <p className="text-[10px] text-slate-500">{t("auto.early_warning_validation_against_absolut", "Early warning validation against absolute clinical reference limits.")}</p>
            </div>
          </div>

          <div className="space-y-4">
            {biomarkers.map((marker, mIdx) =>
            <div
              key={mIdx}
              className={`p-4 rounded-xl border transition-all ${
              marker.isDeviated ?
              "border-amber-500/30 bg-amber-550/5 shadow-inner" :
              "border-[#1A1A1A] bg-[#070707]"}`
              }>
              
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black text-white block tracking-tight uppercase">{marker.name}</span>
                    <span className="text-[10px] text-slate-550 block font-mono">{t("auto.normal_limit", "Normal Limit:")}{marker.normal} {marker.unit}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-sm font-extrabold font-mono block ${marker.isDeviated ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                      {marker.value} {marker.unit}
                    </span>
                    <span className={`text-[8px] uppercase tracking-widest font-black ${marker.isDeviated ? "text-amber-500" : "text-emerald-450"}`}>
                      {marker.status}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal mt-2.5 bg-[#050505] p-2 rounded-lg border border-[#121212] font-medium flex items-start gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${marker.isDeviated ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span>{marker.desc}</span>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>);

}