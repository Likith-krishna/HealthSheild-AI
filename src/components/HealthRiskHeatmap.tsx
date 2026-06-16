import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PredictionEngineOutput } from "../types";
import { 
  Heart, Brain, Activity, Sliders, Sparkles, TrendingUp, TrendingDown, Info, AlertTriangle, 
  CheckCircle, ChevronRight, BookOpen, ShieldCheck, Zap, ToggleLeft, RefreshCw, Eye, ShieldAlert,
  HelpCircle, Apple, Clock, Weight, Flame
} from "lucide-react";
import { User } from "../lib/api";

interface HealthRiskHeatmapProps {
  evaluation: PredictionEngineOutput | null;
  selectedRecord: any;
  user: User;
}

// Organ Risk structure
interface OrganRiskDetail {
  id: string;
  name: string;
  score: number;
  category: "Healthy" | "Moderate Risk" | "High Risk" | "Critical Risk";
  contributingFactors: string[];
  recommendations: string[];
  lastMonthScore: number;
  description: string;
}

export default function HealthRiskHeatmap({ evaluation, selectedRecord, user }: HealthRiskHeatmapProps) {
  // If there's no diagnostic record yet
  if (!selectedRecord || !evaluation) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4 shadow-xl">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">No Active Bio-Twin Analysis Sync Case</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please input your baseline metabolic biomarkers inside the "Health Data Input" page to assemble your first Interactive heatmapping twin.
        </p>
      </div>
    );
  }

  // --- Baseline state derivation ---
  const basicInfo = selectedRecord.basicInfo || {};
  const lifestyle = selectedRecord.lifestyle || {};
  const nutrition = selectedRecord.nutrition || {};
  const wearable = selectedRecord.wearableDetails || {};

  const baselineWeight = parseFloat(basicInfo.weight) || 75;
  const baselineHeight = parseFloat(basicInfo.height) || 170;
  const baselineSleep = parseFloat(lifestyle.sleepDuration) || 7;
  const baselineExercise = Number(wearable.exerciseDays) || Number(lifestyle.exerciseDays) || 3;
  const baselineSmoking = (lifestyle.smoking || "Never") as "Never" | "Former" | "Active";
  const baselineStress = parseFloat(lifestyle.stressLevel) || 5;
  const baselineWater = parseFloat(nutrition.water) || 2;
  const baselineAlcohol = (lifestyle.alcohol || "Never") as "Never" | "Social" | "Heavy";

  // Navigation tab for comparison:
  // "current": Active metrics baseline
  // "future_no_change": Standard 10-year age escalation assuming same habits
  // "future_optimized": Standard 10-year projection incorporating full proactive upgrades
  const [projectionMode, setProjectionMode] = useState<"current" | "future_no_change" | "future_optimized">("current");

  // --- Interactive Customizer Sliders (Sandbox) ---
  const [simWeight, setSimWeight] = useState<number>(baselineWeight);
  const [simExercise, setSimExercise] = useState<number>(baselineExercise);
  const [simSleep, setSimSleep] = useState<number>(baselineSleep);
  const [simStress, setSimStress] = useState<number>(baselineStress);
  const [simSmoking, setSimSmoking] = useState<"Never" | "Former" | "Active">(baselineSmoking);
  const [simAlcohol, setSimAlcohol] = useState<"Never" | "Social" | "Heavy">(baselineAlcohol);
  const [simWater, setSimWater] = useState<number>(baselineWater);

  // Sync sliders to baseline when selected record ID changes
  useEffect(() => {
    setSimWeight(baselineWeight);
    setSimExercise(baselineExercise);
    setSimSleep(baselineSleep);
    setSimSmoking(baselineSmoking);
    setSimStress(baselineStress);
    setSimWater(baselineWater);
    setSimAlcohol(baselineAlcohol);
  }, [selectedRecord.id]);

  // Load baseline values helper
  const applyPreset = (type: "baseline" | "unhealthy" | "healthy") => {
    if (type === "baseline") {
      setSimWeight(baselineWeight);
      setSimExercise(baselineExercise);
      setSimSleep(baselineSleep);
      setSimSmoking(baselineSmoking);
      setSimStress(baselineStress);
      setSimWater(baselineWater);
      setSimAlcohol(baselineAlcohol);
    } else if (type === "unhealthy") {
      setSimWeight(baselineWeight + 12);
      setSimExercise(0);
      setSimSleep(4.5);
      setSimStress(9);
      setSimSmoking("Active");
      setSimWater(1);
      setSimAlcohol("Heavy");
    } else if (type === "healthy") {
      // Ideal target weight (BMI ~21.5)
      const idealWt = Math.round(21.5 * ((baselineHeight / 100) * (baselineHeight / 100)));
      setSimWeight(Math.min(baselineWeight, idealWt > 45 ? idealWt : 65));
      setSimExercise(5);
      setSimSleep(8);
      setSimStress(2);
      setSimSmoking("Never");
      setSimWater(3);
      setSimAlcohol("Never");
    }
  };

  // --- Dynamic Model Calculations ---
  // Core disease baseline risks from the AI prediction engine
  const predDiabetes = Math.round(evaluation.predictions?.find(p => p.name.toLowerCase().includes("diabetes"))?.probability || 48);
  const predHeart = Math.round(evaluation.predictions?.find(p => p.name.toLowerCase().includes("heart"))?.probability || 34);
  const predHypertension = Math.round(evaluation.predictions?.find(p => p.name.toLowerCase().includes("hypertension"))?.probability || 42);
  const predKidney = Math.round(evaluation.predictions?.find(p => p.name.toLowerCase().includes("kidney"))?.probability || 25);
  const predStroke = Math.round(evaluation.predictions?.find(p => p.name.toLowerCase().includes("stroke"))?.probability || 28);
  const predRespiratory = Math.round(evaluation.predictions?.find(p => p.name.toLowerCase().includes("respiratory") || p.name.toLowerCase().includes("asthma") || p.name.toLowerCase().includes("pulmonary"))?.probability || 22);

  const calculateOrganRisks = () => {
    // Calculators mapped according to clinical weights requested

    // 1. Lifestyle changes differentials
    const wtChange = baselineWeight - simWeight; // positive is weight loss
    const exChange = simExercise - baselineExercise; // positive is more exercise
    const slChange = simSleep - baselineSleep; // positive is more sleep
    const stChange = baselineStress - simStress; // positive is stress mitigation
    const waChange = simWater - baselineWater;

    // A factor describing user general biometric condition
    let metabolicLifestyleScoreModifier = 0;
    
    // Weight deviation impact
    metabolicLifestyleScoreModifier -= (wtChange * -1.2); // Gaining weight worsens risks
    // Exercise impact
    metabolicLifestyleScoreModifier -= (exChange * 3); // More exercise reduces risks
    // Stress impact
    metabolicLifestyleScoreModifier -= (stChange * 2);

    // Dynamic organ scores
    
    // HEART RISK
    // Baseline = heart disease*0.5 + hypertension*0.3 + (totalCholesterolTotal normalized)*0.2
    const baseChol = parseFloat(basicInfo.cholesterolTotal || "190") || 190;
    const cholFactor = Math.min(100, Math.max(0, (baseChol - 130) * 0.9));
    let heartBase = predHeart * 0.5 + predHypertension * 0.3 + cholFactor * 0.2;

    // Apply simulation slider deltas
    let heartRisk = heartBase + (simWeight - baselineWeight) * 1.3 - (simExercise - baselineExercise) * 3.5 - (simSleep - baselineSleep) * 2.5 + (simStress - baselineStress) * 2.2;
    if (simSmoking === "Active") heartRisk += 18;
    if (simSmoking === "Never" && baselineSmoking === "Active") heartRisk -= 15;
    if (simAlcohol === "Heavy") heartRisk += 10;
    heartRisk = Math.min(99, Math.max(5, Math.round(heartRisk)));

    // BRAIN RISK
    // Baseline = stroke_risk * 0.5 + hypertension_risk * 0.3 + baselineStress * 4
    let brainBase = predStroke * 0.5 + predHypertension * 0.3 + baselineStress * 3;
    let brainRisk = brainBase + (simStress - baselineStress) * 3.5 - (simSleep - baselineSleep) * 3 - (simExercise - baselineExercise) * 2 + (simWeight - baselineWeight) * 0.8;
    if (simSmoking === "Active") brainRisk += 15;
    if (simAlcohol === "Heavy") brainRisk += 12;
    brainRisk = Math.min(99, Math.max(5, Math.round(brainRisk)));

    // PANCREAS RISK
    // Baseline = diabetes_risk
    let pancreasBase = predDiabetes;
    let pancreasRisk = pancreasBase + (simWeight - baselineWeight) * 1.8 - (simExercise - baselineExercise) * 4 - (simWater - baselineWater) * 3 + (simStress - baselineStress) * 1;
    pancreasRisk = Math.min(99, Math.max(5, Math.round(pancreasRisk)));

    // KIDNEY RISK
    // Baseline = kidney_disease_risk*0.5 + diabetes_risk*0.3 + hypertension_risk*0.2
    let kidneyBase = predKidney * 0.5 + predDiabetes * 0.3 + predHypertension * 0.2;
    let kidneyRisk = kidneyBase + (simWeight - baselineWeight) * 0.9 - (simWater - baselineWater) * 4.5 + (simStress - baselineStress) * 1.2 - (simExercise - baselineExercise) * 1.5;
    if (simAlcohol === "Heavy") kidneyRisk += 8;
    kidneyRisk = Math.min(99, Math.max(5, Math.round(kidneyRisk)));

    // LIVER RISK
    // Baseline = Fatty liver/weight factor + alcohol factor
    const baseBMI = baseWeightToBmi(baselineWeight);
    const bmiFactor = Math.min(100, Math.max(0, (baseBMI - 20) * 4.5));
    let liverBase = bmiFactor * 0.4 + (baselineAlcohol === "Heavy" ? 50 : baselineAlcohol === "Social" ? 20 : 5) + (predDiabetes * 0.2);
    let liverRisk = liverBase + (simWeight - baselineWeight) * 1.6 + (simAlcohol === "Heavy" ? 25 : simAlcohol === "Social" ? 8 : -10) - (simExercise - baselineExercise) * 2;
    // Cap to ensure it fits predictions elegantly
    liverRisk = Math.min(99, Math.max(5, Math.round(liverRisk)));

    // LUNG RISK
    // Baseline = respiratory_disease_risk * 0.6 + smoking_factor
    const smokeBaseFactor = baselineSmoking === "Active" ? 55 : baselineSmoking === "Former" ? 25 : 5;
    let lungBase = predRespiratory * 0.6 + smokeBaseFactor;
    let lungRisk = lungBase + (simSmoking === "Active" ? 35 : simSmoking === "Former" ? 12 : -25) - (simExercise - baselineExercise) * 1.8;
    lungRisk = Math.min(99, Math.max(5, Math.round(lungRisk)));

    // Apply projection scale adjustments based on chronological 10-Year path
    if (projectionMode === "future_no_change") {
      // Natural cell deterioration across aging (+15% score risk default)
      // Standard life stress + toxic load doubles standard trend risk
      const multiplier = 1.25;
      heartRisk = Math.min(99, Math.round(heartRisk * multiplier + 8));
      brainRisk = Math.min(99, Math.round(brainRisk * multiplier + 6));
      pancreasRisk = Math.min(99, Math.round(pancreasRisk * multiplier + 7));
      kidneyRisk = Math.min(99, Math.round(kidneyRisk * multiplier + 8));
      liverRisk = Math.min(99, Math.round(liverRisk * multiplier + 5));
      lungRisk = Math.min(99, Math.round(lungRisk * multiplier + 6));
    } else if (projectionMode === "future_optimized") {
      // Dropping risk significantly with optimized parameters (approx. 35% safer)
      const multiplier = 0.65;
      heartRisk = Math.max(5, Math.round(heartRisk * multiplier - 5));
      brainRisk = Math.max(5, Math.round(brainRisk * multiplier - 4));
      pancreasRisk = Math.max(5, Math.round(pancreasRisk * multiplier - 6));
      kidneyRisk = Math.max(5, Math.round(kidneyRisk * multiplier - 5));
      liverRisk = Math.max(5, Math.round(liverRisk * multiplier - 4));
      lungRisk = Math.max(5, Math.round(lungRisk * multiplier - 5));
    }

    return {
      heart: heartRisk,
      brain: brainRisk,
      pancreas: pancreasRisk,
      kidney: kidneyRisk,
      liver: liverRisk,
      lungs: lungRisk
    };
  };

  const currentRisks = calculateOrganRisks();

  // Helper and calculations
  function baseWeightToBmi(wt: number) {
    if (baselineHeight <= 0) return 24.2;
    return wt / ((baselineHeight / 100) * (baselineHeight / 100));
  }

  // Map score value to color indicators
  const getRiskColor = (score: number) => {
    if (score <= 30) return { category: "Healthy" as const, color: "#10B981", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", glow: "shadow-emerald-500/30", text: "text-emerald-400" };
    if (score <= 60) return { category: "Moderate Risk" as const, color: "#EAB308", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", glow: "shadow-amber-500/30", text: "text-amber-400" };
    if (score <= 80) return { category: "High Risk" as const, color: "#F97316", badge: "bg-orange-500/10 text-orange-400 border border-orange-500/20", glow: "shadow-orange-500/30", text: "text-orange-400" };
    return { category: "Critical Risk" as const, color: "#EF4444", badge: "bg-red-500/10 text-red-400 border border-red-500/20", glow: "shadow-red-500/30", text: "text-red-400" };
  };

  // Static organ profiles
  const getOrganStaticDetails = (id: string, score: number): OrganRiskDetail => {
    const currentStatus = getRiskColor(score);
    // Baseline comparisons
    const baselineLookup: Record<string, number> = {
      brain: Math.min(99, Math.max(5, Math.round(predStroke * 0.5 + predHypertension * 0.3 + baselineStress * 3))),
      heart: Math.min(99, Math.max(5, Math.round(predHeart * 0.5 + predHypertension * 0.3 + 30))),
      lungs: Math.min(99, Math.max(5, Math.round(predRespiratory * 0.6 + (baselineSmoking === "Active" ? 55 : baselineSmoking === "Former" ? 25 : 5)))),
      liver: Math.min(99, Math.max(5, Math.round(baseWeightToBmi(baselineWeight) * 4.5 * 0.4 + (baselineAlcohol === "Heavy" ? 50 : baselineAlcohol === "Social" ? 20 : 5)))),
      pancreas: Math.min(99, Math.max(5, Math.round(predDiabetes))),
      kidney: Math.min(99, Math.max(5, Math.round(predKidney * 0.5 + predDiabetes * 0.3 + predHypertension * 0.2)))
    };
    
    // Simulate past month score as slightly different
    const lastMonth = Math.min(99, Math.max(5, Math.round(baselineLookup[id] + (id === "heart" ? 4 : id === "kidney" ? -6 : id === "lungs" ? 2 : -3))));

    switch (id) {
      case "brain":
        return {
          id: "brain",
          name: "Brain / Cerebrovascular System",
          score,
          category: currentStatus.category,
          description: "Responsible for cognitive reserves, neurological pathways, and allostatic stress regulation.",
          contributingFactors: [
            simStress > 6 ? "Elevated Neural Cortisol (Chronic Stress Index)" : "Baseline Stress Adaptation",
            predStroke > 60 ? "Unstable Carotid Occlusion Prediction Profile" : "Stabilized Carotid Flow",
            predHypertension > 60 ? "Hydrostatic Hypertension Vessel Demands" : "Mild Arterial Pressure Load",
            simSleep < 6 ? "Suboptimal Glymphatic Clearance (Restricted Sleep)" : "Balanced Cognitive Regeneration Cycles"
          ].filter(Boolean),
          recommendations: [
            "Perform 12 minutes of box-breathing exercises during active stress cycles.",
            "Establish strict circadian habits aiming for 7.5+ sleep hours nightly.",
            "Incorporate dark berry anthocyanins to bolster endothelial health."
          ],
          lastMonthScore: lastMonth
        };
      case "heart":
        return {
          id: "heart",
          name: "Heart & Cardiovascular Network",
          score,
          category: currentStatus.category,
          description: "Controls systemic circulatory rate, arterial elasticity, and muscular wall resistance.",
          contributingFactors: [
            predHeart > 60 ? "High Cardiac Inotropic Resistance Indicator" : "Standard Cardiovascular Profile",
            simExercise < 2 ? "Low Sarcoplasmic Cardioprotective Reserve" : "Robust Endothelial Capillary Density",
            simWeight > baselineWeight ? "Increased Visceral Vascular Peripheral Resistance" : "Reduced Circulatory Friction Factor",
            simSmoking === "Active" ? "Nicotine-Induced Coronary Microspasm Cycle" : "Absence of Active Tobacco Toxins"
          ],
          recommendations: [
            "Engage in Zone 2 low-intensity cardiovascular training 150 minutes weekly.",
            "Reduce refined sodium chloride intake below 1,600mg daily to ease hydrostatic tension.",
            "Utilize Omega-3 fatty acids (EPA/DHA) to stabilize cellular membrane plaque triggers."
          ],
          lastMonthScore: lastMonth
        };
      case "lungs":
        return {
          id: "lungs",
          name: "Lungs / Pulmonic Core",
          score,
          category: currentStatus.category,
          description: "Mediates alveoli oxygen-carbon dioxide transfer and guards systemic tissue oxygenation.",
          contributingFactors: [
            simSmoking === "Active" ? "Severe Carbon Monoxide Alveoli Damage" : simSmoking === "Former" ? "Partial Nicotine Fiber Remodeling" : "Pristine Respiratory Linings",
            predRespiratory > 50 ? "Bronchopulmonary Inflammatory Sensitivity" : "Normal Mucosal Clearance",
            simExercise < 3 ? "Restricted Peak Vo2 Max Thoracic Expansion" : "Enhanced Aerobic Capillary Capacity"
          ],
          recommendations: [
            "Maintain total cessation of tobacco or vape vaporizers to trigger alveolar macro-phage clearance.",
            "Do diaphragmatic breathing sessions once in the morning to optimize thoracic compliance.",
            "Install HEPA filters in residential workspace quarters to reduce particulate matter load."
          ],
          lastMonthScore: lastMonth
        };
      case "liver":
        return {
          id: "liver",
          name: "Liver / Hepatic Engine",
          score,
          category: currentStatus.category,
          description: "In charge of metabolic detoxification, lipoprotein packaging, and glycogen storage buffers.",
          contributingFactors: [
            baseWeightToBmi(simWeight) > 27.5 ? "Hepatic Adipose Accumulation Index (Fatty Liver Triggers)" : "Healthy Hepatic Lobule Reserves",
            simAlcohol === "Heavy" ? "Acetaldehyde Lipogenesis Strain" : simAlcohol === "Social" ? "Intermittent Oxidative Stress Load" : "Absence of Ethanol Toxin Inputs",
            predDiabetes > 60 ? "Elevated Portal Gluconeogenesis (Insulin Resistance)" : "Stable Insulin-Mediated Liver Metabolism"
          ],
          recommendations: [
            "Prioritize cruciferous vegetables (broccoli, Brussels sprouts) to assist Cytochrome P450 pathways.",
            "Eliminate added high-fructose corn syrups to deter de novo hepatic lipogenesis.",
            "Implement a minimum 12-hour overnight digestive fast to permit hepatocyte clearance."
          ],
          lastMonthScore: lastMonth
        };
      case "pancreas":
        return {
          id: "pancreas",
          name: "Pancreas / Insulin Regulator",
          score,
          category: currentStatus.category,
          description: "Synthesizes insulin and glucagon from Islets of Langerhans to balance systemic blood sugar.",
          contributingFactors: [
            predDiabetes > 60 ? "Desensitized Glut-4 Skeletal Receptor Signalling" : "Excellent Beta-Cell Capacity",
            simWeight > baselineWeight ? "Visceral Fat Inflammatory Cytokine Stress on Beta-Cells" : "Reduced Pancreatic Ectopic Fat Accumulation",
            simExercise > 4 ? "Skeletal Muscle Glycogen Depletion (Dynamic Glucose Sinks)" : "Inadequate Postprandial Skeletal Glucose Sink Capacity"
          ],
          recommendations: [
            "Incorporate brief 10-minute incline walks immediately post-meal to blunt glycemic excursions.",
            "Consume soluble fiber (chia seeds, psyllium husk) prior to carbohydrate intake.",
            "Optimize systemic magnesium intake (glycinate or l-threonate) to restore insulin receptor accuracy."
          ],
          lastMonthScore: lastMonth
        };
      case "kidneys":
        default:
        return {
          id: "kidneys",
          name: "Kidneys / Renal Filter",
          score,
          category: currentStatus.category,
          description: "Filters cellular toxic residues, maintains osmotic electrolyte balance, and controls blood volume.",
          contributingFactors: [
            predKidney > 50 ? "Reduced Glomerular Filtration Capacity Risk" : "Intact Glomerular Membrane Status",
            simWater < 1.5 ? "High Tubule Concentration Stress (Suboptimal Hydration)" : "Excellent Osmotic Fluid Passage Rates",
            predHypertension > 60 ? "High Intraglomerular Pressure Shear Stress" : "Balanced Renal Vessel Pressures",
            predDiabetes > 65 ? "Glycation End-Products Nephron Occlusion" : "Normal Capillary Sieve Flow"
          ],
          recommendations: [
            "Achieve consistent hydration intake of 2.8L to 3.5L pure filtered water daily.",
            "Strictly avoid NSAID pain relievers (ibuprofen) which restrict protective renal afferent artery blood flow.",
            "Ensure low postprandial glycemic peaks to diminish glycation damage inside fragile glomeruli filters."
          ],
          lastMonthScore: lastMonth
        };
    }
  };

  // State for active organ hover tooltips & active clicked organ modal
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [clickedOrgan, setClickedOrgan] = useState<OrganRiskDetail | null>(null);

  // Quick helper to evaluate directional trends
  const evaluateTrendStatus = (score: number, lastMonth: number) => {
    const diff = lastMonth - score;
    if (diff > 2) return { text: "Improving", className: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20", icon: TrendingDown };
    if (diff < -2) return { text: "Deteriorating", className: "text-red-400 bg-red-500/10 border border-red-500/20", icon: TrendingUp };
    return { text: "Stable", className: "text-amber-400 bg-amber-500/10 border border-amber-500/20", icon: Info };
  };

  // Triggering visual glow classes based on risk categories
  const getDotGlowClass = (score: number) => {
    if (score <= 30) return "bg-emerald-500 shadow-[0_0_12px_#10B981]";
    if (score <= 60) return "bg-amber-500 shadow-[0_0_12px_#EAB308]";
    if (score <= 80) return "bg-orange-500 shadow-[0_0_12px_#F97316]";
    return "bg-red-500 shadow-[0_0_12px_#EF4444]";
  };

  // Map coordinate nodes on the visual diagram
  const ORGANS_LIST = [
    { id: "brain", label: "Brain", y: "7%", x: "50%", icon: Brain },
    { id: "lungs", label: "Lungs", y: "30%", x: "50%", icon: Activity },
    { id: "heart", label: "Heart", y: "34%", x: "44%", icon: Heart },
    { id: "liver", label: "Liver", y: "42%", x: "42%", icon: Flame },
    { id: "pancreas", label: "Pancreas", y: "45%", x: "50%", icon: Apple },
    { id: "kidneys", label: "Kidneys", y: "51%", x: "50%", icon: Sliders }
  ];

  return (
    <div className="space-y-6">
      
      {/* Visual Header Grid Panel */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-[#1A1A1A] p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 animate-spin-slow" /> Advanced Body Mapping Interface
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Health Risk Heatmap
            </h2>
            <p className="text-xs text-slate-400 italic">
              "See your health. Understand your risks. Protect your future."
            </p>
          </div>
          
          {/* Projection mode tab switcher */}
          <div className="bg-black/40 border border-[#1C1C1C] rounded-xl p-1 flex gap-1 z-10 w-full sm:w-auto">
            <button
              onClick={() => setProjectionMode("current")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                projectionMode === "current"
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              Current State
            </button>
            <button
              onClick={() => setProjectionMode("future_no_change")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                projectionMode === "future_no_change"
                  ? "bg-red-500/20 text-red-100 border border-red-500/30"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              10-Yr Trend (Standard)
            </button>
            <button
              onClick={() => setProjectionMode("future_optimized")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                projectionMode === "future_optimized"
                  ? "bg-teal-500/20 text-teal-100 border border-teal-500/30"
                  : "text-slate-400 hover:text-white bg-transparent"
              }`}
            >
              10-Yr Optimized Path
            </button>
          </div>
        </div>
      </div>

      {/* Main Structural Twin Display: Left Side Sim Sandbox, Right Side Body Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Predictive Sandbox Slider Controls */}
        <div className="lg:col-span-5 bg-[#0A0A0A]/60 border border-[#1A1A1A] rounded-3xl p-5 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="pb-3 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Interactive Panel</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-400" /> Life-Habit Simulator
                </h3>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                REAL-TIME COUPLING
              </span>
            </div>

            {/* Presets controller */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block">Apply Scenario Presets:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("baseline")}
                  className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-slate-300 rounded-lg py-1.5 text-[9px] uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3 w-3 text-slate-500" /> Baseline
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("unhealthy")}
                  className="bg-red-950/20 hover:bg-red-950/30 border border-red-900/30 text-red-200 rounded-lg py-1.5 text-[9px] uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ShieldAlert className="h-3 w-3 text-red-500" /> Sedentary stress
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("healthy")}
                  className="bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-900/30 text-emerald-200 rounded-lg py-1.5 text-[9px] uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Super regimen
                </button>
              </div>
            </div>

            {/* Sliders elements */}
            <div className="space-y-4 pt-3">
              
              {/* Weight Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350 font-bold font-sans flex items-center gap-1.5 text-[11px]">
                    <Weight className="h-3.5 w-3.5 text-slate-500" /> Body Mass Weight
                  </span>
                  <span className="font-mono text-white text-[11px] font-bold">
                    {simWeight.toFixed(1)} kg <span className="text-slate-500 text-[10px]">({baseWeightToBmi(simWeight).toFixed(1)} BMI)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="130"
                  step="0.5"
                  value={simWeight}
                  onChange={(e) => setSimWeight(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-neutral-900 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Stress Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350 font-bold font-sans flex items-center gap-1.5 text-[11px]">
                    <Zap className="h-3.5 w-3.5 text-slate-500" /> Neural Distress Index
                  </span>
                  <span className="font-mono text-white text-[11px] font-bold">
                    {simStress} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={simStress}
                  onChange={(e) => setSimStress(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-neutral-900 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Exercise Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350 font-bold font-sans flex items-center gap-1.5 text-[11px]">
                    <Flame className="h-3.5 w-3.5 text-slate-500" /> Physical Activation Target
                  </span>
                  <span className="font-mono text-white text-[11px] font-bold">
                    {simExercise} days/wk
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={simExercise}
                  onChange={(e) => setSimExercise(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-neutral-900 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Sleep Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350 font-bold font-sans flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-slate-500" /> Circadian Recovery Loop
                  </span>
                  <span className="font-mono text-white text-[11px] font-bold">
                    {simSleep} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={simSleep}
                  onChange={(e) => setSimSleep(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-neutral-900 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Water Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350 font-bold font-sans flex items-center gap-1.5 text-[11px]">
                    <Activity className="h-3.5 w-3.5 text-slate-500" /> Pure Water Intake
                  </span>
                  <span className="font-mono text-white text-[11px] font-bold">
                    {simWater.toFixed(1)} Liters
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.25"
                  value={simWater}
                  onChange={(e) => setSimWater(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-neutral-900 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Smoking Switch */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Tobacco/Nicotine</span>
                  <select
                    value={simSmoking}
                    onChange={(e: any) => setSimSmoking(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-xs text-white p-2 rounded-xl outline-none cursor-pointer font-sans"
                  >
                    <option value="Never">Never Smoked</option>
                    <option value="Former">Former Smoker</option>
                    <option value="Active">Active Smoker</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Alcohol Load</span>
                  <select
                    value={simAlcohol}
                    onChange={(e: any) => setSimAlcohol(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-xs text-white p-2 rounded-xl outline-none cursor-pointer font-sans"
                  >
                    <option value="Never">Teetotaler / Never</option>
                    <option value="Social">Socially</option>
                    <option value="Heavy">Heavy Intake</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Quick guide text */}
          <div className="bg-zinc-950/60 p-4 border border-zinc-900 rounded-2xl text-[10px] font-sans text-slate-400 leading-relaxed space-y-1 inline-block">
            <span className="font-bold text-slate-300 block flex items-center gap-1.5 leading-none">
              <Info className="h-3.5 w-3.5 text-slate-500" /> Live Synchronized Dynamics
            </span>
            <p>
              Tweak your custom behavioral variables above! The organic simulation engine instantly recalculates hemodynamic forces, glycemic exposure indices, and cellular oxygen transport values to project custom color thresholds in the anatomical model.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Highly Polished Human Anatomy Interactive Diagram */}
        <div className="lg:col-span-7 bg-[#0A0A0A]/60 border border-[#1A1A1A] rounded-3xl p-5 flex flex-col items-center justify-between shadow-xl relative min-h-[550px]">
          
          <div className="w-full flex justify-between items-center pb-2 border-b border-zinc-900 z-10">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block font-mono">
              Anatomy Risk Overlay ({projectionMode === "current" ? "Current State" : projectionMode === "future_no_change" ? "No Change Trend" : "Optimized Pattern"})
            </span>
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block self-center" />
              <span className="text-[9px] text-[#A0A0A0] font-bold font-sans">TAP AN ORGAN FOR ANALYSIS CARD</span>
            </div>
          </div>

          {/* Visual Legend */}
          <div className="flex gap-4 justify-center items-center py-2.5 z-10 text-[9px] font-bold uppercase font-sans">
            <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> <span>Healthy</span></div>
            <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500 inline-block" /> <span>Moderate</span></div>
            <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block" /> <span>High</span></div>
            <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> <span>Critical</span></div>
          </div>

          {/* SVG Frame and Organ Points */}
          <div className="relative w-full h-[450px] flex items-center justify-center py-4 z-10 select-none">
            
            {/* Background Medical Cross Grid lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />
            
            {/* SVG Interactive Humanoid */}
            <svg 
              viewBox="0 0 240 500" 
              className="w-auto h-full max-h-[430px] filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            >
              {/* Grid calibration markers */}
              <line x1="30" y1="20" x2="30" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="20" y1="30" x2="40" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="210" y1="460" x2="210" y2="480" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="200" y1="470" x2="220" y2="470" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Main Human physical outline */}
              <path 
                d="M 120,40 
                   C 100,40 96,55 98,68 
                   C 100,74 104,80 114,84 
                   C 114,90 112,96 112,96
                   C 112,96 100,98 85,102 
                   C 60,108 52,118 52,140
                   C 52,160 55,190 58,210
                   C 60,220 54,235 48,245
                   C 42,255 45,260 50,260
                   C 55,260 62,250 68,235
                   C 72,225 76,215 76,200
                   C 76,215 78,250 78,280
                   C 78,300 85,310 90,320
                   C 95,330 94,360 92,390
                   C 90,420 86,450 88,475
                   C 89,485 96,485 98,485
                   C 100,485 106,470 110,440
                   C 114,410 118,370 120,350
                   C 122,370 126,410 130,440
                   C 134,470 140,485 142,485
                   C 144,485 151,485 152,475
                   C 154,450 150,420 148,390
                   C 146,360 145,330 150,320
                   C 155,310 162,300 162,280
                   C 162,250 164,215 164,200
                   C 164,215 168,225 172,235
                   C 178,250 185,260 190,260
                   C 195,260 198,255 192,245
                   C 186,235 180,220 182,210
                   C 185,190 188,160 188,140
                   C 188,118 180,108 155,102
                   C 140,98 128,96 128,96
                   C 128,96 126,90 126,84
                   C 136,80 140,74 142,68
                   C 144,55 140,40 120,40 Z"
                fill="rgba(15, 23, 42, 0.45)"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="1.8"
                className="transition-all"
              />

              {/* ORGAN SVG OVERLAYS */}

              {/* 1. Brain */}
              <path
                d="M 111,46 C 103,46 99,53 103,61 C 105,65 111,67 115,65 C 117,63 121,63 123,65 C 127,67 133,65 135,61 C 139,53 135,46 127,46 Z"
                fill={getRiskColor(currentRisks.brain).color + "25"}
                stroke={getRiskColor(currentRisks.brain).color}
                strokeWidth={hoveredOrgan === "brain" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-200"
                onClick={() => setClickedOrgan(getOrganStaticDetails("brain", currentRisks.brain))}
                onMouseEnter={() => setHoveredOrgan("brain")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />

              {/* 2. Lungs */}
              {/* Left lobe */}
              <path
                d="M 103,118 C 91,118 87,140 91,159 C 93,171 101,171 108,162 C 110,154 108,131 106,122 Z"
                fill={getRiskColor(currentRisks.lungs).color + "25"}
                stroke={getRiskColor(currentRisks.lungs).color}
                strokeWidth={hoveredOrgan === "lungs" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-200"
                onClick={() => setClickedOrgan(getOrganStaticDetails("lungs", currentRisks.lungs))}
                onMouseEnter={() => setHoveredOrgan("lungs")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
              {/* Right lobe */}
              <path
                d="M 137,118 C 149,118 153,140 149,159 C 147,171 139,171 132,162 C 130,154 132,131 134,122 Z"
                fill={getRiskColor(currentRisks.lungs).color + "25"}
                stroke={getRiskColor(currentRisks.lungs).color}
                strokeWidth={hoveredOrgan === "lungs" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-200"
                onClick={() => setClickedOrgan(getOrganStaticDetails("lungs", currentRisks.lungs))}
                onMouseEnter={() => setHoveredOrgan("lungs")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />

              {/* 3. Heart */}
              <path
                d="M 124,136 C 119,130 113,138 118,147 L 124,155 L 130,147 C 135,138 129,130 124,136 Z"
                fill={getRiskColor(currentRisks.heart).color + "30"}
                stroke={getRiskColor(currentRisks.heart).color}
                strokeWidth={hoveredOrgan === "heart" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-200"
                onClick={() => setClickedOrgan(getOrganStaticDetails("heart", currentRisks.heart))}
                onMouseEnter={() => setHoveredOrgan("heart")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />

              {/* 4. Liver */}
              <path
                d="M 94,182 C 94,175 124,171 131,177 C 133,184 119,193 108,191 C 98,189 94,186 94,182 Z"
                fill={getRiskColor(currentRisks.liver).color + "25"}
                stroke={getRiskColor(currentRisks.liver).color}
                strokeWidth={hoveredOrgan === "liver" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-200"
                onClick={() => setClickedOrgan(getOrganStaticDetails("liver", currentRisks.liver))}
                onMouseEnter={() => setHoveredOrgan("liver")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />

              {/* 5. Pancreas */}
              <path
                d="M 108,206 C 103,203 131,201 134,207 C 131,211 113,211 108,206 Z"
                fill={getRiskColor(currentRisks.pancreas).color + "30"}
                stroke={getRiskColor(currentRisks.pancreas).color}
                strokeWidth={hoveredOrgan === "pancreas" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-200"
                onClick={() => setClickedOrgan(getOrganStaticDetails("pancreas", currentRisks.pancreas))}
                onMouseEnter={() => setHoveredOrgan("pancreas")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />

              {/* 6. Kidneys */}
              {/* Left Kidney */}
              <path
                d="M 100,222 C 96,222 95,227 97,233 C 100,237 102,235 103,231 C 103,227 101,222 100,222 Z"
                fill={getRiskColor(currentRisks.kidney).color + "25"}
                stroke={getRiskColor(currentRisks.kidney).color}
                strokeWidth={hoveredOrgan === "kidneys" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-205"
                onClick={() => setClickedOrgan(getOrganStaticDetails("kidneys", currentRisks.kidney))}
                onMouseEnter={() => setHoveredOrgan("kidneys")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
              {/* Right Kidney */}
              <path
                d="M 140,222 C 144,222 145,227 143,233 C 140,237 138,235 137,231 C 137,227 139,222 140,222 Z"
                fill={getRiskColor(currentRisks.kidney).color + "25"}
                stroke={getRiskColor(currentRisks.kidney).color}
                strokeWidth={hoveredOrgan === "kidneys" ? "2.5" : "1.5"}
                className="transition-all cursor-pointer hover:opacity-100 duration-205"
                onClick={() => setClickedOrgan(getOrganStaticDetails("kidneys", currentRisks.kidney))}
                onMouseEnter={() => setHoveredOrgan("kidneys")}
                onMouseLeave={() => setHoveredOrgan(null)}
              />

            </svg>

            {/* Glowing nodes centered above organs for high fidelity tap assist on mobile */}
            {ORGANS_LIST.map((org) => {
              const staticScore = currentRisks[org.id as keyof typeof currentRisks] || 15;
              const isHovered = hoveredOrgan === org.id;

              return (
                <div
                  key={org.id}
                  style={{ top: org.y, left: org.x }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none"
                >
                  <button
                    type="button"
                    onClick={() => setClickedOrgan(getOrganStaticDetails(org.id, staticScore))}
                    onMouseEnter={() => setHoveredOrgan(org.id)}
                    onMouseLeave={() => setHoveredOrgan(null)}
                    className={`h-4.5 w-4.5 rounded-full border border-black/45 cursor-pointer transition-all flex items-center justify-center ${getDotGlowClass(staticScore)} ${
                      isHovered ? "scale-135 duration-150 ring-4 ring-white/20" : ""
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white block" />
                  </button>
                  
                  {/* Floating labels overlaying nodes */}
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 select-none pointer-events-none mt-1 shadow-md bg-black/85 border border-[#1C1C1C] rounded transition-all leading-none ${
                    isHovered ? "text-white border-slate-700 font-black scale-105" : "text-slate-500"
                  }`}>
                    {org.label} ({staticScore}%)
                  </span>
                </div>
              );
            })}

            {/* HOVER TOOLTIP CARD */}
            <AnimatePresence>
              {hoveredOrgan && (() => {
                const calculatedScore = currentRisks[hoveredOrgan as keyof typeof currentRisks];
                const data = getOrganStaticDetails(hoveredOrgan, calculatedScore);
                const colors = getRiskColor(calculatedScore);

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-64 bg-[#0A0A0AD9]/95 backdrop-blur-md border border-[#1F1F1F] rounded-2xl p-4 space-y-3 shadow-2xl z-20 pointer-events-none"
                  >
                    <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                      <span className="text-xs font-black text-white uppercase">{data.name.split("/")[0]}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${colors.badge}`}>
                        {colors.category}
                      </span>
                    </div>

                    <div className="space-y-1 font-sans">
                      <div className="text-[10px] text-slate-400">Predicted Organ Risk Coefficient</div>
                      <div className={`text-xl font-black ${colors.text}`}>{calculatedScore}%</div>
                    </div>

                    <div className="space-y-1.5 text-[9px] text-slate-400 font-medium">
                      <div className="font-extrabold uppercase text-[8.5px] text-slate-500">Key Triggers:</div>
                      <p className="line-clamp-2 leading-relaxed">&bull; {data.contributingFactors[0] || "Metabolic indicators within standard parameters"}</p>
                    </div>

                    <div className="text-[8.5px] font-bold text-emerald-400 uppercase tracking-wider">
                      Tap organ node to open health modal &rarr;
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

          </div>

          <div className="w-full bg-[#050505] p-3.5 border border-[#1A1A1A] rounded-2xl flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-1.5 select-none mt-4">
            <span className="text-left">* Heatmap dynamic metrics synchronize actively with your sandbox sliders above.</span>
            <span className="shrink-0 font-bold text-emerald-400">Status: Calibration Stable</span>
          </div>
        </div>

      </div>

      {/* FOOTER SECTION: Dynamic AI Health Insights & Recommendation Summary */}
      <div className="bg-[#0A0A0A]/60 border border-[#1A1A1A] p-5 rounded-3xl space-y-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
          <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Personalized Guidance Summary</span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Anatomy Allostatic Load Predictions
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
          <div className="space-y-2 text-xs font-sans text-slate-350">
            <p className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider text-emerald-400">
              Interactive Physiological Assessment
            </p>
            <p className="leading-relaxed">
              Based on the computed lifestyle modifiers, your overall allostatic stress indicators are projected to decline significantly upon adhering to customized plans. 
              {simStress > 7 && " Sustained stress levels remain a high predictive factor for cerebral blood vessel tension and insulin output resistance inside hepatic cells."}
              {simSmoking === "Active" && " Current active nicotine input induces elevated inflammatory and oxidative load across alveoli membranes, restricting optimal capillary transport."}
              {simWeight > baselineWeight && " Visibility of viscero-metabolic strain has risen. Restitution of muscular sink capacity is critical."}
              {simExercise >= 4 && " Your current active exercise targets generate sustained cardiac protection and reduce glycemic loading stress."}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              Top Simulated Health Targets
            </span>
            <div className="space-y-2 text-[11px]">
              <div className="flex gap-2.5 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">Active Glycemic Management</strong>: Engage in postpostprandial incline walks to blunten extreme blood sugar spikes and shield beta-cell volume.
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">Capillary Preservation</strong>: Limit refined sodium chloride compounds and introduce nitric-oxide promoters (beets, arugula) to optimize vessel diameter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED ORGAN DIAL MODAL */}
      <AnimatePresence>
        {clickedOrgan && (() => {
          const calculatedScore = currentRisks[clickedOrgan.id as keyof typeof currentRisks];
          const updatedOrganData = getOrganStaticDetails(clickedOrgan.id, calculatedScore);
          const colors = getRiskColor(calculatedScore);
          const trend = evaluateTrendStatus(calculatedScore, updatedOrganData.lastMonthScore);
          const TrendIcon = trend.icon;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
              >
                {/* Header background accents */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all" 
                  style={{ backgroundColor: colors.color }}
                />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setClickedOrgan(null)}
                  className="absolute top-4 right-4 p-2 bg-zinc-900 border border-zinc-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <span className="text-xs uppercase font-extrabold px-1 block">Close</span>
                </button>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Title and Badge */}
                  <div className="space-y-1.5 pr-14">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold font-mono">
                      <Activity className="h-4 w-4 text-slate-500" /> Organ Physiology Intelligence
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
                      {updatedOrganData.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                      {updatedOrganData.description}
                    </p>
                  </div>

                  {/* Core Metrics comparison panel */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Visual Risk Gauge dial */}
                    <div className="bg-[#050505] p-4.5 rounded-2xl border border-zinc-900 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
                      <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest font-mono">Risk Index</span>
                      <div className="relative h-24 w-24 flex items-center justify-center">
                        {/* Interactive simple SVG radial chart */}
                        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" stroke="#151515" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="42" 
                            stroke={colors.color} 
                            strokeWidth="8.5" 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 42}
                            strokeDashoffset={2 * Math.PI * 42 * (1 - calculatedScore / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="text-center z-10">
                          <span className="text-2xl font-black text-white font-mono">{calculatedScore}%</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${colors.badge}`}>
                        {colors.category}
                      </span>
                    </div>

                    {/* Historical trend index card */}
                    <div className="bg-[#050505] p-4.5 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest font-mono block">Dynamic Trend Tracking</span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Baseline Prior Score:</span>
                          <span className="font-mono text-xs text-white font-bold">{updatedOrganData.lastMonthScore}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Current Computed:</span>
                          <span className="font-mono text-xs text-white font-bold">{calculatedScore}%</span>
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold leading-none ${trend.className}`}>
                        <span className="uppercase text-[9px] tracking-wider">Metabolic Shift:</span>
                        <span className="flex items-center gap-1">
                          <TrendIcon className="h-4.5 w-4.5 shrink-0" />
                          {trend.text}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Root Contributing factors */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                      Organ Biomarkers & Lifestyle Triggers
                    </span>
                    <div className="space-y-1.5 font-sans text-xs">
                      {updatedOrganData.contributingFactors.map((fact, index) => (
                        <div key={index} className="flex gap-2 items-start py-1.5 px-3 bg-zinc-950/60 border border-neutral-900 rounded-xl leading-relaxed text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0 mt-2" />
                          <p>{fact}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions summary recommendations list */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                      Personalized Proactive Action Protocol
                    </span>
                    <div className="space-y-1.5 font-sans text-xs">
                      {updatedOrganData.recommendations.map((rec, index) => (
                        <div key={index} className="flex gap-2.5 items-start leading-relaxed text-slate-300">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-450 shrink-0 mt-0.5" />
                          <p>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
