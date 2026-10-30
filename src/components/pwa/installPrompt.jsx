'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/i18n/i18n-provider.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faShareFromSquare,
  faTimes,
  faMobileScreenButton,
} from '@fortawesome/free-solid-svg-icons'

const MESSAGES = {
  en: {
    install: 'Install', app: 'App', close: 'Close install help', how: 'How to install the app',
    native: 'Install PokerBuddy on your device for quick access.', button: 'Install',
    iosA: 'To install this app on your mobile device, tap the share button', iosB: 'and then', iosC: 'Add to Home Screen',
    other: 'To install this app, open your browser menu and choose "Install app" or "Add to Home screen".',
  },
  fr: {
    install: 'Installer', app: "l'appli", close: "Fermer l'aide à l'installation", how: "Comment installer l'appli",
    native: 'Installe PokerBuddy sur ton appareil pour y accéder plus vite.', button: 'Installer',
    iosA: "Pour installer l'appli sur ton mobile, touche le bouton de partage", iosB: 'puis', iosC: "Sur l'écran d'accueil",
    other: 'Pour installer l\'appli, ouvre le menu de ton navigateur et choisis « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».',
  },
}

export default function InstallPrompt() {
  const { t } = useT(MESSAGES)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [alreadySeen, setAlreadySeen] = useState(false)
  // Chrome / Edge (Android, desktop) : installation native proposée par le navigateur
  const [installEvent, setInstallEvent] = useState(null)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // Ouverture automatique une seule fois, à la 3e visite : à la première, la popup cachait
    // la prochaine partie et ses boutons. Avant ça, l'onglet discret suffit.
    const seen = localStorage.getItem('installPromptSeen')
    const visits = Number(localStorage.getItem('installPromptVisits') || 0) + 1
    localStorage.setItem('installPromptVisits', String(visits))
    if (!seen && visits >= 3) {
      setIsOpen(true)
      localStorage.setItem('installPromptSeen', 'true')
    } else {
      setAlreadySeen(true)
    }

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (isStandalone) return null

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setClosing(false)
    }, 300) // durée anim slideDown
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleInstall = async () => {
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    handleClose()
  }

  return (
    <>
      {isOpen && (
        <div className={`install-popup ${closing ? 'closing' : 'opening'}`}>
          <div className="install-popup__header">
            <h2>
              <span className="red">{t('install')}</span> {t('app')}
            </h2>
            <button type="button" className="install-popup__close" onClick={handleClose} aria-label={t('close')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="install-popup__content">
            {/* Instructions selon l'appareil (les instructions iOS s'affichaient pour tout le monde) */}
            {installEvent ? (
              <>
                <p>{t('native')}</p>
                <button type="button" className="btn btn--small" onClick={handleInstall}>
                  <FontAwesomeIcon icon={faPlus} /> {t('button')}
                </button>
              </>
            ) : isIOS ? (
              <p>
                {t('iosA')} <FontAwesomeIcon icon={faShareFromSquare} /> {t('iosB')}{' '}
                <FontAwesomeIcon icon={faPlus} /> {t('iosC')}
              </p>
            ) : (
              <p>
                {t('other')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bouton flottant toujours présent */}
      <button
        type="button"
        className="install-help-btn visible"
        onClick={handleOpen}
        aria-label={t('how')}
      >
        <FontAwesomeIcon icon={faMobileScreenButton} />
      </button>
    </>
  )
}
