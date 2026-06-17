import React, { useState, useEffect } from "react";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { authApi, User, LoginHistoryRecord } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import {
  User as UserIcon, Mail, Phone, MapPin, KeyRound, LogOut, CheckCircle2,
  Settings, ShieldAlert, Monitor, Globe, Clock, ShieldCheck, Save, Loader2, Sparkles, RefreshCw,
  Activity, BarChart3, Apple, MessageSquare, Heart, Sparkle, Menu, X, BookOpenCheck, Users, Pill, Volume2 } from
"lucide-react";
import HealthCollectionForm from "./HealthCollectionForm";
import EvaluationResultsPage from "./EvaluationResultsPage";
import RiskDevelopmentPage from "./RiskDevelopmentPage";
import TimelineAnalyticsPage from "./TimelineAnalyticsPage";
import NutritionGuidePage from "./NutritionGuidePage";
import RecommendationsPage from "./RecommendationsPage";
import AICoachPage from "./AICoachPage";
import AssessmentSummaryReport from "./AssessmentSummaryReport";
import AIHealthTwin from "./AIHealthTwin";
import HealthRiskHeatmap from "./HealthRiskHeatmap";
import ReportSimplifierPage from "./ReportSimplifierPage";
import MedicationManager from "./MedicationManager";
import NearbyHealthcare from "./NearbyHealthcare";
import { useTranslation } from "react-i18next";

const parsePhoneNumberParts = (rawPhone: string) => {
  const match = rawPhone.match(/^([+]\d+)\s+(.*)$/);
  if (match) {
    return { code: match[1], number: match[2] };
  }
  for (const code of ["+91", "+1", "+44", "+61", "+65", "+971", "+49", "+33"]) {
    if (rawPhone.startsWith(code)) {
      return { code, number: rawPhone.slice(code.length).trim() };
    }
  }
  return { code: "+91", number: rawPhone };
};

const parseAddressParts = (rawAddr: string) => {
  if (rawAddr.includes(" || ")) {
    const parts = rawAddr.split(" || ");
    if (parts.length >= 7) {
      return {
        flatHouse: parts[0] || "",
        streetNagar: parts[1] || "",
        city: parts[2] || "",
        district: parts[3] || "",
        state: parts[4] || "",
        country: parts[5] || "India",
        postalCode: parts[6] || ""
      };
    }
    if (parts.length >= 6) {
      return {
        flatHouse: parts[0] || "",
        streetNagar: parts[1] || "",
        city: parts[2] || "",
        district: parts[3] || "",
        state: parts[4] || "",
        country: parts[5] || "India",
        postalCode: ""
      };
    }
    return {
      flatHouse: parts[0] || "",
      streetNagar: parts[1] || "",
      city: parts[2] || "",
      district: parts[3] || "",
      state: "",
      country: parts[4] || "India",
      postalCode: ""
    };
  }
  const parts = rawAddr.split(",").map((p) => p.trim());
  if (parts.length >= 5) {
    return {
      flatHouse: parts[0] || "",
      streetNagar: parts[1] || "",
      city: parts[2] || "",
      district: parts[3] || "Unspecified",
      state: parts[4] || "Unspecified",
      country: parts[5] || "India",
      postalCode: ""
    };
  }
  return {
    flatHouse: rawAddr,
    streetNagar: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    postalCode: ""
  };
};

interface DashboardPageProps {
  currentUser: User;
  onLogout: () => void;
}

export default function DashboardPage({ currentUser, onLogout }: DashboardPageProps) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("aegis_preferred_lang", lng);
  };

  // Account core profile state
  const [user, setUser] = useState<User>(currentUser);

  // Navigation states matching user requested sections: Profile, Health Data Input, Timeline Analysis, Clinical Companion, AI Health Twin, Health Risk Heatmap, Report Simplifier
  type AppSection = "profile" | "intake" | "twin" | "timeline" | "companion" | "heatmap" | "simplifier" | "medications" | "assistance";
  const [activeSection, setActiveSection] = useState<AppSection>("profile");

  type TimelineSubTab = "evaluation" | "risk_curve" | "timeline_analytics" | "preventive" | "nutrition" | "summary_report";
  const [activeTimelineSubTab, setActiveTimelineSubTab] = useState<TimelineSubTab>("evaluation");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Clincal Evaluation states shared across tabs
  const [timelineRecords, setTimelineRecords] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Profile Form States
  const [editFullName, setEditFullName] = useState(currentUser.fullName);

  // Custom Country Code + Phone Raw States
  const initialPhoneParts = parsePhoneNumberParts(currentUser.phoneNumber);
  const [editCountryCode, setEditCountryCode] = useState(initialPhoneParts.code);
  const [editPhoneRaw, setEditPhoneRaw] = useState(initialPhoneParts.number);

  // Elaborated Address states
  const initialAddrParts = parseAddressParts(currentUser.address);
  const [editFlatHouse, setEditFlatHouse] = useState(initialAddrParts.flatHouse);
  const [editStreetNagar, setEditStreetNagar] = useState(initialAddrParts.streetNagar);
  const [editCity, setEditCity] = useState(initialAddrParts.city);
  const [editDistrict, setEditDistrict] = useState(initialAddrParts.district);
  const [editState, setEditState] = useState(initialAddrParts.state || "");
  const [editCountry, setEditCountry] = useState(initialAddrParts.country);
  const [editPostalCode, setEditPostalCode] = useState(initialAddrParts.postalCode || "");

  // Password modification state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Sub-panel controls & Feedback
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "security">("profile");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const countryToCodeMap: Record<string, string> = {
    "India": "+91",
    "United States": "+1",
    "United Kingdom": "+44",
    "Canada": "+1",
    "Australia": "+61",
    "Singapore": "+65",
    "United Arab Emirates": "+971",
    "Germany": "+49",
    "France": "+33"
  };

  const handleEditCountryChange = (selectedCountry: string) => {
    setEditCountry(selectedCountry);
    const code = countryToCodeMap[selectedCountry];
    if (code) {
      setEditCountryCode(code);
    }
  };

  // Fetch timeline archive logs from database
  const fetchTimeline = async (selectLatest = false) => {
    setLoadingTimeline(true);
    try {
      const resp = await fetch("/api/health-timeline", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aegis_access_token")}`
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setTimelineRecords(data);
        if (data.length > 0) {
          if (selectLatest || !selectedRecordId) {
            setSelectedRecordId(data[data.length - 1].id);
            // Default to evaluation screen inside timeline section if timeline exists and we loaded first time
            if (!selectedRecordId) {
              setActiveSection("timeline");
              setActiveTimelineSubTab("evaluation");
            }
          }
        } else {
          // No records registered: default to Intake form (Health Data Input)
          setActiveSection("intake");
        }
      }
    } catch (e) {
      console.error("Failed fetching chronological timelines:", e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Handle successful save from Intake Form: Redirect to Results
  const handleTimelineSaved = () => {
    fetchTimeline(true);
    setActiveSection("timeline");
    setActiveTimelineSubTab("evaluation");
  };

  const loadLatestProfileAndHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await authApi.getProfile();
      setUser(data.user);
      setLoginHistory(data.loginHistory);
      setEditFullName(data.user.fullName);

      const parsedPhone = parsePhoneNumberParts(data.user.phoneNumber);
      setEditCountryCode(parsedPhone.code);
      setEditPhoneRaw(parsedPhone.number);

      const parsedAddr = parseAddressParts(data.user.address);
      setEditFlatHouse(parsedAddr.flatHouse);
      setEditStreetNagar(parsedAddr.streetNagar);
      setEditCity(parsedAddr.city);
      setEditDistrict(parsedAddr.district);
      setEditState(parsedAddr.state || "");
      setEditCountry(parsedAddr.country);
      setEditPostalCode(parsedAddr.postalCode || "");
    } catch (e) {
      console.error("Failed to load user credentials audit log:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadLatestProfileAndHistory();
    fetchTimeline();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    const combinedPhoneNumber = `${editCountryCode} ${editPhoneRaw.trim()}`.trim();
    const combinedAddress = `${editFlatHouse.trim()} || ${editStreetNagar.trim()} || ${editCity.trim()} || ${editDistrict.trim()} || ${editState.trim()} || ${editCountry.trim()} || ${editPostalCode.trim()}`;

    if (!editFullName || !editPhoneRaw || !editFlatHouse || !editStreetNagar || !editCity || !editDistrict || !editState || !editCountry || !editPostalCode) {
      setProfileError("Full Name, Phone, and all Address elements including Postal Code are required.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        fullName: editFullName,
        phoneNumber: combinedPhoneNumber,
        address: combinedAddress
      });
      setUser(updated);
      setProfileSuccess("Information updated securely and persisted to server.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      console.error(err);
      setProfileError(err.response?.data?.error || "Failed to update target demographic records.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All password inputs are required to proceed with revisions.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Your new password confirmation does not match parameters.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("The new password must span at least 8 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword
      });
      setPasswordSuccess("Security password modified successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.response?.data?.message || err.response?.data?.error || "Weak password or invalid current credential verification.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const formatDateString = (iso: string | null) => {
    if (!iso) return "Not Logged";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Safe selected record state management
  const selectedRecord = timelineRecords.find((rec) => rec.id === selectedRecordId) || timelineRecords[timelineRecords.length - 1] || null;
  const evaluationInput = selectedRecord ? selectedRecord.analysisResults : null;

  // Persistent sidebar links based on the core portal sections requested: Profile, Health Data Input, AI Health Twin, Timeline Analysis, Clinical Companion, Health Risk Heatmap
  const sidebarLinks = [
  { id: "profile", label: t("dashboard.menu.profile", "Profile"), icon: UserIcon },
  { id: "intake", label: t("dashboard.menu.health_data_input", "Health Data Input"), icon: Activity },
  { id: "medications", label: t("dashboard.menu.medication_reminders", "Medication Reminders"), icon: Pill },
  { id: "assistance", label: t("dashboard.menu.nearby_assistance", "Nearby Assistance"), icon: MapPin },
  { id: "heatmap", label: t("dashboard.menu.health_risk_heatmap", "Health Risk Heatmap"), icon: Heart, disabled: timelineRecords.length === 0 },
  { id: "twin", label: t("dashboard.menu.ai_health_twin", "AI Health Twin"), icon: Users, disabled: timelineRecords.length === 0 },
  { id: "timeline", label: t("dashboard.menu.timeline_analysis", "Timeline Analysis"), icon: BarChart3, disabled: timelineRecords.length === 0 },
  { id: "companion", label: t("dashboard.menu.clinical_companion", "Clinical Companion"), icon: MessageSquare, disabled: timelineRecords.length === 0 },
  { id: "simplifier", label: t("dashboard.menu.report_simplifier", "Explain My Report (10yo)"), icon: BookOpenCheck }];


  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Superior header */}
        <header className="bg-[#0A0A0A]/80 border border-[#1A1A1A] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-10 w-10 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white uppercase tracking-wider font-mono">{t("dashboard.title", "HealthSheild AI")}</h1>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/20 lowercase">
                  {t("dashboard.clinical_nodes", "clinical nodes")}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">{t("dashboard.precision_early_warning", "Precision early warning modeling & multi-coordinate timeline graphs")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {/* Mobile Sidebar Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-neutral-900 border border-[#222] text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle navigation menu">
              
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-slate-400 mr-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-xs font-medium">Language:</span>
              </div>
              <div className="flex bg-[#0A0A0A] border border-[#222] rounded-lg overflow-hidden p-0.5">
                {[
                  { code: 'en', label: 'EN' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'ml', label: 'മലയാളം' },
                  { code: 'kn', label: 'ಕನ್ನಡ' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-1.5 text-xs font-bold transition-all ${
                      i18n.language === lang.code 
                        ? 'bg-emerald-500 text-black rounded-md' 
                        : 'text-slate-400 hover:text-white hover:bg-[#1A1A1A] rounded-md'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer uppercase font-mono">
                
                <LogOut className="h-3.5 w-3.5 stroke-[2.5]" />
                {t("dashboard.logout", "Log Out")}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown/Drawer list */}
        {isMobileMenuOpen &&
        <div className="lg:hidden bg-[#0A0A0A]/95 border border-[#1A1A1A] rounded-2xl p-4 space-y-2 shadow-2xl relative z-50">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block mb-1">{t("dashboard.operations_portal", "HealthSheild AI Operations Portal")}</span>
            {sidebarLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <button
                key={link.id}
                disabled={link.disabled}
                onClick={() => {
                  if (!link.disabled) {
                    setActiveSection(link.id as any);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`w-full py-2.5 px-3 rounded-xl text-left font-black text-xs uppercase flex items-center gap-2.5 transition-all ${
                link.disabled ?
                "opacity-35 cursor-not-allowed text-slate-650" :
                "cursor-pointer"} ${

                activeSection === link.id ?
                "bg-gradient-to-r from-emerald-500/12 to-teal-500/5 border border-emerald-500/25 text-white" :
                link.disabled ? "text-slate-605" : "bg-transparent border border-transparent text-slate-400 hover:text-white"}`
                }>
                
                  <IconComponent className={`h-4 w-4 ${activeSection === link.id ? "text-emerald-400" : "text-slate-500"}`} />
                  {link.label}
                </button>);

          })}
          </div>
        }

        {/* Personalized Welcome Message Board */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-[#1E1E1E] rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-1/2 -right-12 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl -translate-y-1/2" />
          
          <div className="space-y-1 z-10 text-center md:text-left">
            <div className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center justify-center md:justify-start gap-1 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-emerald-455 animate-pulse" />
              {t("dashboard.active_diagnostic_account", "Active Diagnostic Account")}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("dashboard.welcome", "Welcome Back")}, <span className="text-emerald-400 font-black">{user.fullName}</span>!
            </h2>
            {timelineRecords.length > 0 && selectedRecord &&
            <div className="text-xs text-slate-400 font-medium">{t("auto.active_assessment_selected", "Active Assessment Selected:")}
              <span className="text-emerald-400 font-bold font-mono">{new Date(selectedRecord.timestamp).toLocaleString()}</span>
              </div>
            }
          </div>

          {/* Detailed Selected Record Selector Dropdown inside welcome banner */}
          {timelineRecords.length > 0 &&
          <div className="bg-black/40 border border-[#1C1C1C] rounded-xl p-2 z-10 flex items-center gap-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 pl-1 font-mono">{t("auto.assessment", "Assessment:")}</span>
              <select
              value={selectedRecordId || ""}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="bg-[#050505] border border-[#222] text-xs text-white px-3 py-1.5 rounded-lg outline-none cursor-pointer focus:border-emerald-500/40 text-center font-mono font-bold">
              
                {timelineRecords.map((rec) =>
              <option key={rec.id} value={rec.id}>
                    {new Date(rec.timestamp).toLocaleDateString()} ({rec.analysisResults?.healthScore?.score || "N/A"}{t("auto.pts", "pts)")}
              </option>
              )}
              </select>
            </div>
          }
        </div>

        {/* Sidebar + Main Render Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Enhanced persistent sidebar tab list menu */}
          <div className="hidden lg:block lg:col-span-3 space-y-2 bg-[#0A0A0A]/40 border border-[#1A1A1A] p-4 rounded-2xl shadow-xl backdrop-blur-md">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mb-1">{t("dashboard.operations_portal", "HealthSheild AI Operations Portal")}</span>
            
            {sidebarLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => link.disabled ? null : setActiveSection(link.id as any)}
                  disabled={link.disabled}
                  className={`w-full py-3 px-3.5 rounded-xl text-left font-black text-xs uppercase flex items-center gap-2.5 transition-all select-none ${
                  link.disabled ?
                  "opacity-35 cursor-not-allowed text-slate-650" :
                  "cursor-pointer"} ${

                  activeSection === link.id ?
                  "bg-gradient-to-r from-emerald-500/12 to-teal-500/5 border border-emerald-500/25 text-white" :
                  link.disabled ? "text-slate-600" : "bg-transparent border border-transparent text-slate-400 hover:text-white"}`
                  }>
                  
                  <IconComponent className={`h-4.5 w-4.5 ${activeSection === link.id ? "text-emerald-400" : "text-slate-500"}`} />
                  {link.label}
                </button>);

            })}
          </div>

          {/* Active Navigation Workspace container */}
          <div className="lg:col-span-9 bg-[#0A0A0A]/20 min-h-[500px]">
            <AnimatePresence mode="wait">
              
              {/* PROFILE TAB */}
              {activeSection === "profile" &&
              <motion.div
                key="personal-tab-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                  {/* Left Column: Demographics card & logs */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#0A0A0A]/60 border border-[#1A1A1A] p-5 rounded-2xl space-y-4 shadow-xl backdrop-blur-md relative overflow-hidden">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-[#161616]">
                        <UserIcon className="h-4 w-4 text-emerald-400" /> {t("dashboard.account_attributes", "Account Attributes")}
                      </h3>
                      
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8.5 w-8.5 bg-zinc-900 border border-neutral-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden min-w-0 flex-1">
                            <span className="text-[8px] uppercase font-bold text-slate-500 block">{t("dashboard.email_address", "Email Address")}</span>
                            <span className="text-xs font-bold text-white truncate block">{user.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-8.5 w-8.5 bg-zinc-900 border border-neutral-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-bold text-slate-500 block">{t("dashboard.phone_connection", "Phone Connection")}</span>
                            <span className="text-xs font-bold text-white block">
                              {user.phoneNumber.includes(" ") ?
                            <>
                                  <span className="text-emerald-400 font-mono mr-1.5">{user.phoneNumber.split(" ")[0]}</span>
                                  <span>{user.phoneNumber.split(" ").slice(1).join(" ")}</span>
                                </> :
                            user.phoneNumber}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="h-8.5 w-8.5 bg-zinc-900 border border-neutral-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[8px] uppercase font-bold text-slate-500 block">{t("dashboard.residential_address", "Residential Address")}</span>
                            {user.address.includes(" || ") ?
                          <div className="text-xs space-y-0.5 mt-0.5 text-slate-300 font-medium">
                                <p className="font-bold text-white">{user.address.split(" || ")[0]}</p>
                                <p className="text-slate-400">{user.address.split(" || ")[1]}</p>
                                <p className="text-slate-400">
                                  {user.address.split(" || ")[2]}, {user.address.split(" || ")[3]}
                                  {user.address.split(" || ").length >= 6 && user.address.split(" || ")[4] ? `, ${user.address.split(" || ")[4]}` : ""}
                                </p>
                                <p className="text-[9px] text-emerald-400 font-extrabold uppercase mt-1 tracking-wider inline-block bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  {user.address.split(" || ").length >= 6 ? user.address.split(" || ")[5] : user.address.split(" || ")[4]}
                                </p>
                              </div> :

                          <span className="text-xs font-bold text-white leading-relaxed block truncate text-slate-300 font-medium">{user.address}</span>
                          }
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-8.5 w-8.5 bg-zinc-900 border border-neutral-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-bold text-slate-500 block">{t("dashboard.registration_timestamp", "Registration Timestamp")}</span>
                            <span className="text-xs font-bold text-slate-300 font-mono block">
                              {formatDateString(user.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audit Logs list */}
                    <div className="bg-[#0A0A0A]/60 border border-[#1A1A1A] p-5 rounded-2xl space-y-4 shadow-xl backdrop-blur-md">
                      <div className="flex justify-between items-center pb-2 border-b border-[#161616]">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Monitor className="h-4 w-4 text-emerald-400" /> {t("dashboard.recent_security_logs", "Recent Security Logs")}
                        </h3>
                        <button
                        onClick={loadLatestProfileAndHistory}
                        disabled={loadingHistory}
                        className="text-slate-500 hover:text-emerald-400 transition-colors uppercase text-[9px] font-extrabold flex items-center gap-1 cursor-pointer">
                        
                          <RefreshCw className={`h-3 w-3 ${loadingHistory ? "animate-spin" : ""}`} /> {t("dashboard.refresh", "Refresh")}
                        </button>
                      </div>

                      {loadingHistory ?
                    <div className="py-6 flex items-center justify-center text-xs text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> {t("dashboard.synchronizing_logs", "Synchronizing logs...")}
                        </div> :
                    loginHistory.length === 0 ?
                    <div className="text-center py-6 text-xs text-slate-600 font-medium">
                          {t("dashboard.no_audit_records", "No previous audit records found in secure registers.")}
                        </div> :

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 font-mono text-[10px]">
                          {loginHistory.map((log) =>
                      <div
                        key={log.id}
                        className={`p-2.5 rounded-xl border flex gap-2.5 items-start ${
                        log.status === "failed" ?
                        "border-red-500/15 bg-red-500/5 text-red-400" :
                        "border-[#1F1F1F] bg-[#070707] text-slate-300"}`
                        }>
                        
                              <Globe className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
                        log.status === "failed" ? "text-red-400" : "text-emerald-400 opacity-90"}`
                        } />
                              <div className="overflow-hidden min-w-0 flex-1 leading-snug">
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-[8px] uppercase tracking-wider text-slate-500">
                                    {t("dashboard.ip", "IP")}: {log.ip}
                                  </span>
                                  <span className={`text-[8px] font-bold uppercase rounded px-1 ${
                            log.status === "success" ?
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                            "bg-red-500/13 text-red-500 border border-red-500/10"}`
                            }>
                                    {log.status}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-400 mt-0.5 truncate text-[10px]">{t("dashboard.device", "Device")}: {log.userAgent}</p>
                                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                                  {formatDateString(log.timestamp)}
                                </span>
                              </div>
                            </div>
                      )}
                        </div>
                    }
                    </div>
                  </div>

                  {/* Right Column: Revisions Panel */}
                  <div className="lg:col-span-7 flex flex-col gap-5">
                    <div className="bg-[#0C0C0C] border border-[#1E1E1E] p-1.5 rounded-2xl flex gap-1 shadow-md">
                      <button
                      type="button"
                      onClick={() => setActiveSubTab("profile")}
                      className={`flex-1 py-3 rounded-xl transition-all cursor-pointer font-bold text-xs uppercase ${
                      activeSubTab === "profile" ?
                      "bg-neutral-900 border border-[#2B2B2B] text-white" :
                      "text-slate-400 hover:text-white"}`
                      }>
                      
                        <div className="flex items-center justify-center gap-2">
                          <Settings className="h-4 w-4 text-emerald-400" />
                          {t("dashboard.demographic_manager", "Demographic Manager")}
                        </div>
                      </button>

                      <button
                      type="button"
                      onClick={() => setActiveSubTab("security")}
                      className={`flex-1 py-3 rounded-xl transition-all cursor-pointer font-bold text-xs uppercase ${
                      activeSubTab === "security" ?
                      "bg-neutral-900 border border-[#2B2B2B] text-white" :
                      "text-slate-400 hover:text-white"}`
                      }>
                      
                        <div className="flex items-center justify-center gap-2">
                          <KeyRound className="h-4 w-4 text-emerald-400" />
                          {t("dashboard.credentials_security", "Credentials Security")}
                        </div>
                      </button>
                    </div>

                    <div className="bg-[#0A0A0A]/60 border border-[#1A1A1A] p-6 rounded-3xl shadow-xl backdrop-blur-md">
                      <AnimatePresence mode="wait">
                        {activeSubTab === "profile" ?
                      <motion.div
                        key="pane-profile"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4">
                        
                            <div>
                              <h3 className="text-base font-black text-white uppercase tracking-tight">{t("dashboard.edit_demographics", "Edit Demographics")}</h3>
                              <p className="text-xs text-slate-500 mt-1">{t("dashboard.update_demographics_desc", "Update demographic factors safely inside database records")}</p>
                            </div>

                            {profileSuccess &&
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>{profileSuccess}</span>
                              </div>
                        }
                            {profileError &&
                        <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2">
                                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                                <span>{profileError}</span>
                              </div>
                        }

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("dashboard.full_name", "Full Name")}</label>
                                <div className="relative">
                                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                  <input
                                type="text"
                                required
                                value={editFullName}
                                onChange={(e) => setEditFullName(e.target.value)}
                                className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-9 py-2.5 rounded-xl outline-none" />
                              
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("dashboard.phone_connection", "Phone Connection")}</label>
                                <div className="flex gap-2">
                                  <select
                                value={editCountryCode}
                                onChange={(e) => setEditCountryCode(e.target.value)}
                                className="bg-[#060606] border border-[#1E1E1E] text-xs text-white px-2 rounded-xl outline-none">
                                
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+65">🇸🇬 +65</option>
                                    <option value="+49">🇩🇪 +49</option>
                                  </select>
                                  <input
                                type="text"
                                required
                                value={editPhoneRaw}
                                onChange={(e) => setEditPhoneRaw(e.target.value)}
                                className="flex-1 bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-4 py-2.5 rounded-xl outline-none" />
                              
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("dashboard.flat_house_no", "Flat/House No.")}</label>
                                  <input
                                type="text"
                                required
                                value={editFlatHouse}
                                onChange={(e) => setEditFlatHouse(e.target.value)}
                                className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-3 py-2.5 rounded-xl outline-none" />
                              
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("dashboard.street_name_area", "Street Name/Area")}</label>
                                  <input
                                type="text"
                                required
                                value={editStreetNagar}
                                onChange={(e) => setEditStreetNagar(e.target.value)}
                                className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-3 py-2.5 rounded-xl outline-none" />
                              
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <input
                              type="text"
                              placeholder={t("dashboard.city", "City")}
                              required
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                              className="bg-[#060606] border border-[#1E1E1E] text-xs px-2.5 py-2.5 rounded-xl outline-none" />
                            
                                <input
                              type="text"
                              placeholder={t("dashboard.district", "District")}
                              required
                              value={editDistrict}
                              onChange={(e) => setEditDistrict(e.target.value)}
                              className="bg-[#060606] border border-[#1E1E1E] text-xs px-2.5 py-2.5 rounded-xl outline-none" />
                            
                                <input
                              type="text"
                              placeholder={t("dashboard.state", "State")}
                              required
                              value={editState}
                              onChange={(e) => setEditState(e.target.value)}
                              className="bg-[#060606] border border-[#1E1E1E] text-xs px-2.5 py-2.5 rounded-xl outline-none" />
                            
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("dashboard.postal_code_zip", "Postal Code / ZIP")}</label>
                                  <input
                                type="text"
                                required
                                placeholder={t("auto.e_g_600001", "e.g. 600001")}
                                value={editPostalCode}
                                onChange={(e) => setEditPostalCode(e.target.value)}
                                className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-3 py-2.5 rounded-xl outline-none" />
                              
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("dashboard.country", "Country")}</label>
                                  <select
                                value={editCountry}
                                onChange={(e) => handleEditCountryChange(e.target.value)}
                                className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-3 py-2.5 rounded-xl outline-none text-white animate-fade-in">
                                
                                    <option value="India">{t("auto.india", "India")}</option>
                                    <option value="United States">{t("auto.united_states", "United States")}</option>
                                    <option value="United Kingdom">{t("auto.united_kingdom", "United Kingdom")}</option>
                                    <option value="Canada">{t("auto.canada", "Canada")}</option>
                                    <option value="Australia">{t("auto.australia", "Australia")}</option>
                                    <option value="Singapore">{t("auto.singapore", "Singapore")}</option>
                                    <option value="United Arab Emirates">{t("auto.united_arab_emirates", "United Arab Emirates")}</option>
                                    <option value="Germany">{t("auto.germany", "Germany")}</option>
                                    <option value="France">{t("auto.france", "France")}</option>
                                  </select>
                                </div>
                              </div>

                              <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-black font-extrabold py-3 px-5 text-xs rounded-xl uppercase transition-all flex items-center justify-center gap-1.5">
                            
                                {isUpdatingProfile ? "Saving changes..." : "Save Demographics"}
                              </button>
                            </form>
                          </motion.div> :

                      <motion.div
                        key="pane-security"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4">
                        
                            <div>
                              <h3 className="text-base font-black text-white uppercase tracking-tight">{t("dashboard.password_modification", "Password Modification")}</h3>
                              <p className="text-xs text-slate-500 mt-1 font-medium">{t("dashboard.password_modification_desc", "Current credential authentication is required to revise security layers")}</p>
                            </div>

                            {passwordSuccess &&
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>{passwordSuccess}</span>
                              </div>
                        }
                            {passwordError &&
                        <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2">
                                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                                <span>{passwordError}</span>
                              </div>
                        }

                            <form onSubmit={handleChangePassword} className="space-y-4">
                              <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder={t("dashboard.current_password", "Current Password")}
                            className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-4 py-2.5 rounded-xl outline-none" />
                          

                              <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t("dashboard.new_password", "New Password (min 8 characters)")}
                            className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-4 py-2.5 rounded-xl outline-none" />
                          

                              <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder={t("dashboard.confirm_new_password", "Confirm New Password")}
                            className="w-full bg-[#060606] border border-[#1E1E1E] text-xs px-4 py-2.5 rounded-xl outline-none" />
                          

                              <PasswordStrengthIndicator pass={newPassword} />

                              <button
                            type="submit"
                            disabled={isUpdatingPassword}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:text-black/40 text-black px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                            
                                {isUpdatingPassword ?
                            <><Loader2 className="h-4 w-4 animate-spin" /> {t("dashboard.applying_encryption", "Applying encryption...")}</> :

                            <><ShieldCheck className="h-4 w-4" /> {t("dashboard.update_security_layer", "Update Security Layer")}</>
                            }
                              </button>
                            </form>
                          </motion.div>
                      }
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              }

              {/* INTAKE FORM */}
              {activeSection === "intake" &&
              <motion.div
                key="collection-tab-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                
                  <HealthCollectionForm userId={user.id} onTimelineSaved={handleTimelineSaved} />
                </motion.div>
              }

              {/* AI HEALTH TWIN SECTION */}
              {activeSection === "twin" &&
              <motion.div
                key="ai-health-twin-portal"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}>
                
                  <AIHealthTwin selectedRecord={selectedRecord} evaluation={evaluationInput} user={user} />
                </motion.div>
              }

              {/* TIMELINE ANALYSIS SECTION */}
              {activeSection === "timeline" &&
              <motion.div
                key="timeline-subtabs-container"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6">
                
                  {/* Timeline Sub-Navigation Bar */}
                  <div className="flex flex-wrap gap-1.5 bg-[#0A0A0A] border border-[#1A1A1A] p-1.5 rounded-xl shadow-lg">
                    {[
                  { id: "evaluation", label: "Health Evaluation", icon: ShieldCheck },
                  { id: "risk_curve", label: "Risk Curves", icon: ShieldAlert },
                  { id: "timeline_analytics", label: "Timeline Metrics", icon: BarChart3 },
                  { id: "preventive", label: "Preventive Measures", icon: Settings },
                  { id: "nutrition", label: "Nutritional Diet", icon: Apple },
                  { id: "summary_report", label: "Weekly Clinical Report", icon: BookOpenCheck }].
                  map((subTab) => {
                    const SubIcon = subTab.icon;
                    const isActive = activeTimelineSubTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => setActiveTimelineSubTab(subTab.id as any)}
                        className={`flex items-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                        isActive ?
                        "bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/25 text-white" :
                        "text-slate-400 hover:text-white border border-transparent"}`
                        }>
                        
                          <SubIcon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                          {subTab.label}
                        </button>);

                  })}
                  </div>

                  {/* Sub-tab viewport container */}
                  <div className="mt-4">
                    {activeTimelineSubTab === "evaluation" &&
                  <EvaluationResultsPage evaluation={evaluationInput} selectedRecord={selectedRecord} />
                  }
                    {activeTimelineSubTab === "risk_curve" &&
                  <RiskDevelopmentPage
                    evaluation={evaluationInput}
                    timelineRecords={timelineRecords}
                    selectedRecordId={selectedRecordId} />

                  }
                    {activeTimelineSubTab === "timeline_analytics" &&
                  <TimelineAnalyticsPage timelineRecords={timelineRecords} />
                  }
                    {activeTimelineSubTab === "preventive" &&
                  <RecommendationsPage evaluation={evaluationInput} selectedRecord={selectedRecord} />
                  }
                    {activeTimelineSubTab === "nutrition" &&
                  <NutritionGuidePage evaluation={evaluationInput} selectedRecord={selectedRecord} />
                  }
                    {activeTimelineSubTab === "summary_report" &&
                  <AssessmentSummaryReport evaluation={evaluationInput} selectedRecord={selectedRecord} user={user} />
                  }
                  </div>
                </motion.div>
              }

              {/* CLINICAL COMPANION CHAT */}
              {activeSection === "companion" &&
              <motion.div
                key="companion-tab-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                
                  <AICoachPage evaluation={evaluationInput} selectedRecord={selectedRecord} />
                </motion.div>
              }

              {/* HEALTH RISK HEATMAP */}
              {activeSection === "heatmap" &&
              <motion.div
                key="heatmap-tab-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                
                  <HealthRiskHeatmap evaluation={evaluationInput} selectedRecord={selectedRecord} user={user} />
                </motion.div>
              }

              {/* REPORT SIMPLIFIER */}
              {activeSection === "simplifier" &&
              <motion.div
                key="simplifier-tab-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                
                  <ReportSimplifierPage user={user} />
                </motion.div>
              }

              {/* SMART MEDICATION MANAGEMENT */}
              {activeSection === "medications" &&
              <motion.div
                key="medications-tab-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                
                  <MedicationManager />
                </motion.div>
              }

              {/* SMART HOSPITAL & DOCTOR RECOMMENDATION SYSTEM */}
              {activeSection === "assistance" &&
              <motion.div
                key="assistance-tab-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                
                  <NearbyHealthcare evaluation={evaluationInput} selectedRecord={selectedRecord} user={user} />
                </motion.div>
              }

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>);

}