import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder dictionaries until extracted
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import kn from './locales/kn.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  ml: { translation: ml },
  kn: { translation: kn },
};

const savedLang = localStorage.getItem("aegis_preferred_lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
