import { List, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { copyByLocale, languageOptions } from '../content'
import type { Locale } from '../types'

type Props = {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function SiteHeader({ locale, onLocaleChange }: Props) {
  const [open, setOpen] = useState(false)
  const copy = copyByLocale[locale]

  const closeMenu = () => setOpen(false)

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={closeMenu} aria-label="Ruyuen">
        <span className="brand-mark" aria-hidden="true">R</span>
        <span className="brand-copy">
          <strong>Ruyuen</strong>
          <small>{copy.heroKicker}</small>
        </span>
      </a>

      <button
        aria-expanded={open}
        aria-label={open ? copy.close : 'Menu'}
        className="menu-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <X size={24} /> : <List size={24} />}
      </button>

      <nav aria-label="Principal" className={open ? 'main-nav open' : 'main-nav'}>
        <a href="#activities" onClick={closeMenu}>{copy.navActivities}</a>
        <a href="#events" onClick={closeMenu}>{copy.navEvents}</a>
        <a href="#about" onClick={closeMenu}>{copy.navAbout}</a>
        <a href="#contact" onClick={closeMenu}>{copy.contact}</a>
      </nav>

      <div className="language-switcher" aria-label="Language selector">
        {languageOptions.map((option) => (
          <button
            aria-pressed={locale === option.code}
            key={option.code}
            onClick={() => onLocaleChange(option.code)}
            title={option.label}
            type="button"
          >
            {option.short}
          </button>
        ))}
      </div>
    </header>
  )
}
