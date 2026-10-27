'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faShareFromSquare,
  faTimes,
  faMobileScreenButton,
} from '@fortawesome/free-solid-svg-icons'

export default function InstallPrompt() {
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
              <span className="red">Install</span> App
            </h2>
            <button type="button" className="install-popup__close" onClick={handleClose} aria-label="Close install help">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="install-popup__content">
            {/* Instructions selon l'appareil (les instructions iOS s'affichaient pour tout le monde) */}
            {installEvent ? (
              <>
                <p>Install PokerBuddy on your device for quick access.</p>
                <button type="button" className="btn btn--small" onClick={handleInstall}>
                  <FontAwesomeIcon icon={faPlus} /> Install
                </button>
              </>
            ) : isIOS ? (
              <p>
                To install this app on your mobile device, tap the share button <FontAwesomeIcon icon={faShareFromSquare} /> and then{' '}
                <FontAwesomeIcon icon={faPlus} /> Add to Home Screen
              </p>
            ) : (
              <p>
                To install this app, open your browser menu and choose &quot;Install app&quot; or &quot;Add to Home screen&quot;.
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
        aria-label="How to install the app"
      >
        <FontAwesomeIcon icon={faMobileScreenButton} />
      </button>
    </>
  )
}
