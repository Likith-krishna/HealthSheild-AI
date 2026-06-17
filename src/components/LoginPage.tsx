import React, { useState } from "react";
import { authApi } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, ShieldAlert, ArrowRight, HelpCircle, User, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }: LoginPageProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Visibilities & loaders
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Forgot password flow states
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [forgotInfo, setForgotInfo] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!email || !password) {
      setServerError("Please enter both your User ID/email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        email,
        password
      }, rememberMe);

      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(response.user);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setServerError("Invalid credentials. Please verify your User ID/email or password.");
      } else if (err.response?.status === 403) {
        setServerError("Access deactivated. Please consult your database administrator.");
      } else {
        setServerError(err.response?.data?.message || "Internal authorization response failure. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotInfo("");

    if (!forgotEmail) {
      setForgotError("Please enter your registered User ID or Email.");
      return;
    }

    if (!forgotPassword || !forgotConfirmPassword) {
      setForgotError("Please provide both your new password fields.");
      return;
    }

    if (forgotPassword.length < 8) {
      setForgotError("The new password must be at least 8 characters long.");
      return;
    }

    if (forgotPassword !== forgotConfirmPassword) {
      setForgotError("New security passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      const response = await authApi.resetPassword({
        identifier: forgotEmail,
        newPassword: forgotPassword
      });

      setForgotInfo(response.message || "Password updated successfully!");

      setTimeout(() => {
        setForgotPasswordStep(false);
        setForgotInfo("");
        setForgotError("");
        setForgotPassword("");
        setForgotConfirmPassword("");
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setForgotError(err.response?.data?.message || err.response?.data?.error || "Reset validation failed. Check your User ID / Email ID.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!forgotPasswordStep ?
        <motion.div
          key="login-form"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          className="bg-[#0A0A0A]/40 border border-[#1A1A1A] p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-emerald-500/5 relative overflow-hidden">
          
            {/* Top high-end gradient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-md" />

            <div className="mb-7 text-center">
              <div className="mx-auto h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase sm:text-3xl">{t("auth.login_title", "Secure Authorization")}</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">{t("auth.login_desc", "HealthSheild AI Cryptographic Access Control")}</p>
            </div>

            {/* Error notifications banner */}
            {serverError &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex gap-2 w-full leading-normal">
            
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{serverError}</span>
              </motion.div>
          }

            <form onSubmit={handleSubmit} className="space-y-4.5">
              
              {/* Email Address / User ID */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auth.email_label", "User ID or Email Address")}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.email_placeholder", "Enter your User ID or registration email")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-sm text-white px-10.5 py-3 rounded-xl outline-none transition-all placeholder-slate-600" />
                
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auth.password_label", "Password")}</label>
                  <button
                  type="button"
                  onClick={() => setForgotPasswordStep(true)}
                  className="text-[10px] text-slate-500 hover:text-emerald-400 font-bold tracking-wide transition-colors uppercase outline-none">
                  
                    {t("auth.forgot_keys", "Forgot Password?")}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.password_placeholder", "Enter security digits")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-sm string text-white px-10.5 py-3 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                
                  <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300">
                  
                    {showPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center">
                <input
                id="remember-me-toggle"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 bg-[#060606] border border-neutral-800 rounded focus:ring-emerald-500/20 accent-emerald-500 shrink-0 cursor-pointer text-emerald-500" />
              
                <label htmlFor="remember-me-toggle" className="ml-2 text-xs text-slate-400 select-none cursor-pointer">
                  {t("auth.remember_device", "Remember my session on this device")}
                </label>
              </div>

              {/* Submission engine */}
              <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-90 disabled:opacity-40 select-none text-black font-extrabold cursor-pointer rounded-xl py-3 px-5 text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/20">
              
                {isSubmitting ?
              <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin mr-1 text-black" />
                    {t("auth.processing", "VERIFYING IDENTITY PATHWAYS...")}
                  </> :
              isSuccess ?
              "MATCH IN PROGRESS..." :

              <>
                    {t("auth.submit_login", "SECURE SIGN IN")}
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
              }
              </button>
            </form>

            <div className="mt-6 border-t border-[#131313] pt-5 text-center">
              <p className="text-xs text-slate-500">{t("auto.new_user_profile_requesting_registration", "New user profile requesting registration?")}
              {" "}
                <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer">
                
                  {t("auth.create_account", "Create Account Free")}
                </button>
              </p>
            </div>
          </motion.div> :

        <motion.div
          key="forgot-password"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="bg-[#0A0A0A]/40 border border-[#1A1A1A] p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-xl shadow-black/80 w-full">
          
            <div className="mb-6 text-center">
              <div className="mx-auto h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-2">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">{t("auto.credentials_override", "Credentials Override")}</h3>
              <p className="text-xs text-slate-400 mt-1">{t("auto.change_your_password_instantly_using_you", "Change your password instantly using your registered identity")}</p>
            </div>

            {forgotInfo &&
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-medium rounded-xl text-xs flex gap-2 w-full items-start mb-5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5" />
                <span>{forgotInfo}</span>
              </div>
          }

            {forgotError &&
          <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 font-medium rounded-xl text-xs flex gap-2 w-full items-start mb-5">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
                <span>{forgotError}</span>
              </div>
          }

            <form onSubmit={handleForgotTrigger} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.your_user_id_or_email_id", "Your User ID or Email ID")}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                  type="text"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={t("auto.john_doe_or_name_organization_com", "john_doe or name@organization.com")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] text-sm text-white px-10.5 py-3 rounded-xl outline-none" />
                
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.choose_new_password_alphanumeric", "Choose New Password (Alphanumeric)")}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                  type={showForgotPass ? "text" : "password"}
                  required
                  value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)}
                  placeholder={t("auto.enter_new_alphanumeric_password", "Enter new alphanumeric password")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] text-sm text-white px-10.5 py-3 rounded-xl outline-none shadow-inner" />
                
                  <button
                  type="button"
                  onClick={() => setShowForgotPass(!showForgotPass)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-white">
                  
                    {showForgotPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.confirm_new_password", "Confirm New Password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                  type={showForgotPass ? "text" : "password"}
                  required
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder={t("auto.re_enter_your_password", "Re-enter your password")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] text-sm text-white px-10.5 py-3 rounded-xl outline-none shadow-inner" />
                
                </div>
              </div>

              <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-emerald-500 text-black font-extrabold cursor-pointer py-3 rounded-xl text-xs tracking-wider uppercase hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
              
                {forgotLoading && <Loader2 className="h-4 w-4 animate-spin" />}{t("auto.update_password_securely", "UPDATE PASSWORD SECURELY")}

            </button>

              <button
              type="button"
              disabled={forgotLoading}
              onClick={() => {
                setForgotPasswordStep(false);
                setForgotInfo("");
                setForgotError("");
                setForgotPassword("");
                setForgotConfirmPassword("");
              }}
              className="w-full text-xs text-slate-500 hover:text-white font-bold transition-colors uppercase outline-none py-1.5">{t("auto.return_to_credentials_mode", "Return to Credentials Mode")}


            </button>
            </form>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}