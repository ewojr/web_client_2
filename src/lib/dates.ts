const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY

// Constructing Intl formatters is expensive and these functions run once per
// row (up to several thousand rows), so cache instances at module scope keyed
// by locale (and, for DateTimeFormat, by its options).
const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>()
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>()

const ABSOLUTE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

function getRelativeTimeFormat(locale: string): Intl.RelativeTimeFormat {
  let rtf = relativeTimeFormatCache.get(locale)
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    relativeTimeFormatCache.set(locale, rtf)
  }
  return rtf
}

function getDateTimeFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let dtf = dateTimeFormatCache.get(key)
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locale, options)
    dateTimeFormatCache.set(key, dtf)
  }
  return dtf
}

export function formatRelativeDate(isoString: string, locale = 'en'): string {
  const date = new Date(isoString)
  const now = Date.now()
  // Tolerate small clock skew: a server clock that is a few seconds ahead of
  // the client would otherwise produce a negative diff for a just-edited entry
  // and fall back to an absolute date. Clamp small negatives to "now" and only
  // treat genuinely future-or-stale timestamps (more than a month out) as
  // absolute.
  const diff = Math.max(0, now - date.getTime())

  const rtf = getRelativeTimeFormat(locale)

  if (diff < MINUTE) return rtf.format(0, 'second')
  if (diff < HOUR) return rtf.format(-Math.floor(diff / MINUTE), 'minute')
  if (diff < DAY) return rtf.format(-Math.floor(diff / HOUR), 'hour')
  if (diff < WEEK) return rtf.format(-Math.floor(diff / DAY), 'day')
  if (diff < MONTH) return rtf.format(-Math.floor(diff / WEEK), 'week')

  return formatAbsoluteDate(isoString, locale)
}

export function formatAbsoluteDate(isoString: string, locale = 'en'): string {
  const date = new Date(isoString)
  return getDateTimeFormat(locale, ABSOLUTE_DATE_OPTIONS).format(date)
}
