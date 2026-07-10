export const locales = ['es', 'zhHant', 'en', 'pt'] as const

export type Locale = (typeof locales)[number]
export type LocalizedText = Record<Locale, string>
export type EventStatus = 'draft' | 'published' | 'archived'
export type BookingStatus =
  | 'reserved'
  | 'waitlisted'
  | 'checked-in'
  | 'cancelled'
  | 'no-show'
  | 'completed'
export type ContactType = 'email' | 'whatsapp'

export type Activity = {
  audience: LocalizedText
  detail: LocalizedText
  duration: LocalizedText
  id: string
  image: string
  order: number
  summary: LocalizedText
  title: LocalizedText
}

export type RuyuenEvent = {
  address: string
  cover: string
  endAt: string
  id: string
  registrationOpen: boolean
  slug: string
  startAt: string
  status: EventStatus
  summary: LocalizedText
  title: LocalizedText
  venue: LocalizedText
}

export type Session = {
  activityId: string
  capacity: number
  endAt: string
  eventId: string
  id: string
  startAt: string
  status: 'open' | 'closed'
}

export type Notice = {
  active: boolean
  body: LocalizedText
  id: string
  priority: 'normal' | 'high'
  title: LocalizedText
}

export type PublicContent = {
  activities: Activity[]
  events: RuyuenEvent[]
  notices: Notice[]
  sessions: Session[]
}

export type Booking = {
  activityId: string
  attendee: string
  checkedInAt?: string
  contact: string
  contactType: ContactType
  createdAt: string
  eventId: string
  id: string
  locale: Locale
  partySize: number
  sessionId: string
  status: BookingStatus
}

export type SubscriberInput = {
  consent: boolean
  contact: string
  contactType: ContactType
  locale: Locale
  name: string
}

export type BookingInput = Omit<Booking, 'checkedInAt' | 'createdAt' | 'id' | 'status'>

export type ApiResult<T> = T & { error?: string }
