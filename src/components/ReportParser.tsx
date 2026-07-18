import { t } from "i18next";
import React, { useState } from "react";
import { MedicalReportExtraction, UserProfile } from "../types";
import { FileText, Sparkles, Upload, FileCheck, RefreshCw, AlertCircle, ArrowDownToLine } from "lucide-react";

interface ReportParserProps {
  onImportVitals: (vitals: Partial<UserProfile>) => void;
}

export default function ReportParser({ onImportVitals }: ReportParserProps) {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("LabReport.pdf");
  const [reportResult, setReportResult] = useState<MedicalReportExtraction | null>(null);

  const sampleReports = [
  {
    title: "🩸 Comprehensive lipid & cardio panel",
    filename: "lipid_panel_9042.pdf",
    text: `LABORATORY TESTING INC - CLINICAL CHEMISTRY STATEMENT
PATIENT: Jane Doe (Age: 52, Gender: Female)
HEALTH ADVICE ID: EX-97330

CARDIOVASCULAR LIPID Biomarkers:
Total Cholesterol: 248 mg/dL (Reference High: >= 200 mg/dL)
LDL Cholesterol: 165 mg/dL (Reference High: >= 100 mg/dL)
HDL Cholesterol: 42 mg/dL (Normal Range: 40-60 mg/dL)
Triglycerides: 195 mg/dL (Elevated Range: > 150 mg/dL)
Arterial Blood Pressure Vitals: 142 / 88 mmHg
Heart resting rate: 82 bpm`
  },
  {
    title: "🧪 Glucotoxicity & metabolic profile",
    filename: "metabolic_eval.txt",
    text: `METABOLIC METRIC STATEMENT - ENDOCRINE ANALYSIS
PATIENT: Anonymous (Age: 48, Gender: Male)

LAB RESULTS:
Fasting Serum Glucose: 134 mg/dL  [Reference normal range: 70 - 99 mg/dL] - HIGH ARREST
Hemoglobin A1c (Pre-diabetes/Diabetes markers): 6.8%  [Reference: < 5.7%] - CRITICAL
RESTING BP: 135 / 84 mmHg`
  },
  {
    title: "🫁 Pulmonary COPD & asthma intake Vitals",
    filename: "pulm_intake.log",
    text: `PULMONARY CLINICAL ASSESSMENT SHEET
LAB RESULTS:
Total Serum Cholesterol: 185 mg/dL
Fasting sugar: 92 mg/dL
Blood pressure: 118 / 76 mmHg
RESTING CELLULAR HEART RATE: 64 bpm
Patient notes: Chronic heavy smoker, displays morning fatigue and respiratory congestion.`
  }];


  const [fileData, setFileData] = useState<{mimeType: string;data: string;} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const loadSample = (sample: typeof sampleReports[number]) => {
    setReportText(sample.text);
    setFilename(sample.filename);
    setFileData(null);
    setUploadError("");
    setReportResult(null);
  };

  const handleParseReport = async () => {
    if (!reportText.trim() && !fileData) return;
    setLoading(true);
    setUploadError("");

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

      const parsed: MedicalReportExtraction = await response.json();
      setReportResult(parsed);
    } catch (error) {
      console.error("Error calling parse report:", error);
      setUploadError("Could not analyze document model. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const [syncStatus, setSyncStatus] = useState("");

  const syncVitalsToProfile = () => {
    if (!reportResult) return;
    onImportVitals(reportResult.extractedVitals);
    setSyncStatus("🧬 Biomarkers loaded into assessment fields!");
    setTimeout(() => setSyncStatus(""), 4000);
  };

  const handleFile = (file: File) => {
    setUploadError("");
    setFilename(file.name);
    setReportResult(null);

    const isText = file.type.startsWith("text/") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".json") ||
    file.name.endsWith(".log");

    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setReportText(text);
        setFileData(null);
      };
      reader.onerror = () => {
        setUploadError("Failed to read the text file.");
      };
      reader.readAsText(file);
    } else {
      // PDF or Image
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Index = result.indexOf(";base64,") + 8;
        const base64Data = result.substring(base64Index);
        setFileData({
          mimeType: file.type || "application/pdf",
          data: base64Data
        });
        setReportText(`[Attached Document File: ${file.name} - Ready for Cognitive OCR extraction]`);
      };
      reader.onerror = () => {
        setUploadError("Failed to read the document file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="report-parser-panel" className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-6 shadow-xl shadow-black/40 space-y-6">
      <div className="border-b border-[#1A1A1A] pb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-400" />{t("auto.medical_report_room_ocr_extractor", "Medical Report room & OCR Extractor")}

        </h2>
        <p className="text-xs text-slate-500 mt-1">{t("auto.paste_laboratory_clinical_sheets_drag_an", "Paste laboratory clinical sheets, drag-and-drop diagnostic files, or load simulated biomarker datasets.")}

        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Editor Box */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* File Upload Zone */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t("auto.1_upload_clinic_document", "1. Upload Clinic Document:")}</span>
            <div
              id="file-dropzone"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
              isDragging ?
              "border-emerald-400 bg-emerald-500/10 text-emerald-300 pointer-events-none" :
              "border-[#202020] bg-[#070707]/60 hover:bg-[#0A0A0A] text-slate-400 hover:border-emerald-500/30"}`
              }>
              
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept=".txt,.json,.log,.csv,.pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }} />
              
              <Upload className={`h-6 w-6 mb-2 ${isDragging ? "text-emerald-400 animate-bounce" : "text-emerald-500/70"}`} />
              <p className="text-xs font-bold text-white mb-0.5">{t("auto.drag_drop_report_here", "Drag & Drop report here")}</p>
              <p className="text-[10px] text-slate-500">{t("auto.or_click_to_select_your_laboratory_file", "or click to select your laboratory file")}</p>
              <p className="text-[9px] text-[#A0A0A0] mt-1.5 font-mono pointer-events-none">{t("auto.pdf_png_jpg_jpeg_txt_csv_json", "PDF, PNG, JPG, JPEG, TXT, CSV, JSON")}</p>
            </div>
            {uploadError &&
            <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-medium p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            }
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block">{t("auto.2_or_load_simulation_pre_sets", "2. Or Load Simulation Pre-sets:")}</span>
            <div className="grid grid-cols-1 gap-2">
              {sampleReports.map((s, idx) =>
              <button
                key={idx}
                id={`btn-sample-report-${idx}`}
                type="button"
                onClick={() => loadSample(s)}
                className="text-left px-3 py-2 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]/60 hover:bg-[#121212] text-xs font-medium text-slate-400 hover:text-emerald-400 transition-all cursor-pointer truncate">
                
                  {s.title}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">{t("auto.3_document_statement_plain_text", "3. Document Statement / Plain Text")}</label>
              <span className="text-[10px] text-slate-500 font-mono underline truncate max-w-[150px]">{filename}</span>
            </div>
            <textarea
              id="report-textarea"
              rows={6}
              value={reportText}
              onChange={(e) => {
                setReportText(e.target.value);
                setFileData(null); // Clear custom file upload on text edit override
              }}
              placeholder={t("auto.paste_raw_laboratory_logs_scanned_blood", "Paste raw laboratory logs, scanned blood works, or type clinic files here...")}
              className="w-full text-xs font-mono p-3 border border-[#222] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-[#050505] text-[#E0E0E0] leading-relaxed placeholder-slate-600" />
            
          </div>

          <button
            id="btn-parse-report"
            type="button"
            onClick={handleParseReport}
            disabled={loading || !reportText.trim() && !fileData}
            className="w-full cursor-pointer bg-[#121212] hover:bg-[#1A1A1A] border border-[#202020] hover:border-[#333] text-white hover:text-emerald-400 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-45 transition-all select-none">
            
            {loading ?
            <>
                <svg className="animate-spin h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{t("auto.extracting_raw_biomarkers_from_document", "Extracting raw biomarkers from document...")}</span>
              </> :

            <>
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>{t("auto.process_document_cognitive_ai", "Process Document (Cognitive AI)")}</span>
              </>
            }
          </button>
        </div>

        {/* Results Screen */}
        <div className="lg:col-span-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 flex flex-col justify-between">
          {!reportResult ?
          <div id="report-empty" className="my-auto text-center space-y-3 p-6 select-none">
              <div className="h-12 w-12 bg-[#0F0F0F] rounded-2xl flex items-center justify-center border border-[#1A1A1A] text-slate-550 mx-auto">
                <Upload className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("auto.clinical_results_dashboard", "Clinical Results Dashboard")}</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal">{t("auto.upload_or_select_a_file_prescription_she", "Upload or select a file prescription sheet on the left. The OCR Parser will identify and structure vital signs directly, making manual data entry optional.")}

            </p>
            </div> :

          <div id="report-active-result" className="space-y-4 animate-fade-in text-slate-300">
              <div className="flex border-b border-[#1A1A1A] pb-3 items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                    <FileCheck className="h-4 w-4" />{t("auto.cognitive_laboratory_analysis", "Cognitive Laboratory Analysis")}
                </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{t("auto.patient", "Patient:")}{reportResult.patientName || "Stated Sample"}</p>
                </div>
                <button
                type="button"
                id="btn-sync-vitals"
                onClick={syncVitalsToProfile}
                className="bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow cursor-pointer transition-all animate-pulse">
                
                  <ArrowDownToLine className="h-3.5 w-3.5" />{t("auto.inject_extracted_biomarkers", "Inject Extracted Biomarkers")}
              </button>
              </div>

              {syncStatus &&
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider text-center">
                  {syncStatus}
                </div>
            }

              {/* Summary */}
              {reportResult.clinicalImpression &&
            <div className="text-[10px] leading-relaxed bg-[#121212] border border-[#1D1D1D] rounded-xl p-3 text-slate-300 font-medium space-y-0.5">
                  <span className="font-extrabold text-white block uppercase tracking-wider text-[9px] text-emerald-450 mb-1">{t("auto.ai_medical_impression", "AI Medical Impression:")}</span>
                  <p>{reportResult.clinicalImpression}</p>
                </div>
            }

              {/* Biomarkers Found List */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{t("auto.identified_biomarkers_mapping", "Identified Biomarkers Mapping:")}</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {reportResult.biomarkersFound.map((b, idx) => {
                  const statusColors =
                  b.status === "Critical" ?
                  "bg-red-500/10 text-red-450 border border-red-500/20" :
                  b.status === "Elevated" ?
                  "bg-amber-500/10 text-amber-450 border border-amber-500/20" :
                  b.status === "Low" ?
                  "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                  "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20";

                  return (
                    <div key={idx} className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-3 flex items-center justify-between text-xs hover:border-[#222] transition-colors">
                        <div>
                          <span className="font-bold text-white block">{b.name}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5 font-medium font-mono">{t("auto.normal_span", "Normal Span:")}{b.normalRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#E0E0E0]">{b.value}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusColors}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>);

                })}
                </div>
              </div>
            </div>
          }
        </div>

      </div>
    </div>);

} 