import { describe, it, expect } from 'vitest'
import en from './locales/en.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import nl from './locales/nl.json'

// CONTRIBUTING.md requires all locale files to stay in structural parity:
// every user-facing string must exist in every language, and interpolation
// placeholders ({{count}}, {{name}}, ...) must match the English source.

const LOCALES: Record<string, Record<string, unknown>> = { de, fr, es, nl }

function leafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object') {
      return leafKeys(value as Record<string, unknown>, path)
    }
    return [path]
  })
}

function leafEntries(obj: Record<string, unknown>, prefix = ''): [string, string][] {
  return Object.entries(obj).flatMap(([key, value]): [string, string][] => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object') {
      return leafEntries(value as Record<string, unknown>, path)
    }
    return [[path, String(value)]]
  })
}

function placeholders(text: string): string[] {
  return (text.match(/\{\{\w+\}\}/g) ?? []).sort()
}

describe('locale files', () => {
  const enKeys = leafKeys(en).sort()

  for (const [lang, resource] of Object.entries(LOCALES)) {
    it(`${lang}.json has the same keys as en.json`, () => {
      expect(leafKeys(resource).sort()).toEqual(enKeys)
    })

    it(`${lang}.json preserves the interpolation placeholders of en.json`, () => {
      const enTexts = new Map(leafEntries(en))
      for (const [key, text] of leafEntries(resource)) {
        expect(placeholders(text), `placeholders of "${key}"`).toEqual(
          placeholders(enTexts.get(key) ?? ''),
        )
      }
    })

    it(`${lang}.json has no empty strings`, () => {
      for (const [key, text] of leafEntries(resource)) {
        expect(text.trim(), `value of "${key}"`).not.toBe('')
      }
    })
  }
})
