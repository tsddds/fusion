import { useEffect, useState } from 'react'
import { getPublicContent } from './api'
import { fallbackContent } from './content'
import { getRoute, isLocale } from './domain'
import type { AppRoute } from './domain'
import type { Locale, PublicContent } from './types'
import { AdminPage } from './components/AdminPage'
import { BookingPage } from './components/BookingPage'
import { HomePage } from './components/HomePage'
import './App.css'

const staffPath = String(import.meta.env.VITE_RUYUEN_STAFF_PATH || 'equipo-ruyuen-7c9f')
  .replace(/^#?\/?/, '')
  .replace(/\/$/, '')

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRoute(window.location.hash, staffPath))
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = window.localStorage.getItem('ruyuen-locale')
    return isLocale(stored) ? stored : 'es'
  })
  const [content, setContent] = useState<PublicContent>(fallbackContent)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute(window.location.hash, staffPath))
      window.scrollTo({ behavior: 'instant', top: 0 })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    getPublicContent().then(setContent).catch(() => setContent(fallbackContent))
  }, [])

  function changeLocale(next: Locale) {
    setLocale(next)
    window.localStorage.setItem('ruyuen-locale', next)
    document.documentElement.lang = next === 'zhHant' ? 'zh-Hant' : next
  }

  if (route === 'admin') return <AdminPage />
  if (route === 'booking') return <BookingPage content={content} locale={locale} onLocaleChange={changeLocale} />
  return <HomePage content={content} locale={locale} onLocaleChange={changeLocale} />
}
