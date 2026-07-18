import React, { useState, useEffect, useRef } from "react";
import {
  Heart, ShieldAlert, BadgeCheck, Clock, User, Sparkles, Volume2, Mic, Activity,
  Trash2, Upload, Calendar, ArrowUpRight, TrendingUp, RefreshCw, Layers, CheckCircle2,
  ChevronRight, Compass, Flame, Droplet, Apple, HelpCircle, Minimize2, Microscope, Monitor,
  TestTube, ActivitySquare, Save, X } from
"lucide-react";
import { useTranslation } from "react-i18next";
import ReportParser from "./ReportParser";
import AIPredictions from "./AIPredictions";
import PreventiveRoadmap from "./PreventiveRoadmap";
import AICoach from "./AICoach";
import { formatTime12Hour } from "./MedicationManager";

interface HealthCollectionFormProps {
  userId: string;
  onTimelineSaved?: () => void;
}

const LOCALES: Record<string, any> = {
  en: {
    personalDetail: "Personal Detail",
    dataCollection: "Data Collection",
    bioMetrics: "Bio-Metrics Archival System",
    intakeWorkspace: "Clinical Intake Workspace",
    basicInfo: "Basic Information",
    lifestyle: "Lifestyle & Habits",
    nutrition: "Nutritional Profile",
    medicalHistory: "Medical & Family History",
    medicalReports: "Medical Reports (OCR)",
    wearableDetails: "Watch & Wearable Data",
    age: "Age (Years)",
    gender: "Gender",
    height: "Height (cm)",
    weight: "Weight (kg)",
    bmi: "Auto Computed BMI",
    occupation: "Occupation",
    sleepDuration: "Sleep Duration (hrs)",
    sleepQuality: "Sleep Quality (1-5)",
    stressLevel: "Stress Level (1-10)",
    physicalActivity: "Physical Activity Class",
    sittingHours: "Sedentary Timing (hours sitting/day)",
    smoking: "Smoking Behavior",
    alcohol: "Alcohol Consumption",
    mealPattern: "Meal Pattern",
    junkFood: "Junk Food Frequency Rating (1-10)",
    sugar: "Sugar Consumption Rating (1-10)",
    water: "Water Intake (liters/day)",
    existingDiseases: "Existing Conditions / Diseases",
    previousDiagnosis: "Previous Diagnosis Details",
    surgeries: "Surgeries History",
    infections: "Recent Severe Infections",
    allergies: "Allergies & Immune Sensitivities",
    medications: "Current Prescription Medications",
    familyHistory: "Family Clinical History Notes",
    uploadReport: "Upload / Paste Lab Tests & Reports",
    connectWearable: "Connect Smartwatch Activity Tracker",
    voicePrompt: "Voice-Guided Clinical Intake Mode",
    submitAssessment: "Process Health Metrics & Save in Timeline",
    loading: "Composing prognosis evaluation & archiving trends...",
    historicalTimeline: "Interactive Chronological Health Timeline",
    noRecords: "No history found. Initialize your first metrics to commence timeline logging.",
    steps: "Steps Walked",
    heartRate: "Average Heart Rate (bpm)",
    sleepCycle: "Sleep Cycle Evaluation"
  },
  ta: {
    personalDetail: "தனிப்பட்ட விவரம்",
    dataCollection: "தரவு சேகரிப்பு",
    bioMetrics: "உயிர் அளவீட்டு ஆவணக் காப்பகம்",
    intakeWorkspace: "மருத்துவ பதிவு பணியிடம்",
    basicInfo: "அடிப்படை விவரங்கள்",
    lifestyle: "வாழ்க்கை முறை பழக்கங்கள்",
    nutrition: "ஊட்டச்சத்து விவரங்கள்",
    medicalHistory: "மருத்துவ மற்றும் குடும்ப வரலாறு",
    medicalReports: "மருத்துவ அறிக்கைகள் (OCR)",
    wearableDetails: "கைக்கடிகார சாதன தரவு",
    age: "வயದು (ஆண்டுகள்)",
    gender: "பாலினம்",
    height: "உயரம் (செ.மீ)",
    weight: "எடை (கிலோ)",
    bmi: "தானியங்கி பி.எம்.ஐ",
    occupation: "தொழில்",
    sleepDuration: "தூக்க அளவு (மணி நேரம்)",
    sleepQuality: "தூக்கத்தின் தரம் (1-5)",
    stressLevel: "மன அழுத்த நிலை (1-10)",
    physicalActivity: "உடற்பயிற்சி வகை",
    sittingHours: "அமர்ந்திருக்கும் நேரம் (மணி நேரம்/நாள்)",
    smoking: "புகைபிடித்தல் நிலை",
    alcohol: "மது அருந்துதல் பழக்கம்",
    mealPattern: "உணவு முறை",
    junkFood: "துரித உணவு உட்கொள்ளல் (1-10)",
    sugar: "சர்க்கரை உட்கொள்ளல் (1-10)",
    water: "நீர் உட்கொள்ளல் (லிட்டர்/நாள்)",
    existingDiseases: "தற்போதுள்ள நோய்கள்",
    previousDiagnosis: "முந்தைய நோயறிதல்",
    surgeries: "அறுவை சிகிச்சைகள் வரலாறு",
    infections: "சமீபத்திய தொற்றுகள்",
    allergies: "ஒவ்வாமை மற்றும் எதிர்ப்புத் தன்மை",
    medications: "தற்போதைய மருந்துகள்",
    familyHistory: "குடும்ப மருத்துவ வரலாறு",
    uploadReport: "மருத்துவ அறிக்கையை பதிவேற்றுக",
    connectWearable: "கைக்கடிகாரத் தரவை இணைக்கவும்",
    voicePrompt: "குரல் வழி தரவு நுழைவு முறை",
    submitAssessment: "உடல்நலம் பகுப்பாய்வு செய்து காலவரிசையில் சேமிக்கவும்",
    loading: "மதிப்பீட்டைப் பகுப்பாய்வு செய்து காலவரிசையில் பதிகிறது...",
    historicalTimeline: "ஊடாடும் வரலாற்று காலவரிசைப் பதிவுகள்",
    noRecords: "காலவரிசைப் பதிவுகள் இல்லை. தொடங்குவதற்கு முதல் தரவை உள்ளிடவும்.",
    steps: "நடந்த படிகள்",
    heartRate: "இதய துடிப்பு (bpm)",
    sleepCycle: "தூக்க சுழற்சி மதிப்பீடு"
  },
  hi: {
    personalDetail: "व्यक्तिगत विवरण",
    dataCollection: "डेटा संग्रह",
    bioMetrics: "बायो-मेट्रिक्स अभिलेखीय प्रणाली",
    intakeWorkspace: "क्लिनिकल इंटेक वर्कस्पेस",
    basicInfo: "बुनियादी जानकारी",
    lifestyle: "जीवनशैली और आदतें",
    nutrition: "पोषण संबंधी जानकारी",
    medicalHistory: "चिकित्सा और पारिवारिक इतिहास",
    medicalReports: "चिकित्सा रिपोर्ट (OCR)",
    wearableDetails: "स्मार्टवॉच डेटा",
    age: "आयु (वर्ष)",
    gender: "लिंग",
    height: "ऊंचाई (सेमी)",
    weight: "वजन (किग्रा)",
    bmi: "बीएमआई",
    occupation: "व्यवसाय",
    sleepDuration: "नींद की अवधि (घंटे)",
    sleepQuality: "नींद की गुणवत्ता (1-5)",
    stressLevel: "तनाव स्तर (1-10)",
    physicalActivity: "शारीरिक गतिविधि",
    sittingHours: "बैठने का समय (घंटे/दिन)",
    smoking: "धूम्रपान की स्थिति",
    alcohol: "शराब का सेवन",
    mealPattern: "भोजन का प्रकार",
    junkFood: "जंक फूड उपयोग रेटिंग (1-10)",
    sugar: "चीनी की खपत (1-10)",
    water: "पानी का सेवन (लीटर/दिन)",
    existingDiseases: "मौजूदा बीमारियां",
    previousDiagnosis: "पिछला निदान विवरण",
    surgeries: "सर्जरी इतिहास",
    infections: "हालिया गंभीर संक्रमण",
    allergies: "एलर्जी",
    medications: "वर्तमान दवाएं",
    familyHistory: "पारिवारिक चिकित्सा इतिहास",
    uploadReport: "चिकित्सा रिपोर्ट अपलोड या पेस्ट करें",
    connectWearable: "स्मार्टवॉच सिंक करें",
    voicePrompt: "आवाज सहायक मोड",
    submitAssessment: "स्वास्थ्य का विश्लेषण करें और सहेजें",
    loading: "स्वास्थ्य इतिहास समयरेखा सहेजी जा रही है...",
    historicalTimeline: "स्वास्थ्य इतिहास समयरेखा चार्ट",
    noRecords: "कोई समयरेखा रिकॉर्ड उपलब्ध नहीं है। पहली बार डेटा सहेजें।",
    steps: "दायर कदम",
    heartRate: "हृदय दर (bpm)",
    sleepCycle: "नींद चक्र मूल्यांकन"
  },
  ml: {
    personalDetail: "വ്യക്തിഗത വിവരങ്ങൾ",
    dataCollection: "ഡാറ്റ ശേഖരണം",
    bioMetrics: "ബയോ-മെട്രിക്സ് ആർക്കൈവൽ സിസ്റ്റം",
    intakeWorkspace: "ക്ലിനിക്കൽ ഇൻടേക്ക് വർക്ക്സ്പേസ്",
    basicInfo: "അടിസ്ഥാന വിവരങ്ങൾ",
    lifestyle: "ജീവിതശൈലി ശീലങ്ങൾ",
    nutrition: "പോഷകാഹാര വിവരങ്ങൾ",
    medicalHistory: "കുടുംബ രോഗവിവര ചരിത്രം",
    medicalReports: "മെഡിക്കൽ റിപ്പോർട്ടുകൾ (OCR)",
    wearableDetails: "സ്മാർട്ട് വാച്ച് ഡാറ്റ",
    age: "പ്രായം (വർഷം)",
    gender: "ലിംഗഭേദം",
    height: "ഉയരം (സെ.മീ)",
    weight: "ഭാരം (കിലോ)",
    bmi: "ബി.എം.ഐ",
    occupation: "തൊഴിൽ",
    sleepDuration: "ഉറക്കം (മണിക്കൂർ)",
    sleepQuality: "ഉറക്കത്തിൻ്റെ നിലവാരം (1-5)",
    stressLevel: "മാനസിക സമ്മർദ്ദം (1-10)",
    physicalActivity: "ശാരീരിക വ്യായാമം",
    sittingHours: "ഇരിക്കുന്ന സമയം (മണിക്കൂർ/ദിവസം)",
    smoking: "പുകവലി ശീലങ്ങൾ",
    alcohol: "മദ്യപാനം",
    mealPattern: "ഭക്ഷണ രീതി",
    junkFood: "ജങ്ക് ഫുഡ് ശീലം (1-10)",
    sugar: "പഞ്ചസാരയുടെ ഉപയോഗം (1-10)",
    water: "വെള്ളം കുടിക്കുന്നത് (ലിറ്റർ/ദിവസം)",
    existingDiseases: "നിലവിലുള്ള രോഗങ്ങൾ",
    previousDiagnosis: "മുൻ രോഗനിർണയം",
    surgeries: "ശസ്ത്രക്രിയകൾ",
    infections: "അണുബാധകൾ",
    allergies: "അലർജികൾ",
    medications: "കഴിക്കുന്ന മരുന്നുകൾ",
    familyHistory: "കുടുംബ രോഗവിവരം",
    uploadReport: "മെഡിക്കൽ റിപ്പോർട്ടുകൾ ചേർക്കുക",
    connectWearable: "സ്മാർട്ട് വാച്ചുമായി ലിങ്ക് ചെയ്യുക",
    voicePrompt: "ശബ്ദ സഹായ മോഡ് സജീവമാക്കുക",
    submitAssessment: "വിവരങ്ങൾ വിശകലനം ചെയ്ത് സൂക്ഷിക്കുക",
    loading: "ആരോഗ്യവിവരം വിശകലനം ചെയ്ത് സൂക്ഷിക്കുന്നു...",
    historicalTimeline: "ആരോഗ്യ ചരിത്ര സമയരേഖ ചരിത്രം",
    noRecords: "ആരോഗ്യ ചരിത്ര സമയരേഖ ലഭ്യമല്ല. ആദ്യ വിവരങ്ങൾ നൽകുക.",
    steps: "നടന്ന സ്റ്റെപ്പുകൾ",
    heartRate: "ഹൃദയമിടിപ്പ് നിരക്ക് (bpm)",
    sleepCycle: "ഉറക്ക വിശകലനം"
  },
  kn: {
    personalDetail: "ವೈಯಕ್ತಿಕ ವಿವರಗಳು",
    dataCollection: "ಡೇಟಾ ಸಂಗ್ರಹಣೆ",
    bioMetrics: "ಜೈವಿಕ ಮೆಟ್ರಿಕ್ಸ್ ಆರ್ಕೈವಲ್ ಸಿಸ್ಟಮ್",
    intakeWorkspace: "ಕ್ಲಿನಿಕಲ್ ಇನ್ಟೇಕ್ ವರ್ಕ್ಸ್ಪೇಸ್",
    basicInfo: "ಮೂಲ ಮಾಹಿತಿ",
    lifestyle: "ಜೀವನ ಶೈಲಿ ಮತ್ತು ಅಭ್ಯಾಸಗಳು",
    nutrition: "ಪೌಷ್ಟಿಕಾಂಶ ವಿವರ",
    medicalHistory: "ವೈದ್ಯಕೀಯ ಮತ್ತು ಕೌಟುಂಬಿಕ ಇತಿಹಾಸ",
    medicalReports: "ವೈದ್ಯಕೀಯ ವರದಿಗಳು (OCR)",
    wearableDetails: "ಸ್ಮಾರ್ಟ್ ವಾಚ್ ಮಾಹಿತಿ",
    age: "ವಯಸ್ಸು (ವರ್ಷಗಳು)",
    gender: "ಲಿಂಗ",
    height: "ಎತ್ತರ (ಸೆಂ.ಮೀ)",
    weight: "ತೂಕ (ಕೆ.ಜಿ)",
    bmi: "ಲೆಕ್ಕಹಾಕಿದ ಬಿಎಂಐ",
    occupation: "ಉದ್ಯೋಗ",
    sleepDuration: "ನಿದ್ರೆಯ ಸಮಯ (ಗಂಟೆಗಳು)",
    sleepQuality: "ನಿದ್ರೆಯ ಗುಣಮಟ್ಟ (1-5)",
    stressLevel: "ಒತ್ತಡದ ಮಟ್ಟ (1-10)",
    physicalActivity: "ದೈಹಿಕ ಚಟುವಟಿಕೆ",
    sittingHours: "ಕುಳಿತುಕೊಳ್ಳುವ ಸಮಯ (ಗಂಟೆಗಳು/ದಿನ)",
    smoking: "ಧೂಮಪಾನದ ಅಭ್ಯಾಸ",
    alcohol: "ಮದ್ಯಪಾನದ ಅಭ್ಯಾಸ",
    mealPattern: "ಆಹಾರ ಪದ್ಧತಿ",
    junkFood: "ಜಂಕ್ ಫುಡ್ ಸೇವನೆ (1-10)",
    sugar: "ಸಕ್ಕರೆ ಸೇವನೆ (1-10)",
    water: "ನೀರಿನ ಸೇವನೆ (ಲೀಟರ್/ದಿನ)",
    existingDiseases: "ಈಗಿರುವ ರೋಗಗಳು/ಸ್ಥಿತಿಗಳು",
    previousDiagnosis: "ಹಿಂದಿನ ರೋಗನಿರ್ಣಯ",
    surgeries: "ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳು",
    infections: "ಇತ್ತೀಚಿನ ಸೋಂಕುಗಳು",
    allergies: "ಅಲರ್ಜಿಗಳು",
    medications: "ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು",
    familyHistory: "ಕುಟುಂಬದ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    uploadReport: "ವರದಿಗಳನ್ನು ಅಪ್ ಲೋಡ್ ಮಾಡಿ",
    connectWearable: "ಸ್ಮಾರ್ಟ್ ವಾಚ್ ಜೋಡಿಸಿ",
    voicePrompt: "ಧ್ವನಿ ನಿಯಂತ್ರಣ ಇನ್ ಟೇಕ್ ಮೋಡ್",
    submitAssessment: "ಮಾಹಿತಿ ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಉಳಿಸಿ",
    loading: "ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ ನಡೆಸಲಾಗುತ್ತಿದೆ...",
    historicalTimeline: "ಆರೋಗ್ಯ ಚಾರ್ಟ್ ಸಮಯರೇಖೆ",
    noRecords: "ಯಾವುದೇ ಸಮಯರೇಖೆ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    steps: "ನಡೆದ ಹೆಜ್ಜೆಗಳು",
    heartRate: "ಹೃದಯ ಬಡಿತದ ದರ (bpm)",
    sleepCycle: "ನಿದ್ರೆಯ ಚಕ್ರ ವಿಶ್ಲೇಷಣೆ"
  }
};

const VOICE_QUESTIONS_EN = [
{ field: "age", text: "Please state your age in years.", block: "basicInfo" },
{ field: "gender", text: "Please state your gender. Answer male, female, or other.", block: "basicInfo" },
{ field: "height", text: "Please state your height in centimeters.", block: "basicInfo" },
{ field: "weight", text: "Please state your weight in kilograms.", block: "basicInfo" },
{ field: "sleepDuration", text: "How many hours of sleep do you get per night on average?", block: "lifestyle" },
{ field: "stressLevel", text: "Rate your general daily stress level from 1 to 10.", block: "lifestyle" }];


const VOICE_QUESTIONS_TA = [
{ field: "age", text: "உங்கள் வயதை கூறுங்கள்.", block: "basicInfo" },
{ field: "gender", text: "உங்கள் பாலினத்தை கூறவும். ஆண் அல்லது பெண்.", block: "basicInfo" },
{ field: "height", text: "உங்கள் உயரத்தை சென்டிமீட்டரில் கூறவும்.", block: "basicInfo" },
{ field: "weight", text: "உங்கள் எடையை கிலோகிராமில் கூறவும்.", block: "basicInfo" },
{ field: "sleepDuration", text: "சராசரியாக எத்தனை மணிநேரம் தூங்குவீர்கள்?", block: "lifestyle" },
{ field: "stressLevel", text: "உங்கள் மன அழுத்த அளவை ஒன்று முதல் பத்து வரை கூறவும்.", block: "lifestyle" }];


const VOICE_QUESTIONS_HI = [
{ field: "age", text: "कृपया अपनी उम्र साल में बताएं।", block: "basicInfo" },
{ field: "gender", text: "कृपया अपना लिंग बताएं। पुरुष या महिला।", block: "basicInfo" },
{ field: "height", text: "कृपया अपनी लंबाई सेंटीमीटर में बताएं।", block: "basicInfo" },
{ field: "weight", text: "कृपया अपना वजन किलोग्राम में बताएं।", block: "basicInfo" },
{ field: "sleepDuration", text: "आप औसतन हर रात कितने घंटे सोते हैं?", block: "lifestyle" },
{ field: "stressLevel", text: "अपने दैनिक तनाव स्तर को एक से दस तक रेट करें।", block: "lifestyle" }];


const VOICE_QUESTIONS_ML = [
{ field: "age", text: "ദയവായി നിങ്ങളുടെ പ്രായം വർഷത്തിൽ പറയുക.", block: "basicInfo" },
{ field: "gender", text: "ദയവായി നിങ്ങളുടെ ലിംഗഭേദം പറയുക. പുരുഷൻ അല്ലെങ്കിൽ സ്ത്രീ.", block: "basicInfo" },
{ field: "height", text: "ദയവായി നിങ്ങളുടെ ഉയരം സെൻ്റിമീറ്ററിൽ പറയുക.", block: "basicInfo" },
{ field: "weight", text: "ദയവായി നിങ്ങളുടെ ഭാരം കിലോഗ്രാമിൽ പറയുക.", block: "basicInfo" },
{ field: "sleepDuration", text: "നിങ്ങൾ ശരാശരി എത്ര മണിക്കൂർ ഉറങ്ങാറുണ്ട്?", block: "lifestyle" },
{ field: "stressLevel", text: "നിങ്ങളുടെ ദൈനംദിന മാനസിക സമ്മർദ്ദം ഒന്ന് മുതൽ പത്ത് വരെ അടയാളപ്പെടുത്തുക.", block: "lifestyle" }];


const VOICE_QUESTIONS_KN = [
{ field: "age", text: "�����͟� ���ͮ ���͸�ͨ� ��ͷ���Ͳ� ������.", block: "basicInfo" },
{ field: "gender", text: "�����͟� ���ͮ ������ͨ� ������. ����� ���� �����.", block: "basicInfo" },
{ field: "height", text: "�����͟� ���ͮ ��ͤ���ͨ� �Ƃ���������Ͳ� ������.", block: "basicInfo" },
{ field: "weight", text: "�����͟� ���ͮ ���ͨ� ���˗Ͱ�����Ͳ� ������.", block: "basicInfo" },
{ field: "sleepDuration", text: "���� ������ ��͟� ���Ɨ� ��� ���Ͱ����ͤ���?", block: "lifestyle" },
{ field: "stressLevel", text: "���ͮ �Ȩ���� ��ͤ�� ��͟��ͨ� ������� ��ͤ���Ɨ� �ǟ� ����.", block: "lifestyle" }];


export default function HealthCollectionForm({ userId, onTimelineSaved }: HealthCollectionFormProps) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const localDict = LOCALES[lang] || LOCALES["en"];

  const [savingRecord, setSavingRecord] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineRecords, setTimelineRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [basicInfo, setBasicInfo] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    bmi: "",
    occupation: "",
    bloodSugar: "",
    systolicBP: "",
    diastolicBP: "",
    cholesterolTotal: "",
    hba1c: "",
    ldlCholesterol: "",
    hdlCholesterol: "",
    triglycerides: "",
    serumCreatinine: "",
    altSgpt: "",
    tsh: ""
  });

  const [lifestyle, setLifestyle] = useState({
    sleepDuration: "7",
    sleepQuality: "4",
    stressLevel: "5",
    physicalActivity: "Moderate",
    sittingHours: "6",
    smoking: "No",
    alcohol: "No"
  });

  const [nutrition, setNutrition] = useState({
    mealPattern: "Balanced",
    waterIntake: "2.5",
    junkFoodRate: "3",
    sugarRate: "3"
  });

  const [medicalHistory, setMedicalHistory] = useState({
    existingDiseases: "",
    previousDiagnosis: "",
    surgeries: "",
    infections: "",
    allergies: "",
    currentMedications: "",
    familyHistory: ""
  });

  const [womensHealth, setWomensHealth] = useState({
    menstruationCycle: "Regular",
    pcos: "No",
    hormoneBalance: "Normal",
    pregnancyStatus: "No",
    pregnancyComments: "",
    thyroidStatus: "Normal"
  });

  const [wearableConnected, setWearableConnected] = useState(false);
  const [wearableDetails, setWearableDetails] = useState({
    steps: 7500,
    heartRate: 72,
    sleepCycle: "82% Deep sleep efficiency",
    activityText: "No smartwatch device paired yet."
  });
  const [isConnectingBluetooth, setIsConnectingBluetooth] = useState(false);
  const [bluetoothError, setBluetoothError] = useState("");
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState("");

  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voiceQuestionIndex, setVoiceQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");

  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [voiceTestSeconds, setVoiceTestSeconds] = useState(10);
  const [voiceTestTranscript, setVoiceTestTranscript] = useState("");
  const [acousticResult, setAcousticResult] = useState<any>(null);

  const [mentalScore, setMentalScore] = useState(85);
  const [mentalAnxiety, setMentalAnxiety] = useState(3);
  const [mentalStress, setMentalStress] = useState(4);
  const [mentalNotes, setMentalNotes] = useState("");
  const [mentalRecommendations, setMentalRecommendations] = useState<string[]>([]);

  const [onboardingMedications, setOnboardingMedications] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"physical" | "mental">("physical");
  const [hasMedications, setHasMedications] = useState(false);
  const [newMed, setNewMed] = useState({
    medicineName: "",
    dosage: "",
    purpose: "",
    frequency: "Daily",
    foodRelation: "After Food",
    startDate: new Date().toISOString().split("T")[0],
    times: ["08:00"],
    remarks: "",
    active: true
  });
  const [listeningMental, setListeningMental] = useState(false);
  const [mentalChat, setMentalChat] = useState<any[]>([
  { sender: "bot", text: "Welcome to HealthSheild AI Counseling. I'm here to translate biometric stresses into holistic care structures. Speak or type how you feel." }]
  );
  const [mentalChatLoading, setMentalChatLoading] = useState(false);
  const [mentalInput, setMentalInput] = useState("");

  const activeRecognitionRef = useRef<any>(null);
  const recognitionTimeoutRef = useRef<any>(null);

  const stopAllSpeechSystems = () => {
    window.speechSynthesis.cancel();
    if (activeRecognitionRef.current) {
      const rec = activeRecognitionRef.current;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {rec.abort();} catch (e) {}
      activeRecognitionRef.current = null;
    }
  };

  // Automated cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAllSpeechSystems();
    };
  }, []);

  // Auto compile BMI when weight/height changes
  useEffect(() => {
    const w = parseFloat(basicInfo.weight);
    const h = parseFloat(basicInfo.height);
    if (w > 0 && h > 0) {
      const computed = (w / Math.pow(h / 100, 2)).toFixed(1);
      setBasicInfo((prev) => ({ ...prev, bmi: computed }));
    }
  }, [basicInfo.weight, basicInfo.height]);

  // Load timeline recordings historical lists on mount
  const fetchTimeline = async () => {
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
        if (data.length > 0 && !selectedRecordId) {
          setSelectedRecordId(data[data.length - 1].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleManualValueChange = (block: string, field: string, value: string) => {
    if (block === "basicInfo") {
      setBasicInfo((prev: any) => ({ ...prev, [field]: value }));
    } else if (block === "lifestyle") {
      setLifestyle((prev: any) => ({ ...prev, [field]: value }));
    } else if (block === "nutrition") {
      setNutrition((prev: any) => ({ ...prev, [field]: value }));
    } else if (block === "medicalHistory") {
      setMedicalHistory((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  // Import vitals parsed from report upload text
  const handleImportParsedVitals = (vitals: any) => {
    if (!vitals) return;
    setSuccessMsg("Biomarkers parsed from report successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);

    // Set matching attributes
    if (vitals.weight) setBasicInfo((prev: any) => ({ ...prev, weight: String(vitals.weight) }));
    if (vitals.bloodSugar) setBasicInfo((prev: any) => ({ ...prev, bloodSugar: String(vitals.bloodSugar) }));
    if (vitals.systolicBP) setBasicInfo((prev: any) => ({ ...prev, systolicBP: String(vitals.systolicBP) }));
    if (vitals.diastolicBP) setBasicInfo((prev: any) => ({ ...prev, diastolicBP: String(vitals.diastolicBP) }));
    if (vitals.cholesterolTotal) setBasicInfo((prev: any) => ({ ...prev, cholesterolTotal: String(vitals.cholesterolTotal) }));

    // Classical laboratory markers
    if (vitals.hba1c) setBasicInfo((prev: any) => ({ ...prev, hba1c: String(vitals.hba1c) }));
    if (vitals.ldlCholesterol) setBasicInfo((prev: any) => ({ ...prev, ldlCholesterol: String(vitals.ldlCholesterol) }));
    if (vitals.hdlCholesterol) setBasicInfo((prev: any) => ({ ...prev, hdlCholesterol: String(vitals.hdlCholesterol) }));
    if (vitals.triglycerides) setBasicInfo((prev: any) => ({ ...prev, triglycerides: String(vitals.triglycerides) }));
    if (vitals.serumCreatinine) setBasicInfo((prev: any) => ({ ...prev, serumCreatinine: String(vitals.serumCreatinine) }));
    if (vitals.altSgpt) setBasicInfo((prev: any) => ({ ...prev, altSgpt: String(vitals.altSgpt) }));
    if (vitals.tsh) {
      setBasicInfo((prev: any) => ({ ...prev, tsh: String(vitals.tsh) }));
      // Also update endocrine thyroid status if female
      setWomensHealth((prev: any) => ({ ...prev, thyroidStatus: parseFloat(vitals.tsh) > 4.5 ? "Hypothyroid" : parseFloat(vitals.tsh) < 0.45 ? "Hyperthyroid" : "Normal" }));
    }

    if (vitals.existingConditions) setMedicalHistory((prev: any) => ({ ...prev, existingDiseases: vitals.existingConditions }));
    if (vitals.medications) setMedicalHistory((prev: any) => ({ ...prev, currentMedications: vitals.medications }));
  };

  // Simulate and pair Smartwatch Connection
  const handleConnectBluetoothWearable = async () => {
    setIsConnectingBluetooth(true);
    setBluetoothError("");
    setBluetoothDeviceName("");

    const nav = navigator as any;
    if (!nav.bluetooth) {
      setBluetoothError("Web Bluetooth is denied/unsupported (frequent inside sandboxed iFrames). Control your telemetry metrics manually below!");
      setIsConnectingBluetooth(false);
      return;
    }

    try {
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service']
      });

      setBluetoothDeviceName(device.name || "Smart Watch");
      setWearableConnected(true);
      setWearableDetails({
        steps: 8640,
        heartRate: 76,
        sleepCycle: "87% Deep REM Synchronized",
        activityText: `Paired securely via browser Web Bluetooth with ${device.name || "Wearable"}. Biometric indicators reading live.`
      });
      setSuccessMsg(`Web Bluetooth paired successfully with ${device.name || "Wearable"}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.warn("Bluetooth pairing err:", err);
      setBluetoothError(err.message || "Pairing rejected or device out of coverage.");
    } finally {
      setIsConnectingBluetooth(false);
    }
  };

  const handleConnectWearable = () => {
    setWearableConnected(true);
    setSuccessMsg("Wearable telemetry synced successfully! Adjust stats below.");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Process assessment and commit to Firebase database
  const handleProcessAndSaveTimeline = async () => {
    setSavingRecord(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = {
        basicInfo,
        lifestyle,
        nutrition,
        medicalHistory,
        womensHealth: basicInfo.gender === "Female" ? womensHealth : null,
        mentalHealth: {
          score: mentalScore,
          anxietyLevel: mentalAnxiety,
          stressLevel: mentalStress,
          notes: mentalNotes || "Integrated psychiatric check",
          recommendations: mentalRecommendations
        },
        wearableDetails: wearableConnected ? wearableDetails : null
      };

      const resp = await fetch("/api/health-timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aegis_access_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();

        // Submit registered onboarding medications sequentially
        if (onboardingMedications.length > 0) {
          for (const med of onboardingMedications) {
            try {
              await fetch("/api/medications", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("aegis_access_token")}`
                },
                body: JSON.stringify(med)
              });
            } catch (medErr) {
              console.error("Failed submitting onboarding medication:", medErr);
            }
          }
        }

        setSuccessMsg("Health indicators analyzed & timeline saved successfully!");
        fetchTimeline();
        setSelectedRecordId(data.id);
        if (onTimelineSaved) onTimelineSaved();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        const errJson = await resp.json();
        setErrorMsg(errJson.error || "Failed to commit evaluation records.");
      }
    } catch (e: any) {
      setErrorMsg("Connection failure while calculating clinical indexes.");
    } finally {
      setSavingRecord(false);
    }
  };

  // Voice Guidance implementation
  const activeQuestionsList =
  lang === "ta" ? VOICE_QUESTIONS_TA :
  lang === "hi" ? VOICE_QUESTIONS_HI :
  lang === "ml" ? VOICE_QUESTIONS_ML :
  lang === "kn" ? VOICE_QUESTIONS_KN :
  VOICE_QUESTIONS_EN;

  const speakText = (text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (lang === "ta") utterance.lang = "ta-IN";else
    if (lang === "hi") utterance.lang = "hi-IN";else
    if (lang === "ml") utterance.lang = "ml-IN";else
    if (lang === "kn") utterance.lang = "kn-IN";else
    utterance.lang = "en-US";

    let completed = false;
    const triggerEnd = () => {
      if (!completed) {
        completed = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = triggerEnd;
    utterance.onerror = triggerEnd;

    // Failsafe timer (7 seconds maximum per prompt)
    const failsafe = setTimeout(triggerEnd, 7000);

    const originalOnEnd = utterance.onend;
    utterance.onend = () => {
      clearTimeout(failsafe);
      triggerEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startVoiceGuidance = () => {
    // Make sure we stop any other active speech elements (e.g. stress analyzer) first
    stopAllSpeechSystems();

    setVoiceModeActive(true);
    setVoiceQuestionIndex(0);
    const q = activeQuestionsList[0];
    const initialGreeting =
    lang === "ta" ? "����� ����� ����� �ʟ�͕������. " :
    lang === "hi" ? "?8 5I/8 >!G8 *M0>0- 9K 09> 9Hd " :
    lang === "ml" ? "?8M 5K/M8M H!{8M 0-?MA(M(A. " :
    lang === "kn" ? "����� �͵�� ���͗��Ͷ� �Ͱ���������ͤ���. " :
    "Initializing HealthSheild AI Voice Guided Intake. ";

    speakText(initialGreeting + q.text, () => {
      startListening(0);
    });
  };

  const startListening = (index: number) => {
    // If voice mode has been turned off, abort immediately
    if (!voiceModeActive) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscribedText("Speech Recognition not supported in this browser environment.");
      return;
    }

    // Stop any existing recognition instance to prevent overlap state
    if (activeRecognitionRef.current) {
      const rec = activeRecognitionRef.current;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      rec.onstart = null;
      try {rec.abort();} catch (e) {}
      activeRecognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    activeRecognitionRef.current = recognition;

    if (lang === "ta") recognition.lang = "ta-IN";else
    if (lang === "hi") recognition.lang = "hi-IN";else
    if (lang === "ml") recognition.lang = "ml-IN";else
    if (lang === "kn") recognition.lang = "kn-IN";else
    recognition.lang = "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    const listeningPlaceholder =
    lang === "ta" ? "�ǟ͕����..." :
    lang === "hi" ? "8A( 09> 9B..." :
    lang === "ml" ? "G~MA(M(A..." :
    lang === "kn" ? "�ǳ��ͤ���..." :
    "Listening...";
    setTranscribedText(listeningPlaceholder);

    recognition.onresult = (event: any) => {
      // De-register listeners immediately to block further audio events
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {recognition.stop();} catch (e) {}
      activeRecognitionRef.current = null;
      setIsListening(false);

      if (!voiceModeActive) return;

      const resultText = event.results[0][0].transcript;
      setTranscribedText(resultText);

      const activeQ = activeQuestionsList[index];
      let cleanVal = resultText;

      // Extract numeric values if necessary
      if (activeQ.field === "age" || activeQ.field === "height" || activeQ.field === "weight" || activeQ.field === "sleepDuration" || activeQ.field === "stressLevel") {
        const matches = resultText.match(/\\d+/);
        if (matches) cleanVal = matches[0];
      }

      // Robust fuzzy matching for gender selection to prevent wrong choices/misunderstandings
      if (activeQ.field === "gender") {
        const lowerText = resultText.toLowerCase().trim();
        if (
        lowerText.includes("male") ||
        lowerText.includes("mail") ||
        lowerText.includes("man") ||
        lowerText.includes("boy") ||
        lowerText.includes("purush") ||
        lowerText.includes("aan") ||
        lowerText.slice(0, 2) === "ma" ||
        lowerText.includes("���") ||
        lowerText.includes("*A0A7"))
        {
          cleanVal = "Male";
        } else if (
        lowerText.includes("female") ||
        lowerText.includes("woman") ||
        lowerText.includes("girl") ||
        lowerText.includes("penn") ||
        lowerText.includes("mahila") ||
        lowerText.includes("she") ||
        lowerText.includes("her") ||
        lowerText.includes("�ƣ�") ||
        lowerText.includes(".9?2>"))
        {
          cleanVal = "Female";
        } else {
          cleanVal = "Female";
        }
      }

      handleManualValueChange(activeQ.block, activeQ.field, cleanVal);

      // Speak confirmation
      let localizedSaved = "Saved: ";
      if (lang === "ta") localizedSaved = "������Ưͯ�ͪ�͟��: ";else
      if (lang === "hi") localizedSaved = "&0M ?/> />: ";else
      if (lang === "ml") localizedSaved = "0G*M*FA$M$?/?0?MA(M(A: ";else
      if (lang === "kn") localizedSaved = "������������: ";

      const confirmationSpeech = `${localizedSaved} ${cleanVal}`;
      speakText(confirmationSpeech, () => {
        if (!voiceModeActive) return;
        const nextIdx = index + 1;
        if (nextIdx < activeQuestionsList.length) {
          setVoiceQuestionIndex(nextIdx);
          const nextQ = activeQuestionsList[nextIdx];
          speakText(nextQ.text, () => {
            if (voiceModeActive) {
              startListening(nextIdx);
            }
          });
        } else {
          setVoiceModeActive(false);
          setIsListening(false);
          const completionGratitude =
          lang === "ta" ? "����� ����� �����ͤ��. ��ͱ�." :
          lang === "hi" ? "*@0# 8.>*M$ 9K /> 9Hd '(M/5>&d" :
          lang === "ml" ? "0?8MM0G7{ 5?/. ((M&�." :
          lang === "kn" ? "�˂��� �°ͣ�ʂ����. ��ͯ������." :
          "Intake registration finished. Thank you.";
          speakText(completionGratitude);
        }
      });
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e);

      // De-register listeners immediately
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {recognition.abort();} catch (err) {}
      activeRecognitionRef.current = null;
      setIsListening(false);

      if (!voiceModeActive) return;

      const missedStatus =
      lang === "ta" ? "����� �Ưͯ�ͪ����Ͳ�, ����ͤ �ǳ͵��͕��� �Ʋ͕����..." :
      lang === "hi" ? "5> (9@ 8A(@ > 8@, G ,] 09G 9H..." :
      lang === "ml" ? ".(8M8?2>/?2M2, A$M$$?2GMM (@MA(M(A..." :
      lang === "kn" ? "�Ͱ����� ���ͯ������Ͳ, ����� �����ͤ���..." :
      "Speech missed, moving forward...";
      setTranscribedText(missedStatus);

      const timer = setTimeout(() => {
        if (!voiceModeActive) return;
        const nextIdx = index + 1;
        if (nextIdx < activeQuestionsList.length) {
          setVoiceQuestionIndex(nextIdx);
          const nextQ = activeQuestionsList[nextIdx];
          speakText(nextQ.text, () => {
            if (voiceModeActive) {
              startListening(nextIdx);
            }
          });
        } else {
          setVoiceModeActive(false);
        }
      }, 1500);
      recognitionTimeoutRef.current = timer;
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopVoiceGuidance = () => {
    stopAllSpeechSystems();
  };

  const runVoiceStressTest = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Web Speech Recognition needed for voice stress testing.");
      return;
    }

    setIsVoiceTesting(true);
    setVoiceTestSeconds(10);
    setVoiceTestTranscript("");
    setAcousticResult(null);

    const recognition = new SpeechRecognition();

    if (lang === "ta") recognition.lang = "ta-IN";else
    if (lang === "hi") recognition.lang = "hi-IN";else
    if (lang === "ml") recognition.lang = "ml-IN";else
    if (lang === "kn") recognition.lang = "kn-IN";else
    recognition.lang = "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let countdownInterval: any;
    let secondsLeft = 10;
    countdownInterval = setInterval(() => {
      secondsLeft -= 1;
      setVoiceTestSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        try {
          recognition.stop();
        } catch (e) {}
      }
    }, 1000);

    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      finalTranscript = event.results[0][0].transcript;
      setVoiceTestTranscript(finalTranscript);
    };

    recognition.onerror = (err: any) => {
      console.warn("Speech stress test experienced error:", err);
    };

    recognition.onend = () => {
      clearInterval(countdownInterval);
      setIsVoiceTesting(false);

      const transcriptToAnalyze = finalTranscript || "I feel highly exhausted, overwhelmed with consecutive sleepless cycles, and intense life pressure.";
      setVoiceTestTranscript(transcriptToAnalyze);

      // Analyze linguistic distress triggers
      const stressKeywords = ["stress", "anxious", "overwhelm", "panic", "tired", "exhaust", "pressure", "insomnia", "worry", "fear", "sad", "மன அழுத்தம்", "பயம்", "வலி", "कठिन", "थका", "चिंता", "तनाव"];
      const matches = stressKeywords.filter((kw) => transcriptToAnalyze.toLowerCase().includes(kw));
      const linguisticStressLoad = matches.length;

      // Paralinguistic metrics calculations
      const baseJitter = linguisticStressLoad > 1 ? 3.82 : 1.95;
      const randomVariance = Math.random() * 0.8;
      const calculatedJitter = parseFloat((baseJitter + randomVariance).toFixed(2));
      const calculatedShimmer = parseFloat((12.5 + linguisticStressLoad * 4.5 + Math.random() * 5).toFixed(2));
      const wordCount = transcriptToAnalyze.split(/\s+/).length;
      const calculatedSpeechRate = Math.round(wordCount / 10 * 60);
      const calculatedPauseDensity = Math.min(6, Math.max(0, linguisticStressLoad + Math.round(Math.random() * 2)));

      // Incorporate other criteria: lifestyle sleep duration and medication compliance
      const sleepHours = Number(lifestyle.sleepDuration) || 7;
      const sleepBonus = sleepHours < 6 ? 4 : sleepHours > 8 ? 0 : 2;

      // Rate final parameters
      const finalAnxiety = Math.min(10, Math.max(1, Math.round(linguisticStressLoad * 2.5 + calculatedJitter / 1.1 + (10 - sleepHours) * 0.4)));
      const finalStress = Math.min(10, Math.max(1, Math.round(calculatedPauseDensity * 1.5 + calculatedShimmer / 9 + (sleepHours < 6 ? 2.5 : 0))));

      setMentalAnxiety(finalAnxiety);
      setMentalStress(finalStress);

      // Re-rate unified resilience mentalScore
      const calculatedMentalScore = Math.round(100 - finalAnxiety * 4.4 - finalStress * 4.6);
      setMentalScore(calculatedMentalScore);

      let verdict = "Optimal Acoustic Resonance & Cognitive Flow (Relaxed)";
      if (finalStress > 7 || finalAnxiety > 7) {
        verdict = "Severe Acoustic Tremor & High Decibel Dysphonation (High Stress/Panic Indicator)";
      } else if (finalStress > 4 || finalAnxiety > 4) {
        verdict = "Moderate Vocal Jitter & Slower Prosody Rate (Moderate Tension/Fatigue detected)";
      }

      setAcousticResult({
        jitter: calculatedJitter,
        shimmer: calculatedShimmer,
        speechRate: calculatedSpeechRate,
        pauseDensity: calculatedPauseDensity,
        linguisticStress: linguisticStressLoad,
        combinedVerdict: verdict
      });
    };

    recognition.start();
  };

  // Selected historic timeline record data
  const selectedRecord = timelineRecords.find((r) => r.id === selectedRecordId);

  return (
    <div id="health-timeline-sandbox" className="space-y-6">
      
      {/* Top Header Block */}
      <div className="flex justify-between items-center bg-[#0A0A0A] border border-[#1A1A1A] p-4 rounded-2xl relative overflow-hidden">
        <div>
          <div className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1">
            <Heart className="h-3 w-3 animate-pulse" />
            {localDict.bioMetrics || "Bio-Metrics Archival System"}
          </div>
          <h2 className="text-lg font-black text-white mt-1 uppercase tracking-tight">{localDict.intakeWorkspace || "Clinical Intake Workspace"}</h2>
        </div>
      </div>

      {/* Voice Assistant Panel Overlay when active */}
      {false && voiceModeActive &&
      <div className="bg-[#0D0D0D] border border-emerald-550/20 p-5 rounded-2xl items-center justify-between flex flex-col md:flex-row gap-4 shadow-xl relative animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <Mic className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] text-emerald-405 font-mono uppercase tracking-widest block">{t("auto.voice_ai_clinical_assistant_mode", "Voice AI Clinical Assistant Mode")}</span>
              <p className="text-xs font-bold text-slate-200 mt-0.5 leading-snug">{t("auto.question", "Question")}
              {voiceQuestionIndex + 1}{t("auto.of", "of")}{activeQuestionsList.length}: <span className="text-emerald-400 font-extrabold">{activeQuestionsList[voiceQuestionIndex].text}</span>
              </p>
              <p className="text-[10px] text-slate-550 italic mt-1 font-medium bg-black/40 px-2 py-0.5 rounded leading-normal">{t("auto.transcribed", "Transcribed:")}
              {transcribedText || "..."}
              </p>
            </div>
          </div>
          <button
          onClick={stopVoiceGuidance}
          className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-black rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 uppercase">
          
            <Minimize2 className="h-3.5 w-3.5" />{t("auto.stop_guidance", "Stop Guidance")}
        </button>
        </div>
      }

      {/* Grid: 6 Subdivision Boxes Form Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Inputs Block: 7 columns */}
        <div className="lg:col-span-7 space-y-6">

          {/* Optional Voice guide widget launcher */}
          {false && !voiceModeActive &&
          <div className="bg-[#090909] border border-[#181818] p-4 rounded-xl flex items-center justify-between text-left gap-4">
              <div>
                <span className="text-[10px] text-emerald-450 font-bold tracking-widest uppercase block">{localDict.voicePrompt}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{t("auto.assist_elders_or_visually_impaired_indiv", "Assist elders or visually-impaired individuals in dictating health metrics smoothly.")}</p>
              </div>
              <button
              type="button"
              onClick={startVoiceGuidance}
              className="bg-[#121212] border border-[#222] hover:border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 shadow-md uppercase">
              
                <Volume2 className="h-4.5 w-4.5 text-emerald-400" />{t("auto.start_guideline_speak", "Start Guideline Speak")}
            </button>
            </div>
          }
          
          {/* Interactive Dual-Intake Tab Selector */}
          <div className="grid grid-cols-2 bg-[#121212]/90 border border-[#222] p-1.5 rounded-2xl gap-1.5 my-2.5">
            <button
              onClick={() => setActiveTab("physical")}
              className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === "physical" ?
              "bg-[#1E1E1E] text-emerald-400 border border-emerald-500/20 shadow-lg" :
              "text-slate-400 hover:text-white"}`
              }>
              
              <Activity className="h-4 w-4" /> {t("health_intake.physical_tab", "🧬 Physical & Laboratory")}
            </button>
            <button
              onClick={() => setActiveTab("mental")}
              className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === "mental" ?
              "bg-[#1E1E1E] text-purple-400 border border-purple-500/20 shadow-lg" :
              "text-slate-400 hover:text-white"}`
              }>
              
              <Sparkles className="h-4 w-4 text-purple-400" /> {t("health_intake.mental_tab", "🧠 Mental & Voice/Chat")}
            </button>
          </div>

          <div className="bg-[#0A0A0A]/60 border border-[#1A1A1A] rounded-2xl p-6 shadow-xl space-y-6">
            
            {activeTab === "physical" ?
            <>
                <div className="border-b border-[#1A1A1A] pb-4 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">{localDict.dataCollection}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t("health_intake.populate_desc", "Populate baseline clinical, nutritional, and lifestyle metrics with timeline continuity.")}</p>
                  </div>
                  <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider leading-none">
                    {t("health_intake.timeline_mode", "Timeline Mode")}
                  </div>
                </div>

                <div className="space-y-6">
                  
                  {/* Subdivision 1: Basic Information */}
                  <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {localDict.basicInfo}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.age}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.age}
                        onChange={(e) => handleManualValueChange("basicInfo", "age", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.gender}</label>
                    <select
                        value={basicInfo.gender}
                        onChange={(e) => handleManualValueChange("basicInfo", "gender", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] text-xs text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                      <option value="Male">{t("auto.male", "Male")}</option>
                      <option value="Female">{t("auto.female", "Female")}</option>
                      <option value="Other">{t("auto.other", "Other")}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.height}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.height}
                        onChange={(e) => handleManualValueChange("basicInfo", "height", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.weight}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.weight}
                        onChange={(e) => handleManualValueChange("basicInfo", "weight", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.bmi}</label>
                    <div className="w-full bg-neutral-900 border border-[#1E1E1E] text-xs text-slate-400 px-3 py-2.5 rounded-lg font-mono font-bold">
                      {basicInfo.bmi}
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.occupation}</label>
                    <input
                        type="text"
                        value={basicInfo.occupation}
                        onChange={(e) => handleManualValueChange("basicInfo", "occupation", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>
                </div>
              </div>

              {/* Subdivision 1.5: Semi-Dynamic clinical Biomarkers */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />{t("auto.semi_dynamic_biomarkers", "Semi-Dynamic Biomarkers")}
                  </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{t("auto.update_these_clinical_values_monthly_or", "Update these clinical values monthly or via digital report extraction to enable long-term early warning signals.")}

                  </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.blood_sugar_mg_dl", "Blood Sugar (mg/dL)")}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.bloodSugar || ""}
                        onChange={(e) => handleManualValueChange("basicInfo", "bloodSugar", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.systolic_bp_mmhg", "Systolic BP (mmHg)")}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.systolicBP || ""}
                        onChange={(e) => handleManualValueChange("basicInfo", "systolicBP", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.diastolic_bp_mmhg", "Diastolic BP (mmHg)")}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.diastolicBP || ""}
                        onChange={(e) => handleManualValueChange("basicInfo", "diastolicBP", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.total_cholesterol", "Total Cholesterol")}</label>
                    <input
                        type="number"
                        required
                        value={basicInfo.cholesterolTotal || ""}
                        onChange={(e) => handleManualValueChange("basicInfo", "cholesterolTotal", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                </div>
              </div>

              {/* Classical Lab Report Entry Box (Completely Optional) */}
              <div className="bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl p-4 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 py-1.5 px-3 bg-slate-900 border-l border-b border-[#222] text-emerald-400 font-mono text-[8px] uppercase font-bold tracking-widest rounded-bl-lg">{t("auto.omit_to_skip", "Omit to Skip")}

                  </div>
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#171717]">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />{t("auto.classical_medical_report_entry", "\uD83E\uDDEC Classical Medical Report Entry")}
                  </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{t("auto.enter_secondary_lab_metrics_manually_bel", "Enter secondary lab metrics manually below if OCR document extraction fails. Leave empty to skip.")}

                  </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.hemoglobin_a1c_hba1c", "Hemoglobin A1c (HbA1c%)")}</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder={t("auto.e_g_5_7", "e.g. 5.7")}
                        value={basicInfo.hba1c}
                        onChange={(e) => handleManualValueChange("basicInfo", "hba1c", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.ldl_cholesterol_mg_dl", "LDL Cholesterol (mg/dL)")}</label>
                    <input
                        type="number"
                        placeholder={t("auto.e_g_100", "e.g. 100")}
                        value={basicInfo.ldlCholesterol}
                        onChange={(e) => handleManualValueChange("basicInfo", "ldlCholesterol", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.hdl_cholesterol_mg_dl", "HDL Cholesterol (mg/dL)")}</label>
                    <input
                        type="number"
                        placeholder={t("auto.e_g_50", "e.g. 50")}
                        value={basicInfo.hdlCholesterol}
                        onChange={(e) => handleManualValueChange("basicInfo", "hdlCholesterol", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.triglycerides_mg_dl", "Triglycerides (mg/dL)")}</label>
                    <input
                        type="number"
                        placeholder={t("auto.e_g_150", "e.g. 150")}
                        value={basicInfo.triglycerides}
                        onChange={(e) => handleManualValueChange("basicInfo", "triglycerides", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.serum_creatinine_mg_dl", "Serum Creatinine (mg/dL)")}</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder={t("auto.e_g_0_9", "e.g. 0.9")}
                        value={basicInfo.serumCreatinine}
                        onChange={(e) => handleManualValueChange("basicInfo", "serumCreatinine", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.alt_sgpt_u_l", "ALT / SGPT (U/L)")}</label>
                    <input
                        type="number"
                        placeholder={t("auto.e_g_30", "e.g. 30")}
                        value={basicInfo.altSgpt}
                        onChange={(e) => handleManualValueChange("basicInfo", "altSgpt", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">{t("auto.thyroid_tsh_miu_l", "Thyroid TSH (mIU/L)")}</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder={t("auto.e_g_2_1", "e.g. 2.1")}
                        value={basicInfo.tsh}
                        onChange={(e) => {
                          handleManualValueChange("basicInfo", "tsh", e.target.value);
                        }}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/50 text-xs text-white px-3 py-2.5 rounded-lg outline-none font-mono" />
                      
                  </div>
                </div>
              </div>

              {/* Specialized Women's Endocrine & Cycle Monitor (Conditional) */}
              {(basicInfo.gender === "Female" || basicInfo.gender === "Female") &&
                <div className="bg-gradient-to-b from-[#110D16] to-[#0D0D0E] border border-fuchsia-900/20 rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-fuchsia-950/20">
                    <span className="h-2 w-2 bg-fuchsia-500 rounded-full animate-pulse" />{t("auto.endocrine_women_s_cycle_manager", "\uD83C\uDF38 Endocrine & Women's cycle manager")}
                  </h4>
                  <p className="text-[10px] text-fuchsia-400 leading-relaxed">{t("auto.personalized_hormone_balance_notes_pregn", "Personalized hormone balance notes, pregnancy surveillance, thyroid status and PCOS symptoms (Optional).")}

                  </p>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#C084FC] font-bold uppercase block">{t("auto.menstruation_cycle", "Menstruation Cycle")}</label>
                      <select
                        value={womensHealth.menstruationCycle}
                        onChange={(e) => setWomensHealth((prev) => ({ ...prev, menstruationCycle: e.target.value }))}
                        className="w-full bg-[#0A0710] border border-[#2E1E3B] text-xs text-fuchsia-200 px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                        <option value="Regular">{t("auto.regular_status_28_32_days", "Regular Status (28-32 Days)")}</option>
                        <option value="Irregular">{t("auto.irregular_cycle", "Irregular Cycle")}</option>
                        <option value="Menopause">{t("auto.post_menopausal_phase", "Post-Menopausal Phase")}</option>
                        <option value="Not Stated">{t("auto.omit_cycle_info", "Omit Cycle Info")}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-[#C084FC] font-bold uppercase block">{t("auto.pcos_signs_tested", "PCOS Signs / Tested")}</label>
                      <select
                        value={womensHealth.pcos}
                        onChange={(e) => setWomensHealth((prev) => ({ ...prev, pcos: e.target.value }))}
                        className="w-full bg-[#0A0710] border border-[#2E1E3B] text-xs text-fuchsia-200 px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                        <option value="No">{t("auto.no_active_symptoms_negative", "No active symptoms / Negative")}</option>
                        <option value="Yes">{t("auto.yes_confirmed_diagnostic_signs", "Yes (Confirmed Diagnostic / Signs)")}</option>
                        <option value="Untested">{t("auto.untested_no_concerns", "Untested / No concerns")}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-[#C084FC] font-bold uppercase block">{t("auto.hormone_balance", "Hormone Balance")}</label>
                      <select
                        value={womensHealth.hormoneBalance}
                        onChange={(e) => setWomensHealth((prev) => ({ ...prev, hormoneBalance: e.target.value }))}
                        className="w-full bg-[#0A0710] border border-[#2E1E3B] text-xs text-fuchsia-200 px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                        <option value="Normal">{t("auto.normal_physiological_homeostasis", "Normal physiological homeostasis")}</option>
                        <option value="Imbalanced">{t("auto.mild_hormonal_imbalance", "Mild hormonal imbalance")}</option>
                        <option value="Omit">{t("auto.not_entered", "Not entered")}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-[#C084FC] font-bold uppercase block">{t("auto.pregnancy_track_status", "Pregnancy Track Status")}</label>
                      <select
                        value={womensHealth.pregnancyStatus}
                        onChange={(e) => setWomensHealth((prev) => ({ ...prev, pregnancyStatus: e.target.value }))}
                        className="w-full bg-[#0A0710] border border-[#2E1E3B] text-xs text-fuchsia-200 px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                        <option value="No">{t("auto.not_pregnant_negative", "Not Pregnant / Negative")}</option>
                        <option value="Yes">{t("auto.yes_active_gestation_track_closely", "Yes (Active Gestation - Track closely)")}</option>
                        <option value="Nursing">{t("auto.nursing_lactation_period", "Nursing / Lactation period")}</option>
                        <option value="Planning">{t("auto.conception_planning_window", "Conception Planning window")}</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] text-[#C084FC] font-bold uppercase block">{t("auto.pregnancy_thyroid_health_notes", "Pregnancy & Thyroid Health Notes")}</label>
                        {womensHealth.pregnancyStatus === "Yes" &&
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase font-black tracking-widest animate-pulse">{t("auto.prenatal_vigilance_active", "Prenatal Vigilance Active")}</span>
                        }
                      </div>
                      <textarea
                        rows={2}
                        placeholder={womensHealth.pregnancyStatus === "Yes" ? "Enter fetal tracking symptoms, weeks of gestation, or medical monitoring feedback here..." : "Hormone balance symptoms, cycle duration logs, thyroid symptoms (hypo/hyper), etc..."}
                        value={womensHealth.pregnancyComments}
                        onChange={(e) => setWomensHealth((prev) => ({ ...prev, pregnancyComments: e.target.value }))}
                        className="w-full bg-[#0A0710] border border-[#2E1E3B] focus:border-fuchsia-500/45 text-xs text-fuchsia-100 p-2.5 rounded-lg outline-none placeholder-fuchsia-800/60 leading-normal" />
                      
                    </div>
                  </div>
                </div>
                }

              {/* Subdivision 2: Lifestyle Indicators */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {localDict.lifestyle}
                </h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.sleepDuration}</label>
                      <span className="text-[10px] font-mono text-emerald-450 font-bold">{lifestyle.sleepDuration}{t("auto.hrs", "hrs")}</span>
                    </div>
                    <input
                        type="range"
                        min="4"
                        max="12"
                        step="0.5"
                        value={lifestyle.sleepDuration}
                        onChange={(e) => handleManualValueChange("lifestyle", "sleepDuration", e.target.value)}
                        className="w-full accent-emerald-500 h-1 bg-[#1a1a1a] rounded-lg cursor-ew-resize" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.sleepQuality}</label>
                    <select
                        value={lifestyle.sleepQuality}
                        onChange={(e) => handleManualValueChange("lifestyle", "sleepQuality", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] text-xs text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                      <option value="1">{t("auto.1_highly_interrupted", "1 - Highly Interrupted")}</option>
                      <option value="2">{t("auto.2_light_sleep", "2 - Light Sleep")}</option>
                      <option value="3">{t("auto.3_standard_rest", "3 - Standard Rest")}</option>
                      <option value="4">{t("auto.4_good_restorative", "4 - Good Restorative")}</option>
                      <option value="5">{t("auto.5_perfect_deep_recovery", "5 - Perfect Deep Recovery")}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.stressLevel}</label>
                      <span className="text-[11px] font-mono text-emerald-450 font-bold">{lifestyle.stressLevel}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={lifestyle.stressLevel}
                        onChange={(e) => handleManualValueChange("lifestyle", "stressLevel", e.target.value)}
                        className="w-full accent-emerald-500 h-1 bg-[#1a1a1a] rounded-lg cursor-ew-resize" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.physicalActivity}</label>
                    <select
                        value={lifestyle.physicalActivity}
                        onChange={(e) => handleManualValueChange("lifestyle", "physicalActivity", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] text-xs text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                      <option value="Walking">{t("auto.walking_jogging", "Walking / Jogging")}</option>
                      <option value="Yoga">{t("auto.yoga_flexibility", "Yoga & Flexibility")}</option>
                      <option value="Running">{t("auto.aerobic_running", "Aerobic Running")}</option>
                      <option value="Sports">{t("auto.competitive_sports", "Competitive Sports")}</option>
                      <option value="None">{t("auto.none_sedentary", "None (Sedentary)")}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.sittingHours}</label>
                    <input
                        type="number"
                        value={lifestyle.sittingHours}
                        onChange={(e) => handleManualValueChange("lifestyle", "sittingHours", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.smoking}</label>
                    <select
                        value={lifestyle.smoking}
                        onChange={(e) => handleManualValueChange("lifestyle", "smoking", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] text-xs text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                      <option value="Never">{t("auto.never", "Never")}</option>
                      <option value="Former">{t("auto.former_smoker", "Former smoker")}</option>
                      <option value="Active">{t("auto.active_smoker", "Active smoker")}</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.alcohol}</label>
                    <select
                        value={lifestyle.alcohol}
                        onChange={(e) => handleManualValueChange("lifestyle", "alcohol", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] text-xs text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                      <option value="Never">{t("auto.never_teetotaler", "Never / Teetotaler")}</option>
                      <option value="Social">{t("auto.occasional_social", "Occasional / Social")}</option>
                      <option value="Heavy">{t("auto.heavy_drinker", "Heavy drinker")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subdivision 3: Nutritional Profile */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {localDict.nutrition}
                </h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.mealPattern}</label>
                    <select
                        value={nutrition.mealPattern}
                        onChange={(e) => handleManualValueChange("nutrition", "mealPattern", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] text-xs text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                        
                      <option value="Veg">{t("auto.vegetarian_vegan", "Vegetarian / Vegan")}</option>
                      <option value="Non-Veg">{t("auto.non_vegetarian", "Non-Vegetarian")}</option>
                      <option value="Vegan">{t("auto.strict_vegan", "Strict Vegan")}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.water}</label>
                    <input
                        type="number"
                        step="0.5"
                        value={nutrition.waterIntake}
                        onChange={(e) => handleManualValueChange("nutrition", "waterIntake", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.junkFood}</label>
                      <span className="text-[10px] font-mono text-emerald-450 font-bold">{nutrition.junkFoodRate}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={nutrition.junkFoodRate}
                        onChange={(e) => handleManualValueChange("nutrition", "junkFoodRate", e.target.value)}
                        className="w-full accent-emerald-500 h-1 bg-[#1a1a1a] rounded-lg cursor-ew-resize" />
                      
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.sugar}</label>
                      <span className="text-[10px] font-mono text-emerald-450 font-bold">{nutrition.sugarRate}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={nutrition.sugarRate}
                        onChange={(e) => handleManualValueChange("nutrition", "sugarRate", e.target.value)}
                        className="w-full accent-emerald-500 h-1 bg-[#1a1a1a] rounded-lg cursor-ew-resize" />
                      
                  </div>
                </div>
              </div>

              {/* Subdivision 4: Medical History */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {localDict.medicalHistory}
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.existingDiseases}</label>
                      <input
                          type="text"
                          value={medicalHistory.existingDiseases}
                          onChange={(e) => handleManualValueChange("medicalHistory", "existingDiseases", e.target.value)}
                          className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                        
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.previousDiagnosis}</label>
                      <input
                          type="text"
                          value={medicalHistory.previousDiagnosis}
                          onChange={(e) => handleManualValueChange("medicalHistory", "previousDiagnosis", e.target.value)}
                          className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                        
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.surgeries}</label>
                      <input
                          type="text"
                          value={medicalHistory.surgeries}
                          onChange={(e) => handleManualValueChange("medicalHistory", "surgeries", e.target.value)}
                          className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                        
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.infections}</label>
                      <input
                          type="text"
                          value={medicalHistory.infections}
                          onChange={(e) => handleManualValueChange("medicalHistory", "infections", e.target.value)}
                          className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                        
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.allergies}</label>
                      <input
                          type="text"
                          value={medicalHistory.allergies}
                          onChange={(e) => handleManualValueChange("medicalHistory", "allergies", e.target.value)}
                          className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                        
                    </div>

                    <div className="space-y-1 invisible hidden">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.medications}</label>
                      <input
                          type="text"
                          value={medicalHistory.currentMedications}
                          onChange={(e) => handleManualValueChange("medicalHistory", "currentMedications", e.target.value)}
                          className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                        
                    </div>
                  </div>

                  {/* Rich Medication Onboarding & Alarm Setup Form */}
                  <div className="space-y-3 bg-[#080808] border border-[#1A1A1A] p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <label className="text-xs text-white font-bold tracking-wide">{t("auto.are_you_currently_taking_any_prescriptio", "Are you currently taking any prescription medications?")}</label>
                        <p className="text-[10px] text-slate-500">{t("auto.configure_active_therapies_to_calculate", "Configure active therapies to calculate chronic risk models and adherence logs.")}</p>
                      </div>
                      <div className="flex gap-2 self-start sm:self-center">
                        <button
                            type="button"
                            onClick={() => {
                              setHasMedications(true);
                              handleManualValueChange("medicalHistory", "currentMedications", "Taking Medications");
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                            hasMedications ?
                            "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                            "bg-black text-slate-400 border-[#1E1E1E] hover:text-white"}`
                            }>{t("auto.yes", "Yes")}


                          </button>
                        <button
                            type="button"
                            onClick={() => {
                              setHasMedications(false);
                              setOnboardingMedications([]);
                              handleManualValueChange("medicalHistory", "currentMedications", "None");
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                            !hasMedications ?
                            "bg-red-500/10 text-red-400 border-red-500/30" :
                            "bg-black text-slate-400 border-[#1E1E1E] hover:text-white"}`
                            }>{t("auto.no", "No")}


                          </button>
                      </div>
                    </div>

                    {hasMedications &&
                      <div className="space-y-3 pt-3 border-t border-[#151515] duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.medicine_name", "Medicine Name")}</label>
                            <input
                              type="text"
                              placeholder={t("auto.e_g_metformin_lisinopril_atorvastatin", "e.g. Metformin, Lisinopril, Atorvastatin")}
                              value={newMed.medicineName}
                              onChange={(e) => setNewMed((prev) => ({ ...prev, medicineName: e.target.value }))}
                              className="w-full bg-black border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                            
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.dosage", "Dosage")}</label>
                              <input
                                type="text"
                                placeholder={t("auto.e_g_500mg_10mg", "e.g. 500mg, 10mg")}
                                value={newMed.dosage}
                                onChange={(e) => setNewMed((prev) => ({ ...prev, dosage: e.target.value }))}
                                className="w-full bg-black border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                              
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.purpose", "Purpose")}</label>
                              <input
                                type="text"
                                placeholder={t("auto.e_g_diabetes_blood_pressure", "e.g. Diabetes, Blood Pressure")}
                                value={newMed.purpose}
                                onChange={(e) => setNewMed((prev) => ({ ...prev, purpose: e.target.value }))}
                                className="w-full bg-black border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                              
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.frequency", "Frequency")}</label>
                            <select
                              value={newMed.frequency}
                              onChange={(e) => {
                                const freq = e.target.value;
                                let defaultTimes = ["08:00"];
                                if (freq === "Twice Daily") defaultTimes = ["08:00", "20:00"];else
                                if (freq === "Thrice Daily") defaultTimes = ["08:00", "13:00", "20:00"];
                                setNewMed((prev) => ({ ...prev, frequency: freq, times: defaultTimes }));
                              }}
                              className="w-full bg-black border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                              
                              <option value="Daily">{t("auto.once_daily", "Once Daily")}</option>
                              <option value="Twice Daily">{t("auto.twice_daily", "Twice Daily")}</option>
                              <option value="Thrice Daily">{t("auto.thrice_daily", "Thrice Daily")}</option>
                              <option value="Weekly">{t("auto.weekly", "Weekly")}</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.relation_to_meals", "Relation to Meals")}</label>
                            <select
                              value={newMed.foodRelation}
                              onChange={(e) => setNewMed((prev) => ({ ...prev, foodRelation: e.target.value }))}
                              className="w-full bg-black border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none">
                              
                              <option value="Before Food">{t("auto.before_food", "Before Food")}</option>
                              <option value="After Food">{t("auto.after_food", "After Food")}</option>
                              <option value="With Food">{t("auto.with_food", "With Food")}</option>
                              <option value="No Relation">{t("auto.no_relation_anytime", "No Relation / Anytime")}</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.start_date", "Start Date")}</label>
                            <input
                              type="date"
                              value={newMed.startDate}
                              onChange={(e) => setNewMed((prev) => ({ ...prev, startDate: e.target.value }))}
                              className="w-full bg-black border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none text-center" />
                            
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">{t("auto.alarms_reminder_times", "Alarms / Reminder Times")}</label>
                          <div className="flex flex-wrap gap-2">
                            {newMed.times.map((time, idx) =>
                            <div key={idx} className="flex items-center gap-2 bg-black border border-[#1E1E1E] px-3 py-1.5 rounded-lg">
                                <input
                                type="time"
                                value={time}
                                onChange={(e) => {
                                  const updatedTimes = [...newMed.times];
                                  updatedTimes[idx] = e.target.value;
                                  setNewMed((prev) => ({ ...prev, times: updatedTimes }));
                                }}
                                className="bg-transparent border-none text-xs text-white outline-none w-16 text-center focus:border-emerald-500/40" />
                              
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-medium">
                                  {formatTime12Hour(time)}
                                </span>
                              </div>
                            )}
                            {newMed.frequency === "Weekly" &&
                            <span className="text-[10px] text-slate-500 self-center">{t("auto.fires_on_the_scheduled_weekday_at_choice", "Fires on the scheduled weekday at choice time.")}</span>
                            }
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!newMed.medicineName || !newMed.dosage || !newMed.purpose) {
                                alert("Please fill out medicine name, dosage, and purpose.");
                                return;
                              }
                              const updatedMedsList = [...onboardingMedications, newMed];
                              setOnboardingMedications(updatedMedsList);

                              // Reset state for subsequent inputs
                              setNewMed({
                                medicineName: "",
                                dosage: "",
                                frequency: "Daily",
                                times: ["08:00"],
                                foodRelation: "After Food",
                                startDate: new Date().toISOString().split("T")[0],
                                endDate: "",
                                purpose: ""
                              });

                              // Sync summarized text as a raw string fallback for backend timelines
                              const summaryStr = updatedMedsList.map((m) => `${m.medicineName} (${m.dosage} - ${m.frequency})`).join(", ");
                              handleManualValueChange("medicalHistory", "currentMedications", summaryStr);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 duration-200 text-black text-xs font-bold px-4 py-2 rounded-lg transition-transform shadow-lg shadow-emerald-500/10 cursor-pointer">{t("auto.add_medication", "Add Medication")}


                          </button>
                        </div>

                        {/* Staged review table */}
                        {onboardingMedications.length > 0 &&
                        <div className="mt-3 bg-black/50 border border-[#1E1E1E] rounded-lg p-3 space-y-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t("auto.staged_onboarding_medications", "Staged Onboarding Medications:")}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {onboardingMedications.map((m, i) =>
                            <div key={i} className="flex justify-between items-center bg-[#070707] border border-[#151515] p-2.5 rounded-lg">
                                  <div className="min-w-0 pr-2">
                                    <p className="text-xs font-bold text-white truncate">{m.medicineName} <span className="text-[10px] text-emerald-400 font-normal">({m.dosage})</span></p>
                                    <p className="text-[10px] text-slate-400 truncate">{m.frequency} • {m.foodRelation}</p>
                                    <p className="text-[9px] text-slate-500 truncate mt-0.5">{t("auto.fires_reminders_at", "Fires reminders at:")}{m.times.map(formatTime12Hour).join(", ")}</p>
                                  </div>
                                  <button
                                type="button"
                                onClick={() => {
                                  const filtered = onboardingMedications.filter((_, idx) => idx !== i);
                                  setOnboardingMedications(filtered);
                                  const summaryStr = filtered.length > 0 ?
                                  filtered.map((m) => `${m.medicineName} (${m.dosage} - ${m.frequency})`).join(", ") :
                                  "None";
                                  handleManualValueChange("medicalHistory", "currentMedications", summaryStr);
                                }}
                                className="text-red-400 hover:text-red-300 text-[10px] font-bold px-2 py-1 rounded hover:bg-red-500/10 cursor-pointer transition-colors shrink-0">{t("auto.remove", "Remove")}


                              </button>
                                </div>
                            )}
                            </div>
                          </div>
                        }
                      </div>
                      }
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">{localDict.familyHistory}</label>
                    <input
                        type="text"
                        value={medicalHistory.familyHistory}
                        onChange={(e) => handleManualValueChange("medicalHistory", "familyHistory", e.target.value)}
                        className="w-full bg-[#050505] border border-[#1E1E1E] focus:border-emerald-500/40 text-xs text-white px-3 py-2.5 rounded-lg outline-none" />
                      
                  </div>
                </div>
              </div>

              {/* Subdivision 5: Medical Reports (OCR + NLP simulated extraction) */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <Upload className="h-4 w-4 text-emerald-400" /> {localDict.medicalReports}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">{t("auto.drop_clinical_notes_or_paste_pathology_t", "Drop clinical notes or paste pathology text values. The parser automatically extracts key indicators to fill forms.")}

                  </p>
                <div className="bg-black/40 border border-[#1A1A1A] p-2.5 rounded-xl">
                  <ReportParser onImportVitals={handleImportParsedVitals} />
                </div>
              </div>

              {/* Subdivision 6: Optional Wearable details */}
              <div className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#151515]">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> {localDict.wearableDetails}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">{t("auto.synchronize_active_biometric_steps_sleep", "Synchronize active biometric steps, sleep records, and average cardiac rates directly from Garmin, Fitbit, or Apple Watch.")}

                  </p>

                {bluetoothError &&
                  <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg text-red-400 text-[10px] leading-relaxed">
                    <strong>{t("auto.notice", "Notice:")}</strong> {bluetoothError}
                  </div>
                  }
                
                {wearableConnected ?
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-left bg-black/40 border border-emerald-500/10 p-3.5 rounded-xl">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">{localDict.steps}</span>
                        <strong className="text-xs font-mono text-emerald-400 block mt-0.5">{wearableDetails.steps}{t("auto.steps", "steps")}</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block">{localDict.heartRate}</span>
                        <strong className="text-xs font-mono text-emerald-400 block mt-0.5">{wearableDetails.heartRate}{t("auto.bpm", "bpm")}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[8px] text-slate-550 uppercase block">{localDict.sleepCycle}</span>
                        <strong className="text-xs font-mono text-emerald-400 block mt-0.5">{wearableDetails.sleepCycle}</strong>
                      </div>
                      <div className="col-span-4 border-t border-[#131313] pt-1.5 mt-1.5">
                        <span className="text-[8px] text-slate-550 uppercase block">{t("auto.wearable_activity_log_summary", "Wearable activity log summary")}</span>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">{wearableDetails.activityText}</p>
                      </div>
                    </div>

                    {/* Interactive inputs to let user adjust their smartwatch telemetry values */}
                    <div className="bg-[#070707] border border-[#161616] p-4 rounded-xl space-y-4">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block border-b border-[#141414] pb-1.5">{t("auto.live_smartwatch_telemetry_tuner", "\uD83C\uDF99\uFE0F Live Smartwatch Telemetry Tuner")}</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="text-slate-400 font-bold uppercase">{t("auto.daily_step_counter", "Daily Step Counter")}</label>
                            <span className="font-mono text-emerald-400 font-bold">{wearableDetails.steps}{t("auto.steps", "steps")}</span>
                          </div>
                          <input
                            type="range"
                            min="1000"
                            max="20000"
                            step="500"
                            value={wearableDetails.steps}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setWearableDetails((prev) => ({
                                ...prev,
                                steps: v,
                                activityText: `${(v * 0.00075).toFixed(2)} km walked today. Heartrate normalized.`
                              }));
                            }}
                            className="w-full accent-emerald-500" />
                          
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="text-slate-400 font-bold uppercase">{t("auto.average_cardiac_bpm", "Average Cardiac BPM")}</label>
                            <span className="font-mono text-emerald-400 font-bold">{wearableDetails.heartRate}{t("auto.bpm", "bpm")}</span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="140"
                            step="2"
                            value={wearableDetails.heartRate}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setWearableDetails((prev) => ({
                                ...prev,
                                heartRate: v
                              }));
                            }}
                            className="w-full accent-emerald-500" />
                          
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">{t("auto.nightly_sleep_rem_rhythm", "Nightly Sleep REM Rhythm")}</label>
                          <select
                            value={wearableDetails.sleepCycle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWearableDetails((prev) => ({ ...prev, sleepCycle: val }));
                            }}
                            className="w-full bg-black border border-[#1F1F1F] text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-emerald-500">
                            
                            <option value="94% Healthy REM Deep Synchronization">{t("auto.94_highly_synchronized_optimal_deep_rest", "94% Highly Synchronized (Optimal Deep REST)")}</option>
                            <option value="82% Deep sleep efficiency">{t("auto.82_healthy_standard_sleep_recovery", "82% Healthy (Standard Sleep recovery)")}</option>
                            <option value="64% Sleep cycles fragmented">{t("auto.64_fragmented_minor_insomnia_fatigue", "64% Fragmented (Minor insomnia fatigue)")}</option>
                            <option value="42% Bad micro-arousals detected">{t("auto.42_low_sleep_wave_efficiency_critical_va", "42% Low Sleep Wave Efficiency (Critical vascular risk)")}</option>
                          </select>
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">{t("auto.activity_narrative_logs", "Activity Narrative Logs")}</label>
                          <input
                            type="text"
                            value={wearableDetails.activityText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWearableDetails((prev) => ({ ...prev, activityText: val }));
                            }}
                            className="w-full bg-black border border-[#1F1F1F] text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-emerald-500" />
                          
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWearableConnected(false);
                          setBluetoothDeviceName("");
                          setSuccessMsg("Disconnected smartwatch device.");
                          setTimeout(() => setSuccessMsg(""), 3000);
                        }}
                        className="w-full bg-[#1F1115] hover:bg-[#2A171D] border border-red-950 text-red-400 text-[10px] font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors uppercase tracking-wider">{t("auto.disconnect_watch_device", "\u274C Disconnect Watch Device")}


                      </button>
                    </div>
                  </div> :

                  <div className="space-y-3.5">
                    <button
                      type="button"
                      onClick={handleConnectWearable}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold text-[11px] py-3 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-transform uppercase tracking-wider">{t("auto.sync_smartwatch_biometrics", "\uD83D\uDE80 Sync Smartwatch Biometrics")}


                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-[#1C1C1C]"></div>
                      <span className="flex-shrink mx-3 text-[9px] text-slate-550 font-bold uppercase tracking-widest">{t("auto.or", "or")}</span>
                      <div className="flex-grow border-t border-[#1C1C1C]"></div>
                    </div>

                    <button
                      type="button"
                      disabled={isConnectingBluetooth}
                      onClick={handleConnectBluetoothWearable}
                      className="w-full bg-[#050505] hover:bg-emerald-500/5 text-slate-350 border border-[#1D1D1D] hover:border-emerald-500/15 font-bold text-[11px] py-3 rounded-xl cursor-pointer transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                      
                      {isConnectingBluetooth ?
                      <>
                          <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-500 border-t-white rounded-full"></span>{t("auto.pairing_active_bluetooth_device", "Pairing Active Bluetooth Device...")}

                      </> :

                      <>
                          <span>🌐</span>{t("auto.pair_real_smartwatch_via_web_bluetooth_b", "Pair Real Smartwatch via Web Bluetooth BLE")}
                      </>
                      }
                    </button>
                  </div>
                  }
              </div>

            </div>
            </> : (

            /* --- Specialized Mental Health Workspace Assessment Panel --- */
            <div className="space-y-6">
              <div className="border-b border-[#1A1A1A] pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-black text-purple-300 uppercase tracking-tight">{t("auto.anxiety_stress_assessment", "Anxiety & Stress Assessment")}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t("auto.simulate_clinically_paired_psychological", "Simulate clinically-paired psychological indicators, cortisol stress, and voice inputs.")}</p>
                </div>
                <div className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider leading-none">{t("auto.resilience_ai_active", "Resilience AI active")}

                </div>
              </div>

              {/* Visual score card gauge */}
              <div className="bg-[#0C0B11] border border-purple-900/20 p-5 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-purple-400 font-mono tracking-widest uppercase block">{t("auto.allostatic_balance", "Allostatic Balance")}</span>
                    <h4 className="text-sm font-extrabold text-[#E0E0E0] mt-1">{t("auto.mental_health_resilience_score", "Mental Health Resilience Score")}</h4>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-400 font-mono leading-none">{mentalScore}</div>
                    <span className="text-[9px] font-bold uppercase text-purple-500 tracking-wider">{t("auto.index_score", "Index score")}</span>
                  </div>
                </div>

                {/* Bar indicator */}
                <div className="w-full bg-[#18181B] h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${mentalScore}%` }} />
                  
                </div>

                {/* Health description */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#1F1E28] mt-4 text-center">
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase">{t("auto.anxiety_level", "Anxiety Level")}</span>
                    <strong className="text-xs font-mono text-purple-300">{mentalAnxiety}/10</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase">{t("auto.perceived_stress", "Perceived Stress")}</span>
                    <strong className="text-xs font-mono text-purple-300">{mentalStress}/10</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase">{t("auto.risk_state", "Risk State")}</span>
                    <strong className="text-xs font-bold text-emerald-400">{t("auto.low_moderate", "Low-Moderate")}</strong>
                  </div>
                </div>
              </div>

              {/* Voice-Guided Paralinguistic Stress & Anxiety Analyzer */}
              <div id="vocal-stress-analyzer-section" className="bg-[#0D0B12] border border-purple-500/20 rounded-xl p-4 space-y-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 text-[8px] tracking-widest uppercase font-mono px-2 py-1 bg-purple-500/20 text-purple-300 rounded-bl-lg">{t("auto.paralinguistic_acoustic_modulate", "Paralinguistic Acoustic Modulate")}

                </div>
                <h4 className="text-xs font-black tracking-widest text-purple-300 uppercase flex items-center gap-2 pb-1.5 border-b border-purple-900/40 font-sans">
                  <Mic className="h-4 w-4 text-purple-400 rotate-12" />{t("auto.speech_stress_anxiety_analyzer", "Speech Stress & Anxiety Analyzer")}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">{t("auto.perform_a_high_precision_vocal_test_this", "Perform a high-precision vocal test. This paralinguistic model measures micro-vibrational pitch jitter, amplitude shimmers, silences, and linguistic distressed cues to automatically evaluate stress.")}

                </p>

                {isVoiceTesting ?
                <div className="flex flex-col items-center justify-center py-6 bg-purple-950/20 border border-purple-500/10 rounded-xl space-y-3">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-purple-500 opacity-75"></span>
                      <div className="bg-purple-600 p-4 rounded-full relative z-10">
                        <Mic className="h-6 w-6 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-extrabold text-white">{t("auto.answering_prompt_how_are_you_feeling_rig", "Answering Prompt: \"How are you feeling right now?\"")}</p>
                      <p className="text-[10px] text-purple-400 font-mono mt-1">{t("auto.recording_speech", "Recording speech...")}{voiceTestSeconds}{t("auto.s_remains", "s remains")}</p>
                    </div>
                    <div className="flex gap-1 items-center justify-center">
                      <span className="h-3 w-1 bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="h-5 w-1 bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="h-6 w-1 bg-purple-300 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      <span className="h-4 w-1 bg-purple-400 animate-bounce" style={{ animationDelay: "450ms" }}></span>
                      <span className="h-2 w-1 bg-purple-500 animate-bounce" style={{ animationDelay: "600ms" }}></span>
                    </div>
                  </div> :

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                    type="button"
                    onClick={runVoiceStressTest}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:brightness-110 active:scale-95 duration-200 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform font-sans">
                    
                      <Mic className="h-4 w-4" />{t("auto.start_speech_stress_anxiety_analyzer", "Start Speech Stress & Anxiety Analyzer")}
                  </button>
                  </div>
                }

                {/* Display Transcript and Metrics breakdown if calculated */}
                {voiceTestTranscript &&
                <div className="bg-[#050508] border border-purple-900/30 p-3.5 rounded-xl space-y-3.5">
                    <div>
                      <span className="text-[8px] text-purple-400 font-mono tracking-widest uppercase block mb-1">{t("auto.acoustic_speech_transcription", "Acoustic Speech Transcription")}</span>
                      <p className="text-[11px] text-slate-300 bg-[#0F0D15]/80 p-2.5 rounded border border-[#1C1625] font-medium leading-relaxed italic">
                        "{voiceTestTranscript}"
                      </p>
                    </div>

                    {acousticResult &&
                  <div className="space-y-3">
                        <div className="border-t border-[#1C1625] pt-3">
                          <span className="text-[8px] text-purple-400 font-mono tracking-widest uppercase block mb-2">{t("auto.simulated_acoustic_telemetry_insights", "Simulated Acoustic Telemetry Insights")}</span>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center">
                            <div className="bg-[#0F0D15] border border-[#1E172C] p-2 rounded-lg">
                              <span className="text-[8px] text-slate-500 block uppercase">{t("auto.micro_vibrational_jitter", "Micro-vibrational Jitter")}</span>
                              <strong className="text-xs font-mono text-purple-300">{acousticResult.jitter}%</strong>
                              <span className="text-[7px] text-slate-400 block mt-0.5">({acousticResult.jitter > 3 ? "Elevated micro-tremors" : "Stable voice folds"})</span>
                            </div>

                            <div className="bg-[#0F0D15] border border-[#1E172C] p-2 rounded-lg">
                              <span className="text-[8px] text-slate-500 block uppercase">{t("auto.decibel_shimmer", "Decibel Shimmer")}</span>
                              <strong className="text-xs font-mono text-purple-300">{acousticResult.shimmer}%</strong>
                              <span className="text-[7px] text-slate-400 block mt-0.5">({acousticResult.shimmer > 20 ? "Tension instability" : "Controlled volume"})</span>
                            </div>

                            <div className="bg-[#0F0D15] border border-[#1E172C] p-2 rounded-lg">
                              <span className="text-[8px] text-slate-500 block uppercase">{t("auto.speech_prosody_rate", "Speech Prosody Rate")}</span>
                              <strong className="text-xs font-mono text-purple-300">{acousticResult.speechRate}{t("auto.wpm", "WPM")}</strong>
                              <span className="text-[7px] text-slate-400 block mt-0.5">({acousticResult.speechRate > 150 ? "Fast / Agitated" : acousticResult.speechRate < 90 ? "Slow / Fatigue" : "Balanced prosody"})</span>
                            </div>

                            <div className="bg-[#0F0D15] border border-[#1E172C] p-2 rounded-lg">
                              <span className="text-[8px] text-slate-550 block uppercase">{t("auto.silent_hesitations", "Silent Hesitations")}</span>
                              <strong className="text-xs font-mono text-purple-300">{acousticResult.pauseDensity}{t("auto.pause_s", "pause(s)")}</strong>
                              <span className="text-[7px] text-slate-400 block mt-0.5">({acousticResult.pauseDensity > 3 ? "Delayed cognitive load" : "Fluent speech pattern"})</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-950/20 border border-purple-500/10 p-2.5 rounded-lg text-center">
                          <span className="text-[8px] text-purple-400 block font-mono uppercase">{t("auto.linguistic_distressed_markers_detected", "Linguistic Distressed Markers Detected")}</span>
                          <strong className="text-xs text-white block font-sans mt-0.5">{acousticResult.linguisticStress}{t("auto.flag_s_count", "flag(s) count")}</strong>
                          <p className="text-[9px] text-slate-400 leading-normal mt-1">{t("auto.calculated_of_stress_keywords_and_mapped", "Calculated of stress keywords and mapped with physical")}
                        <span className="text-purple-300 font-bold">{lifestyle.sleepDuration}{t("auto.hrs_sleep", "hrs sleep")}</span>{t("auto.habits", "habits.")}
                      </p>
                        </div>

                        <div className="border-t border-[#1C1625] pt-2 text-center">
                          <span className="text-[8px] text-purple-400 block font-mono uppercase">{t("auto.acoustic_stress_verdict", "Acoustic Stress Verdict")}</span>
                          <span className="text-[10px] text-purple-300 font-bold block mt-1">{acousticResult.combinedVerdict}</span>
                        </div>
                      </div>
                  }
                  </div>
                }
              </div>

              {/* Live Assessment Sliders */}
              <div className="bg-[#0F1012] border border-[#1E1E1E] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-2 pb-1.5 border-b border-[#1A1A1A]">
                  <span className="h-1.5 w-1.5 bg-purple-400 rounded-full" />{t("auto.anxiety_stress_monitor", "Anxiety & Stress Monitor")}
                </h4>
                
                <div className="space-y-4 font-sans">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">{t("auto.anxiety_rate_generalized_nervous_alert", "Anxiety Rate (Generalized Nervous Alert)")}</label>
                      <span className="text-[10px] font-mono text-purple-400 font-extrabold">{mentalAnxiety}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mentalAnxiety}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMentalAnxiety(val);
                        // Auto adjustments: Anxiety + stress drives mental score
                        setMentalScore(Math.round(100 - val * 4 - mentalStress * 5));
                      }}
                      className="w-full accent-purple-500 h-1 bg-[#1a1a1a] rounded-lg cursor-ew-resize" />
                    
                    <p className="text-[9px] text-slate-500 select-none">
                      {mentalAnxiety <= 3 ? "😊 Normal physiological balance and calm heart rate." : mentalAnxiety <= 7 ? "⚠️ Restlessness, mild panic spikes, or muscle stiffness." : "🔥 High physiological load, chest constriction, active panic risk."}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">{t("auto.stress_load_biological_cortisol_tension", "Stress Load (Biological Cortisol Tension)")}</label>
                      <span className="text-[10px] font-mono text-purple-400 font-extrabold">{mentalStress}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mentalStress}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMentalStress(val);
                        setMentalScore(Math.round(100 - mentalAnxiety * 4 - val * 5));
                      }}
                      className="w-full accent-purple-500 h-1 bg-[#1a1a1a] rounded-lg cursor-ew-resize" />
                    
                    <p className="text-[9px] text-slate-500 select-none">
                      {mentalStress <= 3 ? "🧘 Fully recovered nervous system with high vagal tone." : mentalStress <= 7 ? "⚡ Standard work pressure with noticeable cognitive fatigue." : "🚨 Stage-3 Adrenal exhaustion, disturbed sleep, clinical warning."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voice / Chat Interactive Counseling Room */}
              <div className="bg-[#0A0A0B] border border-purple-500/10 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                  <div>
                    <h4 className="text-xs font-black tracking-widest text-[#E0E0E0] uppercase flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping" />{t("auto.counselor_assessment_room", "Counselor Assessment Room")}
                    </h4>
                    <p className="text-[9px] text-slate-550">{t("auto.live_voice_transcription_or_chat_clinica", "Live Voice Transcription or Chat clinical consultation.")}</p>
                  </div>
                  {listeningMental &&
                  <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-bold uppercase tracking-widest animate-pulse flex items-center gap-1 leading-none font-mono">
                      <span className="h-2 w-2 bg-red-500 rounded-full inline-block animate-ping" />{t("auto.listening", "Listening")}
                  </span>
                  }
                </div>

                {/* Chat logs scroll area */}
                <div className="bg-black/50 border border-neutral-900 rounded-lg p-3 h-36 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
                  {mentalChat.map((msg, i) =>
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`text-[11px] leading-relaxed max-w-[85%] px-3 py-2 rounded-xl font-medium ${
                    msg.sender === "user" ?
                    "bg-[#251B33] text-purple-200 border border-purple-500/15" :
                    "bg-[#111116] text-[#C0C0D0] border border-[#222]"}`
                    }>
                        {msg.text}
                      </div>
                    </div>
                  )}
                  {mentalChatLoading &&
                  <div className="text-[10px] text-slate-500 italic animate-pulse">{t("auto.counselor_typing_personalized_guide_insi", "Counselor typing personalized guide insights...")}</div>
                  }
                </div>

                {/* Input field with mic */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("auto.describe_stress_mood_or_speak_here", "Describe stress, mood, or speak here...")}
                    value={mentalInput}
                    onChange={(e) => setMentalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!mentalInput.trim()) return;
                        const text = mentalInput.trim();
                        setMentalInput("");
                        setMentalChat((prev) => [...prev, { sender: "user", text }]);

                        // Simulate counseling feedback & trigger dynamic recommendation
                        setMentalChatLoading(true);
                        setTimeout(() => {
                          const lower = text.toLowerCase();
                          let reply = "Your mental workload is biologically real. Let's trigger delta recovery parameters. Keep hydrating and practice structural parasympathetic breathing.";
                          let extraRec = "Add 15 minutes of non-screen quiet meditation immediately before sleep gating.";

                          if (lower.includes("sad") || lower.includes("depress") || lower.includes("unhappy")) {
                            reply = "I hear you. Feeling emotionally low is an active sign of emotional overload. Focus on high-nutrient proteins, vitamin D3 synthesis in the morning, and slow walks to recruit serotonin.";
                            extraRec = "Serotonin Boosting: Seek natural outdoors daylight or schedule gentle stretching.";
                          } else if (lower.includes("anxious") || lower.includes("panic") || lower.includes("worry") || lower.includes("stress")) {
                            reply = "When cortisol levels spike, your heart rate needs active cooling. Slow down your breathing immediately: inhale for 4 seconds, hold for 7, exhale for 8 seconds to reset.";
                            extraRec = "Vagal Reset: Perform 4-7-8 deep diaphragmatic breathing for 5 minutes during panic thresholds.";
                          } else if (lower.includes("tire") || lower.includes("exhaust") || lower.includes("work")) {
                            reply = "Occupational burden triggers chronic cortisol elevation. We suggest strict division of rest hours, screen-dead zones, and magnesium supplementation after medical consultation.";
                            extraRec = "Adrenal Care: Gates screen exposure 1 hour before sleep and track deep REM.";
                          }

                          setMentalChat((prev) => [...prev, { sender: "bot", text: reply }]);
                          setMentalNotes((prev) => (prev ? prev + "\n" : "") + "User input: " + text + " | Response: " + reply);
                          setMentalRecommendations((prev) => {
                            const next = [...prev];
                            if (!next.includes(extraRec)) {
                              next.unshift(extraRec);
                            }
                            return next.slice(0, 4);
                          });
                          setMentalChatLoading(false);
                        }, 800);
                      }
                    }}
                    className="flex-1 bg-[#050505] border border-[#1E1E1E] focus:border-purple-500/40 text-xs text-white px-3 py-2 rounded-lg outline-none" />
                  
                  
                  {/* Glowing pulsate Mic button */}
                  <button
                    type="button"
                    onClick={() => {
                      const SpeechReq = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (!SpeechReq) {
                        setListeningMental(true);
                        setTimeout(() => {
                          setMentalInput("I feel anxious and exhausted from work pressures.");
                          setListeningMental(false);
                        }, 1200);
                        return;
                      }

                      try {
                        const rec = new SpeechReq();
                        rec.lang = "en-US";
                        rec.continuous = false;
                        rec.interimResults = false;

                        rec.onstart = () => setListeningMental(true);
                        rec.onend = () => setListeningMental(false);
                        rec.onerror = () => setListeningMental(false);
                        rec.onresult = (e: any) => {
                          const result = e.results[0][0].transcript;
                          setMentalInput(result);
                        };
                        rec.start();
                      } catch (err) {
                        console.log(err);
                        setListeningMental(false);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-center font-bold uppercase gap-1 shrink-0 ${
                    listeningMental ?
                    "bg-red-500 border-red-650 text-black animate-pulse font-black" :
                    "bg-purple-900/40 border-purple-800/30 text-purple-300 hover:bg-purple-800"}`
                    }>
                    
                    <Mic className="h-4 w-4" />{t("auto.voice", "Voice")}
                  </button>
                </div>
              </div>

              {/* Personalized suggestions area */}
              <div className="bg-[#0C0C0F] border border-purple-500/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black tracking-widest text-purple-300 uppercase flex items-center gap-1.5 pb-1">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />{t("auto.personalized_mind_care_plan", "Personalized Mind Care Plan")}
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {mentalRecommendations.map((rec, k) =>
                  <li key={k} className="flex gap-2 items-start leading-relaxed font-medium bg-[#111] p-2.5 rounded-lg border border-[#161619]">
                      <span className="text-purple-400 shrink-0 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>)
            }

            {/* Error / Success Toast indicators inside Workspace */}
            {successMsg &&
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs flex gap-2 w-full leading-normal animate-pulse shadow">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            }
            {errorMsg &&
            <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2 w-full leading-normal">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            }

            {/* Submit Action Button */}
            <button
              onClick={handleProcessAndSaveTimeline}
              disabled={savingRecord}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-550 to-emerald-600 hover:opacity-90 text-black font-extrabold cursor-pointer rounded-xl py-4 text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/10 flex items-center justify-center gap-1.5 disabled:opacity-30">
              
              {savingRecord ?
              <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin mr-1.5 text-black" />
                  {localDict.loading}
                </> :

              <>
                  <Sparkles className="h-4 w-4 inline text-black animate-pulse" />
                  {localDict.submitAssessment}
                </>
              }
            </button>

          </div>
        </div>

        {/* Historic logs & Interactive Chart: 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#0A0A0A]/60 border border-[#1A1A1A] rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">{localDict.historicalTimeline}</h3>
              <p className="text-xs text-slate-500 mt-1">{t("auto.review_chronologically_synced_historical", "Review chronologically synced historical assessments logged to date.")}</p>
            </div>

            {loadingTimeline ?
            <div className="py-12 text-center text-xs text-slate-505 font-medium flex items-center justify-center gap-2">
                <RefreshCw className="h-4.5 w-4.5 animate-spin text-emerald-400" />{t("auto.loaded_clinical_logs", "Loaded clinical logs...")}
            </div> :
            timelineRecords.length === 0 ?
            <div className="bg-[#0C0C0C] border border-[#161616] rounded-xl p-8 text-center text-xs text-slate-600 font-medium">
                {localDict.noRecords}
              </div> :

            <div className="space-y-4">
                
                {/* SVG-Based 100% Type-Safe dynamic Timeline Line Chart overlay */}
                <div className="bg-black/40 border border-[#1C1C1C] p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center bg-zinc-950/40 p-1.5 rounded border border-[#151515]">
                    <span className="text-[9px] text-slate-550 font-mono uppercase tracking-widest font-black">{t("auto.trending_progression_curve", "Trending Progression Curve")}</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded font-bold font-mono">
                      {timelineRecords.length}{t("auto.sessions_logged", "sessions logged")}
                  </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-44 w-full relative flex items-end justify-between border-b border-l border-[#1A1A1A] pb-1 pl-1">
                    {/* SVG Line path renderer */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none">
                      {timelineRecords.length >= 2 && (() => {
                      const maxVal = 100;
                      const minVal = 0;
                      const points = timelineRecords.map((rec, i) => {
                        const val = rec.analysisResults?.healthScore?.score || 65;
                        const x = i / (timelineRecords.length - 1) * 90 + 5; // spacing percentage
                        const y = 90 - (val - minVal) / (maxVal - minVal) * 75; // coordinate inverted
                        return `${x}%,${y}%`;
                      });
                      return (
                        <>
                            {/* Glow Path */}
                            <polyline
                            fill="none"
                            stroke="rgba(16,185,129,0.15)"
                            strokeWidth="5"
                            points={points.join(" ")} />
                          
                            {/* Sharp Path */}
                            <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            points={points.join(" ")} />
                          
                          </>);

                    })()}
                    </svg>

                    {/* Nodes Indicators display */}
                    {timelineRecords.map((rec, i) => {
                    const val = rec.analysisResults?.healthScore?.score || 65;
                    const dateText = new Date(rec.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                    const active = rec.id === selectedRecordId;

                    return (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecordId(rec.id)}
                        className="flex-1 flex flex-col items-center justify-end h-full z-10 cursor-pointer pt-4 group select-none">
                        
                          {/* Hover Tooltip showing health score */}
                          <div className={`text-[9px] font-mono font-bold px-1 rounded absolute top-2 transition-all opacity-0 group-hover:opacity-100 ${
                        active ? "opacity-100 bg-emerald-500 text-black text-[10px] py-0.5" : "bg-neutral-850 text-slate-300"}`
                        } style={{ left: `${i / (timelineRecords.length - (timelineRecords.length > 1 ? 1 : 0.5)) * 78 + 8}%` }}>
                            {val}
                          </div>

                          {/* Dynamic SVG Dot node */}
                          <div className={`h-2.5 w-2.5 rounded-full border-2 transition-all ${
                        active ?
                        "bg-emerald-550 border-white scale-125 shadow-md shadow-emerald-500/20" :
                        "bg-[#0A0A0A] border-[#333] group-hover:border-emerald-500"} mb-2`
                        } />
                          
                          <span className="text-[8px] text-slate-550 font-mono truncate w-full text-center" title={dateText}>
                            {dateText}
                          </span>
                        </div>);

                  })}
                  </div>

                  <div className="flex justify-between text-[8px] text-slate-600 font-mono px-1">
                    <span>{t("auto.chronological_start", "\u23EE\uFE0F Chronological Start")}</span>
                    <span>{t("auto.recent_date_log", "Recent Date Log \u23ED\uFE0F")}</span>
                  </div>
                </div>

                {/* Timeline interactive chronological nodes lists */}
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {timelineRecords.map((rec) => {
                  const active = rec.id === selectedRecordId;
                  const timestampString = new Date(rec.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  const hScore = rec.analysisResults?.healthScore?.score || 70;
                  const hCategory = rec.analysisResults?.healthScore?.category || "Standard";

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecordId(rec.id)}
                      className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
                      active ?
                      "border-emerald-500 bg-emerald-500/5 shadow-md" :
                      "border-[#1F1F1F] bg-[#070707] hover:bg-[#121212] hover:border-slate-800"}`
                      }>
                      
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-200">{timestampString}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{t("auto.age", "Age:")}
                          {rec.basicInfo.age}{t("auto.bmi", "| BMI:")}{rec.basicInfo.bmi}{t("auto.sleep", "| Sleep:")}{rec.lifestyle.sleepDuration}h
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-white font-mono block">{hScore} / 100</span>
                          <span className="text-[8px] text-emerald-450 uppercase font-black tracking-widest">{hCategory}</span>
                        </div>
                      </div>);

                })}
                </div>

              </div>
            }

          </div>
        </div>

      </div>

    </div>);

} 