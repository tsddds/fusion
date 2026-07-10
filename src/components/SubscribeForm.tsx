import { Bell, CheckCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { subscribe } from '../api'
import { copyByLocale } from '../content'
import type { ContactType, Locale } from '../types'

export function SubscribeForm({ locale }: { locale: Locale }) {
  const copy = copyByLocale[locale]
  const [contactType, setContactType] = useState<ContactType>('email')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contact.trim() || !consent) return
    setStatus('loading')
    try {
      await subscribe({ consent, contact: contact.trim(), contactType, locale, name: name.trim() })
      setStatus('success')
      setContact('')
      setName('')
      setConsent(false)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="form-success" role="status">
        <CheckCircle size={30} weight="fill" />
        <p>{copy.notifySuccess}</p>
      </div>
    )
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit}>
      <div className="contact-type" aria-label={copy.contact}>
        <button aria-pressed={contactType === 'email'} onClick={() => setContactType('email')} type="button">
          {copy.email}
        </button>
        <button aria-pressed={contactType === 'whatsapp'} onClick={() => setContactType('whatsapp')} type="button">
          {copy.phone}
        </button>
      </div>
      <label>
        <span>{locale === 'es' ? 'Nombre (opcional)' : locale === 'pt' ? 'Nome (opcional)' : locale === 'en' ? 'Name (optional)' : '姓名（選填）'}</span>
        <input autoComplete="name" onChange={(event) => setName(event.target.value)} value={name} />
      </label>
      <label>
        <span>{contactType === 'email' ? copy.email : copy.phone}</span>
        <input
          autoComplete={contactType === 'email' ? 'email' : 'tel'}
          inputMode={contactType === 'email' ? 'email' : 'tel'}
          onChange={(event) => setContact(event.target.value)}
          required
          type={contactType === 'email' ? 'email' : 'tel'}
          value={contact}
        />
      </label>
      <label className="consent-row">
        <input checked={consent} onChange={(event) => setConsent(event.target.checked)} required type="checkbox" />
        <span>{copy.notifyConsent}</span>
      </label>
      {status === 'error' ? <p className="form-error" role="alert">No pudimos guardar tu contacto. Inténtalo nuevamente.</p> : null}
      <button className="primary-button" disabled={status === 'loading'} type="submit">
        <Bell size={19} />
        {status === 'loading' ? '…' : copy.notify}
      </button>
    </form>
  )
}
