import type { BookingStatus, Locale, LocalizedText } from './types'
import { locales } from './types'

export type AppRoute = 'home' | 'booking' | 'admin'

export function isLocale(value: string | null): value is Locale {
  return locales.includes(value as Locale)
}

export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale]?.trim() || text.es
}

export function getRoute(hash: string, staffPath: string): AppRoute {
  const clean = hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, '')
  if (clean === staffPath) return 'admin'
  if (clean.startsWith('booking')) return 'booking'
  return 'home'
}

export function getBookingStatus(
  reservedSeats: number,
  capacity: number,
  requestedSeats: number,
): Extract<BookingStatus, 'reserved' | 'waitlisted'> {
  return reservedSeats + requestedSeats <= capacity ? 'reserved' : 'waitlisted'
}

export function makeQrPayload(booking: {
  eventId: string
  id: string
  sessionId: string
}) {
  return JSON.stringify({
    bookingId: booking.id,
    eventId: booking.eventId,
    sessionId: booking.sessionId,
    type: 'ruyuen-booking',
    version: 1,
  })
}

export function formatEventDate(value: string, locale: Locale) {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    es: 'es-CL',
    pt: 'pt-BR',
    zhHant: 'zh-TW',
  }
  return new Intl.DateTimeFormat(localeMap[locale], {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}
