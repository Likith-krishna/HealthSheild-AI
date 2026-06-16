import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { TrendingUp, Clock, AlertTriangle, Sparkles, Activity, ShieldCheck, Heart, Info } from "lucide-react";

interface TimelineAnalyticsPageProps {
  timelineRecords: any[];
}

export default function TimelineAnalyticsPage({ timelineRecords }: TimelineAnalyticsPageProps) {
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    healthScore: true,
    nutritionScore: true,
    sleepScore: true,
    stressScore: true,
    activityScore: true
  });

  if (timelineRecords.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black uppercase text-white tracking-wider">No Health Archive Records</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log your health metrics to generate chronological timeline analytics graphs.
        </p>
      </div>
    );
  }

  // Build metrics for all historical records
  const chronologicalRecords = [...timelineRecords].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const chartData = chronologicalRecords.map((rec, idx) => {
    const timestampStr = new Date(rec.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const weekLabel = `WK ${idx + 1}`;

    const lifestyle = rec.lifestyle || {};
    const nutrition = rec.nutrition || {};

    const sleepDuration = parseFloat(lifestyle.sleepDuration) || 7;
    const sleepQuality = parseFloat(lifestyle.sleepQuality) || 3;
    const sleepVal = Math.min(100, Math.round((sleepDuration / 8) * 70 + (sleepQuality / 5) * 30));

    const stressLevel = parseFloat(lifestyle.stressLevel) || 5;
    const stressVal = Math.max(10, Math.round(100 - stressLevel * 9));

    const steps = rec.wearableDetails?.steps || 0;
    const activityVal = steps > 0 
      ? Math.min(100, Math.round((steps / 10000) * 100))
      : (lifestyle.physicalActivity === "High" ? 90 : lifestyle.physicalActivity === "Moderate" ? 75 : lifestyle.physicalActivity === "Low" ? 50 : 30);

    const junkFreq = parseFloat(nutrition.junkFood) || 5;
    const sugarFreq = parseFloat(nutrition.sugar) || 5;
    const waterIntake = parseFloat(nutrition.water) || 2;
    const nutritionVal = Math.max(30, Math.min(100, Math.round(100 - junkFreq * 4 - sugarFreq * 3 + (waterIntake >= 2 ? 10 : 0))));

    return {
      name: timestampStr,
      label: weekLabel,
      healthScore: rec.analysisResults?.healthScore?.score || 75,
      nutritionScore: nutritionVal,
      sleepScore: sleepVal,
      stressScore: stressVal,
      activityScore: activityVal
    };
  });

  const toggleLine = (key: string) => {
    setActiveLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRecentAssessments = () => {
    if (chartData.length < 2) return null;
    const latest = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    return { latest, prev };
  };

  const trendRef = getRecentAssessments();

  return (
    <div className="space-y-6" id="timeline-analytics-tab-panel">
      
      {/* Page Title */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-[#1E1E1E] rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 animate-pulse text-teal-500" />
            Integrative Chronological Analytics Deck
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Timeline Analytics Tracking</h2>
          <p className="text-xs text-slate-500 font-sans">
            Cross-referencing multiple vital coordinates (Sleep, Stress, Nutrition, Workouts) over time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Multiline Graph */}
        <div className="lg:col-span-8 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#161616]">
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1">
                Visual Analytics Plotter
              </h3>
              <p className="text-[10px] text-slate-550">Click legend tags below to toggle specific line visibilities</p>
            </div>

            {/* Manual Legend Switces */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "healthScore", label: "Health Score", color: "#10b981" },
                { key: "nutritionScore", label: "Nutrition", color: "#f59e0b" },
                { key: "sleepScore", label: "Sleep", color: "#3b82f6" },
                { key: "stressScore", label: "Stress Resilience", color: "#a855f7" },
                { key: "activityScore", label: "Activity", color: "#14b8a6" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleLine(item.key)}
                  className={`text-[9px] px-2.5 py-1.5 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                    activeLines[item.key]
                      ? "bg-slate-900 text-white"
                      : "bg-[#050505] text-slate-600 border-transparent opacity-40 hover:opacity-75"
                  }`}
                  style={{ borderLeftColor: activeLines[item.key] ? item.color : "transparent", borderWidth: activeLines[item.key] ? "2px" : "1px" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 mt-4 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151515" />
                <XAxis dataKey="name" stroke="#444" />
                <YAxis stroke="#444" domain={[20, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0C0C0C", borderColor: "#222", borderRadius: "8px" }}
                  labelStyle={{ color: "#888" }}
                />
                
                {activeLines.healthScore && <Line type="monotone" dataKey="healthScore" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />}
                {activeLines.nutritionScore && <Line type="monotone" dataKey="nutritionScore" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />}
                {activeLines.sleepScore && <Line type="monotone" dataKey="sleepScore" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />}
                {activeLines.stressScore && <Line type="monotone" dataKey="stressScore" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />}
                {activeLines.activityScore && <Line type="monotone" dataKey="activityScore" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Early Warning System Panel */}
        <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#151515] pb-3.5">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest leading-tight">Early Warning Signals</h3>
              <p className="text-[10px] text-slate-550 mt-0.5">Automated detection of physiological parameter deviations.</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Real-time calculated health trend */}
            {trendRef ? (
              <div className="bg-[#050505] border border-[#1C1C1C] rounded-xl p-4.5 space-y-3">
                <span className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-wider block font-mono">
                  Trending Analysis (Session Delta)
                </span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Health Balance Variance:</span>
                    <span className={`font-mono font-bold ${trendRef.latest.healthScore >= trendRef.prev.healthScore ? "text-emerald-400" : "text-rose-450"}`}>
                      {trendRef.latest.healthScore >= trendRef.prev.healthScore ? "▲" : "▼"}{" "}
                      {Math.abs(trendRef.latest.healthScore - trendRef.prev.healthScore)} pts
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Allostatic Stress Shift:</span>
                    <span className={`font-mono font-bold ${trendRef.latest.stressScore >= trendRef.prev.stressScore ? "text-emerald-400" : "text-orange-450"}`}>
                      {trendRef.latest.stressScore >= trendRef.prev.stressScore ? "▲" : "▼"}{" "}
                      {Math.abs(trendRef.latest.stressScore - trendRef.prev.stressScore)} pts
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Nutrition Score Variance:</span>
                    <span className={`font-mono font-bold ${trendRef.latest.nutritionScore >= trendRef.prev.nutritionScore ? "text-emerald-400" : "text-orange-450"}`}>
                      {trendRef.latest.nutritionScore >= trendRef.prev.nutritionScore ? "▲" : "▼"}{" "}
                      {Math.abs(trendRef.latest.nutritionScore - trendRef.prev.nutritionScore)} pts
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#121212] text-[10px] text-slate-500 leading-normal flex gap-1.5 items-start">
                  <Info className="h-3.5 w-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                  <span>
                    {trendRef.latest.healthScore < 70 
                      ? "⚠️ Moderate compensation noticed. We recommend physical aerobic workouts immediately."
                      : "🌿 Steady circadian balance. Continue active hydration targets and low glycemic dietary intake."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 border border-dashed border-[#1C1C1C] rounded-xl text-center text-slate-600 text-xs font-semibold">
                Waiting on a second health log to execute dynamic trend variance computations.
              </div>
            )}

            {/* Static early Warning guidelines */}
            <div className="bg-[#050505] border border-[#161616] p-4.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Vulnerability Reference Points
              </span>
              <ul className="space-y-1.5 text-[10px] text-slate-400 leading-relaxed list-disc list-inside">
                <li><strong className="text-slate-300">Stress Balance &lt; 50:</strong> Over-activates blood cortisol, raising arteriole blood pressure and vascular stiffness.</li>
                <li><strong className="text-slate-300">Sleep Duration &lt; 6h:</strong> Impairs insulin clearance efficiency by 30-40% due to cellular wear.</li>
                <li><strong className="text-slate-300">Hydration &lt; 1.5L:</strong> Limits oxygen blood density, creating elevated resting pulse curves.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
