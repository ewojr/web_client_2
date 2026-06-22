import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import de from './locales/de.json'

// Read the persisted language from localStorage (same key as Zustand persist)
function getPersistedLanguage(): string | undefined {
  try {
    const raw = localStorage.getItem('pd-options')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.state?.language
    }
  } catch {
    // ignore
  }
  return undefined
}

const persistedLang = getPersistedLanguage()

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    // Only force a language when the user EXPLICITLY chose one (a non-null
    // persisted value). Otherwise defer to LanguageDetector so a German-browser
    // user keeps seeing German instead of being pinned to a stored default.
    ...(persistedLang ? { lng: persistedLang } : {}),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

// Keep the document language in sync so screen readers, hyphenation, and
// translation tools use the right pronunciation/rules for the active language.
function syncHtmlLang(lng: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
  }
}
syncHtmlLang(i18n.language || 'en')
i18n.on('languageChanged', syncHtmlLang)

export default i18n
