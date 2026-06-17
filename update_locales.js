import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src', 'i18n', 'locales');

const newTranslations = {
  en: {
    dashboard: {
      connected_session: "Connected Session",
      active_diagnostic_account: "Active Diagnostic Account",
      precision_early_warning: "Precision early warning modeling & multi-coordinate timeline graphs",
      account_attributes: "Account Attributes",
      email_address: "Email Address",
      phone_connection: "Phone Connection",
      residential_address: "Residential Address",
      registration_timestamp: "Registration Timestamp",
      recent_security_logs: "Recent Security Logs",
      refresh: "Refresh",
      synchronizing_logs: "Synchronizing logs...",
      no_audit_records: "No previous audit records found in secure registers.",
      ip: "IP",
      device: "Device",
      demographic_manager: "Demographic Manager",
      credentials_security: "Credentials Security",
      edit_demographics: "Edit Demographics",
      update_demographics_desc: "Update demographic factors safely inside database records",
      full_name: "Full Name",
      flat_house_no: "Flat/House No.",
      street_name_area: "Street Name/Area",
      city: "City",
      district: "District",
      state: "State",
      postal_code_zip: "Postal Code / ZIP",
      save_and_update: "Save and Update",
      modifying_records: "Modifying records...",
      password_modification: "Password Modification",
      password_modification_desc: "Current credential authentication is required to revise security layers",
      current_password: "Current Password",
      new_password: "New Password",
      confirm_new_password: "Confirm New Password",
      update_security_layer: "Update Security Layer",
      applying_encryption: "Applying encryption..."
    }
  },
  hi: {
    dashboard: {
      connected_session: "कनेक्टेड सत्र",
      active_diagnostic_account: "सक्रिय डायग्नोस्टिक खाता",
      precision_early_warning: "सटीक प्रारंभिक चेतावनी मॉडलिंग और बहु-समन्वय समयरेखा ग्राफ",
      account_attributes: "खाता विशेषताएँ",
      email_address: "ईमेल पता",
      phone_connection: "फ़ोन कनेक्शन",
      residential_address: "आवासीय पता",
      registration_timestamp: "पंजीकरण टाइमस्टैम्प",
      recent_security_logs: "हाल के सुरक्षा लॉग",
      refresh: "रीफ्रेश करें",
      synchronizing_logs: "लॉग सिंक्रोनाइज़ हो रहे हैं...",
      no_audit_records: "सुरक्षित रजिस्टरों में कोई पिछला ऑडिट रिकॉर्ड नहीं मिला।",
      ip: "आईपी",
      device: "डिवाइस",
      demographic_manager: "जनसांख्यिकीय प्रबंधक",
      credentials_security: "क्रेडेंशियल्स सुरक्षा",
      edit_demographics: "जनसांख्यिकी संपादित करें",
      update_demographics_desc: "डेटाबेस रिकॉर्ड के अंदर जनसांख्यिकीय कारकों को सुरक्षित रूप से अपडेट करें",
      full_name: "पूरा नाम",
      flat_house_no: "फ्लैट/मकान नंबर",
      street_name_area: "सड़क का नाम/क्षेत्र",
      city: "शहर",
      district: "जिला",
      state: "राज्य",
      postal_code_zip: "पिन कोड / ज़िप",
      save_and_update: "सहेजें और अपडेट करें",
      modifying_records: "रिकॉर्ड संशोधित हो रहे हैं...",
      password_modification: "पासवर्ड संशोधन",
      password_modification_desc: "सुरक्षा परतों को संशोधित करने के लिए वर्तमान क्रेडेंशियल प्रमाणीकरण आवश्यक है",
      current_password: "वर्तमान पासवर्ड",
      new_password: "नया पासवर्ड",
      confirm_new_password: "नए पासवर्ड की पुष्टि करें",
      update_security_layer: "सुरक्षा परत अपडेट करें",
      applying_encryption: "एन्क्रिप्शन लागू हो रहा है..."
    }
  },
  ta: {
    dashboard: {
      connected_session: "இணைக்கப்பட்ட அமர்வு",
      active_diagnostic_account: "செயலில் உள்ள கண்டறியும் கணக்கு",
      precision_early_warning: "துல்லியமான ஆரம்ப எச்சரிக்கை மாடலிங் மற்றும் காலவரிசை வரைபடங்கள்",
      account_attributes: "கணக்கு பண்புக்கூறுகள்",
      email_address: "மின்னஞ்சல் முகவரி",
      phone_connection: "தொலைபேசி இணைப்பு",
      residential_address: "குடியிருப்பு முகவரி",
      registration_timestamp: "பதிவு நேரம்",
      recent_security_logs: "சமீபத்திய பாதுகாப்பு பதிவுகள்",
      refresh: "புதுப்பி",
      synchronizing_logs: "பதிவுகள் ஒத்திசைக்கப்படுகின்றன...",
      no_audit_records: "பாதுகாப்பான பதிவேடுகளில் முந்தைய தணிக்கை பதிவுகள் எதுவும் காணப்படவில்லை.",
      ip: "ஐபி",
      device: "சாதனம்",
      demographic_manager: "மக்கள் தொகை மேலாளர்",
      credentials_security: "நற்சான்றிதழ்கள் பாதுகாப்பு",
      edit_demographics: "புள்ளிவிவரங்களைத் திருத்து",
      update_demographics_desc: "தரவுத்தள பதிவுகளுக்குள் புள்ளிவிவர காரணிகளைப் பாதுகாப்பாகப் புதுப்பிக்கவும்",
      full_name: "முழு பெயர்",
      flat_house_no: "வீட்டு எண்",
      street_name_area: "தெரு / பகுதி",
      city: "நகரம்",
      district: "மாவட்டம்",
      state: "மாநிலம்",
      postal_code_zip: "அஞ்சல் குறியீடு",
      save_and_update: "சேமித்து புதுப்பிக்கவும்",
      modifying_records: "பதிவுகள் மாற்றியமைக்கப்படுகின்றன...",
      password_modification: "கடவுச்சொல் மாற்றம்",
      password_modification_desc: "பாதுகாப்பு அடுக்குகளைத் திருத்த தற்போதைய கடவுச்சொல் சரிபார்ப்பு தேவை",
      current_password: "தற்போதைய கடவுச்சொல்",
      new_password: "புதிய கடவுச்சொல்",
      confirm_new_password: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
      update_security_layer: "பாதுகாப்பை புதுப்பிக்கவும்",
      applying_encryption: "குறியாக்கம் பயன்படுத்தப்படுகிறது..."
    }
  },
  ml: {
    dashboard: {
      connected_session: "കണക്റ്റുചെയ്‌ത സെഷൻ",
      active_diagnostic_account: "സജീവ ഡയഗ്നോസ്റ്റിക് അക്കൗണ്ട്",
      precision_early_warning: "കൃത്യമായ മുൻകൂർ മുന്നറിയിപ്പ് മോഡലിംഗ്",
      account_attributes: "അക്കൗണ്ട് ആട്രിബ്യൂട്ടുകൾ",
      email_address: "ഇമെയിൽ വിലാസം",
      phone_connection: "ഫോൺ കണക്ഷൻ",
      residential_address: "താമസ വിലാസം",
      registration_timestamp: "രജിസ്ട്രേഷൻ സമയം",
      recent_security_logs: "സമീപകാല സുരക്ഷാ ലോഗുകൾ",
      refresh: "പുതുക്കുക",
      synchronizing_logs: "ലോഗുകൾ സമന്വയിപ്പിക്കുന്നു...",
      no_audit_records: "സുരക്ഷിത രജിസ്റ്ററുകളിൽ മുൻ ഓഡിറ്റ് റെക്കോർഡുകളൊന്നും കണ്ടെത്തിയില്ല.",
      ip: "ഐപി",
      device: "ഉപകരണം",
      demographic_manager: "ജനസംഖ്യാ മാനേജർ",
      credentials_security: "ക്രെഡൻഷ്യലുകൾ സുരക്ഷ",
      edit_demographics: "ഡെമോഗ്രാഫിക്സ് എഡിറ്റ് ചെയ്യുക",
      update_demographics_desc: "ഡാറ്റാബേസിൽ വിവരങ്ങൾ സുരക്ഷിതമായി അപ്ഡേറ്റ് ചെയ്യുക",
      full_name: "മുഴുവൻ പേര്",
      flat_house_no: "ഫ്ലാറ്റ്/വീട്ട് നമ്പർ",
      street_name_area: "തെരുവ്/പ്രദേശം",
      city: "നഗരം",
      district: "ജില്ല",
      state: "സംസ്ഥാനം",
      postal_code_zip: "പിൻ കോഡ്",
      save_and_update: "സംരക്ഷിച്ച് അപ്ഡേറ്റ് ചെയ്യുക",
      modifying_records: "റെക്കോർഡുകൾ മാറ്റുന്നു...",
      password_modification: "പാസ്‌വേഡ് പരിഷ്‌ക്കരണം",
      password_modification_desc: "സുരക്ഷാ ലെയറുകൾ പരിഷ്‌ക്കരിക്കുന്നതിന് നിലവിലെ പാസ്‌വേഡ് ആവശ്യമാണ്",
      current_password: "നിലവിലെ പാസ്‌വേഡ്",
      new_password: "പുതിയ പാസ്‌വേഡ്",
      confirm_new_password: "പുതിയ പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
      update_security_layer: "സുരക്ഷ അപ്ഡേറ്റ് ചെയ്യുക",
      applying_encryption: "എൻക്രിപ്ഷൻ പ്രയോഗിക്കുന്നു..."
    }
  },
  kn: {
    dashboard: {
      connected_session: "ಸಂಪರ್ಕಿತ ಅಧಿವೇಶನ",
      active_diagnostic_account: "ಸಕ್ರಿಯ ರೋಗನಿರ್ಣಯದ ಖಾತೆ",
      precision_early_warning: "ನಿಖರವಾದ ಮುಂಚಿನ ಎಚ್ಚರಿಕೆ ಮಾಡೆಲಿಂಗ್",
      account_attributes: "ಖಾತೆಯ ಗುಣಲಕ್ಷಣಗಳು",
      email_address: "ಇಮೇಲ್ ವಿಳಾಸ",
      phone_connection: "ಫೋನ್ ಸಂಪರ್ಕ",
      residential_address: "ವಸತಿ ವಿಳಾಸ",
      registration_timestamp: "ನೋಂದಣಿ ಸಮಯ",
      recent_security_logs: "ಇತ್ತೀಚಿನ ಭದ್ರತಾ ಲಾಗ್‌ಗಳು",
      refresh: "ರಿಫ್ರೆಶ್ ಮಾಡಿ",
      synchronizing_logs: "ಲಾಗ್‌ಗಳನ್ನು ಸಿಂಕ್ರೊನೈಸ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      no_audit_records: "ಸುರಕ್ಷಿತ ರಿಜಿಸ್ಟರ್‌ಗಳಲ್ಲಿ ಯಾವುದೇ ಹಿಂದಿನ ಆಡಿಟ್ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      ip: "ಐಪಿ",
      device: "ಸಾಧನ",
      demographic_manager: "ಜನಸಂಖ್ಯಾ ನಿರ್ವಾಹಕ",
      credentials_security: "ರುಜುವಾತುಗಳ ಭದ್ರತೆ",
      edit_demographics: "ಜನಸಂಖ್ಯಾಶಾಸ್ತ್ರವನ್ನು ಸಂಪಾದಿಸಿ",
      update_demographics_desc: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನವೀಕರಿಸಿ",
      full_name: "ಪೂರ್ಣ ಹೆಸರು",
      flat_house_no: "ಫ್ಲಾಟ್/ಮನೆ ಸಂಖ್ಯೆ",
      street_name_area: "ರಸ್ತೆ/ಪ್ರದೇಶ",
      city: "ನಗರ",
      district: "ಜಿಲ್ಲೆ",
      state: "ರಾಜ್ಯ",
      postal_code_zip: "ಪಿನ್ ಕೋಡ್",
      save_and_update: "ಉಳಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿ",
      modifying_records: "ದಾಖಲೆಗಳನ್ನು ಮಾರ್ಪಡಿಸಲಾಗುತ್ತಿದೆ...",
      password_modification: "ಪಾಸ್ವರ್ಡ್ ಮಾರ್ಪಾಡು",
      password_modification_desc: "ಭದ್ರತಾ ಲೇಯರ್‌ಗಳನ್ನು ಪರಿಷ್ಕರಿಸಲು ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿದೆ",
      current_password: "ಪ್ರಸ್ತುತ ಪಾಸ್ವರ್ಡ್",
      new_password: "ಹೊಸ ಪಾಸ್ವರ್ಡ್",
      confirm_new_password: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
      update_security_layer: "ಭದ್ರತೆಯನ್ನು ನವೀಕರಿಸಿ",
      applying_encryption: "ಗೂಢಲಿಪೀಕರಣವನ್ನು ಅನ್ವಯಿಸಲಾಗುತ್ತಿದೆ..."
    }
  }
};

const langs = ['en', 'hi', 'ta', 'ml', 'kn'];

langs.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  let currentObj = {};
  if (fs.existsSync(filePath)) {
    currentObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  // Merge dashboard strings
  currentObj.dashboard = { ...currentObj.dashboard, ...newTranslations[lang].dashboard };
  
  fs.writeFileSync(filePath, JSON.stringify(currentObj, null, 2));
  console.log(`Updated ${lang}.json`);
});
