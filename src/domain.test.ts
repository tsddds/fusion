import { describe, expect, it } from 'vitest'
import { getBookingStatus, getRoute, localize, makeQrPayload } from './domain'

describe('Ruyuen domain rules', () => {
  it('routes public, booking and private staff hashes', () => {
    expect(getRoute('#/', 'equipo-privado')).toBe('home')
    expect(getRoute('#/booking?event=evt-1', 'equipo-privado')).toBe('booking')
    expect(getRoute('#/equipo-privado', 'equipo-privado')).toBe('admin')
  })

  it('falls back to Spanish when a translation is empty', () => {
    expect(localize({ en: '', es: 'Cultura', pt: '', zhHant: '' }, 'pt')).toBe('Cultura')
  })

  it('uses the waitlist when a whole group does not fit', () => {
    expect(getBookingStatus(7, 10, 3)).toBe('reserved')
    expect(getBookingStatus(8, 10, 3)).toBe('waitlisted')
  })

  it('keeps personal information out of the QR payload', () => {
    const payload = makeQrPayload({ eventId: 'evt-1', id: 'RY-123', sessionId: 'ses-1' })
    expect(payload).toContain('RY-123')
    expect(payload).not.toContain('attendee')
    expect(payload).not.toContain('contact')
  })
})
