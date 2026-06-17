import { t } from "i18next";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Sparkles,
  Upload,
  Heart,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkle,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  X,
  Plus,
  Send,
  Loader2,
  ThumbsUp,
  FileCheck,
  ShieldCheck,
  RefreshCw } from
"lucide-react";
import { medicalKnowledgeBase } from "../data/medicalKnowledgeBase";

interface SimplifiedReportParam {
  name: string;
  value: number;
  unit: string;
  normalRange: string;
}

interface ExplanationItem {
  parameter: string;
  value: string;
  normalRange: string;
  status: "Healthy" | "A Bit High" | "A Bit Low" | "Needs Attention";
  whatItIs: string;
  explanation: string;
  impact: string;
  actions: string[];
}

interface DiseaseRiskItem {
  disease: string;
  riskText: string;
  linkage: string;
}

interface RecommendationCard {
  title: string;
  description: string;
  category: "hydration" | "sugars" | "fats" | "sleep" | "movement";
}

interface SimplifiedReportData {
  healthScore: number;
  overallStatusText: string;
  statusColor: string;
  healthSummary: {
    goodNews: string[];
    needsAttention: string[];
    focusAreas: string[];
  };
  explanations: ExplanationItem[];
  diseaseRisks: DiseaseRiskItem[];
  personalizedRecommendations: RecommendationCard[];
}

export default function ReportSimplifierPage({ user }: {user: any;}) {
  // Input parameters state
  const [params, setParams] = useState<SimplifiedReportParam[]>([
  { name: "Fasting Blood Sugar", value: 112, unit: "mg/dL", normalRange: "70 - 99" },
  { name: "HbA1c", value: 6.2, unit: "%", normalRange: "Below 5.7" },
  { name: "LDL Cholesterol", value: 165, unit: "mg/dL", normalRange: "Under 100" },
  { name: "HDL Cholesterol", value: 38, unit: "mg/dL", normalRange: "Over 50" },
  { name: "Creatinine", value: 1.5, unit: "mg/dL", normalRange: "0.7 - 1.3" },
  { name: "Systolic Blood Pressure", value: 135, unit: "mmHg", normalRange: "90 - 119" }]
  );

  // UI state
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [reportResult, setReportResult] = useState<SimplifiedReportData | null>(null);

  // Custom single-add parameter state
  const [newParamName, setNewParamName] = useState("");
  const [newParamVal, setNewParamVal] = useState("");
  const [newParamUnit, setNewParamUnit] = useState("mg/dL");
  const [newParamRange, setNewParamRange] = useState("");

  // Loading state fun messages changer index
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const loadingPhrases = [
  "Summoning the blood-vessel sweeper squad...",
  "Rinsing out the kidney water filters...",
  "Measuring the blood-sugar monster's tail...",
  "Translating complex alien doctor documents into kid-speak...",
  "Inspecting your oxygen freight truck fleet...",
  "Packing healthy action items into your guide map..."];


  // AI Chat states
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "model";content: string;}[]>([
  {
    role: "model",
    content: "Hello friend! I am your companion AI Doctor here to simplify your test scores! Pick any metric card or type double-puzzles above, or ask me directly: 'What is LDL?' or 'Why is my sugar high?'"
  }]
  );
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Rotate loading phrases
  useEffect(() => {
    let interval: any;
    if (analysisLoading) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingPhrases.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [analysisLoading]);

  // Scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // Preset Options
  const presets = [
  {
    title: "🧪 Blood Sugar & Diabetes Flag",
    description: "Mild sugar level elevation with HbA1c pre-diabetes markers",
    items: [
    { name: "Fasting Blood Sugar", value: 128, unit: "mg/dL", normalRange: "70 - 99" },
    { name: "HbA1c", value: 6.8, unit: "%", normalRange: "Below 5.7" },
    { name: "LDL Cholesterol", value: 92, unit: "mg/dL", normalRange: "Under 100" },
    { name: "HDL Cholesterol", value: 52, unit: "mg/dL", normalRange: "Over 50" },
    { name: "Creatinine", value: 0.9, unit: "mg/dL", normalRange: "0.7 - 1.3" },
    { name: "Systolic Blood Pressure", value: 115, unit: "mmHg", normalRange: "90 - 119" }]

  },
  {
    title: "🍔 High Fats & Cholesterol Plaque",
    description: "Elevated bad fats (LDL) risk with borderline pressure squeeze",
    items: [
    { name: "Fasting Blood Sugar", value: 94, unit: "mg/dL", normalRange: "70 - 99" },
    { name: "HbA1c", value: 5.2, unit: "%", normalRange: "Below 5.7" },
    { name: "LDL Cholesterol", value: 174, unit: "mg/dL", normalRange: "Under 100" },
    { name: "HDL Cholesterol", value: 34, unit: "mg/dL", normalRange: "Over 50" },
    { name: "Creatinine", value: 1.1, unit: "mg/dL", normalRange: "0.7 - 1.3" },
    { name: "Systolic Blood Pressure", value: 138, unit: "mmHg", normalRange: "90 - 119" }]

  },
  {
    title: "🌿 Splendidly Clean Health Star",
    description: "Perfect optimal markers inside every biological threshold",
    items: [
    { name: "Fasting Blood Sugar", value: 82, unit: "mg/dL", normalRange: "70 - 99" },
    { name: "HbA1c", value: 5.0, unit: "%", normalRange: "Below 5.7" },
    { name: "LDL Cholesterol", value: 85, unit: "mg/dL", normalRange: "Under 100" },
    { name: "HDL Cholesterol", value: 58, unit: "mg/dL", normalRange: "Over 50" },
    { name: "Creatinine", value: 0.8, unit: "mg/dL", normalRange: "0.7 - 1.3" },
    { name: "Systolic Blood Pressure", value: 112, unit: "mmHg", normalRange: "90 - 119" }]

  }];


  // OCR file handler
  const processUploadedFile = (file: File) => {
    setUploadError("");
    setFileLoading(true);

    const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".log");

    if (isText) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const textContent = e.target?.result as string || "";
          await sendAndAnalyze(textContent, file.name, null);
        } catch (err: any) {
          console.error("Text processing error:", err);
          setUploadError("Could not process report text.");
          setFileLoading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read the text file.");
        setFileLoading(false);
      };
      reader.readAsText(file);
    } else {
      // PDF or Image
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string || "";
          const base64Index = result.indexOf(";base64,");
          if (base64Index === -1) {
            throw new Error("Could not find standard base64 signature in document reader.");
          }
          const base64Data = result.substring(base64Index + 8);
          await sendAndAnalyze("", file.name, {
            mimeType: file.type || "application/pdf",
            data: base64Data
          });
        } catch (err: any) {
          console.error("Binary document conversion failed:", err);
          setUploadError("Failed to convert document file for OCR.");
          setFileLoading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read the binary file.");
        setFileLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendAndAnalyze = async (
  reportText: string,
  filename: string,
  fileData: {mimeType: string;data: string;} | null) =>
  {
    try {
      const response = await fetch("/api/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText,
          filename,
          fileData
        })
      });

      if (!response.ok) throw new Error("Could not contact cognitive document parser.");
      const parsed = await response.json();

      if (parsed && parsed.biomarkersFound && parsed.biomarkersFound.length > 0) {
        const newExtracted = parsed.biomarkersFound.map((b: any) => {
          let rawVal = parseFloat(b.value.replace(/[^0-9.]/g, ""));
          return {
            name: b.name,
            value: isNaN(rawVal) ? 100 : rawVal,
            unit: b.value.replace(/[0-9.]/g, "").trim() || "mg/dL",
            normalRange: b.normalRange || "Optimal reference range"
          };
        });
        setParams(newExtracted);
        setUploadError("");

        // Auto trigger high-fidelity 10yo breakdown immediately for premium user experience!
        await runAutoSimplification(newExtracted);
      } else {
        throw new Error("AI parser didn't extract any active biomarkers from the clinical document.");
      }
    } catch (err: any) {
      console.error("AI Parser failed:", err);
      setUploadError("The AI couldn't read target biomarkers from this lab document. Please check the text or add them manually.");
    } finally {
      setFileLoading(false);
    }
  };

  const runAutoSimplification = async (paramsToAnalyze: SimplifiedReportParam[]) => {
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/generate-simplified-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: localStorage.getItem("aegis_preferred_lang") || "en",
          parameters: paramsToAnalyze,
          user: user
        })
      });

      if (!res.ok) throw new Error("Simplifier analysis failed");
      const data: SimplifiedReportData = await res.json();
      setReportResult(data);

      setChatHistory([
      {
        role: "model",
        content: `Hi there! I've loaded your pediatric report. Your overall biological factory score is **${data.healthScore}/100** which stands for **"${data.overallStatusText}"**! Click any of the interactive card items above to learn details about it in kid-analogies, or type any custom questions you have here below!`
      }]
      );
    } catch (err) {
      console.error("Auto simplifier extraction failed:", err);
      setUploadError("Failed to automatically synthesize report analysis. Please try clicking the action button manually.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Add individual param manually
  const handleAddNewParam = () => {
    if (!newParamName || !newParamVal) return;
    const val = parseFloat(newParamVal);
    if (isNaN(val)) return;

    // Detect fallback range and unit if empty
    let unitResolved = newParamUnit || "mg/dL";
    let rangeResolved = newParamRange;
    if (!rangeResolved) {
      const match = medicalKnowledgeBase.find((kb) => kb.name.toLowerCase().includes(newParamName.toLowerCase()));
      rangeResolved = match ? match.normalRangeText : "Normal bounds";
      unitResolved = match ? match.unit : unitResolved;
    }

    const updated = [...params, {
      name: newParamName,
      value: val,
      unit: unitResolved,
      normalRange: rangeResolved
    }];

    setParams(updated);
    setNewParamName("");
    setNewParamVal("");
    setNewParamRange("");
  };

  // Remove param
  const handleRemoveParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  // Request high fidelity AI 10yo breakdown from server
  const handleGenerateSimplifiedAnalysis = async () => {
    await runAutoSimplification(params);
  };

  // AI chat question submitter
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/simplify-report-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: localStorage.getItem("aegis_preferred_lang") || "en",
          message: userMsg,
          reportData: reportResult,
          chatHistory: chatHistory
        })
      });

      if (!res.ok) throw new Error("Chat model failure");
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "model", content: data.response || "I didn't catch that, can you repeat in kid terms?" }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: "model", content: "Oops, my pediatric brain took a quick nap! Let's talk about blood sweepers, what would you like to know?" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Pre-loaded rapid questions
  const quickQuestions = [
  "What is bad cholesterol (LDL)?",
  "Why is my sugar level high?",
  "How do my kidneys clean blood?",
  "How can I reduce blood pressure?",
  "What should I eat to stay strong?"];


  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 md:px-4 py-2 animate-fade-in text-slate-100">
      
      {/* HEADER HERO AREA */}
      <div className="relative bg-gradient-to-r from-[#0C120C] via-[#0D0D11] to-[#120F0C] border border-[#1A1A22] rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-505/20 rounded-full uppercase">
              <Award className="h-3.5 w-3.5 text-emerald-450 animate-pulse" />{t("auto.patient_age_10_simplifier_mode_live", "Patient Age-10 Simplifier Mode Live")}

            </div>
            <h1 className="text-2xl md:text-3.5xl font-black text-white uppercase tracking-tight leading-none">{t("auto.explain_my_report", "Explain My Report")}
              <span className="text-emerald-400">{t("auto.like_i_m_10", "Like I'm 10")}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium">{t("auto.simple_health_no_scary_jargon_turn_conf", "\"Simple health. No scary jargon.\" Turn confusing, scientific laboratory spreadsheets and blood test values into custom-styled stories, friendly home analogies, and simple quests that anyone can understand!")}

            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400">
                10
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{t("auto.reading_level", "Reading Level")}</span>
                <span className="text-xs font-extrabold text-slate-200">{t("auto.friendly_pediatric", "Friendly Pediatric")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT ZONE (UPLOAD / MANUAL FORM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SOURCE DATA INGEST */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#171717] rounded-3xl p-5 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-[#141414] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-emerald-400" />{t("auto.1_laboratory_data_input", "1. Laboratory Data Input")}

                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{t("auto.upload_a_scanned_file_choose_a_preset_or", "Upload a scanned file, choose a preset, or type values manually.")}</p>
              </div>
              <button
                onClick={() => setParams([
                { name: "Fasting Blood Sugar", value: 110, unit: "mg/dL", normalRange: "70 - 99" },
                { name: "HbA1c", value: 6.0, unit: "%", normalRange: "Below 5.7" },
                { name: "LDL Cholesterol", value: 155, unit: "mg/dL", normalRange: "Under 100" }]
                )}
                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title={t("auto.reset_parameter_block", "Reset parameter block")}>
                
                <RotateCcw className="h-3 w-3" />{t("auto.clear", "Clear")}
              </button>
            </div>

            {/* PRESETS BUTTONS */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t("auto.choose_demo_scenario_preset", "Choose Demo Scenario Preset:")}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((p, idx) =>
                <button
                  key={idx}
                  onClick={() => {
                    setParams(p.items);
                    setUploadError("");
                  }}
                  className="p-2.5 rounded-xl border border-[#1D1D22] bg-[#0E0E12] hover:bg-[#15151B] text-left hover:border-emerald-500/20 group transition-all cursor-pointer">
                  
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 block truncate">{p.title.split(" ")[0]} {p.title.split(" ").slice(1).join(" ")}</span>
                    <span className="text-[9px] text-slate-500 block truncate mt-0.5">{p.description}</span>
                  </button>
                )}
              </div>
            </div>

            {/* DRAG-ZONE */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t("auto.or_upload_laboratory_sheet", "Or upload laboratory sheet:")}</span>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload-dialog")?.click()}
                className={`border-2 border-dashed p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver ?
                "border-emerald-400 bg-emerald-500/10 text-emerald-300 scale-[0.98]" :
                "border-[#1E1E22] bg-[#050505] hover:bg-[#08080B] text-slate-450 hover:border-emerald-500/30"}`
                }>
                
                <input
                  id="file-upload-dialog"
                  type="file"
                  className="hidden"
                  accept=".txt,.csv,.json,.log,.pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processUploadedFile(e.target.files[0]);
                    }
                  }} />
                
                
                {fileLoading ?
                <div className="flex flex-col items-center py-2">
                    <Loader2 className="h-6 w-6 text-emerald-400 animate-spin mb-2" />
                    <span className="text-[11px] font-bold text-white">{t("auto.extracting_raw_markers_via_cognitive_ocr", "Extracting raw markers via Cognitive OCR...")}</span>
                  </div> :

                <>
                    <Upload className="h-6 w-6 text-emerald-500/50 group-hover:text-emerald-400 mb-1.5" />
                    <span className="text-xs font-bold text-white block">{t("auto.drop_blood_work_report_here", "Drop blood work report here")}</span>
                    <span className="text-[10px] text-slate-500 block">{t("auto.or_browse_files_pdf_jpg_png_txt_csv", "or browse files (PDF, JPG, PNG, TXT, CSV)")}</span>
                  </>
                }
              </div>
              {uploadError &&
              <div className="p-2 border border-red-500/20 bg-red-500/10 rounded-xl text-[10px] text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              }
            </div>

            {/* MANUAL MANAGE TABLE */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t("auto.active_biomarkers_for_simplify_table", "Active Biomarkers For Simplify Table:")}</span>
              
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {params.length === 0 ?
                <div className="p-4 border border-[#161616] rounded-xl text-center text-[11px] text-slate-600 font-mono">{t("auto.empty_board_choose_a_preset_or_type_belo", "Empty board. Choose a preset or type below.")}

                </div> :

                params.map((p, idx) =>
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-[#121215] hover:border-[#1E1E25] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <div>
                          <span className="text-xs font-bold text-white block leading-none">{p.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{t("auto.ideal_range", "Ideal range:")}{p.normalRange} {p.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-100 font-mono">{p.value}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{p.unit}</span>
                        </div>
                        <button
                      onClick={() => handleRemoveParam(idx)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
                      
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                )
                }
              </div>

              {/* ADD CUSTOM FIELD IN-LINE */}
              <div className="bg-[#050505] border border-[#151515] p-3 rounded-2xl space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">{t("auto.add_custom_missing_parameter_manually", "Add Custom / Missing Parameter Manually:")}</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={t("auto.e_g_total_cholesterol", "e.g. Total Cholesterol")}
                    value={newParamName}
                    onChange={(e) => setNewParamName(e.target.value)}
                    className="px-2.5 py-1.5 text-[11px] rounded-lg bg-black border border-[#1D1D22] text-white focus:border-emerald-500/40" />
                  
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="any"
                      placeholder={t("auto.value_e_g_185", "Value (e.g. 185)")}
                      value={newParamVal}
                      onChange={(e) => setNewParamVal(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-black border border-[#1D1D22] text-white focus:border-emerald-500/40 font-mono" />
                    
                    <button
                      onClick={handleAddNewParam}
                      type="button"
                      className="px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors">
                      
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newParamUnit}
                    onChange={(e) => setNewParamUnit(e.target.value)}
                    className="px-2.5 py-1 text-[10px] rounded-lg bg-black border border-[#1D1D22] text-slate-400">
                    
                    <option value="mg/dL">{t("auto.mg_dl", "mg/dL")}</option>
                    <option value="%">%</option>
                    <option value="mmHg">{t("auto.mmhg", "mmHg")}</option>
                    <option value="g/dL">{t("auto.g_dl", "g/dL")}</option>
                    <option value="U/L">{t("auto.u_l", "U/L")}</option>
                    <option value="/mcL">{t("auto.mcl", "/mcL")}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t("auto.norm_range_e_g_200", "Norm Range (e.g. < 200)")}
                    value={newParamRange}
                    onChange={(e) => setNewParamRange(e.target.value)}
                    className="px-2.5 py-1 text-[10px] rounded-lg bg-black border border-[#1D1D22] text-slate-400" />
                  
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={handleGenerateSimplifiedAnalysis}
            disabled={analysisLoading || params.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/5 cursor-pointer select-none disabled:opacity-40 transition-all mt-6">
            
            {analysisLoading ?
            <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>{t("auto.simplifying_lab_variables", "Simplifying Lab Variables...")}</span>
              </> :

            <>
                <Sparkles className="h-4 w-4" />
                <span>{t("auto.explain_like_i_m_10_process_ai", "Explain Like I'm 10 (Process AI)")}</span>
              </>
            }
          </button>
        </div>

        {/* RIGHT COLUMN: AGE-10 OUTPUT REPORT SCREEN */}
        <div className="lg:col-span-7 flex flex-col min-h-[550px]">
          
          <AnimatePresence mode="wait">
            
            {/* 1. LOADING SCREEN */}
            {analysisLoading &&
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-[#0A0A0A] border border-[#171717] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
              
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin" />
                  <Heart className="h-7 w-7 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{t("auto.cognitive_simplification_engine_engaged", "Cognitive simplification engine engaged")}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#999] font-mono font-bold">{t("auto.currently", "Currently:")}
                  {loadingPhrases[loadingMessageIdx]}
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-md">{t("auto.gemini_is_packaging_complex_biology_para", "Gemini is packaging complex biology parameters into colorful metaphors, helper teams metrics, and healthy quests! This takes just a moment...")}

              </p>
              </motion.div>
            }

            {/* 2. INITIAL EMPTY SCREEN */}
            {!analysisLoading && !reportResult &&
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-[#0A0A0A] border border-dashed border-[#1A1A22] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-5">
              
                <div className="h-16 w-16 bg-[#0E0E14] border border-[#1E1E25] rounded-3xl flex items-center justify-center text-emerald-400">
                  <BookOpen className="h-7 w-7 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">{t("auto.no_simplified_report_loaded", "No simplified report loaded")}</h4>
                  <p className="text-xs text-slate-400">{t("auto.your_interactive_pediatric_guide_card_is", "Your interactive pediatric guide card is ready to be spawned! Feed the input panel on the left and click the gold")}
                  <strong className="text-emerald-450">{t("auto.explain_like_i_m_10", "Explain Like I'm 10")}</strong>{t("auto.button_to_start", "button to start.")}
                </p>
                </div>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-xl max-w-md leading-relaxed uppercase tracking-wider font-mono">{t("auto.tip_choose_the_blood_sugar_diabetes_fla", "\uD83D\uDCA1 Tip: Choose the \"Blood Sugar & Diabetes Flag\" preset on the left to see the AI report simplifier build immediately!")}

              </div>
              </motion.div>
            }

            {/* 3. SIMPLIFIED RESULTS BOARD VIEW */}
            {!analysisLoading && reportResult &&
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6">
              
                
                {/* CORE HEADER RATING CARD */}
                <div className="bg-gradient-to-br from-[#0F120F] to-[#0A0A0D] border border-[#1A221A] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    
                    {/* Ring score */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="46" stroke="#121512" strokeWidth="9" fill="transparent" />
                        <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke={
                        reportResult.statusColor === "emerald" || reportResult.statusColor === "green" ?
                        "#10b981" :
                        reportResult.statusColor === "amber" ?
                        "#f59e0b" :
                        "#ef4444"
                        }
                        strokeWidth="9"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 46}
                        strokeDashoffset={2 * Math.PI * 46 * (1 - reportResult.healthScore / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out" />
                      
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-black text-white block leading-none font-mono">{reportResult.healthScore}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block mt-0.5">{t("auto.health_point", "Health Point")}</span>
                      </div>
                    </div>

                    {/* Status Text Block */}
                    <div className="text-center sm:text-left space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block font-mono">{t("auto.overall_diagnostic_state", "Overall Diagnostic State:")}</span>
                      <h2 className="text-lg md:text-xl font-extrabold text-[#E5E5E5] uppercase tracking-tight">
                        "{reportResult.overallStatusText}"
                      </h2>
                      <p className="text-[11px] text-slate-400">{t("auto.based_on", "Based on")}
                      {params.length}{t("auto.biomarkers_detected_inside_this_medical", "biomarkers detected inside this medical statement. All clinical terminology has been successfully pediatric-adapted.")}
                    </p>
                    </div>

                  </div>
                </div>

                {/* TWO-COLUMN QUICK SUMMARY SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* GOOD NEWS CHECKLIST */}
                  <div className="bg-[#090C09] border border-[#161F16] rounded-2xl p-4 space-y-3 shadow shadow-emerald-900/5">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-emerald-950/45 pb-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />{t("auto.good_news_checklist", "Good News Checklist")}
                  </h3>
                    <ul className="space-y-2">
                      {reportResult.healthSummary.goodNews.map((g, idx) =>
                    <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-350">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{g}</span>
                        </li>
                    )}
                    </ul>
                  </div>

                  {/* NEEDS ATTENTION ALERTS */}
                  <div className="bg-[#0D0A0A] border border-[#221616] rounded-2xl p-4 space-y-3 shadow shadow-red-950/5">
                    <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-red-950/45 pb-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />{t("auto.needs_caution_flags", "Needs Caution Flags")}
                  </h3>
                    <ul className="space-y-2">
                      {reportResult.healthSummary.needsAttention.map((a, idx) =>
                    <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-350">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 animate-pulse" />
                          <span>{a}</span>
                        </li>
                    )}
                    </ul>
                  </div>

                </div>

                {/* THE PRIORITY ROADMAP QUESTS CARDS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkle className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">{t("auto.active_focus_quests_recommendations", "Active Focus Quests & Recommendations:")}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reportResult.personalizedRecommendations.map((rec, idx) => {
                    const iconsByCat = {
                      hydration: { bg: "bg-sky-500/10 border-sky-500/20 text-sky-400", title: "Water Drop Challenge" },
                      sugars: { bg: "bg-amber-500/10 border-amber-500/20 text-amber-400", title: "Sugar Tamer Journey" },
                      fats: { bg: "bg-red-500/10 border-red-500/20 text-red-400", title: "Rusty Sweepers Sweep" },
                      sleep: { bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400", title: "Dream Rest Quest" },
                      movement: { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", title: "Sprint & Play Project" }
                    };
                    const setMeta = iconsByCat[rec.category as keyof typeof iconsByCat] || iconsByCat.movement;

                    return (
                      <div key={idx} className="bg-[#0D0D11] border border-[#191924] rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/10 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border font-bold font-mono ${setMeta.bg}`}>
                                {setMeta.title}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">{t("auto.difficulty_medium", "Difficulty: Medium")}</span>
                            </div>
                            <h4 className="text-xs font-black text-white tracking-wide mt-1.5 uppercase">{rec.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>
                          </div>
                        </div>);

                  })}
                  </div>
                </div>

                {/* DISEASE RISK PREVIEW WARNING (Prediction linkage) */}
                <div className="bg-gradient-to-r from-red-950/15 to-neutral-900 border border-red-900/15 rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-28 w-28 bg-red-500/5 blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-450" />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono">{t("auto.kid_disease_risk_correlations_detected", "Kid Disease Risk Correlations Detected:")}</span>
                  </div>
                  <div className="space-y-2">
                    {reportResult.diseaseRisks.map((d, idx) =>
                  <div key={idx} className="bg-black/40 border border-red-500/5 p-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-200 block uppercase leading-none">{d.disease}</span>
                          <p className="text-[10px] text-slate-400">{d.riskText}</p>
                        </div>
                        <div className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-lg shrink-0 font-bold max-w-xs font-mono select-none">{t("auto.linked_to", "\uD83D\uDEA8 Linked to:")}
                      {d.linkage}
                        </div>
                      </div>
                  )}
                  </div>
                </div>

                {/* THE CARDS GRID FOR EACH PARAMETER */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">{t("auto.detailed_biomarker_breakdown", "Detailed Biomarker Breakdown:")}</span>
                    <span className="text-[9px] text-[#A0A0A0] font-mono">{t("auto.parameters_mapped", "Parameters Mapped:")}{reportResult.explanations.length}</span>
                  </div>

                  <div className="space-y-4.5">
                    {reportResult.explanations.map((exp, idx) => {
                    const badgeColors = {
                      "Healthy": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                      "A Bit High": "bg-amber-500/10 text-amber-400 border border-amber-50s/20 animate-pulse",
                      "A Bit Low": "bg-sky-500/10 text-sky-400 border border-sky-500/20",
                      "Needs Attention": "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                    };

                    return (
                      <div
                        key={idx}
                        className="bg-[#0B0B0C] border border-[#1A1A22] rounded-2xl p-5 hover:border-emerald-500/25 transition-all relative overflow-hidden">
                        
                          <div className="absolute top-0 right-0 h-40 w-40 bg-white/2 blur-[80px] pointer-events-none rounded-full" />
                          
                          {/* Top Row: Name, Status badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#14141A]">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">{exp.parameter}</h3>
                                <span className="text-[10px] font-extrabold text-slate-550 font-mono">({exp.whatItIs})</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block leading-none font-mono mt-0.5">{t("auto.healthy_standard", "Healthy Standard:")}{exp.normalRange}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="font-mono text-xs font-black text-[#EFEFEF] block">{exp.value}</span>
                              </div>
                              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono ${badgeColors[exp.status] || badgeColors.Healthy}`}>
                                {exp.status}
                              </span>
                            </div>
                          </div>

                          {/* Meter logic */}
                          <div className="my-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span className="shrink-0">{t("auto.safe_limits", "Safe Limits")}</span>
                            <div className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden flex">
                              <div className="w-1/3 h-full border-r border-[#0A0A0A] bg-sky-500" />
                              <div className="w-1/3 h-full border-r border-[#0A0A0A] bg-emerald-500" />
                              <div className="w-1/3 h-full bg-red-500" />
                            </div>
                            <span className="shrink-0">{t("auto.over_targets", "Over Targets")}</span>
                          </div>

                          {/* Body Text */}
                          <div className="space-y-3 mt-3">
                            <div className="rounded-xl border border-emerald-500/5 bg-[#0F140F]/10 p-3 leading-relaxed">
                              <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-widest font-mono mb-1">{t("auto.friendly_story_mapping", "Friendly Story Mapping:")}</span>
                              <p className="text-xs text-slate-300 font-medium font-sans">
                                {exp.explanation}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium pt-2">
                              <div>
                                <span className="text-[9px] uppercase font-black text-slate-450 block tracking-widest font-mono mb-1">{t("auto.why_this_matters", "Why This Matters:")}</span>
                                <p className="text-[11px] text-slate-400 leading-normal">{exp.impact}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-black text-slate-450 block tracking-widest font-mono mb-1">{t("auto.kid_friendly_actions", "Kid-Friendly Actions:")}</span>
                                <ul className="space-y-1">
                                  {exp.actions.map((act, aIdx) =>
                                <li key={aIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                      <span className="text-emerald-550 mt-0.5">&bull;</span>
                                      <span>{act}</span>
                                    </li>
                                )}
                                </ul>
                              </div>
                            </div>
                          </div>

                        </div>);

                  })}
                  </div>
                </div>

                {/* AI HEALTH COACH ZONE ("Explain More") */}
                <div className="border border-[#1E1E28] bg-gradient-to-br from-[#0B0B0D] via-[#090D09] to-[#0D120D] rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-[#181822] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-4 animate-pulse shrink-0" />
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">{t("auto.ask_your_friendly_doctor_ai_coach", "Ask Your Friendly Doctor (AI Coach)")}</h3>
                        <p className="text-[10px] text-slate-500">{t("auto.curious_about_any_metric_ask_an_interact", "Curious about any metric? Ask an interactive pediatric question.")}</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[9px] uppercase font-extrabold text-emerald-400 font-mono tracking-wider">{t("auto.pediatric_coach_live", "Pediatric Coach \u2022 Live")}

                  </div>
                  </div>

                  {/* CHAT DISPLAY */}
                  <div className="h-[220px] overflow-y-auto pr-1 space-y-3.5 flex flex-col">
                    {chatHistory.map((m, idx) => {
                    const isModel = m.role === "model";
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-[85%] ${isModel ? "self-start" : "self-end flex-row-reverse"}`}>
                        
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isModel ? "bg-[#111] border-emerald-505/20 text-emerald-400" : "bg-emerald-500 border-emerald-550 text-black"}`
                        }>
                            {isModel ? <MessageSquare className="h-3.5 w-3.5" /> : <Award className="h-3.5 w-3.5 font-bold" />}
                          </div>
                          <div className={`rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                        isModel ? "bg-[#111116] border border-[#14141E] text-slate-300" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-350"}`
                        }>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                        </div>);

                  })}
                    {chatLoading &&
                  <div className="self-start flex gap-3 max-w-[80%]">
                        <div className="h-7 w-7 rounded-lg bg-[#111] border border-emerald-505/15 flex items-center justify-center animate-spin">
                          <Loader2 className="h-3.5 w-3.5 text-emerald-450" />
                        </div>
                        <div className="bg-[#111116] border border-[#14141E] rounded-2xl p-3.5 text-xs text-slate-500 shrink-0 select-none animate-pulse">{t("auto.friendly_doctor_is_typing_simplified_ans", "Friendly doctor is typing simplified answer...")}

                    </div>
                      </div>
                  }
                    <div ref={chatBottomRef} />
                  </div>

                  {/* QUICK SUGGESTIONS */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t("auto.quick_questions_to_click", "Quick Questions To Click:")}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickQuestions.map((q, idx) =>
                    <button
                      key={idx}
                      disabled={chatLoading}
                      onClick={() => {
                        setChatInput(q);
                        setTimeout(() => {
                          // Auto trigger message submit
                          setChatInput(q);
                          const fakeEvent = { preventDefault: () => {} } as any;
                          // Submit helper
                        }, 50);
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-[#1C1C24] bg-[#0C0C0E] hover:bg-[#15151B] text-[10px] font-medium text-slate-450 hover:text-emerald-400 transition-colors cursor-pointer">
                      
                          {q}
                        </button>
                    )}
                    </div>
                  </div>

                  {/* CHAT INPUT FORM */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2 bg-[#060608] border border-[#1A1A24] rounded-2xl p-1.5">
                    <input
                    type="text"
                    disabled={chatLoading}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t("auto.ask_the_doctor_why_is_bad_cholesterol_ca", "Ask the doctor: 'Why is bad cholesterol called sticky fat?'...")}
                    className="w-full bg-transparent text-xs text-slate-200 outline-none px-2.5" />
                  
                    <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:scale-100 flex items-center justify-center">
                    
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>

                </div>

                {/* MEDICAL SAFETY DISCLAIMER */}
                <div className="p-4 border border-[#1C201C]/40 bg-[#0E150E]/20 rounded-2xl flex items-start gap-3 text-[10px] text-slate-500 leading-relaxed font-sans mt-8 shadow-inner">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500/70 mt-0.5" />
                  <div>
                    <strong className="text-slate-400 font-extrabold uppercase tracking-wide block">{t("auto.friendly_medical_guardrail_advice_first", "Friendly Medical Guardrail Advice First:")}</strong>{t("auto.this_explain_my_report_like_i_m_10_inter", "This \"Explain My Report Like I'm 10\" interpreter tool prepares age-appropriate storytelling summaries purely to help understand general laboratory metrics. It should never be substituted as clinical doctor diagnostic prescriptions, treatment orders, or medical disease decisions. Always gather with your parent or dynamic pediatrician to chart your medical diagnostics maps together.")}

                </div>
                </div>

              </motion.div>
            }

          </AnimatePresence>

        </div>

      </div>

    </div>);

}