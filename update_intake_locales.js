import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src', 'i18n', 'locales');

const intakeTranslations = {
  en: {
    health_intake: {
      physical_tab: "Physical & Laboratory",
      mental_tab: "Mental & Voice/Chat",
      timeline_mode: "Timeline Mode",
      populate_desc: "Populate baseline clinical, nutritional, and lifestyle metrics with timeline continuity."
    }
  },
  hi: {
    health_intake: {
      physical_tab: "शारीरिक और प्रयोगशाला",
      mental_tab: "मानसिक और वॉयस/चैट",
      timeline_mode: "समयरेखा मोड",
      populate_desc: "समयरेखा निरंतरता के साथ नैदानिक, पोषण और जीवनशैली मेट्रिक्स भरें।"
    }
  },
  ta: {
    health_intake: {
      physical_tab: "உடல் மற்றும் ஆய்வகம்",
      mental_tab: "மனநலம் மற்றும் குரல்/அரட்டை",
      timeline_mode: "காலவரிசை முறை",
      populate_desc: "காலவரிசை தொடர்ச்சியுடன் மருத்துவ, ஊட்டச்சத்து மற்றும் வாழ்க்கை முறை அளவீடுகளை நிரப்பவும்."
    }
  },
  ml: {
    health_intake: {
      physical_tab: "ശാരീരികവും ലബോറട്ടറിയും",
      mental_tab: "മാനസികവും വോയ്‌സ്/ചാറ്റ്",
      timeline_mode: "ടൈംലൈൻ മോഡ്",
      populate_desc: "ടൈംലൈൻ തുടർച്ചയോടെ ക്ലിനിക്കൽ, പോഷകാഹാര, ജീവിതശൈലി അളവുകൾ പൂരിപ്പിക്കുക."
    }
  },
  kn: {
    health_intake: {
      physical_tab: "ದೈಹಿಕ ಮತ್ತು ಪ್ರಯೋಗಾಲಯ",
      mental_tab: "ಮಾನಸಿಕ ಮತ್ತು ಧ್ವನಿ/ಚಾಟ್",
      timeline_mode: "ಟೈಮ್‌ಲೈನ್ ಮೋಡ್",
      populate_desc: "ಟೈಮ್‌ಲೈನ್ ನಿರಂತರತೆಯೊಂದಿಗೆ ಕ್ಲಿನಿಕಲ್, ಪೌಷ್ಟಿಕಾಂಶ ಮತ್ತು ಜೀವನಶೈಲಿ ಮೆಟ್ರಿಕ್‌ಗಳನ್ನು ಜನಪ್ರಿಯಗೊಳಿಸಿ."
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
  currentObj.health_intake = { ...currentObj.health_intake, ...intakeTranslations[lang].health_intake };
  
  fs.writeFileSync(filePath, JSON.stringify(currentObj, null, 2));
  console.log(`Updated ${lang}.json for health_intake`);
});
