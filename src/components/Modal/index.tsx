'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type ReactNode } from 'react'
import styles from './Modal.module.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  disableClose?: boolean
  className?: string
}

export default function Modal({ isOpen, onClose, children, ariaLabel, disableClose, className }: ModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleOverlayClick = () => {
    if (disableClose) return
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setIsAnimatingIn(true)
      const id = setTimeout(() => setIsAnimatingIn(false), 20) // allow first paint before animating in
      return () => clearTimeout(id)
    }

    if (isVisible) {
      setIsClosing(true)
      const timeout = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
        setIsAnimatingIn(false)
      }, 280) // keep in sync with transition duration
      return () => clearTimeout(timeout)
    }
  }, [isOpen, isVisible])

  if (!isVisible) return null

  return (
    <div className={`${styles.overlay} ${isClosing || isAnimatingIn ? styles.overlayHidden : styles.overlayVisible}`} onClick={handleOverlayClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`${styles.panel} ${isClosing || isAnimatingIn ? styles.panelHidden : styles.panelVisible} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
