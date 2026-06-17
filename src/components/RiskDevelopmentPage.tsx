import { t } from "i18next";
import React, { useState } from "react";
import { PredictionEngineOutput, DiseasePrediction } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ShieldAlert, TrendingUp, Sparkles, Brain, Eye, HelpCircle, Activity, Info, BarChart3 } from "lucide-react";

interface RiskDevelopmentPageProps {
  evaluation: PredictionEngineOutput | null;
  timelineRecords: any[];
  selectedRecordId: string | null;
}

export default function RiskDevelopmentPage({ evaluation, timelineRecords, selectedRecordId }: RiskDevelopmentPageProps) {
  const [selectedDiseaseType, setSelectedDiseaseType] = useState<string>("Cardiovascular");

  if (!evaluation || timelineRecords.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">{t("auto.no_baseline_assessment_registered", "No Baseline Assessment Registered")}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("auto.please_complete_your_clinical_vital_entr", "Please complete your clinical vital entry inside the \"Clinical Intake\" screen to compile predictive risk structures.")}

        </p>
      </div>);

  }

  const { predictions } = evaluation;

  // Process historical risk progress across timeline records for Recharts
  // Let's extract risk history chronologically
  const chronologicalRecords = [...timelineRecords].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const chartData = chronologicalRecords.map((rec, idx) => {
    const timestampStr = new Date(rec.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const weekLabel = `Week ${idx + 1}`;

    // Find disease probabilities
    const findProb = (diseaseName: string) => {
      const pred = rec.analysisResults?.predictions?.find((p: any) => p.name.includes(diseaseName) || p.category === diseaseName);
      return pred ? pred.probability : 15; // fallback
    };

    return {
      name: timestampStr,
      label: weekLabel,
      Cardiovascular: findProb("Cardiovascular"),
      Metabolic: findProb("Metabolic"),
      Kidney: findProb("Kidney") || findProb("CKD"),
      Liver: findProb("Liver") || findProb("NASH"),
      overallScore: rec.analysisResults?.healthScore?.score || 75
    };
  });

  // Precompute metrics to bypass TSX inline-casting parser bottlenecks
  const getRiskNum = (index: number): number => {
    if (chartData.length === 0 || index >= chartData.length) return 0;
    const item = chartData[index];
    const key = selectedDiseaseType as keyof typeof item;
    return typeof item[key] === "number" ? item[key] as number : 15;
  };

  const initialRiskVal = getRiskNum(0);
  const currentRiskVal = getRiskNum(chartData.length - 1);
  const riskValDiff = currentRiskVal - initialRiskVal;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "Critical":return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Severe":return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "Moderate":return "text-amber-450 bg-amber-500/10 border-amber-500/20";
      default:return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  // Explain disease predictions based on typical limits exceeded:
  const getExplainableExplanation = (pred: DiseasePrediction) => {
    if (pred.category === "Cardiovascular") {
      return "Triggered due to blood pressure parameters exceeding 120/80 mmHg or high serum cholesterol metrics (> 170 mg/dL). Dynamic familial history of cardiac overlap additionally moves the probability baseline higher.";
    }
    if (pred.category === "Metabolic") {
      return "Formulated from synergistic fasting blood glucose limits (> 100 mg/dL) combined with elevated clinical Body Mass Index (BMI > 25 kg/m²). Glucosic levels over target directly stress beta-cells.";
    }
    if (pred.category === "Kidney") {
      return "Chronic blood sugar and systemic lipid overload can constrain nephron metabolic filtering gates, leading to renal early warning alerts.";
    }
    if (pred.category === "Liver") {
      return "Metabolic clearance stress and low physical activity indices can lead to fatty liver lipid overload warnings in non-alcoholic NASH domains.";
    }
    return "Induced as a preemptive warning vector. Deviations in sedentary timing (> 6h sitting) and high inflammatory stress levels represent active cellular risk factors.";
  };

  // Risk progression calculation (Week 1 vs Week 2 etc.)
  const activeRecordIdx = chronologicalRecords.findIndex((r) => r.id === selectedRecordId);
  const currentRecord = chronologicalRecords[activeRecordIdx] || chronologicalRecords[chronologicalRecords.length - 1];

  return (
    <div className="space-y-6" id="risk-development-tab-panel">
      
      {/* Risk Title Headers */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Brain className="h-4 w-4 animate-pulse text-red-500" />{t("auto.clinical_prognosis_engine_explainable_ai", "Clinical Prognosis Engine (Explainable AI Version)")}

          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{t("auto.risk_development_curves", "Risk Development Curves")}</h2>
          <p className="text-xs text-slate-500">{t("auto.plotting_chronological_disease_risk_prog", "Plotting chronological disease risk progression and deviations beyond target safety references.")}

          </p>
        </div>
      </div>

      {/* Grid of Disease risk progression line graphs (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Curve panel */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-[#161616]">
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />{t("auto.chronological_development_curve", "Chronological Development Curve")}

              </h3>
              <p className="text-[10px] text-slate-500">{t("auto.historical_disease_probability_trends_ma", "Historical disease probability trends mapped across sessions")}</p>
            </div>

            <div className="flex gap-1 bg-[#101010] p-1 rounded-lg border border-[#1A1A1A]">
              {["Cardiovascular", "Metabolic", "Kidney", "Liver"].map((type) =>
              <button
                key={type}
                onClick={() => setSelectedDiseaseType(type)}
                className={`text-[9px] px-2.5 py-1.5 rounded font-bold uppercase cursor-pointer ${
                selectedDiseaseType === type ?
                "bg-emerald-500 text-black" :
                "text-slate-400 hover:text-white"}`
                }>
                
                  {type}
                </button>
              )}
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-64 mt-4 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151515" />
                <XAxis dataKey="label" stroke="#444" />
                <YAxis stroke="#444" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0C0C0C", borderColor: "#222", borderRadius: "8px" }}
                  itemStyle={{ color: "#FFF", fontFamily: "monospace" }}
                  labelStyle={{ color: "#888" }} />
                
                <Line
                  type="monotone"
                  dataKey={selectedDiseaseType}
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 1 }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Temporal shift explanation */}
          <div className="bg-[#050505] border border-[#161616] rounded-xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#E0E0E0] flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-400" />{t("auto.dynamic_shift_insights_explainable_ai", "Dynamic Shift Insights (Explainable AI)")}

            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{t("auto.comparing_your_chronological_datasets_gi", "Comparing your chronological datasets gives a clear indication of metabolic resilience:")}

              {chartData.length >= 2 ?
              <>
                  {" "}{t("auto.at", "At")}<span className="text-white font-mono">{chartData[0].name}{t("auto.session_1", "(Session 1)")}</span>{t("auto.your", ", your")}{selectedDiseaseType}{t("auto.risk_index_was", "risk index was")}<span className="text-red-400 font-mono font-bold">{initialRiskVal}%</span>{t("auto.by", ". \n                  By")}
                <span className="text-white font-mono">{chartData[chartData.length - 1].name}{t("auto.session", "(Session")}{chartData.length})</span>{t("auto.it_altered_to", ", it altered to")}<span className="text-red-400 font-mono font-bold">{currentRiskVal}%</span>{t("auto.this_represents_a_net_shift_of", ". \n                  This represents a net shift of")}
                {" "}
                  <span className={`${riskValDiff >= 0 ? "text-red-400" : "text-emerald-400"} font-mono font-bold`}>
                    {riskValDiff > 0 ? "+" : ""}{riskValDiff.toFixed(0)}%
                  </span>.
                </> :

              " Please complete a secondary assessment at a future date (simulating week 2) to unlock automatic chronological risk delta shifts (e.g. week 1 = 15%, week 2 = 25%)."
              }
            </p>
          </div>
        </div>

        {/* Explainable AI Risk Classifier Panel */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 font-mono">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />{t("auto.predicted_disease_classified_risk_index", "Predicted Disease Classified Risk Index")}

          </h3>

          <div className="space-y-3.5 h-[390px] overflow-y-auto pr-1">
            {predictions.map((p, index) => {
              const style = getSeverityStyle(p.severity);
              return (
                <div
                  key={index}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] p-4.5 rounded-2xl space-y-3 hover:border-[#222] transition-colors">
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-white block uppercase tracking-tight">{p.name}</span>
                      <span className="text-[9px] text-slate-550 block font-mono">{t("auto.timeline_projection", "Timeline Projection:")}{p.timeline}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white font-mono block">{p.probability}%</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black font-mono border ${style}`}>
                        {p.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed bg-[#050505] p-2.5 rounded-lg border border-[#121212]">
                    <span className="font-bold text-white block uppercase text-[8px] tracking-wider mb-0.5 mb-1 text-emerald-400 flex items-center gap-1">
                      <Brain className="h-3 w-3" />{t("auto.explainable_ai_diagnostic_rule", "Explainable AI Diagnostic Rule:")}
                    </span>
                    {getExplainableExplanation(p)}
                  </p>

                  <div className="p-2 border border-dashed border-[#1C1C1C] rounded-lg text-[9px] text-slate-500 font-mono flex flex-wrap gap-1 items-center">
                    <span className="font-bold uppercase text-slate-400">{t("auto.trigger_indices", "Trigger Indices:")}</span>
                    {p.triggers.map((trig, tIdx) =>
                    <span key={tIdx} className="bg-neutral-900 border border-[#222] px-1.5 py-0.5 rounded text-slate-300">
                        {trig}
                      </span>
                    )}
                  </div>
                </div>);

            })}
          </div>
        </div>

      </div>

    </div>);

}