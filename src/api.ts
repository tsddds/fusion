import { demoContent, fallbackContent } from './content'
import { getBookingStatus } from './domain'
import type {
  Activity,
  AdminData,
  ApiResult,
  Booking,
  BookingInput,
  BookingStatus,
  LocalizedText,
  Notice,
  PublicContent,
  RuyuenEvent,
  Session,
  SubscriberInput,
} from './types'

const apiUrl = import.meta.env.VITE_RUYUEN_API_URL as string | undefined
const demoMode = import.meta.env.DEV
const bookingsKey = 'ruyuen-bookings-v2'
const subscribersKey = 'ruyuen-subscribers-v2'

type SheetRow = Record<string, unknown>

async function postAction<T>(action: string, payload: Record<string, unknown>) {
  if (!apiUrl) return null
  const response = await fetch(apiUrl, {
    body: JSON.stringify({ action, ...payload }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    method: 'POST',
  })
  if (!response.ok) throw new Error(`Ruyuen API ${response.status}`)
  const result = (await response.json()) as ApiResult<T>
  if (result.error) throw new Error(result.error)
  return result
}

function localized(row: SheetRow, prefix: string): LocalizedText {
  const es = String(row[`${prefix}_es`] || row[prefix] || '')
  return {
    en: String(row[`${prefix}_en`] || es),
    es,
    pt: String(row[`${prefix}_pt`] || es),
    zhHant: String(row[`${prefix}_zhHant`] || es),
  }
}

function asBoolean(value: unknown) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1'
}

function normalizeActivity(row: SheetRow): Activity {
  return {
    audience: localized(row, 'audience'),
    detail: localized(row, 'detail'),
    duration: localized(row, 'duration'),
    id: String(row.id),
    image: String(row.image || ''),
    order: Number(row.order || 0),
    summary: localized(row, 'summary'),
    title: localized(row, 'title'),
  }
}

function normalizeEvent(row: SheetRow): RuyuenEvent {
  return {
    address: String(row.address || ''),
    cover: String(row.cover || ''),
    endAt: String(row.endAt || ''),
    id: String(row.id),
    registrationOpen: asBoolean(row.registrationOpen),
    slug: String(row.slug || row.id),
    startAt: String(row.startAt || ''),
    status: String(row.status || 'draft') as RuyuenEvent['status'],
    summary: localized(row, 'summary'),
    title: localized(row, 'title'),
    venue: localized(row, 'venue'),
  }
}

function normalizeSession(row: SheetRow): Session {
  return {
    activityId: String(row.activityId),
    capacity: Number(row.capacity || 0),
    endAt: String(row.endAt || ''),
    eventId: String(row.eventId),
    id: String(row.id),
    startAt: String(row.startAt || ''),
    status: String(row.status || 'open') as Session['status'],
  }
}

function normalizeNotice(row: SheetRow): Notice {
  return {
    active: asBoolean(row.active),
    body: localized(row, 'body'),
    id: String(row.id),
    priority: String(row.priority || 'normal') as Notice['priority'],
    title: localized(row, 'title'),
  }
}

export async function getPublicContent(): Promise<PublicContent> {
  if (demoMode) return demoContent
  try {
    const response = await postAction<{
      activities?: SheetRow[]
      events?: SheetRow[]
      notices?: SheetRow[]
      sessions?: SheetRow[]
    }>('getPublicContent', {})
    if (!response) return fallbackContent
    const activities = response.activities?.map(normalizeActivity).filter((item) => item.id) || []
    return {
      activities: activities.length ? activities : fallbackContent.activities,
      events: response.events?.map(normalizeEvent).filter((item) => item.status !== 'draft') || [],
      notices: response.notices?.map(normalizeNotice).filter((item) => item.active) || [],
      sessions: response.sessions?.map(normalizeSession).filter((item) => item.id) || [],
    }
  } catch {
    return fallbackContent
  }
}

export async function subscribe(input: SubscriberInput) {
  if (!demoMode) {
    const response = await postAction<{ ok: boolean }>('subscribe', { subscriber: input })
    if (response) return response
  }
  const current = readStored<SubscriberInput>(subscribersKey)
  writeStored(subscribersKey, [...current, input])
  return { ok: true }
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  if (!demoMode) {
    const response = await postAction<{ booking: Booking }>('createBooking', { booking: input })
    if (response?.booking) return response.booking
  }

  const current = readStored<Booking>(bookingsKey)
  const sessionBookings = current.filter(
    (booking) => booking.sessionId === input.sessionId && !['cancelled', 'no-show'].includes(booking.status),
  )
  const reservedSeats = sessionBookings
    .filter((booking) => booking.status !== 'waitlisted')
    .reduce((total, booking) => total + booking.partySize, 0)
  const booking: Booking = {
    ...input,
    createdAt: new Date().toISOString(),
    id: `RY-${Date.now().toString(36).toUpperCase()}`,
    status: getBookingStatus(
      reservedSeats,
      demoMode ? (demoContent.sessions.find((session) => session.id === input.sessionId)?.capacity || 0) : Number.MAX_SAFE_INTEGER,
      input.partySize,
    ),
  }
  writeStored(bookingsKey, [...current, booking])
  return booking
}

export async function adminLogin(adminPin: string): Promise<AdminData> {
  if (!demoMode) {
    const response = await postAction<{
      activities?: SheetRow[]
      bookings?: Booking[]
      events?: SheetRow[]
      sessions?: SheetRow[]
    }>('adminListBookings', { adminPin })
    if (response) {
      return {
        activities: response.activities?.map(normalizeActivity).filter((item) => item.id) || [],
        bookings: response.bookings || [],
        events: response.events?.map(normalizeEvent).filter((item) => item.id) || [],
        sessions: response.sessions?.map(normalizeSession).filter((item) => item.id) || [],
      }
    }
  }
  // El panel de prueba siempre usa esta clave local; no comparte ni consulta la clave real.
  const localPin = demoMode ? '1234' : (import.meta.env.VITE_RUYUEN_DEMO_ADMIN_PIN || '1234')
  if (adminPin !== localPin) throw new Error('Invalid PIN')
  return demoMode
    ? { activities: demoContent.activities, bookings: readStored<Booking>(bookingsKey), events: demoContent.events, sessions: demoContent.sessions }
    : { activities: [], bookings: readStored<Booking>(bookingsKey), events: [], sessions: [] }
}

export async function updateBookingStatus(
  adminPin: string,
  bookingId: string,
  status: BookingStatus,
) {
  if (!demoMode) {
    const response = await postAction<{ ok: boolean }>('adminUpdateBooking', {
      adminPin,
      bookingId,
      checkedInAt: status === 'checked-in' ? new Date().toISOString() : '',
      status,
    })
    if (response) return response
  }
  const current = readStored<Booking>(bookingsKey)
  writeStored(
    bookingsKey,
    current.map((booking) =>
      booking.id === bookingId
        ? { ...booking, checkedInAt: status === 'checked-in' ? new Date().toISOString() : undefined, status }
        : booking,
    ),
  )
  return { ok: true }
}

export async function promoteWaitlist(adminPin: string, bookingId: string) {
  if (!demoMode) {
    const response = await postAction<{ booking?: Booking; ok: boolean }>('adminPromoteWaitlist', {
      adminPin,
      bookingId,
    })
    if (response) return response
  }
  return updateBookingStatus(adminPin, bookingId, 'reserved')
}

function readStored<T>(key: string): T[] {
  try {
    return JSON.parse(window.localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeStored<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
