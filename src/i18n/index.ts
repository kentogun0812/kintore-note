import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import ja from './locales/ja.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'ja';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja }
    },
    lng: deviceLanguage,
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
