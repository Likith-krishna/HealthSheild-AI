import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src', 'i18n', 'locales');

const authTranslations = {
  en: {
    auth: {
      login_title: "Secure Authorization",
      login_desc: "HealthSheild AI Cryptographic Access Control",
      email_placeholder: "Registered Email Identity",
      email_label: "Digital Access Identity",
      password_placeholder: "Cryptographic Passkey",
      password_label: "Cryptographic Security Sequence",
      remember_device: "Secure this device node",
      forgot_keys: "Recover Access Keys?",
      submit_login: "Authenticate Securely",
      processing: "Verifying Nodes...",
      demo_access: "Emergency Bypass / Demo Mode",
      demo_bypass: "Demo Bypass Authorized",
      create_account: "Create New Secure Profile",
      register_title: "Create Account",
      register_desc: "Establish secure profile access on HealthSheild AI Server",
      name_label: "Full Legal Identification",
      name_placeholder: "e.g., Sarah Jenkins",
      phone_label: "Verified Contact Vector",
      phone_placeholder: "e.g., +91 9876543210",
      address_label: "Geographic Coordinates",
      address_placeholder: "e.g., 12B Block, Cyber City, Bangalore",
      submit_register: "Initialize Profile",
      initializing: "Initializing...",
      have_account: "Already hold security keys?"
    }
  },
  hi: {
    auth: {
      login_title: "सुरक्षित प्राधिकरण",
      login_desc: "HealthSheild AI क्रिप्टोग्राफ़िक एक्सेस कंट्रोल",
      email_placeholder: "पंजीकृत ईमेल पहचान",
      email_label: "डिजिटल एक्सेस पहचान",
      password_placeholder: "क्रिप्टोग्राफ़िक पासकी",
      password_label: "क्रिप्टोग्राफ़िक सुरक्षा अनुक्रम",
      remember_device: "इस डिवाइस को सुरक्षित करें",
      forgot_keys: "एक्सेस कुंजी पुनर्प्राप्त करें?",
      submit_login: "सुरक्षित रूप से प्रमाणित करें",
      processing: "नोड्स का सत्यापन हो रहा है...",
      demo_access: "आपातकालीन बाईपास / डेमो मोड",
      demo_bypass: "डेमो बाईपास अधिकृत",
      create_account: "नया सुरक्षित प्रोफ़ाइल बनाएं",
      register_title: "खाता बनाएं",
      register_desc: "HealthSheild AI सर्वर पर सुरक्षित प्रोफ़ाइल एक्सेस स्थापित करें",
      name_label: "पूर्ण कानूनी पहचान",
      name_placeholder: "उदा., सारा जेनकिंस",
      phone_label: "सत्यापित संपर्क वेक्टर",
      phone_placeholder: "उदा., +91 9876543210",
      address_label: "भौगोलिक निर्देशांक",
      address_placeholder: "उदा., 12B ब्लॉक, साइबर सिटी, बैंगलोर",
      submit_register: "प्रोफ़ाइल आरंभ करें",
      initializing: "आरंभ हो रहा है...",
      have_account: "पहले से ही सुरक्षा कुंजियाँ हैं?"
    }
  },
  ta: {
    auth: {
      login_title: "பாதுகாப்பான அங்கீகாரம்",
      login_desc: "HealthSheild AI கிரிப்டோகிராஃபிக் அணுகல் கட்டுப்பாடு",
      email_placeholder: "பதிவு செய்யப்பட்ட மின்னஞ்சல்",
      email_label: "டிஜிட்டல் அணுகல் அடையாளம்",
      password_placeholder: "கிரிப்டோகிராஃபிக் பாஸ்கீ",
      password_label: "கிரிப்டோகிராஃபிக் பாதுகாப்பு வரிசை",
      remember_device: "இந்த சாதனத்தை பாதுகாக்கவும்",
      forgot_keys: "அணுகல் விசைகளை மீட்டெடுக்கவா?",
      submit_login: "பாதுகாப்பாக அங்கீகரிக்கவும்",
      processing: "சரிபார்க்கப்படுகிறது...",
      demo_access: "அவசர பைபாஸ் / டெமோ முறை",
      demo_bypass: "டெமோ பைபாஸ் அங்கீகரிக்கப்பட்டது",
      create_account: "புதிய கணக்கை உருவாக்கவும்",
      register_title: "கணக்கை உருவாக்கவும்",
      register_desc: "HealthSheild AI சேவையகத்தில் பாதுகாப்பான அணுகலை நிறுவவும்",
      name_label: "முழு சட்ட அடையாளம்",
      name_placeholder: "எ.கா. சாரா ஜென்கின்ஸ்",
      phone_label: "சரிபார்க்கப்பட்ட தொடர்பு எண்",
      phone_placeholder: "எ.கா. +91 9876543210",
      address_label: "முகவரி",
      address_placeholder: "எ.கா. 12B பிளாக், சைபர் சிட்டி, பெங்களூர்",
      submit_register: "சுயவிவரத்தை தொடங்கவும்",
      initializing: "தொடங்கப்படுகிறது...",
      have_account: "ஏற்கனவே கணக்கு உள்ளதா?"
    }
  },
  ml: {
    auth: {
      login_title: "സുരക്ഷിത അംഗീകാരം",
      login_desc: "HealthSheild AI ആക്സസ് കൺട്രോൾ",
      email_placeholder: "രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ",
      email_label: "ഡിജിറ്റൽ ആക്സസ് ഐഡന്റിറ്റി",
      password_placeholder: "പാസ്സ്‌വേർഡ്",
      password_label: "സുരക്ഷാ പാസ്സ്‌വേർഡ്",
      remember_device: "ഈ ഉപകരണം ഓർമ്മിക്കുക",
      forgot_keys: "പാസ്സ്‌വേർഡ് മറന്നോ?",
      submit_login: "ലോഗിൻ ചെയ്യുക",
      processing: "പരിശോധിക്കുന്നു...",
      demo_access: "ഡെമോ മോഡ്",
      demo_bypass: "ഡെമോ ബൈപാസ് അനുവദിച്ചു",
      create_account: "പുതിയ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
      register_title: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
      register_desc: "HealthSheild AI സെർവറിൽ സുരക്ഷിതമായ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
      name_label: "മുഴുവൻ പേര്",
      name_placeholder: "ഉദാ. സാറ ജെങ്കിൻസ്",
      phone_label: "ഫോൺ നമ്പർ",
      phone_placeholder: "ഉദാ. +91 9876543210",
      address_label: "വിലാസം",
      address_placeholder: "ഉദാ. 12B ബ്ലോക്ക്, സൈബർ സിറ്റി, ബാംഗ്ലൂർ",
      submit_register: "അക്കൗണ്ട് ആരംഭിക്കുക",
      initializing: "ആരംഭിക്കുന്നു...",
      have_account: "അക്കൗണ്ട് ഉണ്ടോ?"
    }
  },
  kn: {
    auth: {
      login_title: "ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ",
      login_desc: "HealthSheild AI ಪ್ರವೇಶ ನಿಯಂತ್ರಣ",
      email_placeholder: "ನೋಂದಾಯಿತ ಇಮೇಲ್",
      email_label: "ಡಿಜಿಟಲ್ ಪ್ರವೇಶ ಗುರುತು",
      password_placeholder: "ಪಾಸ್ವರ್ಡ್",
      password_label: "ಸುರಕ್ಷತಾ ಪಾಸ್ವರ್ಡ್",
      remember_device: "ಈ ಸಾಧನವನ್ನು ನೆನಪಿಡಿ",
      forgot_keys: "ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ?",
      submit_login: "ಲಾಗಿನ್ ಮಾಡಿ",
      processing: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      demo_access: "ಡೆಮೊ ಮೋಡ್",
      demo_bypass: "ಡೆಮೊ ಬೈಪಾಸ್ ಅಧಿಕೃತಗೊಳಿಸಲಾಗಿದೆ",
      create_account: "ಹೊಸ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      register_title: "ಖಾತೆ ರಚಿಸಿ",
      register_desc: "HealthSheild AI ಸರ್ವರ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      name_label: "ಪೂರ್ಣ ಹೆಸರು",
      name_placeholder: "ಉದಾಹರಣೆಗೆ ಸಾರಾ ಜೆಂಕಿನ್ಸ್",
      phone_label: "ಫೋನ್ ಸಂಖ್ಯೆ",
      phone_placeholder: "ಉದಾಹರಣೆಗೆ +91 9876543210",
      address_label: "ವಿಳಾಸ",
      address_placeholder: "ಉದಾಹರಣೆಗೆ 12B ಬ್ಲಾಕ್, ಸೈಬರ್ ಸಿಟಿ, ಬೆಂಗಳೂರು",
      submit_register: "ಖಾತೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ",
      initializing: "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
      have_account: "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?"
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
  
  // Merge
  currentObj.auth = { ...currentObj.auth, ...authTranslations[lang].auth };
  
  fs.writeFileSync(filePath, JSON.stringify(currentObj, null, 2));
  console.log(`Updated ${lang}.json for auth`);
});
