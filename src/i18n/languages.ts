// Single source of truth for the languages offered in the UI (AppBar dropdown
// and Options dialog). Each entry must have a matching resource bundle
// registered in src/i18n/index.ts.
export interface LanguageOption {
  code: string
  label: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'nl', label: 'Nederlands' },
]
