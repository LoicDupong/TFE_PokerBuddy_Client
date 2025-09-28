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

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // Vérifie si déjà vu
    const seen = localStorage.getItem('installPromptSeen')
    if (!seen) {
      setIsOpen(true) // première visite → affiche popup
      localStorage.setItem('installPromptSeen', 'true')
    } else {
      setAlreadySeen(true)
    }
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

  return (
    <>
      {isOpen && (
        <div className={`install-popup ${closing ? 'closing' : 'opening'}`}>
          <div className="install-popup__header">
            <h2>
              <span className="red">Install</span> App
            </h2>
            <button className="install-popup__close" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="install-popup__content">
              <p>
                To install this app on your mobile device, tap the share button <FontAwesomeIcon icon={faShareFromSquare} /> and then{' '}
                <FontAwesomeIcon icon={faPlus} /> Add to Home Screen
              </p>
          </div>
        </div>
      )}

      {/* Bouton flottant toujours présent */}
      <button
        className="install-help-btn visible"
        onClick={handleOpen}
      >
        <FontAwesomeIcon icon={faMobileScreenButton} />
      </button>
    </>
  )
}
