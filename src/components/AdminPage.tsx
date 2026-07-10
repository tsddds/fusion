import { Camera, CheckCircle, MagnifyingGlass, SignOut, Ticket, Users } from '@phosphor-icons/react'
import { useMemo, useRef, useState } from 'react'
import { adminLogin, promoteWaitlist, updateBookingStatus } from '../api'
import type { Booking, BookingStatus } from '../types'

export function AdminPage() {
  const [pin, setPin] = useState('')
  const [activePin, setActivePin] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all')
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return bookings.filter((booking) =>
      (filter === 'all' || booking.status === filter)
      && (!query || [booking.id, booking.attendee, booking.contact].some((value) => value.toLowerCase().includes(query))),
    )
  }, [bookings, filter, search])

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      const result = await adminLogin(pin.trim())
      setBookings(result)
      setActivePin(pin.trim())
      setUnlocked(true)
    } catch {
      setError('La clave no es correcta.')
    }
  }

  async function changeStatus(bookingId: string, status: BookingStatus) {
    await updateBookingStatus(activePin, bookingId, status)
    setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status } : booking))
  }

  async function promote(bookingId: string) {
    await promoteWaitlist(activePin, bookingId)
    setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: 'reserved' } : booking))
  }

  async function scanQr() {
    if (!videoRef.current) return
    setScanning(true)
    setError('')
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current)
      const payload = JSON.parse(result.getText()) as { bookingId?: string }
      if (!payload.bookingId) throw new Error('Invalid QR')
      setSearch(payload.bookingId)
    } catch {
      setError('No pudimos leer el QR. Puedes buscar el código manualmente.')
    } finally {
      const stream = videoRef.current?.srcObject as MediaStream | null
      stream?.getTracks().forEach((track) => track.stop())
      setScanning(false)
    }
  }

  if (!unlocked) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={login}>
          <span className="brand-mark">R</span>
          <p className="eyebrow">Ruyuen</p>
          <h1>Panel del equipo</h1>
          <p>Revisa reservas, llegadas y lista de espera.</p>
          <label><span>Clave del equipo</span><input autoComplete="current-password" onChange={(event) => setPin(event.target.value)} required type="password" value={pin} /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit">Ingresar</button>
          <a className="text-link" href="#/">Volver al sitio</a>
        </form>
      </main>
    )
  }

  const reserved = bookings.filter((booking) => booking.status === 'reserved').length
  const checked = bookings.filter((booking) => booking.status === 'checked-in').length
  const waitlisted = bookings.filter((booking) => booking.status === 'waitlisted').length

  return (
    <main className="admin-page dashboard-page">
      <header className="admin-header"><div className="brand-footer"><span className="brand-mark">R</span><div><strong>Ruyuen</strong><small>Panel del equipo</small></div></div><button className="secondary-button" onClick={() => setUnlocked(false)} type="button"><SignOut size={19} />Salir</button></header>
      <section className="admin-content">
        <div className="admin-heading"><div><p className="eyebrow">Operación del encuentro</p><h1>Reservas y llegada</h1></div><button className="primary-button" onClick={scanQr} type="button"><Camera size={20} />{scanning ? 'Escaneando…' : 'Escanear QR'}</button></div>
        <video className={scanning ? 'scanner-video active' : 'scanner-video'} muted playsInline ref={videoRef} />
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="admin-stats"><article><Ticket size={26} /><strong>{reserved}</strong><span>Reservas</span></article><article><CheckCircle size={26} /><strong>{checked}</strong><span>Llegadas</span></article><article><Users size={26} /><strong>{waitlisted}</strong><span>En espera</span></article></div>
        <div className="admin-toolbar"><label><MagnifyingGlass size={20} /><input onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nombre, contacto o código" value={search} /></label><select onChange={(event) => setFilter(event.target.value as BookingStatus | 'all')} value={filter}><option value="all">Todos los estados</option><option value="reserved">Reservado</option><option value="waitlisted">Lista de espera</option><option value="checked-in">Llegó</option><option value="cancelled">Cancelado</option><option value="no-show">No llegó</option><option value="completed">Completado</option></select></div>
        <div className="booking-table">
          {filtered.length ? filtered.map((booking) => (
            <article key={booking.id}>
              <div><strong>{booking.attendee}</strong><span>{booking.id} · {booking.contact}</span></div>
              <div><strong>{booking.activityId}</strong><span>{booking.sessionId} · {booking.partySize} personas</span></div>
              <div className="status-actions"><select onChange={(event) => changeStatus(booking.id, event.target.value as BookingStatus)} value={booking.status}><option value="reserved">Reservado</option><option value="waitlisted">Lista de espera</option><option value="checked-in">Llegó</option><option value="cancelled">Cancelado</option><option value="no-show">No llegó</option><option value="completed">Completado</option></select>{booking.status === 'waitlisted' ? <button onClick={() => promote(booking.id)} type="button">Promover</button> : null}</div>
            </article>
          )) : <div className="admin-empty"><Ticket size={48} /><p>No hay reservas que coincidan.</p></div>}
        </div>
      </section>
    </main>
  )
}
