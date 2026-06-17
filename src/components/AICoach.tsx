import React, { useState, useRef, useEffect } from "react";
import { UserProfile, DiseasePrediction, PredictionEngineOutput } from "../types";
import { 
  Bot, User, Send, Compass, Flame, HelpCircle, AlertCircle, Sparkles, 
  CheckCircle2, Clock, Activity, ClipboardList, Lightbulb, TrendingUp, Info
} from "lucide-react";

interface AICoachProps {
  profile: UserProfile;
  currentPredictions: DiseasePrediction[];
  evaluation: PredictionEngineOutput | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AICoach({ profile, currentPredictions, evaluation }: AICoachProps) {
  // Mobile active tab logic inside chat widget
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `### Welcome to your Proactive Health Lounge! 

I am your AI Clinical Companion, loaded with your active vital parameters, genetic health indices, and metabolic metrics.

I've flagged key preventative insights for your cardiovascular and metabolic status in the panel. Ask me anything about your evaluations, or tap one of the personalized clinical prompt seeds below to begin mapping your health trajectory:`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load completed tasks state from localStorage
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`aegis_tasks_${profile.gender}_${profile.age}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load custom habits from evaluation or standard templates
  const habits = evaluation?.preventiveRoadmap?.habits || [
    { category: "Fitness", title: "Walk exactly 8,000 steps daily", description: "Enhance insulin sensitivity and stimulate peripheral blood flow.", difficulty: "Easy", impact: "High" },
    { category: "Sleep", title: "Target 8 hours of restorative sleep", description: "Restrict midnight screens to assist cortisol recovery.", difficulty: "Medium", impact: "High" },
    { category: "Nutrition", title: "Reduce simple sugars to <15g/day", description: "Prevent sugar glycations to protect arterial elastin profiles.", difficulty: "Challenging", impact: "Urgent" },
    { category: "Stress Management", title: "Somatic parasympathetic box breathing", description: "Perform 5-min slow counts to assist vagal tone.", difficulty: "Easy", impact: "Standard" }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleTask = (taskTitle: string) => {
    const updated = { ...completedTasks, [taskTitle]: !completedTasks[taskTitle] };
    setCompletedTasks(updated);
    try {
      localStorage.setItem(`aegis_tasks_${profile.gender}_${profile.age}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  const completedCount = habits.filter(h => completedTasks[h.title]).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Dynamically generated clinical prompt seeds based on biochemistry & risks
  const getDynamicPrompts = () => {
    const prompts = [];
    if (profile.bloodSugar > 100) {
      prompts.push(`💡 Low-glycemic macro strategy for blood sugar of ${profile.bloodSugar} mg/dL.`);
    } else {
      prompts.push("💡 Proactive vascular protection diet based on my lipids.");
    }

    if (profile.systolicBP >= 130) {
      prompts.push(`💡 How to counter high systolic blood pressure (${profile.systolicBP}/${profile.diastolicBP}) physically.`);
    } else {
      prompts.push("💡 Oxygen extraction aerobic zones (Zone 2 cardio schedules).");
    }

    if (profile.smoking === "Active") {
      prompts.push("💡 Cellular recovery breakdown: what happens when I quit smoking.");
    } else if (profile.stressLevel >= 7) {
      prompts.push(`💡 Vagus-stimulation drills to downregulate stress of ${profile.stressLevel}/10.`);
    } else {
      prompts.push("💡 Biochemical explanation of Advanced Glycation End-products.");
    }

    if (currentPredictions && currentPredictions.length > 0) {
      prompts.push(`💡 Specific behavioral steps regarding my ${currentPredictions[0].name} risk.`);
    } else {
      prompts.push("💡 How structural muscle mass acts as a direct metabolic glucose sink.");
    }

    return prompts.slice(0, 4);
  };

  const dynamicPrompts = getDynamicPrompts();

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    try {
      const response = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: localStorage.getItem("aegis_preferred_lang") || "en",
          message: textToSend,
          profile,
          currentRisks: currentPredictions,
          chatHistory: messages.slice(-10), // Send adequate history
        }),
      });

      const data = await response.json();
      const assistMsg: ChatMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, assistMsg]);
    } catch (error) {
      console.error("Companion chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I encountered a connection issue syncing with the proactive health engine. Please confirm your local networks are connected, and check if your platform API keys are correctly active. Feel free to ask another query!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Helper renderers for bio indicators
  const getSugarStatus = (val: number) => {
    if (val >= 126) return { label: "Diabetic Threat", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (val >= 100) return { label: "Impaired Glucose", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "Euglycemic (Optimal)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) return { label: "Stage 2 Hypertension", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (sys >= 130 || dia >= 80) return { label: "Stage 1 Hypertension", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "Norman (Ideal Elasticity)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getStressStatus = (lvl: number) => {
    if (lvl >= 7) return { label: "High Cortisol Load", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (lvl >= 4) return { label: "Moderate Stress", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "Restorative Parasympathetic", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="companion-dashboard-widget">
      
      {/* Mobile Selector Tab Switcher */}
      <div className="lg:hidden col-span-1 flex gap-2 bg-[#0A0A0A] border border-[#1A1A1A] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${
            activeTab === "chat" 
              ? "bg-[#141414] border border-[#222] text-white" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          💬 Consultation Chat
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${
            activeTab === "insights" 
              ? "bg-[#141414] border border-[#222] text-white" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          🎯 Insights & Task Board ({habits.length - completedCount} open)
        </button>
      </div>

      {/* Main Conversational Board Panel */}
      <div 
        className={`lg:col-span-7 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl shadow-xl p-8 flex flex-col h-[780px] transition-all duration-250 ${
          activeTab === "chat" ? "block" : "hidden lg:flex"
        }`}
      >
        <div className="flex border-b border-[#1C1C1C] pb-3 items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Clinical Conversation Room</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] text-[#A0A0A0] font-mono tracking-wide uppercase">AI Companion Online</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-lg font-black uppercase font-mono">
            Secure Consult
          </div>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto my-6 space-y-6 pr-2 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[90%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                m.role === "user"
                  ? "bg-[#111] border-[#222] text-teal-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`rounded-xl p-5 text-sm leading-loose border ${
                m.role === "user"
                  ? "bg-gradient-to-br from-neutral-900 to-[#121212] border-emerald-500/15 text-white rounded-tr-none shadow-md"
                  : "bg-[#050505] border-[#1C1C1C] text-slate-300 rounded-tl-none space-y-4"
              }`}>
                {m.role === "assistant" ? (
                  <div className="space-y-2.5">
                    {m.content && typeof m.content === "string" ? (
                      m.content.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("### ")) {
                          return (
                            <h4 
                              key={pIdx} 
                              className="font-bold text-white text-xs border-b border-[#1C1C1C] pb-1 uppercase tracking-wider mt-4 first:mt-0 flex items-center gap-1.5"
                            >
                              <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                              {para.replace("### ", "")}
                            </h4>
                          );
                        }
                        if (para.startsWith("- ") || para.startsWith("* ")) {
                          return (
                            <ul key={pIdx} className="list-none space-y-1.5 my-2 pl-0 text-slate-300">
                              {para.split("\n").map((li, lIdx) => (
                                <li key={lIdx} className="flex items-start gap-2 text-slate-400 hover:text-white transition-colors">
                                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">▪</span>
                                  <span>{li.replace(/^[-\*]\s+/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        if (/^\d+\.\s+/.test(para)) {
                          return (
                            <ol key={pIdx} className="list-none space-y-1.5 my-2 pl-0">
                              {para.split("\n").map((li, lIdx) => {
                                const match = li.match(/^(\d+)\.\s+(.*)/);
                                return (
                                  <li key={lIdx} className="flex items-start gap-2.5 text-slate-400 hover:text-white">
                                    <span className="h-5 w-5 rounded-md bg-[#121212] border border-[#222] font-mono text-[10px] font-bold text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                      {match ? match[1] : lIdx + 1}
                                    </span>
                                    <span>{match ? match[2] : li}</span>
                                  </li>
                                );
                              })}
                            </ol>
                          );
                        }
                        return <p key={pIdx} className="leading-relaxed text-slate-300">{para}</p>;
                      })
                    ) : (
                      <p className="leading-relaxed text-slate-300">{m.content ? String(m.content) : "No response content received"}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-200">{m.content || ""}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-[#050505] border border-[#1A1A1A] rounded-xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" />
                </div>
                <span>Analyzing biomarkers & molecular triggers...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Dynamic Prompt Selector Tray */}
        <div className="shrink-0 border-t border-[#1C1C1C] pt-3 space-y-2">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase text-slate-500 tracking-wider">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            Bio-targeted prompt ideas:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {dynamicPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => !loading && sendMessage(qp.replace(/^💡 /, ""))}
                disabled={loading}
                className="text-[10px] text-slate-400 hover:text-emerald-400 text-left py-2 px-2.5 bg-[#050505] hover:bg-[#121212] border border-[#1C1C1C] hover:border-emerald-500/20 rounded-xl transition-all truncate cursor-pointer disabled:opacity-40"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Chat input controls form */}
        <form onSubmit={handleFormSubmit} className="shrink-0 flex gap-2 mt-3.5 pt-3.5 border-t border-[#1C1C1C]">
          <input
            id="chat-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={loading ? "AI expert is computing..." : "Inquire about insulin sensitivity, hypertension stages..."}
            disabled={loading}
            className="flex-1 text-sm px-4 py-3.5 border border-[#1C1C1C] hover:border-[#2A2A2A] bg-[#050505] rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-slate-600 transition-all font-medium"
          />
          <button
            id="chat-submit"
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 text-black px-4 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <Send className="h-4 w-4 text-black stroke-[3]" />
          </button>
        </form>
      </div>

      {/* Proactive Health Observations & Habits Task Board Panel */}
      <div 
        className={`lg:col-span-5 space-y-6 h-[780px] overflow-y-auto pr-2 scrollbar-thin transition-all duration-250 ${
          activeTab === "insights" ? "block" : "hidden lg:block"
        }`}
      >
        
        {/* Dynamic Habit Task Accomplishments card */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-2xl shadow-lg space-y-5">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#1A1A1A]">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-emerald-400" /> Personalized Daily Tasks
            </span>
            <span className="text-[10px] text-emerald-450 font-bold bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-lg font-mono">
              Roadmap Sync
            </span>
          </div>

          <p className="text-[10.5px] text-slate-400 leading-normal">
            Mark off compiled tasks from your early-warning preventive roadmap to build allostatic resilience.
          </p>

          {/* Elegant Progress bar & streak count */}
          <div className="space-y-1.5 bg-[#050505] p-3 rounded-xl border border-[#121212]">
            <div className="flex justify-between text-[10px] font-mono font-bold tracking-wide">
              <span className="text-slate-400">Accomplished Goals</span>
              <span className="text-emerald-400">{completedCount} of {habits.length} ({progressPercent}%)</span>
            </div>
            <div className="h-2 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] text-[#A0A0A0] font-mono">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Streak: 4 Days Active (Preventative Focus)</span>
            </div>
          </div>

          {/* Interactive Checkbox list */}
          <div className="space-y-2">
            {habits.map((habit, idx) => {
              const checked = !!completedTasks[habit.title];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleTask(habit.title)}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 flex items-start gap-3 ${
                    checked 
                      ? "bg-emerald-500/5 border-emerald-500/20 text-slate-305" 
                      : "bg-[#040404] hover:bg-[#090909] border-[#1C1C1C] text-slate-400"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {checked ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 fill-emerald-500/10" />
                    ) : (
                      <div className="h-4.5 w-4.5 rounded-md border border-slate-700 hover:border-emerald-500/40 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[11px] font-black uppercase tracking-wide truncate ${checked ? "line-through text-slate-500" : "text-white"}`}>
                        {habit.title}
                      </span>
                      <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold uppercase shrink-0 font-mono ${
                        habit.impact === "Urgent" 
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/10" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                      }`}>
                        {habit.impact}
                      </span>
                    </div>
                    <p className={`text-[10px] mt-1 leading-normal ${checked ? "text-slate-600" : "text-slate-400"}`}>
                      {habit.description}
                    </p>
                    <div className="flex gap-2 mt-1.5 text-[8.5px] font-mono text-slate-500 uppercase tracking-widest">
                      <span>• Diff: {habit.difficulty}</span>
                      <span>• Cat: {habit.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proactive Health Insights & Bio Indicators */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-2xl shadow-lg space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-[#1A1A1A]">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Biomarker Analytics
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Actual Reading
            </span>
          </div>

          <div className="space-y-3">
            {/* Blood Sugar Indicator */}
            <div className="bg-[#050505] p-3 rounded-xl border border-[#161616] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-black uppercase tracking-wide text-white">Fasting Blood Sugar</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{profile.bloodSugar} mg/dL</span>
              </div>
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="text-slate-500">Early Warning Analysis</span>
                <span className={`px-2 py-0.5 font-bold rounded font-mono ${getSugarStatus(profile.bloodSugar).color}`}>
                  {getSugarStatus(profile.bloodSugar).label}
                </span>
              </div>
            </div>

            {/* Blood Pressure Indicator */}
            <div className="bg-[#050505] p-3 rounded-xl border border-[#161616] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-black uppercase tracking-wide text-white">Arterial Tension BP</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{profile.systolicBP}/{profile.diastolicBP} mmHg</span>
              </div>
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="text-slate-500">Hydro-dynamics Tension</span>
                <span className={`px-2 py-0.5 font-bold rounded font-mono ${getBPStatus(profile.systolicBP, profile.diastolicBP).color}`}>
                  {getBPStatus(profile.systolicBP, profile.diastolicBP).label}
                </span>
              </div>
            </div>

            {/* Cortisol & Stress Indicator */}
            <div className="bg-[#050505] p-3 rounded-xl border border-[#161616] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-black uppercase tracking-wide text-white">Allostatic Cortisol Level</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{profile.stressLevel}/10</span>
              </div>
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="text-slate-500">Cardiac Sympathetic Stress</span>
                <span className={`px-2 py-0.5 font-bold rounded font-mono ${getStressStatus(profile.stressLevel).color}`}>
                  {getStressStatus(profile.stressLevel).label}
                </span>
              </div>
            </div>
          </div>

          {/* Active Diagnostic Coaching Insights List */}
          {evaluation && evaluation.coachingInsights && evaluation.coachingInsights.length > 0 && (
            <div className="space-y-2 bg-[#050505] border border-[#151515] p-3.5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B0B0B0] font-mono flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Active Observations & Coaching Logs:
              </span>
              <div className="space-y-2 text-[10.5px] text-slate-400 mt-1 leading-relaxed">
                {evaluation.coachingInsights.slice(0, 3).map((insight, idx) => (
                  <p key={idx} className="flex gap-2 items-start border-l-2 border-emerald-500/20 pl-2">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{insight}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
