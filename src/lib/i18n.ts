import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import en from "@/locales/en"
import vi from "@/locales/vi"

export const LANGUAGES = {
  en: { label: "EN", nativeLabel: "English" },
  vi: { label: "VI", nativeLabel: "Tiếng Việt" },
} as const

export type Language = keyof typeof LANGUAGES

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "vi"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "lang",
    },
    interpolation: {
      escapeValue: false, // React handles XSS
    },
  })

export { i18n }
