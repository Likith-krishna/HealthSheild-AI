import { t } from "i18next";
import React, { useState } from "react";
import { UserProfile, PredictionEngineOutput, DynamicDigitalTwinScenario } from "../types";
import { Users, TrendingDown, RefreshCw, Zap, Sliders, PlayCircle, Plus } from "lucide-react";

interface DigitalTwinProps {
  originalProfile: UserProfile;
  currentEvaluation: PredictionEngineOutput | null;
}

export default function DigitalTwin({ originalProfile, currentEvaluation }: DigitalTwinProps) {
  const [loading, setLoading] = useState(false);
  const [simulatedTwin, setSimulatedTwin] = useState<DynamicDigitalTwinScenario | null>(null);

  // Simulated changes checkbox state
  const [changes, setChanges] = useState({
    stopSmoking: false,
    cardioFit: false,
    healthyDiet: false,
    weightReduction: false,
    sleepRestored: false,
    stressDown: false
  });

  const handleToggleChange = (key: keyof typeof changes) => {
    setChanges((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const triggerSimulation = async () => {
    if (!currentEvaluation) return;
    setLoading(true);

    try {
      const simulatedChanges: Partial<UserProfile> = {};
      if (changes.stopSmoking) simulatedChanges.smoking = "Never";
      if (changes.cardioFit) simulatedChanges.exerciseDays = Math.max(originalProfile.exerciseDays, 4);
      if (changes.healthyDiet) simulatedChanges.dietType = "Mediterranean";
      if (changes.weightReduction) simulatedChanges.weight = Math.round(originalProfile.weight * 0.9); // 10% drop
      if (changes.sleepRestored) simulatedChanges.sleepHours = Math.max(originalProfile.sleepHours, 7.5);
      if (changes.stressDown) simulatedChanges.stressLevel = Math.max(1, originalProfile.stressLevel - 3);

      const response = await fetch("/api/digital-twin-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalProfile,
          simulatedChanges
        })
      });

      const data = await response.json();
      setSimulatedTwin(data);
    } catch (error) {
      console.error("Failed simulating digital twin state:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSimulation = () => {
    setChanges({
      stopSmoking: false,
      cardioFit: false,
      healthyDiet: false,
      weightReduction: false,
      sleepRestored: false,
      stressDown: false
    });
    setSimulatedTwin(null);
  };

  const originalScore = currentEvaluation?.healthScore.score || 72;

  return (
    <div id="digital-twin-component" className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl shadow-black/40 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1A1A1A] pb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />{t("auto.predictive_health_digital_twin_simulator", "Predictive Health Digital Twin Simulator")}

          </h2>
          <p className="text-xs text-slate-500 mt-1">{t("auto.simulate_how_clinical_values_and_daily_l", "Simulate how clinical values and daily lifestyle overhauls shift your predictive lifetime disease curves.")}

          </p>
        </div>

        {simulatedTwin &&
        <button
          type="button"
          id="twin-clear"
          onClick={clearSimulation}
          className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1.5 cursor-pointer underline decoration-dotted">
          
            <RefreshCw className="h-3 w-3" />{t("auto.reset_variables", "Reset Variables")}
        </button>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Toggleable modifications sandbox */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" />{t("auto.behavior_sandboxing", "Behavior Sandboxing")}
          </h3>

          <div className="space-y-2.5">
            {[
            {
              id: "stopSmoking",
              label: "🚭 Tobacco Cessation",
              desc: "Remnants of oxidized compounds disappear, restoring coronary arterial inner walls.",
              active: changes.stopSmoking,
              applicable: originalProfile.smoking !== "Never"
            },
            {
              id: "cardioFit",
              label: "🏋️ Dynamic Aerobic Fitness (4d/wk)",
              desc: "Promotes biological insulin sensitivity & dilates vessels through higher Nitric Oxide.",
              active: changes.cardioFit,
              applicable: originalProfile.exerciseDays < 4
            },
            {
              id: "healthyDiet",
              label: "🥗 Mediterranean Nutrition",
              desc: "Substitutes saturated trans fats with soluble fiber and cardiac mono-unsaturated lipids.",
              active: changes.healthyDiet,
              applicable: originalProfile.dietType !== "Mediterranean"
            },
            {
              id: "weightReduction",
              label: "⚖️ Achieved 10% Weight Loss",
              desc: "Decongests lipogenesis pathways inside hepatocytes and visceral fat pockets.",
              active: changes.weightReduction,
              applicable: true
            },
            {
              id: "sleepRestored",
              label: "💤 Resilient Sleep Synchronization",
              desc: "Optimizes deep non-REM recovery, naturally lowering cardiac sympathetic load.",
              active: changes.sleepRestored,
              applicable: originalProfile.sleepHours < 7.5
            },
            {
              id: "stressDown",
              label: "🧘 Vagal Autonomic Calm (-3 Stress)",
              desc: "Dampens sustained allostatic cortisol, stabilizing systemic vascular tension.",
              active: changes.stressDown,
              applicable: originalProfile.stressLevel > 4
            }].
            map((item) => {
              if (!item.applicable) return null;
              return (
                <button
                  key={item.id}
                  id={`twin-opt-${item.id}`}
                  type="button"
                  onClick={() => handleToggleChange(item.id as any)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  item.active ?
                  "border-emerald-500 bg-emerald-500/10 shadow-sm" :
                  "border-[#1A1A1A] hover:bg-[#151515] bg-[#0A0A0A]/60"}`
                  }>
                  
                  <div className={`mt-0.5 rounded border h-4.5 w-4.5 flex items-center justify-center transition-colors shrink-0 ${
                  item.active ? "border-emerald-500 bg-emerald-500 text-black font-extrabold" : "border-[#333]"}`
                  }>
                    {item.active && <span className="text-[10px] font-extrabold text-[#050505]">✓</span>}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block leading-normal">{item.desc}</span>
                  </div>
                </button>);

            })}
          </div>

          <button
            id="twin-run-simulation"
            type="button"
            onClick={triggerSimulation}
            disabled={loading || !currentEvaluation}
            className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-black py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition-all select-none">
            
            {loading ?
            <>
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{t("auto.re_modeling_vascular_and_metabolic_traje", "Re-modeling vascular and metabolic trajectories...")}</span>
              </> :

            <>
                <PlayCircle className="h-4 w-4 text-black" />
                <span>{t("auto.synchronize_digital_twin_state", "Synchronize Digital Twin State")}</span>
              </>
            }
          </button>
        </div>

        {/* Comparative Digital Twin dashboard outputs */}
        <div className="lg:col-span-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 flex flex-col justify-between">
          {!simulatedTwin ?
          <div id="twin-empty-result" className="my-auto text-center space-y-3 p-6">
              <div className="h-12 w-12 bg-[#0F0F0F] rounded-2xl flex items-center justify-center border border-[#1A1A1A] text-slate-500 mx-auto">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("auto.awaiting_simulation", "Awaiting Simulation")}</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal">{t("auto.toggle_structural_behaviors_on_the_left", "Toggle structural behaviors on the left panel, and initialize modeling to overlay optimized future health score lines over your baseline.")}

            </p>
            </div> :

          <div id="twin-active-result" className="space-y-5 animate-fade-in">
              <div className="flex border-b border-[#1A1A1A] pb-3 flex-wrap gap-4 items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t("auto.digital_twin_scenario_executed", "Digital Twin Scenario Executed")}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{t("auto.comparison_model_overlay_vs_default", "Comparison model overlay vs default")}</p>
                </div>
                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">{t("auto.simulation_active", "Simulation: Active")}

              </div>
              </div>

              {/* Health Score comparative graph widget */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{t("auto.before_score", "Before Score")}</span>
                  <div className="text-xl font-extrabold text-slate-400 font-mono mt-1">{simulatedTwin.overallHealthScoreBefore}</div>
                  <div className="text-[9px] text-slate-500 font-medium font-mono">{t("auto.standard_life", "Standard Life")}</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 font-mono">
                    <TrendingDown className="h-3.5 w-3.5 transform rotate-180" />
                    <span>+{simulatedTwin.overallHealthScoreAfter - simulatedTwin.overallHealthScoreBefore}{t("auto.pts", "pts")}</span>
                  </div>
                  <div className="w-16 h-0.5 bg-[#1A1A1A] relative mt-2">
                    <div className="absolute top-1/2 left-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{t("auto.after_score", "After Score")}</span>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">{simulatedTwin.overallHealthScoreAfter}</div>
                  <div className="text-[10px] text-emerald-400 font-extrabold uppercase mt-0.5">{t("auto.optimum_state", "Optimum State")}</div>
                </div>
              </div>

              {/* Diseases Risks Impact overlay */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.risk_projection_deflections", "Risk Projection Deflections:")}</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {simulatedTwin.impact.map((imp, idx) => {
                  const diff = imp.beforeProbability - imp.afterProbability;
                  return (
                    <div key={idx} className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-3 flex items-center justify-between text-xs hover:border-[#1E1E1E] transition-colors">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block truncate max-w-[140px] md:max-w-xs">{imp.diseaseName}</span>
                          <span className="text-[9px] text-slate-400 font-medium block">{t("auto.baseline", "Baseline:")}
                          {imp.beforeProbability}{t("auto.optimized", "% | Optimized:")}{imp.afterProbability}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 bg-[#1D1D1D] h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#333] h-full" style={{ width: `${imp.afterProbability}%` }} />
                            <div className="bg-emerald-500 h-full" style={{ width: `${diff}%` }} />
                          </div>
                          {diff > 0 ?
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              -{diff}{t("auto.risk", "% Risk")}
                        </span> :

                        <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5">{t("auto.no_deflection", "No deflection")}</span>
                        }
                        </div>
                      </div>);

                })}
                </div>
              </div>

              {/* Twin Timeline commentary */}
              {simulatedTwin.timelineEstimate &&
            <div className="text-[10px] bg-emerald-500/5 text-slate-300 border border-emerald-500/10 p-3 rounded-xl leading-relaxed mt-2">
                  <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5 text-emerald-405">{t("auto.estimated_physical_convergence_target", "Estimated physical Convergence Target:")}</span>
                  {simulatedTwin.timelineEstimate}
                </div>
            }
            </div>
          }
        </div>

      </div>
    </div>);

}