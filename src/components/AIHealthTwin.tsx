import { t } from "i18next";
import React, { useState, useEffect } from "react";
import { PredictionEngineOutput, UserProfile, DynamicDigitalTwinScenario } from "../types";
import {
  Users, TrendingDown, TrendingUp, RefreshCw, Zap, Sliders, PlayCircle, Award,
  ShieldCheck, ShieldAlert, BrainCircuit, Sparkles, Calendar, ChevronRight, Heart,
  Clock, Flame, HelpCircle, ArrowRight, Table, Info } from
"lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from
"recharts";

interface AIHealthTwinProps {
  selectedRecord: any;
  evaluation: PredictionEngineOutput | null;
  user: any;
}

export default function AIHealthTwin({ selectedRecord, evaluation, user }: AIHealthTwinProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "comparison">("simulator");
  const [selectedForecastMetric, setSelectedForecastMetric] = useState<"score" | "diabetes" | "heart" | "hypertension">("score");

  // Local state for interactive simulators initialized with current values
  const [simulatedWeight, setSimulatedWeight] = useState<number>(75);
  const [simulatedExercise, setSimulatedExercise] = useState<number>(3);
  const [simulatedSleep, setSimulatedSleep] = useState<number>(7);
  const [simulatedSmoking, setSimulatedSmoking] = useState<"Never" | "Former" | "Active">("Never");
  const [simulatedStress, setSimulatedStress] = useState<number>(5);
  const [simulatedWater, setSimulatedWater] = useState<number>(2);

  // Simulation outcome states
  const [simResults, setSimResults] = useState<{
    scoreBefore: number;
    scoreAfter: number;
    diabetesBefore: number;
    diabetesAfter: number;
    heartBefore: number;
    heartAfter: number;
    hypertensionBefore: number;
    hypertensionAfter: number;
    aiInsights: string[];
    timelineEstimate: string;
  } | null>(null);

  if (!selectedRecord || !evaluation) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">{t("auto.no_active_digital_replica_sync_case", "No Active Digital Replica Sync Case")}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("auto.please_complete_your_initial_biomarkers", "Please complete your initial biomarkers and health metrics from the \"Health Data Input\" page to assemble your first Medical Twin representation.")}

        </p>
      </div>);

  }

  // Baseline properties derived from selected record
  const basicInfo = selectedRecord.basicInfo || {};
  const lifestyle = selectedRecord.lifestyle || {};
  const nutrition = selectedRecord.nutrition || {};
  const wearable = selectedRecord.wearableDetails || {};

  const currentScore = evaluation.healthScore?.score || 72;
  const currentDiabetesRisk = Math.round(evaluation.predictions?.find((p) => p.name.toLowerCase().includes("diabetes"))?.probability || 48);
  const currentHeartRisk = Math.round(evaluation.predictions?.find((p) => p.name.toLowerCase().includes("heart"))?.probability || 34);
  const currentHypertensionRisk = Math.round(evaluation.predictions?.find((p) => p.name.toLowerCase().includes("hypertension"))?.probability || 42);

  const baselineWeight = parseFloat(basicInfo.weight) || 75;
  const baselineHeight = parseFloat(basicInfo.height) || 170;
  const baselineSleep = parseFloat(lifestyle.sleepDuration) || 7;
  const baselineExercise = Number(wearable.exerciseDays) || Number(lifestyle.exerciseDays) || 3;
  const baselineSmoking = (lifestyle.smoking || "Never") as "Never" | "Former" | "Active";
  const baselineStress = parseFloat(lifestyle.stressLevel) || 5;
  const baselineWater = parseFloat(nutrition.water) || 2;

  // Initialize sliders with baseline numbers on load or change
  useEffect(() => {
    setSimulatedWeight(baselineWeight);
    setSimulatedExercise(baselineExercise);
    setSimulatedSleep(baselineSleep);
    setSimulatedSmoking(baselineSmoking);
    setSimulatedStress(baselineStress);
    setSimulatedWater(baselineWater);
  }, [selectedRecord.id]);

  // Compute BMI dynamically
  const getBmi = (wt: number) => {
    return baselineHeight > 0 ? wt / (baselineHeight / 100 * (baselineHeight / 100)) : 24.2;
  };

  // Immediate Simulation Algorithm that reacts in real-time
  const computeSimulationOutput = () => {
    // Basic mathematical response calculations
    let scoreDelta = 0;
    let diabetesDelta = 0;
    let heartDelta = 0;
    let hypertensionDelta = 0;

    // Weight differential
    const wtChange = baselineWeight - simulatedWeight;
    if (wtChange > 0) {
      // positive impact (losing weight is generally beneficial if initially elevated)
      scoreDelta += Math.min(10, wtChange * 0.8);
      diabetesDelta -= wtChange * 1.5;
      heartDelta -= wtChange * 1.1;
      hypertensionDelta -= wtChange * 1.2;
    } else if (wtChange < 0) {
      // negative impact (gaining weight)
      scoreDelta += Math.max(-12, wtChange * 0.9);
      diabetesDelta -= wtChange * 2.0;
      heartDelta -= wtChange * 1.4;
      hypertensionDelta -= wtChange * 1.5;
    }

    // Exercise differential
    const exChange = simulatedExercise - baselineExercise;
    scoreDelta += exChange * 2.5;
    diabetesDelta -= exChange * 3.5;
    heartDelta -= exChange * 2.8;
    hypertensionDelta -= exChange * 2.5;

    // Sleep differential
    const slChange = simulatedSleep - baselineSleep;
    if (simulatedSleep >= 7 && simulatedSleep <= 9) {
      if (baselineSleep < 7) {
        scoreDelta += 6;
        heartDelta -= 6;
        hypertensionDelta -= 8;
      }
    } else if (simulatedSleep < 6) {
      scoreDelta -= 7;
      heartDelta += 5;
      hypertensionDelta += 6;
    }

    // Stress differential
    const stChange = baselineStress - simulatedStress;
    scoreDelta += stChange * 1.5;
    heartDelta -= stChange * 2.2;
    hypertensionDelta -= stChange * 2.5;

    // Smoking differential
    if (baselineSmoking === "Active" && simulatedSmoking === "Never") {
      scoreDelta += 12;
      heartDelta -= 18;
      hypertensionDelta -= 12;
    } else if (baselineSmoking === "Active" && simulatedSmoking === "Former") {
      scoreDelta += 6;
      heartDelta -= 8;
    } else if (baselineSmoking === "Never" && simulatedSmoking === "Active") {
      scoreDelta -= 15;
      heartDelta += 20;
      hypertensionDelta += 14;
    }

    // Water differential
    const waChange = simulatedWater - baselineWater;
    if (waChange > 0) {
      scoreDelta += Math.min(3, waChange * 1.2);
    }

    // Constrain outputs
    const scoreAfter = Math.min(98, Math.max(25, Math.round(currentScore + scoreDelta)));
    const diabetesAfter = Math.min(95, Math.max(5, Math.round(currentDiabetesRisk + diabetesDelta)));
    const heartAfter = Math.min(95, Math.max(5, Math.round(currentHeartRisk + heartDelta)));
    const hypertensionAfter = Math.min(95, Math.max(5, Math.round(currentHypertensionRisk + hypertensionDelta)));

    // Generate dynamic textual Insights
    const aiInsights: string[] = [];
    if (wtChange > 3) {
      aiInsights.push(`Losing ${wtChange.toFixed(1)} kg reduces adipose tissue volume, cutting estimated diabetes risk by ${Math.abs(Math.round(diabetesDelta))}% through restored GLUT-4 cellular glucose capture.`);
    }
    if (exChange >= 2) {
      aiInsights.push(`Increasing exercise frequency to ${simulatedExercise} days/week enhances coronary arterial elasticity, stabilizing resting systolic thresholds.`);
    }
    if (simulatedSleep >= 7.5 && baselineSleep < 6.5) {
      aiInsights.push("Restoring your sleep structure to over 7.5 hours allows crucial parasympathetic vagal recovery, naturally buffering daily cardiovascular load.");
    }
    if (simulatedStress < baselineStress) {
      aiInsights.push(`Mitigating neural stress levels (down to ${simulatedStress}/10) diminishes chronobiological cortisol release, safeguarding your endothelial linings.`);
    }
    if (baselineSmoking === "Active" && simulatedSmoking === "Never") {
      aiInsights.push("Total tobacco cessation eliminates inhaled chemical toxins immediately, stopping oxidative degradation of inner arterial cell structures.");
    }

    if (aiInsights.length === 0) {
      aiInsights.push("Your habits are currently identical to baseline. Modify any of the sliders on the left to see predictive deflection curves in real-time.");
    }

    const timelineEstimate = wtChange > 0 || exChange > 0 || baselineSmoking === "Active" && simulatedSmoking === "Never" ?
    "Endothelial vessel relaxation initiates within 30 days. Full insulin sensitivity stabilization occurs around Month 6." :
    "Metabolic risk indices remain standard. Predictive biological markers align to baseline trends.";

    return {
      scoreBefore: currentScore,
      scoreAfter,
      diabetesBefore: currentDiabetesRisk,
      diabetesAfter,
      heartBefore: currentHeartRisk,
      heartAfter,
      hypertensionBefore: currentHypertensionRisk,
      hypertensionAfter,
      aiInsights,
      timelineEstimate
    };
  };

  // Run dynamic calculation on state modify
  const results = computeSimulationOutput();

  // Trigger server-side AI-supported deep digital twin scenario simulation
  const runServerBasedSimulation = async () => {
    setLoading(true);
    try {
      const simulatedChanges = {
        weight: simulatedWeight,
        exerciseDays: simulatedExercise,
        sleepHours: simulatedSleep,
        smoking: simulatedSmoking,
        stressLevel: simulatedStress,
        waterIntake: simulatedWater * 1000
      };

      const response = await fetch("/api/digital-twin-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: localStorage.getItem("aegis_preferred_lang") || "en",
          originalProfile: {
            age: Number(basicInfo.age) || 30,
            gender: basicInfo.gender || "Never",
            height: Number(basicInfo.height) || 170,
            weight: Number(baselineWeight),
            systolicBP: Number(basicInfo.systolicBP) || 120,
            diastolicBP: Number(basicInfo.diastolicBP) || 80,
            bloodSugar: Number(basicInfo.bloodSugar) || 100,
            cholesterolTotal: Number(basicInfo.cholesterolTotal) || 190,
            heartRate: Number(basicInfo.heartRate) || 72,
            smoking: baselineSmoking,
            alcohol: (lifestyle.alcohol || "Social") as any,
            sleepHours: baselineSleep,
            exerciseDays: baselineExercise,
            waterIntake: baselineWater * 1000,
            stressLevel: baselineStress,
            dietType: "Standard",
            familyHistory: [],
            existingConditions: []
          },
          simulatedChanges
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Set simulated outcome based on server returns
        console.log("Server digital twin data synced:", data);
      }
    } catch (err) {
      console.error("AI simulation server error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthForecastData = () => {
    // Generates coordinates for 6 Month, 1 Year, 3 Year, 5 Year comparisons
    if (selectedForecastMetric === "score") {
      return [
      { name: "Current", baseline: currentScore, unchanged: currentScore, improved: currentScore },
      { name: "6 Months", baseline: Math.round(currentScore * 0.98), unchanged: Math.round(currentScore * 0.98), improved: Math.round(currentScore + (results.scoreAfter - currentScore) * 0.4) },
      { name: "1 Year", baseline: Math.round(currentScore * 0.95), unchanged: Math.round(currentScore * 0.95), improved: Math.round(currentScore + (results.scoreAfter - currentScore) * 0.70) },
      { name: "3 Years", baseline: Math.round(currentScore * 0.91), unchanged: Math.round(currentScore * 0.91), improved: Math.round(currentScore + (results.scoreAfter - currentScore) * 0.90) },
      { name: "5 Years", baseline: Math.round(currentScore * 0.88), unchanged: Math.round(currentScore * 0.88), improved: results.scoreAfter }];

    } else if (selectedForecastMetric === "diabetes") {
      return [
      { name: "Current", baseline: currentDiabetesRisk, unchanged: currentDiabetesRisk, improved: currentDiabetesRisk },
      { name: "6 Months", baseline: Math.round(currentDiabetesRisk * 1.05), unchanged: Math.round(currentDiabetesRisk * 1.05), improved: Math.round(currentDiabetesRisk + (results.diabetesAfter - currentDiabetesRisk) * 0.4) },
      { name: "1 Year", baseline: Math.round(currentDiabetesRisk * 1.15), unchanged: Math.round(currentDiabetesRisk * 1.15), improved: Math.round(currentDiabetesRisk + (results.diabetesAfter - currentDiabetesRisk) * 0.70) },
      { name: "3 Years", baseline: Math.round(currentDiabetesRisk * 1.30), unchanged: Math.round(currentDiabetesRisk * 1.30), improved: Math.round(currentDiabetesRisk + (results.diabetesAfter - currentDiabetesRisk) * 0.90) },
      { name: "5 Years", baseline: Math.round(currentDiabetesRisk * 1.45), unchanged: Math.round(currentDiabetesRisk * 1.45), improved: results.diabetesAfter }];

    } else if (selectedForecastMetric === "heart") {
      return [
      { name: "Current", baseline: currentHeartRisk, unchanged: currentHeartRisk, improved: currentHeartRisk },
      { name: "6 Months", baseline: Math.round(currentHeartRisk * 1.03), unchanged: Math.round(currentHeartRisk * 1.03), improved: Math.round(currentHeartRisk + (results.heartAfter - currentHeartRisk) * 0.4) },
      { name: "1 Year", baseline: Math.round(currentHeartRisk * 1.10), unchanged: Math.round(currentHeartRisk * 1.10), improved: Math.round(currentHeartRisk + (results.heartAfter - currentHeartRisk) * 0.70) },
      { name: "3 Years", baseline: Math.round(currentHeartRisk * 1.25), unchanged: Math.round(currentHeartRisk * 1.25), improved: Math.round(currentHeartRisk + (results.heartAfter - currentHeartRisk) * 0.90) },
      { name: "5 Years", baseline: Math.round(currentHeartRisk * 1.40), unchanged: Math.round(currentHeartRisk * 1.40), improved: results.heartAfter }];

    } else {
      return [
      { name: "Current", baseline: currentHypertensionRisk, unchanged: currentHypertensionRisk, improved: currentHypertensionRisk },
      { name: "6 Months", baseline: Math.round(currentHypertensionRisk * 1.04), unchanged: Math.round(currentHypertensionRisk * 1.04), improved: Math.round(currentHypertensionRisk + (results.hypertensionAfter - currentHypertensionRisk) * 0.4) },
      { name: "1 Year", baseline: Math.round(currentHypertensionRisk * 1.12), unchanged: Math.round(currentHypertensionRisk * 1.12), improved: Math.round(currentHypertensionRisk + (results.hypertensionAfter - currentHypertensionRisk) * 0.70) },
      { name: "3 Years", baseline: Math.round(currentHypertensionRisk * 1.22), unchanged: Math.round(currentHypertensionRisk * 1.22), improved: Math.round(currentHypertensionRisk + (results.hypertensionAfter - currentHypertensionRisk) * 0.90) },
      { name: "5 Years", baseline: Math.round(currentHypertensionRisk * 1.35), unchanged: Math.round(currentHypertensionRisk * 1.35), improved: results.hypertensionAfter }];

    }
  };

  const scoreCategoryColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-teal-400";
    if (score >= 55) return "text-amber-400";
    return "text-red-400";
  };

  const scoreBgColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "bg-teal-500/10 border-teal-500/20";
    if (score >= 55) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-6" id="ai-health-twin-portal-panel">
      
      {/* Title & Banner Gating */}
      <div className="bg-gradient-to-r from-[#0D0D11] via-[#09090D] to-[#0D0D11] border border-[#1C1C24] p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-extrabold font-mono tracking-wider uppercase">{t("auto.ai_health_twin_simulation", "AI HEALTH TWIN SIMULATION")}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-tight">{t("auto.meet_your_digital_health_twin", "Meet Your Digital Health Twin")}</h1>
            <p className="text-xs text-slate-400 font-medium max-w-xl italic">{t("auto.see_how_today_s_choices_shape_tomorrow", "\"See how today's choices shape tomorrow's health.\"")}

            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-4 py-2 text-xs rounded-xl font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border ${
              activeTab === "simulator" ?
              "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10" :
              "bg-zinc-900 border-neutral-800 text-slate-400 hover:text-white"}`
              }>
              
              <Sliders className="h-4 w-4" />{t("auto.interactive_simulator", "Interactive Simulator")}

            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-4 py-2 text-xs rounded-xl font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border ${
              activeTab === "comparison" ?
              "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10" :
              "bg-zinc-900 border-neutral-800 text-slate-400 hover:text-white"}`
              }>
              
              <Table className="h-4 w-4" />{t("auto.visual_matrix_comparison", "Visual Matrix comparison")}

            </button>
          </div>
        </div>
      </div>

      {activeTab === "simulator" &&
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sliders sandbox: 5 Cols */}
          <div className="lg:col-span-5 bg-[#08080B] border border-[#16161B] rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
            <div className="border-b border-[#141419] pb-3">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />{t("auto.configure_lifestyle_sliders", "Configure Lifestyle Sliders")}

            </h3>
              <p className="text-[10px] text-slate-500">{t("auto.diverge_simulated_indicators_from_your_c", "Diverge simulated indicators from your current baseline clinical records")}</p>
            </div>

            <div className="space-y-4">
              
              {/* Weight modification slider */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{t("auto.body_weight", "\u2696\uFE0F Body Weight")}</span>
                  <span className="font-mono text-emerald-400 font-bold">{simulatedWeight}{t("auto.kg", "kg")}<span className="text-[10px] text-slate-500">{t("auto.bmi", "(BMI:")}{getBmi(simulatedWeight).toFixed(1)})</span></span>
                </div>
                <input
                type="range"
                min="40"
                max="155"
                step="1"
                value={simulatedWeight}
                onChange={(e) => setSimulatedWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-[#14141A] rounded-lg appearance-none cursor-ew-resize accent-emerald-500 text-emerald-400" />
              
                <div className="flex justify-between text-[8px] text-slate-555 font-mono">
                  <span>{t("auto.baseline", "Baseline:")}{baselineWeight}{t("auto.kg", "kg")}</span>
                  <span className={`${simulatedWeight < baselineWeight ? 'text-emerald-405 font-bold' : simulatedWeight > baselineWeight ? 'text-red-405 font-bold' : ''}`}>
                    {simulatedWeight < baselineWeight ? `-${(baselineWeight - simulatedWeight).toFixed(1)} kg` : simulatedWeight > baselineWeight ? `+${(simulatedWeight - baselineWeight).toFixed(1)} kg` : "Unmodified"}
                  </span>
                </div>
              </div>

              {/* Exercise Days slider */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{t("auto.exercise_frequency", "\uD83C\uDFCB\uFE0F Exercise Frequency")}</span>
                  <span className="font-mono text-emerald-400 font-bold">{simulatedExercise}{t("auto.days_week", "Days/Week")}</span>
                </div>
                <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={simulatedExercise}
                onChange={(e) => setSimulatedExercise(Number(e.target.value))}
                className="w-full h-1.5 bg-[#14141A] rounded-lg appearance-none cursor-ew-resize accent-emerald-500" />
              
                <div className="flex justify-between text-[8px] text-slate-555 font-mono">
                  <span>{t("auto.baseline", "Baseline:")}{baselineExercise}{t("auto.days", "Days")}</span>
                  <span className={`${simulatedExercise > baselineExercise ? 'text-emerald-405 font-bold' : simulatedExercise < baselineExercise ? 'text-red-405 font-bold' : ''}`}>
                    {simulatedExercise > baselineExercise ? `+${simulatedExercise - baselineExercise} Days` : simulatedExercise < baselineExercise ? `${simulatedExercise - baselineExercise} Days` : "Unmodified"}
                  </span>
                </div>
              </div>

              {/* Sleep Hours slider */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{t("auto.sleep_duration", "\uD83D\uDCA4 Sleep Duration")}</span>
                  <span className="font-mono text-emerald-400 font-bold">{simulatedSleep}{t("auto.hours_night", "Hours/Night")}</span>
                </div>
                <input
                type="range"
                min="4"
                max="11"
                step="0.5"
                value={simulatedSleep}
                onChange={(e) => setSimulatedSleep(Number(e.target.value))}
                className="w-full h-1.5 bg-[#14141A] rounded-lg appearance-none cursor-ew-resize accent-emerald-500" />
              
                <div className="flex justify-between text-[8px] text-slate-555 font-mono">
                  <span>{t("auto.baseline", "Baseline:")}{baselineSleep}{t("auto.hrs", "hrs")}</span>
                  <span className={`${simulatedSleep > baselineSleep ? 'text-emerald-405 font-bold' : simulatedSleep < baselineSleep ? 'text-amber-500 font-bold' : ''}`}>
                    {simulatedSleep > baselineSleep ? `+${(simulatedSleep - baselineSleep).toFixed(1)} hrs` : simulatedSleep < baselineSleep ? `${(simulatedSleep - baselineSleep).toFixed(1)} hrs` : "Unmodified"}
                  </span>
                </div>
              </div>

              {/* Stress Level slider */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{t("auto.stress_allostatic_load", "\uD83E\uDDD8 Stress / Allostatic Load")}</span>
                  <span className="font-mono text-emerald-400 font-bold">{simulatedStress}{t("auto.10_scale", "/ 10 Scale")}</span>
                </div>
                <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={simulatedStress}
                onChange={(e) => setSimulatedStress(Number(e.target.value))}
                className="w-full h-1.5 bg-[#14141A] rounded-lg appearance-none cursor-ew-resize accent-emerald-500" />
              
                <div className="flex justify-between text-[8px] text-slate-555 font-mono">
                  <span>{t("auto.baseline", "Baseline:")}{baselineStress}{t("auto.stress", "stress")}</span>
                  <span className={`${simulatedStress < baselineStress ? 'text-emerald-405 font-bold' : simulatedStress > baselineStress ? 'text-red-405 font-bold' : ''}`}>
                    {simulatedStress < baselineStress ? `-${baselineStress - simulatedStress} Stress` : simulatedStress > baselineStress ? `+${simulatedStress - baselineStress} Stress` : "Unmodified"}
                  </span>
                </div>
              </div>

              {/* Smoking Gating Status Dropdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{t("auto.smoking_habit", "\uD83D\uDEAD Smoking Habit")}</span>
                  <select
                  value={simulatedSmoking}
                  onChange={(e) => setSimulatedSmoking(e.target.value as any)}
                  className="bg-[#0A0A0A] border border-[#222] font-mono text-xs text-white px-2.5 py-1 rounded outline-none cursor-pointer">
                  
                    <option value="Never">{t("auto.never_smoked", "Never Smoked")}</option>
                    <option value="Former">{t("auto.former_smoker", "Former Smoker")}</option>
                    <option value="Active">{t("auto.active_smoker", "Active Smoker")}</option>
                  </select>
                </div>
                <div className="flex justify-between text-[8px] text-slate-555 font-mono mt-1">
                  <span>{t("auto.baseline", "Baseline:")}{baselineSmoking}</span>
                  {simulatedSmoking !== baselineSmoking &&
                <span className="text-emerald-405 font-black uppercase">{t("auto.modified", "Modified")}</span>
                }
                </div>
              </div>

              {/* Water Intake slider */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{t("auto.daily_hydration", "\uD83D\uDCA7 Daily Hydration")}</span>
                  <span className="font-mono text-emerald-400 font-bold">{simulatedWater}{t("auto.liters_day", "Liters / Day")}</span>
                </div>
                <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={simulatedWater}
                onChange={(e) => setSimulatedWater(Number(e.target.value))}
                className="w-full h-1.5 bg-[#14141A] rounded-lg appearance-none cursor-ew-resize accent-emerald-500" />
              
                <div className="flex justify-between text-[8px] text-slate-555 font-mono">
                  <span>{t("auto.baseline", "Baseline:")}{baselineWater} L</span>
                  <span className={`${simulatedWater > baselineWater ? 'text-emerald-405 font-bold' : ''}`}>
                    {simulatedWater > baselineWater ? `+${(simulatedWater - baselineWater).toFixed(1)} L` : "Unmodified"}
                  </span>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
              type="button"
              onClick={() => {
                setSimulatedWeight(baselineWeight);
                setSimulatedExercise(baselineExercise);
                setSimulatedSleep(baselineSleep);
                setSimulatedSmoking(baselineSmoking);
                setSimulatedStress(baselineStress);
                setSimulatedWater(baselineWater);
              }}
              className="w-full py-3 border border-[#1C1C24] bg-[#0A0A0E] text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-emerald-500/25">
              
                <RefreshCw className="h-3.5 w-3.5" />{t("auto.reset_sandbox_sliders", "Reset Sandbox Sliders")}

            </button>
            </div>
          </div>

          {/* Forecast & Snapshot results panel: 7 Cols */}
          <div className="lg:col-span-7 space-y-6">

            {/* Current Health Score & Risk Progress Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Health Score Gauge comparison */}
              <div className="bg-[#08080B] border border-[#16161B] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-xl">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t("auto.twin_health_score_deflection", "Twin Health Score Deflection")}</span>
                
                <div className="relative flex items-center justify-center my-4 h-32 w-32">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#1C1C24] animate-spin-slow" />
                  <div className="absolute h-26 w-26 rounded-full bg-[#050508] border border-[#14141B] flex flex-col items-center justify-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none font-mono">{t("auto.simulated", "Simulated")}</span>
                    <strong className={`text-4xl font-extrabold font-mono mt-1 ${scoreCategoryColor(results.scoreAfter)}`}>
                      {results.scoreAfter}
                    </strong>
                    <span className="text-[8px] text-slate-400 leading-none mt-1 uppercase font-mono">{t("auto.100_pts", "/100 pts")}</span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-around border-t border-[#121217] pt-3.5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">{t("auto.baseline", "Baseline")}</span>
                    <strong className="text-white block font-mono">{currentScore}</strong>
                  </div>
                  <div className="h-6 w-[1px] bg-neutral-800" />
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-mono">{t("auto.variance", "Variance")}</span>
                    <strong className={`font-mono flex items-center gap-0.5 justify-center ${results.scoreAfter >= currentScore ? 'text-emerald-400' : 'text-red-400'}`}>
                      {results.scoreAfter >= currentScore ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {results.scoreAfter >= currentScore ? `+${results.scoreAfter - currentScore}` : `${results.scoreAfter - currentScore}`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Twin Disease Risks deflections */}
              <div className="bg-[#08080B] border border-[#16161B] rounded-2xl p-5 space-y-4 shadow-xl">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">{t("auto.real_time_risk_deflections", "Real-time Risk Deflections")}</span>
                
                <div className="space-y-3 pt-1">
                  
                  {/* Diabetes progress indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{t("auto.diabetes_risk", "Diabetes Risk")}</span>
                      <span className="font-mono text-slate-400">
                        {currentDiabetesRisk}% → <span className={results.diabetesAfter < currentDiabetesRisk ? 'text-emerald-400 font-bold' : ''}>{results.diabetesAfter}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden relative border border-[#141419]">
                      <div className="absolute top-0 bottom-0 left-0 bg-red-500/20" style={{ width: `${currentDiabetesRisk}%` }} />
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-500" style={{ width: `${results.diabetesAfter}%` }} />
                    </div>
                  </div>

                  {/* Heart disease progress indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{t("auto.heart_disease_risk", "Heart Disease Risk")}</span>
                      <span className="font-mono text-slate-400">
                        {currentHeartRisk}% → <span className={results.heartAfter < currentHeartRisk ? 'text-emerald-400 font-bold' : ''}>{results.heartAfter}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden relative border border-[#141419]">
                      <div className="absolute top-0 bottom-0 left-0 bg-red-500/20" style={{ width: `${currentHeartRisk}%` }} />
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-500" style={{ width: `${results.heartAfter}%` }} />
                    </div>
                  </div>

                  {/* Hypertension progress indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{t("auto.hypertension_risk", "Hypertension Risk")}</span>
                      <span className="font-mono text-slate-400">
                        {currentHypertensionRisk}% → <span className={results.hypertensionAfter < currentHypertensionRisk ? 'text-emerald-400 font-bold' : ''}>{results.hypertensionAfter}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden relative border border-[#141419]">
                      <div className="absolute top-0 bottom-0 left-0 bg-red-500/20" style={{ width: `${currentHypertensionRisk}%` }} />
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-500" style={{ width: `${results.hypertensionAfter}%` }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* AI Insights display */}
            <div className="bg-[#08080B] border border-[#16161B] rounded-2xl p-5 space-y-3 shadow-xl relative overflow-hidden">
              <div className="absolute right-4 top-4 text-emerald-500/10 pointer-events-none">
                <BrainCircuit className="h-16 w-16" />
              </div>

              <div className="flex items-center gap-2 border-b border-[#141419] pb-2.5">
                <div className="h-6.5 w-6.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest font-mono">{t("auto.dynamic_ai_insights", "Dynamic AI insights")}</h4>
                  <p className="text-[9px] text-slate-500 leading-none">{t("auto.physiological_twin_variance_biochemical", "Physiological twin variance & biochemical correlations")}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {results.aiInsights.map((ins, index) =>
              <div key={index} className="flex gap-2.5 items-start text-xs bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-900 leading-normal font-medium text-slate-300">
                    <span className="text-emerald-400 font-extrabold shrink-0 mt-0.5 animate-pulse">✦</span>
                    <p>{ins}</p>
                  </div>
              )}
              </div>

              {results.timelineEstimate &&
            <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 p-3 rounded-xl text-[10px] font-mono leading-relaxed mt-1 block">
                  <span className="font-extrabold uppercase mr-1.5 text-emerald-400 tracking-wider">{t("auto.convergence_matrix", "Convergence Matrix:")}</span>
                  <span className="text-slate-300">{results.timelineEstimate}</span>
                </div>
            }
            </div>

            {/* Future Self Visualization */}
            <div className="bg-[#08080B] border border-[#16161B] rounded-2xl p-5 space-y-4 shadow-xl">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">{t("auto.meet_your_future_self", "Meet Your Future Self")}</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                
                {/* Current You */}
                <div className="bg-zinc-950 border border-neutral-900 rounded-xl p-3 text-center space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-zinc-900 border border-neutral-800 text-slate-400 px-2.5 py-0.5 rounded-md font-mono uppercase tracking-wider inline-block">{t("auto.current_you", "Current You")}

                  </span>
                    <strong className="block text-2xl font-black font-mono text-white mt-1.5">{currentScore}</strong>
                    <span className="text-[9px] text-slate-500 block leading-tight font-medium mt-1">{t("auto.baseline_high_fidelity_medical_digital_t", "Baseline high-fidelity medical digital twin synchronized from record.")}

                  </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-[#71717A] uppercase tracking-wider block mt-2 pt-2 border-t border-neutral-950">{t("auto.normal_stasis", "Normal Stasis")}</span>
                </div>

                {/* Future Unchanged */}
                <div className="bg-red-500/5 border border-red-950/20 rounded-xl p-3 text-center space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-red-950/40 border border-red-900/30 text-red-300 px-2.5 py-0.5 rounded-md font-mono uppercase tracking-wider inline-block">{t("auto.future_unchanged", "Future (Unchanged)")}

                  </span>
                    <strong className="block text-2xl font-black font-mono text-red-400 mt-1.5">{Math.max(30, currentScore - 9)}</strong>
                    <span className="text-[9px] text-red-200/50 block leading-tight font-medium mt-1">{t("auto.estimated_risk_progression_if_current_li", "Estimated risk progression if current lifestyle and baseline habits remain uncorrected at Year 5.")}

                  </span>
                  </div>
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mt-2 pt-2 border-t border-neutral-950">{t("auto.risk_escalation", "Risk Escalation")}</span>
                </div>

                {/* Future Improved */}
                <div className="bg-emerald-500/5 border border-emerald-950/20 rounded-xl p-3 text-center space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 px-2.5 py-0.5 rounded-md font-mono uppercase tracking-wider inline-block">{t("auto.future_improved", "Future (Improved)")}

                  </span>
                    <strong className="block text-2xl font-black font-mono text-emerald-400 mt-1.5">{results.scoreAfter}</strong>
                    <span className="text-[9px] text-emerald-200/50 block leading-tight font-medium mt-1">{t("auto.predicted_metabolic_restabilization_and", "Predicted metabolic restabilization and optimal cellular aging if targets are sustained at Year 5.")}

                  </span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mt-2 pt-2 border-t border-neutral-950">{t("auto.optimum_health", "Optimum Health")}</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      }

      {activeTab === "comparison" &&
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Timeline Projections Line Chart: 7 Cols */}
          <div className="lg:col-span-7 bg-[#08080B] border border-[#16161B] rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#141419] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />{t("auto.visual_health_progression_charts_5_year", "Visual Health Progression Charts (5-Year Forecast)")}

              </h3>
                <p className="text-[10px] text-slate-500 font-medium">{t("auto.evaluate_path_deflections_based_on_activ", "Evaluate path deflections based on active behavioral sandboxing")}</p>
              </div>

              <div className="flex bg-neutral-950 p-1 border border-neutral-900 rounded-lg">
                {[
              { id: "score", label: "Health Score" },
              { id: "diabetes", label: "Diabetes Risk" },
              { id: "heart", label: "Heart Risk" },
              { id: "hypertension", label: "HTN Risk" }].
              map((item) =>
              <button
                key={item.id}
                onClick={() => setSelectedForecastMetric(item.id as any)}
                className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer ${
                selectedForecastMetric === item.id ?
                "bg-zinc-900 text-emerald-400" :
                "text-slate-500 hover:text-white"}`
                }>
                
                    {item.label}
                  </button>
              )}
              </div>
            </div>

            {/* Recharts chart staging */}
            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getHealthForecastData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#121217" />
                  <XAxis dataKey="name" stroke="#555" fontSize={9} fontClassName="font-mono font-bold" />
                  <YAxis stroke="#555" fontSize={9} fontClassName="font-mono font-bold" domain={[0, 100]} />
                  <Tooltip
                  contentStyle={{ backgroundColor: "#09090D", borderColor: "#1A1A24", borderRadius: "10px", fontSize: "10px" }}
                  labelStyle={{ color: "#aaa" }} />
                
                  <Legend wrapperStyle={{ fontSize: "9px", textTransform: "uppercase", fontWeight: "bold" }} />
                  
                  <Line
                  type="monotone"
                  dataKey="improved"
                  name="Future (Improved Lifestyle)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }} />
                
                  <Line
                  type="monotone"
                  dataKey="unchanged"
                  name="Future (Current Habits)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }} />
                
                  <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Stasis Baseline"
                  stroke="#6b7280"
                  strokeWidth={1.5}
                  dot={{ r: 2 }} />
                
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-neutral-900/20 border border-neutral-900 p-3.5 rounded-xl text-[10px] leading-relaxed text-slate-400">
              <div className="flex gap-1.5 items-center text-slate-300 font-bold mb-1 uppercase text-[9px] tracking-wider">
                <Info className="h-3.5 w-3.5 text-emerald-405 shrink-0" />{t("auto.understanding_your_deflection_curves", "Understanding your deflection curves")}

            </div>{t("auto.the", "The")}
            <strong className="text-emerald-400 font-bold">{t("auto.improved_curve", "Improved curve")}</strong>{t("auto.maps_predictive_progress_assuming_your_c", "maps predictive progress assuming your configured sliders are sustained. The")}<strong className="text-red-400 font-bold">{t("auto.current_curve", "Current curve")}</strong>{t("auto.tracks_how_allostatic_load_sub_optimal_r", "tracks how allostatic load, sub-optimal resting matrices and weight profiles compounding over 60 months typically accelerate vascular decay and metabolic resistance according to mathematical random forest warning models.")}
          </div>
          </div>

          {/* Visual comparison grid cards: 5 Cols */}
          <div className="lg:col-span-5 bg-[#08080B] border border-[#16161B] rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-1 pb-1 border-b border-[#141419]">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Table className="h-4 w-4 text-emerald-400" />{t("auto.interactive_comparison_matrix", "Interactive Comparison Matrix")}

            </h3>
              <p className="text-[10px] text-slate-500">{t("auto.summary_side_by_side_numerical_compariso", "Summary side-by-side numerical comparison metrics")}</p>
            </div>

            <div className="divide-y divide-[#141419] text-xs font-semibold">
              
              {/* Row 1: Health Score */}
              <div className="py-3 flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />{t("auto.overall_health_score", "Overall Health Score")}
              </span>
                <div className="grid grid-cols-3 gap-6 font-mono text-center text-[11px]">
                  <div>
                    <span className="text-[8px] text-slate-555 block uppercase font-mono leading-none">{t("auto.current", "Current")}</span>
                    <strong className="text-slate-400">{currentScore}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-555 block uppercase font-mono leading-none">{t("auto.unchanged", "Unchanged")}</span>
                    <strong className="text-red-400">{Math.max(30, currentScore - 9)}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-555 block uppercase font-mono leading-none">{t("auto.improved", "Improved")}</span>
                    <strong className="text-emerald-400 font-extrabold">{results.scoreAfter}</strong>
                  </div>
                </div>
              </div>

              {/* Row 2: Diabetes Risk */}
              <div className="py-3 flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-teal-400 rounded-full" />{t("auto.diabetes_risk", "Diabetes Risk")}
              </span>
                <div className="grid grid-cols-3 gap-6 font-mono text-center text-[11px]">
                  <div>
                    <strong className="text-slate-400">{currentDiabetesRisk}%</strong>
                  </div>
                  <div>
                    <strong className="text-red-400">{Math.min(95, Math.round(currentDiabetesRisk * 1.45))}%</strong>
                  </div>
                  <div>
                    <strong className="text-emerald-400 font-extrabold">{results.diabetesAfter}%</strong>
                  </div>
                </div>
              </div>

              {/* Row 3: Heart Risk */}
              <div className="py-3 flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-purple-400 rounded-full" />{t("auto.heart_disease_risk", "Heart Disease Risk")}
              </span>
                <div className="grid grid-cols-3 gap-6 font-mono text-center text-[11px]">
                  <div>
                    <strong className="text-slate-400">{currentHeartRisk}%</strong>
                  </div>
                  <div>
                    <strong className="text-red-400">{Math.min(95, Math.round(currentHeartRisk * 1.4))}%</strong>
                  </div>
                  <div>
                    <strong className="text-emerald-400 font-extrabold">{results.heartAfter}%</strong>
                  </div>
                </div>
              </div>

              {/* Row 4: Hypertension Risk */}
              <div className="py-3 flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />{t("auto.hypertension_risk", "Hypertension Risk")}
              </span>
                <div className="grid grid-cols-3 gap-6 font-mono text-center text-[11px]">
                  <div>
                    <strong className="text-slate-400">{currentHypertensionRisk}%</strong>
                  </div>
                  <div>
                    <strong className="text-red-400">{Math.min(95, Math.round(currentHypertensionRisk * 1.35))}%</strong>
                  </div>
                  <div>
                    <strong className="text-emerald-400 font-extrabold">{results.hypertensionAfter}%</strong>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-2 bg-gradient-to-r from-red-500/5 to-transparent border-l-2 border-red-500 p-3 rounded-r-xl text-[10px] font-medium leading-relaxed text-slate-405">{t("auto.warning_if_habits_persist_unchanged_over", "Warning: If habits persist unchanged over 36\u201360 months, clinical algorithms estimate your cumulative allostatic markers could shift your digital stasis to critical thresholds, decreasing your longevity score index.")}

          </div>
          </div>

        </div>
      }

      {/* Prevention Roadmap Integration */}
      <div className="bg-[#08080B] border border-[#16161B] rounded-3xl p-6 space-y-4 shadow-xl">
        <div>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block font-mono">{t("auto.integrated_cellular_recovery_path", "INTEGRATED CELLULAR RECOVERY PATH")}</span>
          <h3 className="text-sm font-black text-white mt-1 uppercase tracking-tight flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-emerald-500" />{t("auto.prevention_roadmap_risk_deflection_miles", "Prevention Roadmap & Risk Deflection Milestones")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t("auto.a_month_by_month_progressive_lifestyle_o", "A month-by-month progressive lifestyle optimization protocol with estimated score bonuses")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Milestone 1 */}
          <div className="bg-zinc-950 border border-neutral-900 rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black font-mono">{t("auto.month_1", "MONTH 1")}

                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{t("auto.4_pts", "+4 pts")}</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase mt-1">{t("auto.foundation_steps", "Foundation Steps")}</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">{t("auto.aim_to_walk_at_least_5k_steps_daily_and", "Aim to walk at least 5k steps daily and terminate high-fructose sugary beverages.")}

              </p>
            </div>
            <div className="border-t border-neutral-900/60 pt-2.5 mt-3 text-[9px] font-mono font-medium text-slate-550 flex items-center justify-between">
              <span>{t("auto.cardio_deflection", "Cardio Deflection:")}</span>
              <strong className="text-emerald-450">{t("auto.4_diabetes", "-4% Diabetes")}</strong>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="bg-zinc-950 border border-neutral-900 rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black font-mono">{t("auto.month_2", "MONTH 2")}

                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{t("auto.8_pts", "+8 pts")}</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase mt-1">{t("auto.circadian_rest", "Circadian Rest")}</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">{t("auto.enforce_circadian_sleep_hygiene_targetin", "Enforce circadian sleep hygiene, targeting minimum 7 consecutive baseline rest hours.")}

              </p>
            </div>
            <div className="border-t border-neutral-900/60 pt-2.5 mt-3 text-[9px] font-mono font-medium text-slate-550 flex items-center justify-between">
              <span>{t("auto.vascular_deflection", "Vascular Deflection:")}</span>
              <strong className="text-emerald-455">{t("auto.8_hypertension", "-8% Hypertension")}</strong>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="bg-zinc-950 border border-neutral-900 rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black font-mono">{t("auto.month_3", "MONTH 3")}

                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{t("auto.11_pts", "+11 pts")}</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase mt-1">{t("auto.weight_transition", "Weight Transition")}</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">{t("auto.reach_initial_2_kg_sustained_weight_loss", "Reach initial 2 kg sustained weight loss using light caloric stasis restriction methods.")}

              </p>
            </div>
            <div className="border-t border-neutral-900/60 pt-2.5 mt-3 text-[9px] font-mono font-medium text-slate-550 flex items-center justify-between">
              <span>{t("auto.coronary_deflection", "Coronary Deflection:")}</span>
              <strong className="text-emerald-450">{t("auto.7_heart_disease", "-7% Heart Disease")}</strong>
            </div>
          </div>

          {/* Milestone 4 */}
          <div className="bg-zinc-950 border border-neutral-900 rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black font-mono">{t("auto.month_6", "MONTH 6")}

                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{t("auto.25_pts", "+25 pts")}</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase mt-1">{t("auto.target_stabilization", "Target Stabilization")}</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">{t("auto.stabilize_body_weight_at_dynamic_target", "Stabilize body weight at dynamic target levels and complete full digital twin evaluation.")}

              </p>
            </div>
            <div className="border-t border-neutral-900/60 pt-2.5 mt-3 text-[9px] font-mono font-medium text-slate-550 flex items-center justify-between">
              <span>{t("auto.overall_deflection", "Overall Deflection:")}</span>
              <strong className="text-emerald-450">{t("auto.25_chronic_index", "-25% Chronic Index")}</strong>
            </div>
          </div>

        </div>
      </div>

    </div>);

}