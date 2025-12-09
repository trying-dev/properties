'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type ReactNode } from 'react'

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
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${
        isClosing || isAnimatingIn ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out ${
          isClosing || isAnimatingIn
            ? 'opacity-0 scale-95 translate-y-2'
            : 'opacity-100 scale-100 translate-y-0'
        } ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
