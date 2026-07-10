import { ArrowLeft, ArrowRight, CalendarDots, CheckCircle, Clock, QrCode, Users } from '@phosphor-icons/react'
import { toDataURL } from 'qrcode'
import { useEffect, useMemo, useState } from 'react'
import { createBooking } from '../api'
import { copyByLocale } from '../content'
import { formatEventDate, localize, makeQrPayload } from '../domain'
import type { Booking, ContactType, Locale, PublicContent } from '../types'
import { SiteHeader } from './SiteHeader'
import { SubscribeForm } from './SubscribeForm'

type Props = {
  content: PublicContent
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function BookingPage({ content, locale, onLocaleChange }: Props) {
  const copy = copyByLocale[locale]
  const eventId = new URLSearchParams(window.location.hash.split('?')[1] || '').get('event')
  const activeEvent = content.events.find((event) => event.id === eventId && event.status === 'published')
    || content.events.find((event) => event.status === 'published' && event.registrationOpen)
  const eventSessions = content.sessions.filter((session) => session.eventId === activeEvent?.id && session.status === 'open')
  const [sessionId, setSessionId] = useState(eventSessions[0]?.id || '')
  const [attendee, setAttendee] = useState('')
  const [contactType, setContactType] = useState<ContactType>('email')
  const [contact, setContact] = useState('')
  const [partySize, setPartySize] = useState(1)
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [qrImage, setQrImage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const selectedSession = eventSessions.find((session) => session.id === sessionId)
  const selectedActivity = content.activities.find((activity) => activity.id === selectedSession?.activityId)
  const labels = useMemo(() => bookingLabels[locale], [locale])

  useEffect(() => {
    if (!booking) return
    toDataURL(makeQrPayload(booking), {
      color: { dark: '#071d2a', light: '#f5ead8' },
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 260,
    }).then(setQrImage).catch(() => setQrImage(''))
  }, [booking])

  function nextStep() {
    setError('')
    if (step === 1 && !selectedSession) return setError(labels.chooseSession)
    if (step === 2 && (!attendee.trim() || !contact.trim())) return setError(labels.required)
    setStep((current) => Math.min(3, current + 1))
  }

  async function submitBooking() {
    if (!activeEvent || !selectedSession || !selectedActivity) return
    setSubmitting(true)
    setError('')
    try {
      const result = await createBooking({
        activityId: selectedActivity.id,
        attendee: attendee.trim(),
        contact: contact.trim(),
        contactType,
        eventId: activeEvent.id,
        locale,
        partySize,
        sessionId: selectedSession.id,
      })
      setBooking(result)
      setStep(4)
    } catch {
      setError(labels.error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeEvent) {
    return (
      <main className="booking-page">
        <SiteHeader locale={locale} onLocaleChange={onLocaleChange} />
        <section className="booking-empty">
          <CalendarEmptyIcon />
          <p className="eyebrow">{copy.eventEyebrow}</p>
          <h1>{copy.eventTitle}</h1>
          <p>{copy.eventBody}</p>
          <SubscribeForm locale={locale} />
          <a className="text-link" href="#/"><ArrowLeft size={18} />{labels.back}</a>
        </section>
      </main>
    )
  }

  return (
    <main className="booking-page">
      <SiteHeader locale={locale} onLocaleChange={onLocaleChange} />
      <section className="booking-shell">
        <a className="text-link back-link" href="#/"><ArrowLeft size={18} />{labels.back}</a>
        <div className="booking-heading">
          <p className="eyebrow">{localize(activeEvent.title, locale)}</p>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
        </div>
        <ol className="stepper" aria-label={labels.progress}>
          {[labels.session, labels.details, labels.review, labels.confirmation].map((label, index) => (
            <li className={step >= index + 1 ? 'active' : ''} key={label}><span>{index + 1}</span>{label}</li>
          ))}
        </ol>

        {step === 1 ? (
          <div className="booking-step">
            <h2>{labels.choose}</h2>
            <div className="session-list">
              {eventSessions.map((session) => {
                const activity = content.activities.find((item) => item.id === session.activityId)
                return (
                  <label className={sessionId === session.id ? 'session-card selected' : 'session-card'} key={session.id}>
                    <input checked={sessionId === session.id} name="session" onChange={() => setSessionId(session.id)} type="radio" />
                    <img alt="" src={activity?.image} />
                    <span><strong>{activity ? localize(activity.title, locale) : session.activityId}</strong><small><Clock size={17} />{formatEventDate(session.startAt, locale)}</small><small><Users size={17} />{session.capacity} {labels.seats}</small></span>
                  </label>
                )
              })}
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="primary-button" onClick={nextStep} type="button">{labels.continue}<ArrowRight size={19} /></button>
          </div>
        ) : null}

        {step === 2 ? (
          <form className="booking-step booking-form" onSubmit={(event) => { event.preventDefault(); nextStep() }}>
            <h2>{labels.yourDetails}</h2>
            <label><span>{labels.name}</span><input autoComplete="name" onChange={(event) => setAttendee(event.target.value)} required value={attendee} /></label>
            <div className="contact-type"><button aria-pressed={contactType === 'email'} onClick={() => setContactType('email')} type="button">{copy.email}</button><button aria-pressed={contactType === 'whatsapp'} onClick={() => setContactType('whatsapp')} type="button">{copy.phone}</button></div>
            <label><span>{contactType === 'email' ? copy.email : copy.phone}</span><input autoComplete={contactType === 'email' ? 'email' : 'tel'} inputMode={contactType === 'email' ? 'email' : 'tel'} onChange={(event) => setContact(event.target.value)} required type={contactType === 'email' ? 'email' : 'tel'} value={contact} /></label>
            <label><span>{labels.party}</span><select onChange={(event) => setPartySize(Number(event.target.value))} value={partySize}>{[1, 2, 3, 4].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="form-actions"><button className="secondary-button" onClick={() => setStep(1)} type="button">{labels.backStep}</button><button className="primary-button" type="submit">{labels.continue}<ArrowRight size={19} /></button></div>
          </form>
        ) : null}

        {step === 3 && selectedSession && selectedActivity ? (
          <div className="booking-step review-card">
            <h2>{labels.review}</h2>
            <dl><div><dt>{labels.activity}</dt><dd>{localize(selectedActivity.title, locale)}</dd></div><div><dt>{labels.schedule}</dt><dd>{formatEventDate(selectedSession.startAt, locale)}</dd></div><div><dt>{labels.name}</dt><dd>{attendee}</dd></div><div><dt>{labels.contact}</dt><dd>{contact}</dd></div><div><dt>{labels.party}</dt><dd>{partySize}</dd></div></dl>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="form-actions"><button className="secondary-button" onClick={() => setStep(2)} type="button">{labels.backStep}</button><button className="primary-button" disabled={submitting} onClick={submitBooking} type="button"><QrCode size={20} />{submitting ? '…' : labels.confirm}</button></div>
          </div>
        ) : null}

        {step === 4 && booking ? (
          <div className="booking-step confirmation-card" role="status">
            <CheckCircle size={54} weight="fill" />
            <p className="eyebrow">{booking.status === 'waitlisted' ? labels.waitlist : labels.confirmation}</p>
            <h2>{booking.status === 'waitlisted' ? labels.waitlistTitle : labels.confirmedTitle}</h2>
            <p>{booking.status === 'waitlisted' ? labels.waitlistBody : labels.confirmedBody}</p>
            {qrImage ? <img alt={labels.qrAlt} className="qr-image" src={qrImage} /> : null}
            <strong className="booking-code">{booking.id}</strong>
            <a className="primary-button" href={qrImage} download={`${booking.id}-ruyuen.png`}>{labels.download}</a>
          </div>
        ) : null}
      </section>
    </main>
  )
}

function CalendarEmptyIcon() {
  return <CalendarDots size={64} weight="thin" />
}

const bookingLabels = {
  es: { activity: 'Actividad', back: 'Volver al inicio', backStep: 'Atrás', body: 'Elige una experiencia, completa tus datos y recibe una confirmación con QR.', choose: 'Elige una clase u horario', chooseSession: 'Selecciona un horario para continuar.', confirm: 'Confirmar reserva', confirmation: 'Confirmación', confirmedBody: 'Guarda este QR. También enviaremos una copia por email cuando corresponda.', confirmedTitle: 'Tu cupo está reservado.', contact: 'Contacto', continue: 'Continuar', details: 'Tus datos', download: 'Descargar QR', error: 'No pudimos completar la reserva. Inténtalo nuevamente.', name: 'Nombre completo', party: 'Cantidad de personas', progress: 'Progreso de la reserva', qrAlt: 'Código QR de la reserva', required: 'Completa tu nombre y contacto.', review: 'Revisar', schedule: 'Horario', seats: 'cupos', session: 'Actividad', title: 'Reserva tu experiencia', waitlist: 'Lista de espera', waitlistBody: 'Te contactaremos si se libera espacio para todo tu grupo.', waitlistTitle: 'Te agregamos a la lista de espera.', yourDetails: 'Cuéntanos quién asistirá' },
  zhHant: { activity: '活動', back: '返回首頁', backStep: '上一步', body: '選擇體驗、填寫資料並取得 QR 碼確認。', choose: '選擇活動時段', chooseSession: '請選擇一個時段。', confirm: '確認預約', confirmation: '確認', confirmedBody: '請保存此 QR 碼。如提供電子郵件，我們也會寄送副本。', confirmedTitle: '預約成功。', contact: '聯絡方式', continue: '繼續', details: '個人資料', download: '下載 QR', error: '無法完成預約，請再試一次。', name: '姓名', party: '人數', progress: '預約進度', qrAlt: '預約 QR 碼', required: '請填寫姓名與聯絡方式。', review: '確認資料', schedule: '時間', seats: '名額', session: '活動', title: '預約文化體驗', waitlist: '候補名單', waitlistBody: '若有足夠名額，我們會與你聯絡。', waitlistTitle: '已加入候補名單。', yourDetails: '參加者資料' },
  en: { activity: 'Activity', back: 'Back home', backStep: 'Back', body: 'Choose an experience, add your details, and receive a QR confirmation.', choose: 'Choose a class or time', chooseSession: 'Choose a session to continue.', confirm: 'Confirm booking', confirmation: 'Confirmation', confirmedBody: 'Save this QR. We will also send an email copy when applicable.', confirmedTitle: 'Your place is reserved.', contact: 'Contact', continue: 'Continue', details: 'Your details', download: 'Download QR', error: 'We could not complete the booking. Please try again.', name: 'Full name', party: 'Number of people', progress: 'Booking progress', qrAlt: 'Booking QR code', required: 'Complete your name and contact.', review: 'Review', schedule: 'Schedule', seats: 'places', session: 'Activity', title: 'Book your experience', waitlist: 'Waitlist', waitlistBody: 'We will contact you if enough places open for your group.', waitlistTitle: 'You are on the waitlist.', yourDetails: 'Tell us who is attending' },
  pt: { activity: 'Atividade', back: 'Voltar ao início', backStep: 'Voltar', body: 'Escolha uma experiência, complete seus dados e receba uma confirmação com QR.', choose: 'Escolha uma aula ou horário', chooseSession: 'Selecione um horário para continuar.', confirm: 'Confirmar reserva', confirmation: 'Confirmação', confirmedBody: 'Guarde este QR. Também enviaremos uma cópia por email quando aplicável.', confirmedTitle: 'Sua vaga está reservada.', contact: 'Contato', continue: 'Continuar', details: 'Seus dados', download: 'Baixar QR', error: 'Não foi possível concluir a reserva. Tente novamente.', name: 'Nome completo', party: 'Quantidade de pessoas', progress: 'Progresso da reserva', qrAlt: 'Código QR da reserva', required: 'Complete seu nome e contato.', review: 'Revisar', schedule: 'Horário', seats: 'vagas', session: 'Atividade', title: 'Reserve sua experiência', waitlist: 'Lista de espera', waitlistBody: 'Entraremos em contato se houver espaço para todo o grupo.', waitlistTitle: 'Você está na lista de espera.', yourDetails: 'Conte quem participará' },
}
