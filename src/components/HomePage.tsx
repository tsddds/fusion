import {
  ArrowRight,
  BookOpen,
  CalendarDots,
  CookingPot,
  InstagramLogo,
  PaintBrush,
  UsersThree,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { copyByLocale, heroPoster, heroVideo } from '../content'
import { formatEventDate, localize } from '../domain'
import type { Activity, Locale, PublicContent } from '../types'
import { SiteHeader } from './SiteHeader'
import { SubscribeForm } from './SubscribeForm'

const journeyIcons = [BookOpen, PaintBrush, CookingPot, UsersThree]

type Props = {
  content: PublicContent
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function HomePage({ content, locale, onLocaleChange }: Props) {
  const copy = copyByLocale[locale]
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (!selectedActivity) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedActivity(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedActivity])
  const nextEvent = content.events
    .filter((event) => event.status === 'published' && new Date(event.endAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0]
  const archivedEvents = content.events
    .filter((event) => event.status === 'archived' || new Date(event.endAt).getTime() < Date.now())
    .slice(0, 3)

  return (
    <main className="site-shell" id="top">
      <section className="hero-section">
        <video
          aria-hidden="true"
          autoPlay
          className="hero-media"
          loop
          muted
          playsInline
          poster={heroPoster}
          preload="metadata"
          src={heroVideo}
        />
        <div className="hero-shade" />
        <SiteHeader locale={locale} onLocaleChange={onLocaleChange} />
        <div className="hero-copy">
          <span className="vertical-mark" aria-hidden="true">如<br />緣</span>
          <p className="eyebrow">{copy.heroKicker}</p>
          <h1><span>Ruyuen</span>{copy.heroTitle}</h1>
          <p className="hero-body">{copy.heroBody}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#activities">{copy.discover}<ArrowRight size={20} /></a>
            <a className="text-link" href="#about">{copy.learnMore}<ArrowRight size={18} /></a>
          </div>
        </div>
        <a className="event-peek" href="#events">
          <CalendarDots size={33} />
          <span><strong>{copy.eventEyebrow}</strong>{nextEvent ? localize(nextEvent.title, locale) : copy.eventTitle}</span>
        </a>
      </section>

      <section className="journey-strip" aria-label={copy.aboutTitle}>
        {copy.journey.map(([title, body], index) => {
          const Icon = journeyIcons[index]
          return <article key={title}><Icon size={34} /><h2>{title}</h2><p>{body}</p></article>
        })}
      </section>

      {content.notices.length ? (
        <aside className="notice-bar" aria-label="Avisos">
          {content.notices.map((notice) => <p key={notice.id}><strong>{localize(notice.title, locale)}</strong>{localize(notice.body, locale)}</p>)}
        </aside>
      ) : null}

      <section className="content-section activities-section" id="activities">
        <div className="section-heading">
          <p className="eyebrow">{copy.activitiesEyebrow}</p>
          <h2>{copy.activitiesTitle}</h2>
          <p>{copy.activitiesBody}</p>
        </div>
        <div className="activity-list">
          {content.activities.sort((a, b) => a.order - b.order).map((activity, index) => (
            <article className="activity-row" key={activity.id}>
              <img alt={localize(activity.title, locale)} loading="lazy" src={activity.image} />
              <div>
                <span className="activity-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{localize(activity.title, locale)}</h3>
                <p>{localize(activity.summary, locale)}</p>
                <button className="text-link" onClick={() => setSelectedActivity(activity)} type="button">
                  {copy.readActivity}<ArrowRight size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="events-section" id="events">
        <div className="section-heading light">
          <p className="eyebrow">{copy.eventEyebrow}</p>
          <h2>{nextEvent ? localize(nextEvent.title, locale) : copy.eventTitle}</h2>
          <p>{nextEvent ? localize(nextEvent.summary, locale) : copy.eventBody}</p>
        </div>
        {nextEvent ? (
          <article className="next-event">
            <img alt="" src={nextEvent.cover || heroPoster} />
            <div>
              <time dateTime={nextEvent.startAt}>{formatEventDate(nextEvent.startAt, locale)}</time>
              <h3>{localize(nextEvent.venue, locale)}</h3>
              <p>{nextEvent.address}</p>
              {nextEvent.registrationOpen ? <a className="primary-button" href={`#/booking?event=${nextEvent.id}`}>{copy.booking}<ArrowRight size={20} /></a> : null}
            </div>
          </article>
        ) : (
          <div className="notify-panel">
            <div><CalendarDots size={42} /><p>{copy.notifyBody}</p></div>
            <SubscribeForm locale={locale} />
          </div>
        )}
        {archivedEvents.length ? (
          <div className="event-archive"><h3>{copy.eventArchive}</h3>{archivedEvents.map((event) => <article key={event.id}><time>{formatEventDate(event.startAt, locale)}</time><strong>{localize(event.title, locale)}</strong></article>)}</div>
        ) : null}
      </section>

      <section className="about-section" id="about">
        <div className="about-image"><img alt="Caligrafía china" loading="lazy" src={content.activities[0]?.image || heroPoster} /></div>
        <div><p className="eyebrow">{copy.aboutEyebrow}</p><h2>{copy.aboutTitle}</h2><p>{copy.aboutBody}</p><a className="text-link" href="https://www.instagram.com/ruyuen.oficial/" rel="noreferrer" target="_blank"><InstagramLogo size={20} />{copy.instagram}</a></div>
      </section>

      <footer className="site-footer" id="contact"><div className="brand-footer"><span className="brand-mark">R</span><div><strong>Ruyuen</strong><small>{copy.heroKicker}</small></div></div><a href="https://www.instagram.com/ruyuen.oficial/" rel="noreferrer" target="_blank"><InstagramLogo size={22} />@ruyuen.oficial</a></footer>

      {selectedActivity ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedActivity(null)}>
          <article aria-labelledby="activity-dialog-title" aria-modal="true" className="activity-dialog" onMouseDown={(event) => event.stopPropagation()} role="dialog">
            <img alt={localize(selectedActivity.title, locale)} src={selectedActivity.image} />
            <div><button aria-label={copy.close} className="dialog-close" onClick={() => setSelectedActivity(null)} type="button">×</button><p className="eyebrow">{copy.activitiesEyebrow}</p><h2 id="activity-dialog-title">{localize(selectedActivity.title, locale)}</h2><p>{localize(selectedActivity.detail, locale)}</p><dl><div><dt>{copy.duration}</dt><dd>{localize(selectedActivity.duration, locale)}</dd></div><div><dt>{copy.audience}</dt><dd>{localize(selectedActivity.audience, locale)}</dd></div></dl></div>
          </article>
        </div>
      ) : null}
    </main>
  )
}
