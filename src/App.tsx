import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
import DashboardPage from "./components/DashboardPage";
import { authApi, User } from "./lib/api";
import { ShieldCheck, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<"login" | "register">("login");
  const [restoreError, setRestoreError] = useState("");

  // Attempt automatic session restoration on app boot
  useEffect(() => {
    async function restoreSession() {
      // Add a dynamic loading delay for the HealthShield AI splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (authApi.hasToken()) {
        try {
          const profileData = await authApi.getProfile();
          setCurrentUser(profileData.user);
        } catch (e: any) {
          console.warn("Silent session restoration failed or token expired:", e);
          setRestoreError("Previous session expired. Please sign in with fresh credentials.");
          // Clear error notification after 5 seconds automatically
          setTimeout(() => setRestoreError(""), 5000);
          authApi.logout();
        }
      }
      setIsAppLoading(false);
    }

    restoreSession();

    // Listen for custom token failure events published by client interceptors
    const handleResetEvent = () => {
      setCurrentUser(null);
    };
    window.addEventListener("aegis_logout", handleResetEvent);
    return () => {
      window.removeEventListener("aegis_logout", handleResetEvent);
    };
  }, []);

  const handleLoginSuccess = (userRecord: User) => {
    setCurrentUser(userRecord);
  };

  const handleRegisterSuccess = (userRecord: User) => {
    setCurrentUser(userRecord);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setActiveScreen("login");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] select-none font-sans overflow-x-hidden flex flex-col justify-between selection:bg-emerald-500/30 selection:text-white">
      
      {/* Session verification splash loader */}
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative flex items-center justify-center">
              {/* Spinning perimeter glow */}
              <div className="absolute h-16 w-16 bg-emerald-500/10 rounded-full animate-ping blur-xl" />
              <div className="h-12 w-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <ShieldCheck className="absolute h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-center space-y-1 mt-2">
              <motion.span 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg text-emerald-400 font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5 animate-pulse" />
                HealthShield AI
              </motion.span>
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-xs text-slate-500 font-mono font-medium animate-pulse"
              >
                Initializing intelligent systems...
              </motion.p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Container routing wrapper */}
      <div className="flex-1 flex flex-col">
        {currentUser ? (
          <motion.div
            key="authorized-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full"
          >
            <DashboardPage currentUser={currentUser} onLogout={handleLogout} />
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Ambient lighting overlays */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            
            {/* Session expired error toast */}
            {restoreError && (
              <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 shadow-lg shadow-black/40">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span className="font-medium">{restoreError}</span>
              </div>
            )}

            <div className="relative z-10 w-full">
              {activeScreen === "login" ? (
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() => setActiveScreen("register")}
                />
              ) : (
                <RegistrationPage
                  onRegisterSuccess={handleRegisterSuccess}
                  onNavigateToLogin={() => setActiveScreen("login")}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Standard bottom branding */}
      <footer className="py-6 border-t border-[#131313] bg-[#070707] text-center text-[10px] text-zinc-600 font-mono uppercase tracking-wider relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Security Node: AES-256 / HS256 Compliant</span>
          </div>
          <div>
            <span>Verified Sec-Ops Layer • UTC 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
