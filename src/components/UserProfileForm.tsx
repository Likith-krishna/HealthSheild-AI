import React from "react";
import { UserProfile } from "../types";
import { Heart, Activity, User, Eye, Sparkles, Flame, Droplet, Smile, Compass } from "lucide-react";

interface UserProfileFormProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function UserProfileForm({ profile, onChange, onAnalyze, loading }: UserProfileFormProps) {
  const handleInputChange = (field: keyof UserProfile, value: any) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  const toggleFamilyHistory = (item: string) => {
    const list = profile.familyHistory.includes(item)
      ? profile.familyHistory.filter((i) => i !== item)
      : [...profile.familyHistory, item];
    handleInputChange("familyHistory", list);
  };

  const toggleExistingCondition = (item: string) => {
    const list = profile.existingConditions.includes(item)
      ? profile.existingConditions.filter((i) => i !== item)
      : [...profile.existingConditions, item];
    handleInputChange("existingConditions", list);
  };

  // Compute live BMI
  const heightInM = profile.height / 100;
  const bmi = heightInM > 0 ? (profile.weight / (heightInM * heightInM)).toFixed(1) : "0.0";
  const numBmi = parseFloat(bmi);
  const bmiStatus =
    numBmi >= 30
      ? { text: "Obese (Stage 1-3)", color: "text-red-500 bg-red-500/10" }
      : numBmi >= 25
      ? { text: "Overweight", color: "text-amber-500 bg-amber-500/10" }
      : numBmi >= 18.5
      ? { text: "Optimal Range", color: "text-emerald-500 bg-emerald-500/10" }
      : { text: "Underweight", color: "text-sky-500 bg-sky-500/10" };

  return (
    <div id="user-profile-form" className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl shadow-xl shadow-black/40 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            Vitals & Biomarkers Intake
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Provide baseline lab details or load sample files inside the report room.
          </p>
        </div>
        <div className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 ${bmiStatus.color}`}>
          <Flame className="h-3.5 w-3.5" />
          <span>Calculated BMI: {bmi} ({bmiStatus.text})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Demographics & Anthropometrics */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Demographic Metrics
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Age</label>
              <input
                id="profile-age"
                type="number"
                value={profile.age}
                onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
              <select
                id="profile-gender"
                value={profile.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Male" className="bg-[#050505] text-white">Male</option>
                <option value="Female" className="bg-[#050505] text-white">Female</option>
                <option value="Other" className="bg-[#050505] text-white">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Heart Rate</label>
              <input
                id="profile-hr"
                type="number"
                value={profile.heartRate}
                onChange={(e) => handleInputChange("heartRate", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                placeholder="60-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Height (cm)</label>
              <input
                id="profile-height"
                type="number"
                value={profile.height}
                onChange={(e) => handleInputChange("height", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Weight (kg)</label>
              <input
                id="profile-weight"
                type="number"
                value={profile.weight}
                onChange={(e) => handleInputChange("weight", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Vitals */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-500" /> Cardiovascular & Metabolic Markers
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>Systolic BP</span>
                <span className="text-[10px] text-slate-500 font-normal">Normal &lt; 120</span>
              </label>
              <div className="relative">
                <input
                  id="profile-sys-bp"
                  type="number"
                  value={profile.systolicBP}
                  onChange={(e) => handleInputChange("systolicBP", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono pr-12"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 uppercase font-medium">mmHg</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>Diastolic BP</span>
                <span className="text-[10px] text-slate-500 font-normal">Normal &lt; 80</span>
              </label>
              <div className="relative">
                <input
                  id="profile-dia-bp"
                  type="number"
                  value={profile.diastolicBP}
                  onChange={(e) => handleInputChange("diastolicBP", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono pr-12"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 uppercase font-medium">mmHg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>Fasting Glucose</span>
                <span className="text-[10px] text-slate-500 font-normal">Healthy &lt; 100</span>
              </label>
              <div className="relative">
                <input
                  id="profile-sugar"
                  type="number"
                  value={profile.bloodSugar}
                  onChange={(e) => handleInputChange("bloodSugar", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono pr-12"
                />
                <span className="absolute right-3 top-1.5 text-[10px] text-slate-500 font-medium">mg/dL</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>HbA1c %</span>
                <span className="text-[10px] text-slate-500 font-normal">&lt; 5.7%</span>
              </label>
              <input
                id="profile-hba1c"
                type="number"
                step="0.1"
                value={profile.hba1c || ""}
                onChange={(e) => handleInputChange("hba1c", parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                placeholder="5.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Total Serum Cholesterol</span>
              <span className="text-[10px] text-slate-500 font-normal">Ideal &lt; 200 mg/dL</span>
            </label>
            <div className="relative">
              <input
                id="profile-chol"
                type="number"
                value={profile.cholesterolTotal}
                onChange={(e) => handleInputChange("cholesterolTotal", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono pr-14"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-medium uppercase">mg/dL</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-[#1A1A1A]" />

      {/* Section 3: Lifestyle Habits */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 text-emerald-400">
          <Activity className="h-3.5 w-3.5 text-emerald-450" /> Core Daily Habits & Behavioral Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tobacco Exposure</label>
            <select
              id="profile-smoking"
              value={profile.smoking}
              onChange={(e) => handleInputChange("smoking", e.target.value)}
              className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Never" className="bg-[#050505] text-white">Never Smoked</option>
              <option value="Former" className="bg-[#050505] text-white">Former Smoker</option>
              <option value="Active" className="bg-[#050505] text-white">Active Smoker</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Alcohol consumption</label>
            <select
              id="profile-alcohol"
              value={profile.alcohol}
              onChange={(e) => handleInputChange("alcohol", e.target.value)}
              className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Never" className="bg-[#050505] text-white">Never</option>
              <option value="Social" className="bg-[#050505] text-white">Socially / Occasional</option>
              <option value="Heavy" className="bg-[#050505] text-white">Heavy Drinker</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex justify-between">
              <span>Sleep Hours</span>
              <span className="text-[10px] text-slate-500">Target 7-8h</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="profile-sleep"
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={profile.sleepHours}
                onChange={(e) => handleInputChange("sleepHours", parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-[#151515] rounded-lg cursor-pointer"
              />
              <span className="text-xs font-semibold text-white font-mono w-10 text-right">{profile.sleepHours}h</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex justify-between">
              <span>Exercise Days / Wk</span>
              <span className="text-[10px] text-slate-500">Target 3-5d</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="profile-exc"
                type="range"
                min="0"
                max="7"
                step="1"
                value={profile.exerciseDays}
                onChange={(e) => handleInputChange("exerciseDays", parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-[#151515] rounded-lg cursor-pointer"
              />
              <span className="text-xs font-semibold text-white font-mono w-10 text-right">{profile.exerciseDays}d</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex justify-between">
              <span>Daily Fluid Hydration</span>
              <span className="text-emerald-400 text-[10px] font-medium">{profile.waterIntake} ml</span>
            </label>
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-sky-400 shrink-0" />
              <input
                id="profile-water"
                type="range"
                min="1000"
                max="4000"
                step="250"
                value={profile.waterIntake}
                onChange={(e) => handleInputChange("waterIntake", parseInt(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-[#151515] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex justify-between">
              <span>Allostatic Stress Index</span>
              <span className="text-amber-500 text-[10px] font-medium">{profile.stressLevel} / 10</span>
            </label>
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-amber-500 shrink-0" />
              <input
                id="profile-stress"
                type="range"
                min="1"
                max="10"
                step="1"
                value={profile.stressLevel}
                onChange={(e) => handleInputChange("stressLevel", parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-[#151515] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nutrition Style</label>
            <select
              id="profile-diet"
              value={profile.dietType}
              onChange={(e) => handleInputChange("dietType", e.target.value)}
              className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Standard" className="bg-[#050505] text-white">Standard Western Diet</option>
              <option value="Mediterranean" className="bg-[#050505] text-white">Mediterranean Cardioprotective Diet</option>
              <option value="Keto" className="bg-[#050505] text-white">Ketogenic High-Fat Diet</option>
              <option value="Vegan" className="bg-[#050505] text-white">Whole Foods Vegan Diet</option>
              <option value="Low-Carb" className="bg-[#050505] text-white">Low-Carbohydrate Diet</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-[#1A1A1A]" />

      {/* Section 4: History checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Compass className="h-3.5 w-3.5" /> First-Degree Family Medical History
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {["Heart Disease", "Diabetes", "Hypertension", "Stroke", "Dementia / Alzheimer's", "Kidney Dysfunction"].map((item) => {
              const active = profile.familyHistory.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  id={`fam-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleFamilyHistory(item)}
                  className={`px-3 py-2 rounded-xl text-xs text-left font-medium border transition-all cursor-pointer ${
                    active
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-[#1A1A1A] bg-[#0A0A0A] hover:bg-[#151515] text-[#A0A0A0]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-[#E0E0E0]" /> Self Clinical History
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {["Obesity", "Pre-Diabetes", "High Cholesterol", "Asthma", "Chronic Fatigue", "Liver Fat Accumulation"].map((item) => {
              const active = profile.existingConditions.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  id={`self-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleExistingCondition(item)}
                  className={`px-3 py-2 rounded-xl text-xs text-left font-medium border transition-all cursor-pointer ${
                    active
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-[#1A1A1A] bg-[#0A0A0A] hover:bg-[#151515] text-[#A0A0A0]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Trigger Action */}
      <div className="pt-4 flex">
        <button
          type="button"
          id="btn-analyze-health"
          onClick={onAnalyze}
          disabled={loading}
          className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.99] disabled:opacity-50 transition-all text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Recalibrating Clinical Risk Intelligence...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-black" />
              <span>Simulate Prognosis Prediction Index</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
