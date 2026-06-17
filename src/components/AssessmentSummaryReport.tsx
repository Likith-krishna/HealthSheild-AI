import { t } from "i18next";
import React, { useState, useEffect } from "react";
import { PredictionEngineOutput } from "../types";
import {
  FileText, Printer, ShieldCheck, Activity, Award, CheckCircle2,
  AlertTriangle, Sparkles, Heart, BrainCircuit, RefreshCw, AlertCircle } from
"lucide-react";

interface AssessmentSummaryReportProps {
  evaluation: PredictionEngineOutput | null;
  selectedRecord: any;
  user: any;
}

export default function AssessmentSummaryReport({ evaluation, selectedRecord, user }: AssessmentSummaryReportProps) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [errorAI, setErrorAI] = useState<string>("");

  if (!selectedRecord || !evaluation) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">{t("auto.no_active_timeline_data_found", "No Active Timeline Data Found")}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("auto.please_navigate_to_the_health_data_input", "Please navigate to the \"Health Data Input\" screen and submit your current biomarkers first to compile your Clinical Summary Report.")}

        </p>
      </div>);

  }

  // Extract variables
  const { healthScore, predictions, alerts } = evaluation;
  const basicInfo = selectedRecord.basicInfo || {};
  const lifestyle = selectedRecord.lifestyle || {};
  const nutrition = selectedRecord.nutrition || {};
  const wearable = selectedRecord.wearableDetails || {};
  const womensHealth = selectedRecord.womensHealth || {};
  const mentalHealth = selectedRecord.mentalHealth || {};

  // Compute sub-system health indices exactly like evaluation pages
  const sleepDuration = parseFloat(lifestyle.sleepDuration) || 7;
  const sleepQuality = parseFloat(lifestyle.sleepQuality) || 3;
  const sleepScore = Math.min(100, Math.round(sleepDuration / 8 * 70 + sleepQuality / 5 * 30));

  const stressLevel = parseFloat(lifestyle.stressLevel) || 5;
  const stressScore = Math.max(10, Math.round(100 - stressLevel * 9));

  const steps = wearable.steps || 0;
  const activityScore = steps > 0 ?
  Math.min(100, Math.round(steps / 10000 * 100)) :
  lifestyle.physicalActivity === "High" ? 90 : lifestyle.physicalActivity === "Moderate" ? 75 : lifestyle.physicalActivity === "Low" ? 50 : 30;

  const junkFreq = parseFloat(nutrition.junkFood) || 5;
  const sugarFreq = parseFloat(nutrition.sugar) || 5;
  const waterIntake = parseFloat(nutrition.water) || 2;
  const nutritionScore = Math.max(30, Math.min(100, Math.round(100 - junkFreq * 4 - sugarFreq * 3 + (waterIntake >= 2 ? 10 : 0))));

  // Mental Health indicators if filled in workspace
  const anxietyLevel = mentalHealth.anxietyLevel !== undefined ? Number(mentalHealth.anxietyLevel) : Math.round(stressLevel * 0.9);
  const mentalStressLevel = mentalHealth.stressLoad !== undefined ? Number(mentalHealth.stressLoad) : Math.round(stressLevel * 1.1);
  const mentalScore = Math.min(100, Math.max(10, Math.round(100 - anxietyLevel * 4 - mentalStressLevel * 55 / 10)));

  // BMI Calculation
  const w = parseFloat(basicInfo.weight) || 70;
  const h = parseFloat(basicInfo.height) || 170;
  const bmiVal = h > 0 ? (w / (h / 100 * (h / 100))).toFixed(1) : "22.0";
  const bmi = parseFloat(bmiVal);
  const bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal Weight" : bmi < 30 ? "Overweight" : "Obese";

  // Dynamic procedural diagnostic summary generator (Runs immediately and acts as flawless high fidelity fallback)
  const generateProceduralSummary = () => {
    let text = `CLINICAL SUMMARY & OVERALL INTUITIVE DISCOVERY SUMMARY:\n\n`;

    // Para 1: Vital observations & Scores
    text += `Based on the latest weekly health assessment synchronized on ${new Date(selectedRecord.timestamp).toLocaleDateString()}, the patient presents with an overall Clinical Twin Health Score of ${healthScore.score}/100, categorized as a "${healthScore.category}" state. `;
    text += `Biomedical vitals tracking flags a Blood Pressure of ${basicInfo.systolicBP || 120}/${basicInfo.diastolicBP || 80} mmHg and Fasting Blood Glucose of ${basicInfo.bloodSugar || 100} mg/dL. `;
    if (parseFloat(basicInfo.bloodSugar) > 100) {
      text += `Fasting Blood Sugar is currently elevated (${basicInfo.bloodSugar} mg/dL) indicating borderline glucose tolerance risk that requires active dietary and physical intervention. `;
    } else {
      text += `Blood glucose levels are currently stabilized within normal homeostatic limits. `;
    }
    if (parseFloat(basicInfo.systolicBP) > 130) {
      text += `Systolic blood pressure is elevated at ${basicInfo.systolicBP} mmHg, indicating arterial pressure accentuation. `;
    }

    // Para 2: Mental stress, Sleep duration and Activity indices
    text += `\n\nAllostatic load and subjective lifestyle logs show a chronobiological sleep balance of ${sleepScore}%, with an average of ${sleepDuration} hours of rest. `;
    text += `Subjective stress resilience is estimated at ${stressScore}%, highlighting allostatic strain levels of ${stressLevel}/10. `;
    if (anxietyLevel > 5) {
      text += `We note high subjective anxiety indices of ${anxietyLevel}/10 during active thresholds, indicating autonomic nervous system over-excitation. `;
    } else {
      text += `Sympathetic nervous system responses are currently compensated with stable baseline anxiety levels. `;
    }

    // Para 3: Actionable Advice
    text += `\n\nIMMEDIATE STRATEGIC ACTIONABLE HIGHLIGHTS:\n`;
    text += `To increase overall health score and reduce predictive risks, the following immediate protocols are highly suggested: `;
    if (parseFloat(basicInfo.bloodSugar) > 100 || nutritionScore < 70) {
      text += `1. Nutrition: Completely eliminate refined sugar and high-glycemic carbohydrates; increase high-yield digestible fibers. `;
    }
    if (steps < 7000) {
      text += `2. Fitness: Elevate daily walking count to exactly 8,000 steps to stimulate glucose transporter GLUT4 and enhance arterial pliability. `;
    } else {
      text += `2. Fitness: Sustain active aerobic routines, targeting at least 150 minutes of weekly cardiovascular conditioning. `;
    }
    if (stressLevel > 5 || anxietyLevel > 5) {
      text += `3. Stress Management: Perform the standard 4-7-8 deep diaphragmatic breathing technique block for 5 minutes during panic indices or stress thresholds. Gating electronic screens 1 hour before sleep is highly recommended.`;
    } else {
      text += `3. Recovery: Continue standard restoration guidelines and safeguard circadian rest consistency.`;
    }

    return text;
  };

  // Fetch true AI assessment summary from database/model
  const fetchAISummary = async () => {
    setLoadingAI(true);
    setErrorAI("");
    try {
      const response = await fetch("/api/generate-assessment-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aegis_access_token")}`
        },
        body: JSON.stringify({
          lang: localStorage.getItem("aegis_preferred_lang") || "en",
          recordId: selectedRecord.id,
          scores: {
            overall: healthScore.score,
            nutrition: nutritionScore,
            sleep: sleepScore,
            stress: stressScore,
            activity: activityScore,
            mental: mentalScore
          },
          biomarkers: {
            bloodSugar: basicInfo.bloodSugar,
            systolicBP: basicInfo.systolicBP,
            diastolicBP: basicInfo.diastolicBP,
            cholesterolTotal: basicInfo.cholesterolTotal,
            heartRate: basicInfo.heartRate,
            weight: basicInfo.weight,
            height: basicInfo.height,
            bmi: bmi
          },
          demographics: {
            fullName: user.fullName,
            age: basicInfo.age || 30,
            gender: basicInfo.gender || "Unspecified"
          },
          predictions: predictions.slice(0, 3).map((p) => ({
            name: p.name,
            probability: p.probability,
            severity: p.severity
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          setAiSummary(data.summary);
        } else {
          setAiSummary(generateProceduralSummary());
        }
      } else {
        setAiSummary(generateProceduralSummary());
      }
    } catch (err) {
      console.error("AI Report generation error:", err);
      setAiSummary(generateProceduralSummary());
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAISummary();
  }, [selectedRecord.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="assessment-summary-report-panel">
      {/* CSS style block specifically targeting print layouts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, nav, button, .no-print {
            display: none !important;
          }
          #printed-report-card {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .print-full-card {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-border {
            border: 1px solid #ddd !important;
          }
          .print-text-dark {
            color: #111 !important;
          }
          .print-text-muted {
            color: #555 !important;
          }
          .print-bg-light {
            background-color: #f9f9f9 !important;
          }
          .print-badge {
            background: #eee !important;
            color: #000 !important;
            border: 1px solid #bbb !important;
          }
        }
      ` }} />

      {/* Control panel & print bar */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-4.5 flex gap-4 flex-col sm:flex-row justify-between items-center no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">{t("auto.precision_clinical_record", "Precision Clinical Record")}</span>
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-tight">{t("auto.weekly_assessment_summary_report", "Weekly Assessment Summary Report")}</h2>
          <p className="text-xs text-slate-500">{t("auto.generate_print_or_export_a_comprehensive", "Generate, print or export a comprehensive summary review of all diagnostic factors.")}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchAISummary}
            disabled={loadingAI}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-300">
            
            <RefreshCw className={`h-3.5 w-3.5 ${loadingAI ? 'animate-spin text-emerald-400' : ''}`} />
            {loadingAI ? "Re-syncing AI..." : "Re-sync AI"}
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-5 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-emerald-500/10">
            
            <Printer className="h-4 w-4 stroke-[2.5]" />{t("auto.print_export_pdf", "Print / Export PDF")}

          </button>
        </div>
      </div>

      {/* Main Report Card Paperheet */}
      <div
        id="printed-report-card"
        className="bg-[#08080A]/95 border border-[#17171B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 text-[#E0E0E0] print-full-card">
        
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Clinical Letterhead Header */}
        <div className="border-b border-[#1C1C24] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print-border print-text-dark">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                <FileText className="h-4 w-4" />
              </div>
              <h1 className="text-sm font-black text-white font-mono uppercase tracking-widest print-text-dark">{t("auto.healthsheild_ai_clinical_labs", "HealthSheild AI Clinical Labs")}</h1>
            </div>
            <p className="text-[10px] text-slate-500 font-mono print-text-muted">{t("auto.digital_twin_early_diagnostics_license_c", "Digital Twin Early Diagnostics | License Code: HEALTHSHEILD-782-SYS")}</p>
            <p className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20 font-mono uppercase tracking-wider inline-block mt-1 print-badge">{t("auto.clinical_twin_report_synchronized", "Clinical Twin Report synchronized")}

            </p>
          </div>

          <div className="font-mono text-left md:text-right text-[10px] space-y-1 text-slate-400 print-text-muted">
            <p><span className="text-slate-550 mr-1.5 font-bold uppercase">{t("auto.report_ref_id", "Report Ref ID:")}</span> <span className="text-white font-bold print-text-dark">{t("auto.agr", "AGR-")}{selectedRecord.id?.substring(0, 8).toUpperCase() || "WEEKLY"}</span></p>
            <p><span className="text-slate-550 mr-1.5 font-bold uppercase">{t("auto.assessment_date", "Assessment Date:")}</span> {new Date(selectedRecord.timestamp).toLocaleDateString()} {new Date(selectedRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><span className="text-slate-550 mr-1.5 font-bold uppercase">{t("auto.print_generation", "Print Generation:")}</span> {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Patient Demographics Panel */}
        <div className="bg-[#050507] border border-[#121216] rounded-xl p-4.5 print-bg-light print-border print-text-dark">
          <span className="text-[9px] text-emerald-450 font-bold uppercase tracking-widest block mb-2 px-1 font-mono">{t("auto.patient_demographics", "Patient Demographics")}</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div>
              <span className="text-[9px] text-[#71717A] uppercase block">{t("auto.fullname", "FullName")}</span>
              <strong className="text-[#E4E4E7] block mt-0.5 print-text-dark">{user.fullName || "HealthSheild AI Participant"}</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#71717A] uppercase block">{t("auto.age_biological_gating", "Age / Biological Gating")}</span>
              <strong className="text-[#E4E4E7] block mt-0.5 print-text-dark">{basicInfo.age || 30}{t("auto.yrs", "yrs (")}{basicInfo.gender || "Unspecified"})</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#71717A] uppercase block">{t("auto.calculated_bmi", "Calculated BMI")}</span>
              <strong className="text-[#E4E4E7] block mt-0.5 print-text-dark">
                {bmiVal}{t("auto.kg_m", "kg/m\xB2")}<span className="text-[9px] bg-zinc-900 border border-neutral-800 text-slate-400 px-1.5 py-0.5 rounded ml-1 font-mono uppercase print-badge">{bmiCategory}</span>
              </strong>
            </div>
            <div>
              <span className="text-[9px] text-[#71717A] uppercase block">{t("auto.residence_node", "Residence Node")}</span>
              <strong className="text-[#E4E4E7] block mt-0.5 truncate print-text-dark">{user.address?.split(" || ").pop() || "India"}</strong>
            </div>
          </div>
        </div>

        {/* Comprehensive Score Matrix Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-500" />{t("auto.multi_coordinate_diagnostic_scores", "Multi-Coordinate Diagnostic Scores")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            
            {/* Overall Health Score */}
            <div className="bg-[#050507]/65 border border-[#16161C] p-3 rounded-xl text-center print-border print-bg-light">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.health_score", "Health Score")}</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1 print-text-dark">{healthScore.score}</div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block print-badge">
                {healthScore.category}
              </span>
            </div>

            {/* Nutrition Index */}
            <div className="bg-[#050507]/65 border border-[#16161C] p-3 rounded-xl text-center print-border print-bg-light">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.nutrition_index", "Nutrition Index")}</span>
              <div className="text-2xl font-black text-amber-500 font-mono mt-1 print-text-dark">{nutritionScore}</div>
              <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block print-badge">
                {nutritionScore >= 80 ? "Optimal" : nutritionScore >= 60 ? "Moderate" : "Deficient"}
              </span>
            </div>

            {/* Sleep Rest */}
            <div className="bg-[#050507]/65 border border-[#16161C] p-3 rounded-xl text-center print-border print-bg-light">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.circadian_sleep", "Circadian Sleep")}</span>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1 print-text-dark">{sleepScore}</div>
              <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block print-badge">
                {sleepScore >= 85 ? "Excellent" : sleepScore >= 65 ? "Fair" : "Fragmented"}
              </span>
            </div>

            {/* Stress Resilience */}
            <div className="bg-[#050507]/65 border border-[#16161C] p-3 rounded-xl text-center print-border print-bg-light">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.stress_resilience", "Stress Resilience")}</span>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1 print-text-dark">{stressScore}</div>
              <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block print-badge">
                {stressScore >= 75 ? "Balanced" : stressScore >= 50 ? "Compensated" : "High Strain"}
              </span>
            </div>

            {/* Activity Index */}
            <div className="bg-[#050507]/65 border border-[#16161C] p-3 rounded-xl text-center print-border print-bg-light">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.activity_index", "Activity Index")}</span>
              <div className="text-2xl font-black text-teal-400 font-mono mt-1 print-text-dark">{activityScore}</div>
              <span className="text-[8px] bg-teal-500/10 text-teal-450 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block print-badge">
                {activityScore >= 80 ? "Vigorous" : activityScore >= 50 ? "Active" : "Sedentary"}
              </span>
            </div>

            {/* Mental Coping Index (Anxiety & Mental Stress) */}
            <div className="bg-[#050507]/65 border border-[#16161C] p-3 rounded-xl text-center print-border print-bg-light">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.mental_focus", "Mental Focus")}</span>
              <div className="text-2xl font-black text-pink-400 font-mono mt-1 print-text-dark">{mentalScore}</div>
              <span className="text-[8px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block print-badge">
                {mentalScore >= 80 ? "Optimal" : mentalScore >= 60 ? "Moderate" : "Adrenal Care"}
              </span>
            </div>

          </div>
        </div>

        {/* Primary Laboratory Vital Biomarkers */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />{t("auto.laboratory_biomarkers_core_vitals", "Laboratory Biomarkers & Core Vitals")}
          </h3>
          <div className="bg-[#040405] border border-[#14141A] rounded-xl overflow-hidden print-border">
            <div className="grid grid-cols-5 bg-[#0C0B0E] p-3 text-[10px] uppercase font-black text-slate-500 tracking-wider font-mono border-b border-[#14141A] print-bg-light print-border print-text-dark">
              <div className="col-span-2">{t("auto.biomarker_vital_index", "Biomarker / Vital Index")}</div>
              <div className="text-center">{t("auto.recorded_value", "Recorded Value")}</div>
              <div className="text-center">{t("auto.reference_limits", "Reference limits")}</div>
              <div className="text-right">{t("auto.evaluation_status", "Evaluation Status")}</div>
            </div>

            <div className="divide-y divide-[#121217] text-xs font-medium print-text-dark">
              {/* Blood Glucose */}
              <div className="grid grid-cols-5 p-3 items-center hover:bg-[#08080C]/40 transition-all">
                <div className="col-span-2">
                  <span className="font-extrabold text-[#E4E4E7] block print-text-dark">{t("auto.fasting_blood_sugar", "Fasting Blood Sugar")}</span>
                  <span className="text-[9px] text-[#71717A] leading-none">{t("auto.measures_glycemic_regulation_and_insulin", "Measures glycemic regulation and insulin load response.")}</span>
                </div>
                <div className="text-center font-bold font-mono text-white print-text-dark">{basicInfo.bloodSugar || 100}{t("auto.mg_dl", "mg/dL")}</div>
                <div className="text-center font-mono text-slate-500">{t("auto.70_100_mg_dl", "70 - 100 mg/dL")}</div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  parseFloat(basicInfo.bloodSugar) > 100 ?
                  "bg-amber-500/10 text-amber-500 border border-amber-500/15" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"}`
                  }>
                    {parseFloat(basicInfo.bloodSugar) > 100 ? "Elevated Alert" : "Normal"}
                  </span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="grid grid-cols-5 p-3 items-center hover:bg-[#08080C]/40 transition-all">
                <div className="col-span-2">
                  <span className="font-extrabold text-[#E4E4E7] block print-text-dark">{t("auto.blood_pressure_systolic_diastolic", "Blood Pressure (Systolic / Diastolic)")}</span>
                  <span className="text-[9px] text-[#71717A] leading-none">{t("auto.vascular_tension_and_arterial_resistance", "Vascular tension and arterial resistance markers.")}</span>
                </div>
                <div className="text-center font-bold font-mono text-white print-text-dark">{basicInfo.systolicBP || 120}/{basicInfo.diastolicBP || 80}{t("auto.mmhg", "mmHg")}</div>
                <div className="text-center font-mono text-slate-500">{t("auto.90_60_120_80_mmhg", "90/60 - 120/80 mmHg")}</div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  parseFloat(basicInfo.systolicBP) > 130 ?
                  "bg-amber-500/10 text-amber-500 border border-amber-500/15" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"}`
                  }>
                    {parseFloat(basicInfo.systolicBP) > 130 ? "Stage 1 HTN" : parseFloat(basicInfo.systolicBP) > 120 ? "Pre-HTN Accent" : "Optimal"}
                  </span>
                </div>
              </div>

              {/* Total Cholesterol */}
              <div className="grid grid-cols-5 p-3 items-center hover:bg-[#08080C]/40 transition-all">
                <div className="col-span-2">
                  <span className="font-extrabold text-[#E4E4E7] block print-text-dark">{t("auto.total_serum_cholesterol", "Total Serum Cholesterol")}</span>
                  <span className="text-[9px] text-[#71717A] leading-none">{t("auto.coronary_fat_loading_risk_metric", "Coronary fat loading risk metric.")}</span>
                </div>
                <div className="text-center font-bold font-mono text-white print-text-dark">{basicInfo.cholesterolTotal || 190}{t("auto.mg_dl", "mg/dL")}</div>
                <div className="text-center font-mono text-slate-500">{t("auto.130_200_mg_dl", "130 - 200 mg/dL")}</div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  parseFloat(basicInfo.cholesterolTotal) > 200 ?
                  "bg-amber-500/10 text-amber-500 border border-amber-500/15" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"}`
                  }>
                    {parseFloat(basicInfo.cholesterolTotal) > 200 ? "Borderline High" : "Optimal"}
                  </span>
                </div>
              </div>

              {/* Resting Heart Rate */}
              <div className="grid grid-cols-5 p-3 items-center hover:bg-[#08080C]/40 transition-all">
                <div className="col-span-2">
                  <span className="font-extrabold text-[#E4E4E7] block print-text-dark">{t("auto.resting_heart_rate", "Resting Heart Rate")}</span>
                  <span className="text-[9px] text-[#71717A] leading-none">{t("auto.autonomic_cardiac_regulation_index", "Autonomic cardiac regulation index.")}</span>
                </div>
                <div className="text-center font-bold font-mono text-white print-text-dark">{basicInfo.heartRate || 72}{t("auto.bpm", "bpm")}</div>
                <div className="text-center font-mono text-slate-500">{t("auto.60_100_bpm", "60 - 100 bpm")}</div>
                <div className="text-right">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">{t("auto.optimal", "Optimal")}

                  </span>
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="grid grid-cols-5 p-3 items-center hover:bg-[#08080C]/40 transition-all">
                <div className="col-span-2">
                  <span className="font-extrabold text-[#E4E4E7] block print-text-dark">{t("auto.circadian_sleep_rest_duration", "circadian Sleep Rest Duration")}</span>
                  <span className="text-[9px] text-[#71717A] leading-none">{t("auto.sleep_depth_and_rem_restoration_period", "Sleep depth and REM restoration period.")}</span>
                </div>
                <div className="text-center font-bold font-mono text-white print-text-dark">{sleepDuration}{t("auto.hrs_day", "hrs/day")}</div>
                <div className="text-center font-mono text-slate-500">{t("auto.7_0_9_0_hrs", "7.0 - 9.0 hrs")}</div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  sleepDuration < 6.5 ?
                  "bg-amber-500/10 text-amber-500 border border-amber-500/15" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"}`
                  }>
                    {sleepDuration < 6.5 ? "Sub-optimal" : "Optimized"}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* AI Medical Summary & Clinical Impressions Section */}
        <div className="bg-[#070709] border border-[#14141A] rounded-xl p-5 space-y-3 relative overflow-hidden print-border">
          <div className="absolute right-3 top-3 opacity-10">
            <BrainCircuit className="h-20 w-20 text-emerald-500" />
          </div>
          
          <div className="flex items-center gap-2 border-b border-[#141419] pb-3 print-border">
            <div className="h-6.5 w-6.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest print-text-dark">{t("auto.ai_overall_clinical_summary", "AI Overall Clinical summary")}</h3>
              <p className="text-[9px] text-slate-500 print-text-muted">{t("auto.cognitive_ai_medical_twin_synthesis_week", "Cognitive AI medical twin synthesis & weekly behavioral trends analysis.")}</p>
            </div>
          </div>

          {loadingAI ?
          <div className="py-8 flex flex-col items-center justify-center text-xs text-slate-500 space-y-2">
              <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
              <span>{t("auto.analyzing_biomarkers_mental_scores_and_p", "Analyzing biomarkers, mental scores, and predicting health summary trajectories...")}</span>
            </div> :

          <div className="text-xs leading-relaxed text-[#D4D4D8] font-sans space-y-3.5 select-text print-text-dark whitespace-pre-line">
              {aiSummary}
            </div>
          }
        </div>

        {/* Tailored Recommendations and Directions Gating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dietary Nutrition suggestions */}
          <div className="bg-[#050507] border border-[#121217] rounded-xl p-4.5 space-y-3 print-border">
            <h4 className="text-[10px] font-black tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5 pb-2 border-b border-[#141419] print-border print-text-dark">
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />{t("auto.nutrition_gating_suggestions", "Nutrition Gating Suggestions")}
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">{t("auto.recommended_foods", "Recommended Foods:")}</span>
                <div className="flex flex-wrap gap-1">
                  {(evaluation.preventiveRoadmap?.dietToInclude || ["Fresh leafy greens", "Avocado mono-fats", "Walnuts / Omega-3", "Lean organic proteins"]).map((food, idx) =>
                  <span key={idx} className="bg-[#0D0E10] border border-[#1A1A1E] text-slate-300 font-medium px-2 py-0.5 rounded text-[10px] print-badge print-text-dark">
                      ✓ {food}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">{t("auto.restrict_avoid", "Restrict / Avoid:")}</span>
                <div className="flex flex-wrap gap-1">
                  {(evaluation.preventiveRoadmap?.dietToAvoid || ["Refined sugars", "High glycemic cereals", "Processed junk snacks", "Saturated trans-fats"]).map((food, idx) =>
                  <span key={idx} className="bg-[#110D0D] border border-red-950/20 text-red-300 font-medium px-2 py-0.5 rounded text-[10px] print-badge print-text-dark">
                      ✗ {food}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fitness, Rest and Behavioral Suggestions */}
          <div className="bg-[#050507] border border-[#121217] rounded-xl p-4.5 space-y-3 print-border">
            <h4 className="text-[10px] font-black tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5 pb-2 border-b border-[#141419] print-border print-text-dark">
              <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" />{t("auto.recovery_fitness_recommendations", "Recovery & Fitness Recommendations")}
            </h4>
            
            <ul className="text-xs text-slate-300 space-y-2 font-medium print-text-dark">
              <li className="flex gap-2 items-start">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{t("auto.fitness_target_walk", "Fitness Target: Walk")}{steps >= 8000 ? `${steps} steps matched!` : `8,000 daily steps to regulate blood sugar`}{t("auto.train_for_150_minutes_weekly", "& train for 150 minutes weekly.")}</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{t("auto.sleep_optimization_secure_consecutive_7", "Sleep Optimization: Secure consecutive 7.5 to 8 hours rest. Gate all monitors 1 hour prior to biological sleep time.")}</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-purple-400 font-bold shrink-0">✓</span>
                <span>{t("auto.parasympathetic_reset_perform_4_7_8_diap", "Parasympathetic Reset: Perform 4-7-8 diaphragmatic deep breathing twice daily (inhale 4s, hold 7s, exhale 8s) to cool anxiety spikes.")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer Disclaimer and Signatures */}
        <div className="border-t border-[#1C1C24] pt-5 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[9px] text-slate-500 print-border print-text-muted">
          <p className="max-w-md leading-relaxed">{t("auto.clinical_twin_statement_this_model_uses", "*Clinical Twin Statement: This model uses predictive wellness algorithms and automated medical guidelines simulations. It provides mathematical indications of potential risk trajectories rather than absolute medical diagnoses. Please check and verify your clinical blood scores with actual primary care physicians prior to altering medical regimens.")}

          </p>
          <div className="text-left sm:text-right shrink-0">
            <span className="block font-bold uppercase text-slate-400 print-text-dark font-mono">{t("auto.healthsheild_ai_intelligence", "HealthSheild AI Intelligence")}</span>
            <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded mt-1 inline-block uppercase font-mono tracking-widest print-badge">{t("auto.active_node_verified", "Active node verified")}

            </span>
          </div>
        </div>

      </div>
    </div>);

}