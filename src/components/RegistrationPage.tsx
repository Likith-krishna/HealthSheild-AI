import React, { useState, useEffect } from "react";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { authApi } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegistrationPageProps {
  onRegisterSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
}

export default function RegistrationPage({ onRegisterSuccess, onNavigateToLogin }: RegistrationPageProps) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // Elaborated Phone & Address States
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [flatHouse, setFlatHouse] = useState("");
  const [streetNagar, setStreetNagar] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

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

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const code = countryToCodeMap[selectedCountry];
    if (code) {
      setCountryCode(code);
    }
  };

  // Input states visibilities
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Errors & Status
  const [valErrors, setValErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Real-time validations loop
  useEffect(() => {
    const errors: Record<string, string> = {};

    if (email && !email.includes("@")) {
      errors.email = "Please enter a valid email containing '@' symbol.";
    }
    if (userId && !/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
      errors.userId = "User ID must be 3-20 characters, alphanumeric or underscores.";
    }
    if (phoneRaw && phoneRaw.trim().length < 8) {
      errors.phone = "Phone digits should span at least 8 numbers.";
    }
    if (password && password.length < 8) {
      errors.password = "Password must span at least 8 characters.";
    }
    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Security passwords do not match.";
    }

    setValErrors(errors);
  }, [email, userId, password, confirmPassword, phoneRaw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const combinedPhoneNumber = `${countryCode} ${phoneRaw.trim()}`.trim();
    const combinedAddress = `${flatHouse.trim()} || ${streetNagar.trim()} || ${city.trim()} || ${district.trim()} || ${state.trim()} || ${country.trim()}`;

    // Field required validations
    if (!fullName || !email || !userId || !password || !confirmPassword || !phoneRaw || !flatHouse || !streetNagar || !city || !district || !state || !country) {
      setServerError("Please complete all demographic & address fields to establish profile.");
      return;
    }

    if (Object.keys(valErrors).length > 0) {
      setServerError("Please correct highlighted validation errors in the form first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.register({
        fullName,
        email,
        userId,
        password,
        phoneNumber: combinedPhoneNumber,
        address: combinedAddress
      });

      setIsSuccess(true);
      setTimeout(() => {
        onRegisterSuccess(response.user);
      }, 1500); // Small transition latency for high-end success confirmation display

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setServerError(err.response?.data?.message || "An account with these details already exists.");
      } else {
        setServerError(err.response?.data?.error || err.response?.data?.message || "Registration validation failed. Please check parameters.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ?
        <motion.div
          key="register-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="bg-[#0A0A0A]/40 border border-[#1A1A1A] p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
          
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-md" />

            <div className="mb-6.5 text-center relative z-10">
              <div className="mx-auto h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase sm:text-3xl">
                {t("auth.register_title", "Create Account")}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {t("auth.register_desc", "Establish secure profile access on HealthSheild AI Server")}
              </p>
            </div>

            {/* Error alerts banner */}
            {serverError &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex gap-2 w-full leading-relaxed">
            
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
                <span>{serverError}</span>
              </motion.div>
          }

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full name input */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auth.name_label", "Full Name")}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.name_placeholder", "Enter full legal name")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-sm text-white px-10.5 py-2.5 rounded-xl shadow-inner outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                
                </div>
              </div>

              {/* Custom User ID (Username) */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.chosen_user_id_username", "Chosen User ID (Username)")}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-emerald-400" />
                  <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={t("auto.enter_a_unique_user_id_e_g_john_doe", "Enter a unique User ID (e.g. john_doe)")}
                  className={`w-full bg-[#060606] border ${
                  valErrors.userId ? "border-red-500/45 focus:border-red-500" : "border-[#1E1E1E] focus:border-emerald-500/40"} text-sm text-white px-10.5 py-2.5 rounded-xl shadow-inner outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20`
                  } />
                
                </div>
                {valErrors.userId &&
              <span className="text-[10px] text-red-400 block mt-0.5 font-medium">{valErrors.userId}</span>
              }
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.email_address", "Email Address")}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auto.name_organization_com", "name@organization.com")}
                    className={`w-full bg-[#060606] border ${
                    valErrors.email ? "border-red-500/45 focus:border-red-500" : "border-[#1E1E1E] focus:border-emerald-500/40"} text-sm text-white px-10.5 py-2.5 rounded-xl shadow-inner outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20`
                    } />
                  
                  </div>
                </div>
                {valErrors.email &&
              <span className="text-[10px] text-red-400 block mt-0.5 font-medium">{valErrors.email}</span>
              }
              </div>

              {/* Password and Confirm fields double columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.password", "Password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auto.min_8_chars", "Min 8 chars")}
                    className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-sm text-white px-10.5 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                  
                    <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300">
                    
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.confirm_password", "Confirm Password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auto.repeat_password", "Repeat password")}
                    className={`w-full bg-[#060606] border ${
                    valErrors.confirmPassword ? "border-red-500/45 focus:border-red-500" : "border-[#1E1E1E] focus:border-emerald-500/40"} text-sm text-white px-10.5 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600`
                    } />
                  
                    <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300">
                    
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {valErrors.confirmPassword &&
                <span className="text-[10px] text-red-400 block mt-0.5 font-medium">{valErrors.confirmPassword}</span>
                }
                </div>
              </div>

              {/* Password strength indicators */}
              <PasswordStrengthIndicator pass={password} />

              {/* Phone Connection with Country Code prefix */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">{t("auto.phone_connection", "Phone Connection")}</label>
                <div className="flex gap-2">
                  <div className="w-[110px] shrink-0 relative">
                    <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full h-[42px] bg-[#060606] border border-[#1E1E1E] text-sm text-white px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500/40 cursor-pointer appearance-none text-center">
                    
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸/🇨🇦 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                    </select>
                    <div className="absolute right-3 top-4.5 pointer-events-none border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500"></div>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input
                    type="tel"
                    required
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    placeholder={t("auth.phone_placeholder", "Enter phone digits (e.g. 9876543210)")}
                    className={`w-full bg-[#060606] border ${
                    valErrors.phone ? "border-red-500/45 focus:border-red-500" : "border-[#1E1E1E] focus:border-emerald-500/40"} text-sm text-white px-10.5 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20`
                    } />
                  
                  </div>
                </div>
                {valErrors.phone &&
              <span className="text-[10px] text-red-400 block mt-0.5 font-medium">{valErrors.phone}</span>
              }
              </div>

              {/* Elaborated Residential Address block */}
              <div className="border-t border-[#131313] pt-4.5 mt-2 space-y-4">
                <div className="flex items-center gap-1.5 pb-1">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="text-[11px] font-black tracking-widest text-slate-300 uppercase">{t("auto.residential_location_nodes", "Residential Location Nodes")}</span>
                </div>

                {/* Country dropdown */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("auto.country", "Country")}</label>
                  <select
                  required
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-[#060606] border border-[#1E1E1E] text-sm text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500/40 cursor-pointer">
                  
                    <option value="India">{t("auto.india", "\uD83C\uDDEE\uD83C\uDDF3 India")}</option>
                    <option value="United States">{t("auto.united_states", "\uD83C\uDDFA\uD83C\uDDF8 United States")}</option>
                    <option value="United Kingdom">{t("auto.united_kingdom", "\uD83C\uDDEC\uD83C\uDDE7 United Kingdom")}</option>
                    <option value="Canada">{t("auto.canada", "\uD83C\uDDE8\uD83C\uDDE6 Canada")}</option>
                    <option value="Australia">{t("auto.australia", "\uD83C\uDDE6\uD83C\uDDFA Australia")}</option>
                    <option value="Singapore">{t("auto.singapore", "\uD83C\uDDF8\uD83C\uDDEC Singapore")}</option>
                    <option value="United Arab Emirates">{t("auto.united_arab_emirates", "\uD83C\uDDE6\uD83C\uDDEA United Arab Emirates")}</option>
                    <option value="Germany">{t("auto.germany", "\uD83C\uDDE9\uD83C\uDDEA Germany")}</option>
                    <option value="France">{t("auto.france", "\uD83C\uDDEB\uD83C\uDDF7 France")}</option>
                  </select>
                </div>

                {/* Flat, House number */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("auto.flat_house_number_suite", "Flat, House Number / Suite")}</label>
                  <input
                  type="text"
                  required
                  value={flatHouse}
                  onChange={(e) => setFlatHouse(e.target.value)}
                  placeholder={t("auto.e_g_apartment_4b_house_56", "e.g. Apartment 4B, House #56")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-sm text-white px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                
                </div>

                {/* Street, Nagar, Area */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("auto.street_nagar_area", "Street, Nagar & Area")}</label>
                  <input
                  type="text"
                  required
                  value={streetNagar}
                  onChange={(e) => setStreetNagar(e.target.value)}
                  placeholder={t("auto.e_g_5th_main_street_gandhi_nagar_adyar", "e.g. 5th Main Street, Gandhi Nagar, Adyar")}
                  className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-sm text-white px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("auto.city", "City")}</label>
                    <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("auto.e_g_chennai", "e.g. Chennai")}
                    className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-[13px] text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                  
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("auto.district", "District")}</label>
                    <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t("auto.e_g_adyar", "e.g. Adyar")}
                    className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-[13px] text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                  
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("auto.state", "State")}</label>
                    <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder={t("auto.e_g_tamil_nadu", "e.g. Tamil Nadu")}
                    className="w-full bg-[#060606] border border-[#1E1E1E] focus:border-emerald-500/40 text-[13px] text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder-slate-600 focus:ring-1 focus:ring-emerald-500/20" />
                  
                  </div>
                </div>
              </div>

              {/* Submit launcher */}
              <button
              type="submit"
              disabled={isSubmitting || Object.keys(valErrors).length > 0}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-90 disabled:opacity-40 select-none text-black font-extrabold cursor-pointer rounded-xl py-3 px-5 text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/20">
              
                {isSubmitting ?
              <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin mr-1 text-black" />
                    {t("auth.initializing", "REGISTERING SECURE WORKSPACE...")}
                  </> :

              <>
                    {t("auth.submit_register", "ESTABLISH SECURE ACCOUNT")}
                    <ArrowRight className="h-4 w-4 stroke-[2.5] text-black" />
                  </>
              }
              </button>
            </form>

            {/* Back swap panel */}
            <div className="mt-6 border-t border-[#131313] pt-5 text-center">
              <p className="text-xs text-slate-500">
                {t("auth.have_account", "Already registered with credentials?")}{" "}
                <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer">{t("auto.sign_in_directly", "Sign In Directly")}


              </button>
              </p>
            </div>
          </motion.div> :

        <motion.div
          key="success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center p-9 bg-[#0A0A0A]/60 border border-emerald-500/20 p-8 rounded-3xl backdrop-blur-xl shadow-xl shadow-emerald-900/10">
          
            <motion.div
            initial={{ scale: 0.5, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-5">
            
              <CheckCircle2 className="h-9 w-9" />
            </motion.div>
            <h3 className="text-2xl font-black text-white">{t("auto.system_granted_security", "SYSTEM GRANTED SECURITY")}</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">{t("auto.your_cryptographic_profile_is_verified_a", "Your cryptographic profile is verified. Access token pair registered on your system, launching dashboard...")}

          </p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}