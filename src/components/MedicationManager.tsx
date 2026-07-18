import { t } from "i18next";
import React, { useState, useEffect } from "react";
import {
  Pill,
  Calendar,
  Bell,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  Edit,
  Edit2 } from
"lucide-react";

interface Medication {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  foodRelation: string;
  startDate: string;
  endDate?: string;
  purpose: string;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  userId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  date: string;
  status: "Taken" | "Skipped" | "Snoozed" | "Pending";
  actionTime?: string;
}

interface AdherenceStats {
  totalDosesScheduled: number;
  dosesTaken: number;
  dosesMissed: number;
  dosesDelayed: number;
  adherenceScore: number;
  adherenceClassification: "Excellent" | "Good" | "Poor" | "Critical";
}

interface AIInsight {
  insights: string;
  alerts: string[];
}

export function formatTime12Hour(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hrStr = String(hours).padStart(2, "0");
  return `${hrStr}:${minutes} ${ampm}`;
}

export default function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [stats, setStats] = useState<AdherenceStats>({
    totalDosesScheduled: 0,
    dosesTaken: 0,
    dosesMissed: 0,
    dosesDelayed: 0,
    adherenceScore: 100,
    adherenceClassification: "Excellent"
  });
  const [insights, setInsights] = useState<AIInsight>({
    insights: "",
    alerts: []
  });

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  // Modal State for adding new medication
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>("");
  const [formDosage, setFormDosage] = useState<string>("");
  const [formFrequency, setFormFrequency] = useState<string>("Daily");
  const [formTimes, setFormTimes] = useState<string[]>(["08:00"]);
  const [formFood, setFormFood] = useState<string>("After Food");
  const [formPurpose, setFormPurpose] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState<string>("");

  // Modal State for editing existing medication prescription
  const [showEditMedModal, setShowEditMedModal] = useState<boolean>(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editFormName, setEditFormName] = useState<string>("");
  const [editFormDosage, setEditFormDosage] = useState<string>("");
  const [editFormFrequency, setEditFormFrequency] = useState<string>("Daily");
  const [editFormTimes, setEditFormTimes] = useState<string[]>(["08:00"]);
  const [editFormFood, setEditFormFood] = useState<string>("After Food");
  const [editFormPurpose, setEditFormPurpose] = useState<string>("");
  const [editFormStartDate, setEditFormStartDate] = useState<string>("");
  const [editFormEndDate, setEditFormEndDate] = useState<string>("");

  // Modal State for editing single log entry dose
  const [showEditLogModal, setShowEditLogModal] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<MedicationLog | null>(null);
  const [editLogName, setEditLogName] = useState<string>("");
  const [editLogDosage, setEditLogDosage] = useState<string>("");
  const [editLogTime, setEditLogTime] = useState<string>("");
  const [editLogStatus, setEditLogStatus] = useState<"Taken" | "Skipped" | "Snoozed" | "Pending">("Pending");

  // Alarm State
  const [activeAlarm, setActiveAlarm] = useState<MedicationLog | null>(null);

  // Fetch core data
  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;

    try {
      // 1. Get Medications
      const medsResp = await fetch("/api/medications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const medsData = await medsResp.json();
      setMedications(Array.isArray(medsData) ? medsData : []);

      // 2. Get Logs for selected date
      const logsResp = await fetch(`/api/medication-logs?date=${selectedDate}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const logsData = await logsResp.json();
      setLogs(Array.isArray(logsData) ? logsData : []);

      // 3. Get Stats
      const statsResp = await fetch("/api/medication-stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const statsData = await statsResp.json();
      if (statsData && !statsData.error) {
        setStats(statsData);
      }
    } catch (e) {
      console.error("Failed to load medication dataset:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    setLoadingInsights(true);
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;
    try {
      const preferredLang = localStorage.getItem("aegis_preferred_lang") || "en";
      const resp = await fetch(`/api/medication-insights?lang=${preferredLang}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data && !data.error) {
        setInsights(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    loadAIInsights();
    requestNotificationPermission();
  }, [medications]);

  // Alarm background engine
  useEffect(() => {
    const interval = setInterval(() => {
      if (logs.length === 0) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMins = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMins}`;

      // Check if any log for today matches current time and is "Pending"
      const currentTodayDate = now.toISOString().split("T")[0];
      if (selectedDate === currentTodayDate) {
        const matchingLog = logs.find(
          (l) => l.status === "Pending" && l.scheduledTime === currentTimeStr
        );
        if (matchingLog && (!activeAlarm || activeAlarm.id !== matchingLog.id)) {
          setActiveAlarm(matchingLog);
          triggerPushNotification(matchingLog);
          speakAlarm(matchingLog);
        }
      }
    }, 12000); // Check every 12 seconds
    return () => clearInterval(interval);
  }, [logs, selectedDate, activeAlarm]);

  // Request browser notification permissions
  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  // Sound/Speech Alarm Synthesis
  const speakAlarm = (log: MedicationLog) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const matched = medications.find((m) => m.id === log.medicationId);
    const rela = matched ? matched.foodRelation : "Anytime";
    const utterance = new SpeechSynthesisUtterance(
      `Alarm. It is time to take your medication. ${log.medicineName}, dosage ${log.dosage}. Relation: ${rela}.`
    );
    utterance.volume = 1.0;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const triggerPushNotification = (log: MedicationLog) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const matched = medications.find((m) => m.id === log.medicationId);
      const rela = matched ? matched.foodRelation : "Anytime";
      new Notification(`Medication Reminder: ${log.medicineName}`, {
        body: `Dosage: ${log.dosage} (${rela}) scheduled for ${log.scheduledTime}. Mark Taken from your dashboard now.`,
        icon: "/pills_logo.png"
      });
    }
  };

  // Handlers
  const handleUpdateLogStatus = async (id: string, status: "Taken" | "Skipped" | "Snoozed" | "Pending") => {
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;
    try {
      const now = new Date();
      const actionTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const resp = await fetch(`/api/medication-logs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, actionTime: actionTimeStr })
      });

      if (resp.ok) {
        // Update local logs list instantly
        setLogs((prev) => prev.map((l) => l.id === id ? { ...l, status, actionTime: actionTimeStr } : l));
        // Reload statistics and AI reports
        const statsResp = await fetch("/api/medication-stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const statsData = await statsResp.json();
        if (statsData && !statsData.error) {
          setStats(statsData);
        }
        if (activeAlarm?.id === id) {
          setActiveAlarm(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDosage || !formPurpose) {
      alert("Please fill out complete medication parameters.");
      return;
    }
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;

    try {
      const resp = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          medicineName: formName,
          dosage: formDosage,
          frequency: formFrequency,
          times: formTimes,
          foodRelation: formFood,
          startDate: formStartDate,
          endDate: formEndDate || undefined,
          purpose: formPurpose
        })
      });

      if (resp.ok) {
        setShowAddModal(false);
        // Clear forms
        setFormName("");
        setFormDosage("");
        setFormFrequency("Daily");
        setFormTimes(["08:00"]);
        setFormFood("After Food");
        setFormPurpose("");
        // Reload all data
        loadData();
      } else {
        const error = await resp.json();
        alert(error.error || "Failed registration.");
      }
    } catch (er) {
      console.error(er);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm("Are you sure you want to stop and delete this chronic therapy schedule?")) return;
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;
    try {
      const resp = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedication || !editFormName || !editFormDosage || !editFormPurpose) {
      alert("Please fill out complete medication parameters.");
      return;
    }
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;

    try {
      const resp = await fetch(`/api/medications/${editingMedication.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          medicineName: editFormName,
          dosage: editFormDosage,
          frequency: editFormFrequency,
          times: editFormTimes,
          foodRelation: editFormFood,
          startDate: editFormStartDate,
          endDate: editFormEndDate || undefined,
          purpose: editFormPurpose
        })
      });

      if (resp.ok) {
        setShowEditMedModal(false);
        setEditingMedication(null);
        loadData();
      } else {
        const error = await resp.json();
        alert(error.error || "Failed updating medication.");
      }
    } catch (er) {
      console.error(er);
    }
  };

  const handleEditLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !editLogName || !editLogDosage || !editLogTime) {
      alert("Please fill out complete dose parameters.");
      return;
    }
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;

    try {
      const resp = await fetch(`/api/medication-logs/${editingLog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          medicineName: editLogName,
          dosage: editLogDosage,
          scheduledTime: editLogTime,
          status: editLogStatus
        })
      });

      if (resp.ok) {
        setShowEditLogModal(false);
        setEditingLog(null);
        loadData();
      } else {
        const error = await resp.json();
        alert(error.error || "Failed updating log entry.");
      }
    } catch (er) {
      console.error(er);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to remove this specific scheduled dose log from the checklist?")) return;
    const token = localStorage.getItem("aegis_access_token");
    if (!token) return;
    try {
      const resp = await fetch(`/api/medication-logs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFromChecklist = async (log: MedicationLog) => {
    const parentMed = medications.find((m) => m.id === log.medicationId);
    if (parentMed) {
      if (confirm(`Are you sure you want to stop and delete the whole scheduled medication "${parentMed.medicineName}" therapy? This will completely remove it from your chronic schedules and daily checklist.`)) {
        const token = localStorage.getItem("aegis_access_token");
        if (!token) return;
        try {
          const resp = await fetch(`/api/medications/${parentMed.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resp.ok) {
            loadData();
          } else {
            alert("Failed to delete medication therapy.");
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      await handleDeleteLog(log.id);
    }
  };

  const handleEditFromChecklist = (log: MedicationLog) => {
    const parentMed = medications.find((m) => m.id === log.medicationId);
    if (parentMed) {
      openEditMedicationFlow(parentMed);
    } else {
      openEditLogFlow(log);
    }
  };

  const openEditMedicationFlow = (med: Medication) => {
    setEditingMedication(med);
    setEditFormName(med.medicineName);
    setEditFormDosage(med.dosage);
    setEditFormFrequency(med.frequency);
    setEditFormTimes(med.times || ["08:00"]);
    setEditFormFood(med.foodRelation);
    setEditFormPurpose(med.purpose);
    setEditFormStartDate(med.startDate ? med.startDate.split("T")[0] : "");
    setEditFormEndDate(med.endDate ? med.endDate.split("T")[0] : "");
    setShowEditMedModal(true);
  };

  const openEditLogFlow = (log: MedicationLog) => {
    setEditingLog(log);
    setEditLogName(log.medicineName);
    setEditLogDosage(log.dosage);
    setLogTimeAndFields(log);
  };

  const setLogTimeAndFields = (log: MedicationLog) => {
    setEditLogTime(log.scheduledTime);
    setEditLogStatus(log.status);
    setShowEditLogModal(true);
  };

  // Generate date list for calendar strip
  const getCalendarStrip = () => {
    const list = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const current = new Date();
      current.setDate(today.getDate() + i);
      list.push(current);
    }
    return list;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="space-y-6">
      {/* alarm modal / alert Banner */}
      {activeAlarm && (() => {
        const matched = medications.find((m) => m.id === activeAlarm.medicationId);
        const rela = matched ? matched.foodRelation : "Anytime";
        return (
          <div className="bg-[#1C0F0F] border-2 border-red-500/50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce shadow-xl shadow-red-950/20">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-full ring-4 ring-red-500/10">
                <Bell className="h-6 w-6 text-red-400 animate-swing" />
              </div>
              <div>
                <p className="text-[#FFEBEB] text-xs font-black uppercase tracking-widest">{t("auto.alarm_medication_time_now", "ALARM: MEDICATION TIME NOW")}</p>
                <h3 className="text-white text-base font-bold">{activeAlarm.medicineName} {activeAlarm.dosage}</h3>
                <p className="text-red-300 text-xs">{rela}{t("auto.scheduled", "\u2022 Scheduled:")}{formatTime12Hour(activeAlarm.scheduledTime)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateLogStatus(activeAlarm.id, "Taken")}
                className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black px-4 py-2 rounded-lg cursor-pointer">{t("auto.mark_taken", "Mark Taken")}


              </button>
              <button
                onClick={() => {
                  // Snooze: reset alarm temporarily
                  setActiveAlarm(null);
                  // Prompt snooze alert
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Alarms snoozed. Repeat in five minutes."));
                  }
                }}
                className="bg-[#2C1818] hover:bg-[#3D2222] text-[#FF9E9E] border border-red-500/20 text-xs font-bold px-3 py-2 rounded-lg">{t("auto.snooze", "Snooze")}


              </button>
              <button
                onClick={() => handleUpdateLogStatus(activeAlarm.id, "Skipped")}
                className="bg-[#150F0F] hover:bg-black text-red-400 text-xs font-semibold px-3 py-2 rounded-lg">{t("auto.skip_dose", "Skip Dose")}


              </button>
            </div>
          </div>);

      })()}

      {/* Critical Adherence Warnings */}
      {insights.alerts && insights.alerts.length > 0 &&
      <div className="space-y-2">
          {insights.alerts.map((al, index) =>
        <div key={index} className="bg-[#1C0F0F] border border-red-500/20 text-red-300 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>{al}</span>
            </div>
        )}
        </div>
      }

      {/* Grid Layout: Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Score Adherence Gauge */}
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Pill className="h-4 w-4 text-emerald-400" />{t("auto.compliance_scoring", "Compliance Scoring")}
            </h3>
            <p className="text-[11px] text-slate-500">{t("auto.adherence_percentage_drives_overall_heal", "Adherence percentage drives overall health prediction indexes.")}</p>
          </div>

          <div className="flex items-center justify-around">
            <div className="relative flex items-center justify-center p-2">
              {/* Custom SVG Adherence Semi-Circle gauge */}
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke="#151515"
                  strokeWidth="8"
                  fill="transparent" />
                
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke={
                  stats.adherenceScore >= 90 ? "#10B981" :
                  stats.adherenceScore >= 75 ? "#F59E0B" :
                  "#EF4444"
                  }
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - 282.7 * Math.min(100, stats.adherenceScore) / 100} />
                
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{stats.adherenceScore}%</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t("auto.adherence", "Adherence")}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">{t("auto.status_classification", "Status classification")}</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
              stats.adherenceClassification === "Excellent" ? "bg-emerald-500/10 text-emerald-400" :
              stats.adherenceClassification === "Good" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-red-500/10 text-red-500"}`
              }>
                {stats.adherenceClassification}{t("auto.routine", "Routine")}
              </span>
              <p className="text-[10px] text-slate-400 leading-snug max-w-[140px]">
                {stats.adherenceScore >= 90 ? "Excellent consistency lowers cellular progression indices." :
                stats.adherenceScore >= 75 ? "Consistent enough. Tighten alarms to lower volatility." :
                "Irregular therapies aggravate disease corridors. Please restore regime schedule."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#151515] text-center">
            <div className="p-1.5 bg-[#080808] border border-[#151515] rounded-xl">
              <span className="text-white text-xs font-black">{stats.dosesTaken}</span>
              <p className="text-[9px] text-slate-400">{t("auto.marked_taken", "Marked Taken")}</p>
            </div>
            <div className="p-1.5 bg-[#080808] border border-[#151515] rounded-xl">
              <span className="text-white text-xs font-black">{stats.dosesMissed}</span>
              <p className="text-[9px] text-slate-400">{t("auto.missed_skipped", "Missed / Skipped")}</p>
            </div>
          </div>
        </div>

        {/* Card 2 & 3: Calendar Logs strip & Day Checklist */}
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <h3 className="text-white text-sm font-bold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-400" />{t("auto.adherence_logs_checklist", "Adherence Logs checklist")}
              </h3>
              <p className="text-[11px] text-slate-500">{t("auto.track_doses_and_adjust_daily_compliance", "Track doses and adjust daily compliance parameters.")}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 self-start sm:self-center cursor-pointer active:scale-95 duration-150">
              
              <Plus className="h-3 w-3" />{t("auto.register_therapy", "Register Therapy")}
            </button>
          </div>

          {/* Calendar Strip */}
          <div className="flex items-center justify-between gap-1 bg-[#050505] p-1.5 border border-[#181818] rounded-xl">
            {getCalendarStrip().map((date, idx) => {
              const dateStr = date.toISOString().split("T")[0];
              const isSelected = selectedDate === dateStr;
              const isCurrentToday = new Date().toISOString().split("T")[0] === dateStr;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all cursor-pointer ${
                  isSelected ?
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  isCurrentToday ?
                  "bg-[#101010] text-[#E0E0E0] border border-[#1A1A1A]" :
                  "text-slate-500 hover:text-white"}`
                  }>
                  
                  <span className="text-[9px] uppercase tracking-wider">{getDayName(date)}</span>
                  <span className="text-xs font-black mt-0.5">{date.getDate()}</span>
                </button>);

            })}
          </div>

          {/* Day checklist */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {loading ?
            <div className="text-center py-8 text-xs text-slate-500">{t("auto.loading_daily_adherence_checklists", "Loading daily adherence checklists...")}</div> :
            logs.length === 0 ?
            <div className="text-center py-8 border border-[#151515] border-dashed rounded-xl space-y-1">
                <p className="text-xs text-slate-400">{t("auto.no_therapy_tasks_scheduled_for_this_day", "No therapy tasks scheduled for this day.")}</p>
                <p className="text-[10px] text-slate-600">{t("auto.ensure_active_dates_match_prescription_t", "Ensure active dates match prescription timeline limits.")}</p>
              </div> :

            logs.map((log) =>
            <div
              key={log.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              log.status === "Taken" ? "bg-emerald-500/5 border-emerald-500/20" :
              log.status === "Skipped" ? "bg-red-500/5 border-red-500/20 text-slate-500" :
              "bg-[#070707] border-[#181818]"}`
              }>
              
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{log.medicineName}</span>
                      <span className="text-[9px] bg-black border border-[#1F1F1F] text-slate-400 px-1 rounded">{log.dosage}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-0.5 text-emerald-400/90 font-semibold"><Clock className="h-3 w-3" /> {formatTime12Hour(log.scheduledTime)}</span>
                      <span>•</span>
                      {log.status === "Taken" && log.actionTime &&
                  <span className="text-slate-500">{t("auto.took", "Took:")}{log.actionTime}</span>
                  }
                      {log.status !== "Taken" &&
                  <span>{t("auto.status", "Status:")}<span className="font-semibold text-slate-400 capitalize">{log.status}</span></span>
                  }
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0 items-center">
                    {log.status === "Pending" ?
                <>
                        <button
                    onClick={() => handleUpdateLogStatus(log.id, "Taken")}
                    className="bg-emerald-500 hover:bg-emerald-600 p-1.5 rounded-lg text-black transition-colors cursor-pointer"
                    title={t("auto.mark_taken", "Mark Taken")}>
                    
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                    onClick={() => handleUpdateLogStatus(log.id, "Skipped")}
                    className="bg-red-500/10 border border-red-500/20 p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    title={t("auto.skip_dose", "Skip Dose")}>
                    
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </> :

                <button
                  onClick={() => handleUpdateLogStatus(log.id, "Pending")}
                  className="bg-black border border-[#1E1E1E] px-2 py-1 text-[9px] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={t("auto.reset_status", "Reset Status")}>{t("auto.reset", "Reset")}


                </button>
                }

                    <div className="h-4 w-[1.5px] bg-[#222]" />

                    {/* Edit Scheduled Medication Button */}
                    <button
                  onClick={() => handleEditFromChecklist(log)}
                  className="bg-[#121212] hover:bg-[#202020] border border-[#222] p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                  title={t("auto.edit_therapy_details", "Edit therapy details")}>
                  
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Scheduled Medication Button */}
                    <button
                  onClick={() => handleDeleteFromChecklist(log)}
                  className="bg-[#121212] hover:bg-[#202020] border border-[#222] p-1.5 rounded-lg text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                  title={t("auto.delete_schedule", "Delete schedule")}>
                  
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
            )
            }
          </div>
        </div>
      </div>

      {/* Grid Row 2: AI Insights & Registered list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 4: AI Insights Panel */}
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl p-5 lg:col-span-2 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />{t("auto.ai_medication_advisory_guide", "AI Medication Advisory Guide")}
            </h3>
            <p className="text-[11px] text-slate-500">{t("auto.deep_biological_advisory_analyzing_presc", "Deep biological advisory analyzing prescription sync and risk trends.")}</p>
          </div>

          <div className="bg-black/40 border border-[#141414] rounded-xl p-4 min-h-[140px]">
            {loadingInsights ?
            <div className="text-center py-12 text-xs text-slate-500 animate-pulse">{t("auto.running_smart_prevention_calculations", "Running smart prevention calculations...")}</div> :
            insights.insights ?
            <div className="text-xs text-slate-300 leading-relaxed text-left max-w-none prose prose-invert overflow-auto">
                {/* Parse key headings or lines with rich style */}
                {insights.insights.split("\n").map((line, lidx) => {
                if (line.startsWith("###")) {
                  return <h4 key={lidx} className="text-xs font-black text-[#FFEBEB] uppercase tracking-wider mb-2 mt-3">{line.replace("###", "")}</h4>;
                }
                if (line.startsWith("-")) {
                  // Try parsing bold subparts
                  const parts = line.split("**");
                  if (parts.length >= 3) {
                    return (
                      <p key={lidx} className="mb-2 pl-2 border-l border-emerald-500/20 list-none ml-0">
                          <span className="text-white font-bold">{parts[1]}</span>{parts.slice(2).join("")}
                        </p>);

                  }
                  return <p key={lidx} className="mb-1.5 pl-2 border-l border-emerald-500/20 ml-0">{line.substring(2)}</p>;
                }
                return <p key={lidx} className="mb-1.5">{line}</p>;
              })}
              </div> :

            <div className="text-center py-12 text-xs text-slate-500">{t("auto.register_daily_therapies_to_generate_per", "Register daily therapies to generate personalized risk progression advisories.")}</div>
            }
          </div>

          <p className="text-[10px] text-slate-500 text-center">{t("auto.your_personal_ai_medication_assistant_be", "Your personal AI medication assistant. Better adherence, better health.")}</p>
        </div>

        {/* Card 5: Registered Prescriptions registry list */}
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-white text-sm font-bold">{t("auto.prescription_directory", "Prescription directory")}</h3>
            <p className="text-[11px] text-slate-500">{t("auto.active_chronic_condition_therapies_being", "Active chronic condition therapies being simulated.")}</p>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {medications.length === 0 ?
            <div className="text-center py-10 border border-[#151515] border-dashed rounded-xl text-xs text-slate-500">{t("auto.no_active_chronic_therapies_use_register", "No active chronic therapies. Use Register Therapy to configure schedules.")}

            </div> :

            medications.map((m) =>
            <div key={m.id} className="bg-black/60 border border-[#1C1C1C] p-3 rounded-xl flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-rose-300 truncate">{m.medicineName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{m.dosage} • {m.frequency}</p>
                    {m.times && m.times.length > 0 &&
                <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{t("auto.times", "Times:")}
                  {m.times.map(formatTime12Hour).join(", ")}
                      </p>
                }
                    <p className="text-[9px] text-slate-500 mt-1 truncate">{t("auto.purpose", "Purpose:")}{m.purpose}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                  onClick={() => openEditMedicationFlow(m)}
                  className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={t("auto.edit_therapy_parameters", "Edit Therapy Parameters")}>
                  
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                  onClick={() => handleDeleteMedication(m.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-550/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={t("auto.remove_therapy", "Remove Therapy")}>
                  
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
            )
            }
          </div>
        </div>
      </div>

      {/* Add Medication modal overlay */}
      {showAddModal &&
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#1E1E1E] w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
              <h3 className="text-white text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />{t("auto.register_chronic_disease_therapy", "Register Chronic Disease Therapy")}
            </h3>
              <button
              onClick={() => setShowAddModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg">
              
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.medicine_name", "Medicine Name")}</label>
                  <input
                  type="text"
                  required
                  placeholder={t("auto.e_g_atorvastatin", "e.g. Atorvastatin")}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.dosage", "Dosage")}</label>
                  <input
                  type="text"
                  required
                  placeholder={t("auto.e_g_20_mg", "e.g. 20 mg")}
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.purpose_of_therapy", "Purpose of therapy")}</label>
                  <input
                  type="text"
                  required
                  placeholder={t("auto.e_g_cholesterol_control", "e.g. Cholesterol Control")}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.relation_to_meals", "Relation to Meals")}</label>
                  <select
                  value={formFood}
                  onChange={(e) => setFormFood(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                  
                    <option value="Before Food">{t("auto.before_food", "Before Food")}</option>
                    <option value="After Food">{t("auto.after_food", "After Food")}</option>
                    <option value="With Food">{t("auto.with_food", "With Food")}</option>
                    <option value="No Relation">{t("auto.no_relation_anytime", "No Relation / Anytime")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.frequency", "Frequency")}</label>
                  <select
                  value={formFrequency}
                  onChange={(e) => {
                    const f = e.target.value;
                    let dTimes = ["08:00"];
                    if (f === "Twice Daily") dTimes = ["08:00", "20:00"];else
                    if (f === "Thrice Daily") dTimes = ["08:00", "13:00", "20:00"];
                    setFormFrequency(f);
                    setFormTimes(dTimes);
                  }}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                  
                    <option value="Daily">{t("auto.once_daily", "Once Daily")}</option>
                    <option value="Twice Daily">{t("auto.twice_daily", "Twice Daily")}</option>
                    <option value="Thrice Daily">{t("auto.thrice_daily", "Thrice Daily")}</option>
                    <option value="Weekly">{t("auto.weekly", "Weekly")}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.start_date", "Start Date")}</label>
                  <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none text-center" />
                
                </div>
              </div>

              {/* Times list */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.designated_reminders_times", "Designated Reminders Times")}</label>
                <div className="flex flex-wrap gap-2">
                  {formTimes.map((time, idx) =>
                <div key={idx} className="flex items-center gap-2 bg-black border border-[#1E1E1E] px-3 py-1.5 rounded-lg">
                      <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const copy = [...formTimes];
                      copy[idx] = e.target.value;
                      setFormTimes(copy);
                    }}
                    className="bg-transparent border-none text-xs text-white outline-none w-16" />
                  
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-medium">
                        {formatTime12Hour(time)}
                      </span>
                    </div>
                )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A1A1A] flex justify-end gap-2">
                <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="bg-transparent hover:bg-white/5 border border-[#1E1E1E] text-xs text-white font-semibold px-4 py-2 rounded-lg cursor-pointer">{t("auto.cancel", "Cancel")}


              </button>
                <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-5 py-2 rounded-lg cursor-pointer">{t("auto.save_therapy", "Save therapy")}


              </button>
              </div>
            </form>
          </div>
        </div>
      }

      {/* Edit Medication modal overlay */}
      {showEditMedModal &&
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#1E1E1E] w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
              <h3 className="text-white text-sm font-bold flex items-center gap-2">
                <Edit className="h-4 w-4 text-emerald-400" />{t("auto.edit_chronic_disease_therapy", "Edit Chronic Disease Therapy")}
            </h3>
              <button
              onClick={() => {
                setShowEditMedModal(false);
                setEditingMedication(null);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg">
              
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditMedication} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.medicine_name", "Medicine Name")}</label>
                  <input
                  type="text"
                  required
                  placeholder={t("auto.e_g_atorvastatin", "e.g. Atorvastatin")}
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.dosage", "Dosage")}</label>
                  <input
                  type="text"
                  required
                  placeholder={t("auto.e_g_20_mg", "e.g. 20 mg")}
                  value={editFormDosage}
                  onChange={(e) => setEditFormDosage(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.purpose_of_therapy", "Purpose of therapy")}</label>
                  <input
                  type="text"
                  required
                  placeholder={t("auto.e_g_cholesterol_control", "e.g. Cholesterol Control")}
                  value={editFormPurpose}
                  onChange={(e) => setEditFormPurpose(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.relation_to_meals", "Relation to Meals")}</label>
                  <select
                  value={editFormFood}
                  onChange={(e) => setEditFormFood(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                  
                    <option value="Before Food">{t("auto.before_food", "Before Food")}</option>
                    <option value="After Food">{t("auto.after_food", "After Food")}</option>
                    <option value="With Food">{t("auto.with_food", "With Food")}</option>
                    <option value="No Relation">{t("auto.no_relation_anytime", "No Relation / Anytime")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.frequency", "Frequency")}</label>
                  <select
                  value={editFormFrequency}
                  onChange={(e) => {
                    const f = e.target.value;
                    let dTimes = ["08:00"];
                    if (f === "Twice Daily") dTimes = ["08:00", "20:00"];else
                    if (f === "Thrice Daily") dTimes = ["08:00", "13:00", "20:00"];
                    setEditFormFrequency(f);
                    setEditFormTimes(dTimes);
                  }}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                  
                    <option value="Daily">{t("auto.once_daily", "Once Daily")}</option>
                    <option value="Twice Daily">{t("auto.twice_daily", "Twice Daily")}</option>
                    <option value="Thrice Daily">{t("auto.thrice_daily", "Thrice Daily")}</option>
                    <option value="Weekly">{t("auto.weekly", "Weekly")}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.start_date", "Start Date")}</label>
                  <input
                  type="date"
                  required
                  value={editFormStartDate}
                  onChange={(e) => setEditFormStartDate(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none text-center" />
                
                </div>
              </div>

              {/* Times list */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.designated_reminders_times", "Designated Reminders Times")}</label>
                <div className="flex flex-wrap gap-2">
                  {editFormTimes.map((time, idx) =>
                <div key={idx} className="flex items-center gap-2 bg-black border border-[#1E1E1E] px-3 py-1.5 rounded-lg">
                      <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const copy = [...editFormTimes];
                      copy[idx] = e.target.value;
                      setEditFormTimes(copy);
                    }}
                    className="bg-transparent border-none text-xs text-white outline-none w-16" />
                  
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-medium">
                        {formatTime12Hour(time)}
                      </span>
                    </div>
                )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A1A1A] flex justify-end gap-2">
                <button
                type="button"
                onClick={() => {
                  setShowEditMedModal(false);
                  setEditingMedication(null);
                }}
                className="bg-transparent hover:bg-white/5 border border-[#1E1E1E] text-xs text-white font-semibold px-4 py-2 rounded-lg cursor-pointer">{t("auto.cancel", "Cancel")}


              </button>
                <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-5 py-2 rounded-lg cursor-pointer">{t("auto.update_therapy", "Update Therapy")}


              </button>
              </div>
            </form>
          </div>
        </div>
      }

      {/* Edit Single Log/Dose modal overlay */}
      {showEditLogModal &&
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#1E1E1E] w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
              <h3 className="text-white text-sm font-bold flex items-center gap-2">
                <Edit className="h-4 w-4 text-emerald-400" />{t("auto.edit_checklist_scheduled_dose", "Edit Checklist Scheduled Dose")}
            </h3>
              <button
              onClick={() => {
                setShowEditLogModal(false);
                setEditingLog(null);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg">
              
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditLog} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.medicine_name", "Medicine Name")}</label>
                <input
                type="text"
                required
                value={editLogName}
                onChange={(e) => setEditLogName(e.target.value)}
                className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
              
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.dosage_specification", "Dosage Specification")}</label>
                  <input
                  type="text"
                  required
                  value={editLogDosage}
                  onChange={(e) => setEditLogDosage(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.scheduled_time", "Scheduled Time")}</label>
                  <input
                  type="time"
                  required
                  value={editLogTime}
                  onChange={(e) => setEditLogTime(e.target.value)}
                  className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.compliance_status", "Compliance Status")}</label>
                <select
                value={editLogStatus}
                onChange={(e) => setEditLogStatus(e.target.value as any)}
                className="w-full bg-black border border-[#1F1F1F] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                
                  <option value="Pending">{t("auto.pending_dose", "Pending Dose")}</option>
                  <option value="Taken">{t("auto.taken_dose", "Taken Dose")}</option>
                  <option value="Skipped">{t("auto.skipped_dose", "Skipped Dose")}</option>
                  <option value="Snoozed">{t("auto.snoozed_alarm", "Snoozed Alarm")}</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#1A1A1A] flex justify-end gap-2">
                <button
                type="button"
                onClick={() => {
                  setShowEditLogModal(false);
                  setEditingLog(null);
                }}
                className="bg-transparent hover:bg-white/5 border border-[#1E1E1E] text-xs text-white font-semibold px-4 py-2 rounded-lg cursor-pointer">{t("auto.cancel", "Cancel")}


              </button>
                <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-5 py-2 rounded-lg cursor-pointer">{t("auto.update_dose_details", "Update Dose Details")}


              </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

} 