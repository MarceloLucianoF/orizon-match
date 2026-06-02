import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es }
};

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('i18nextLng');
    if (saved && ['pt', 'en', 'es'].includes(saved)) {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0];
    if (['pt', 'en', 'es'].includes(browserLang)) {
      return browserLang;
    }
  }
  return 'pt';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values (xss protection)
    }
  });

export default i18n;
