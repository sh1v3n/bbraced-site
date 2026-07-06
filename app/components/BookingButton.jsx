'use client'
import { useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import BookingModal from './BookingModal'

export default function BookingButton({ label = 'Book Appointment', className = 'btn btn-primary' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const btnRef = useRef(null)

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setOrigin(`${r.left + r.width / 2}px ${r.top + r.height / 2}px`)
    }
    setIsOpen(true)
  }

  return (
    <>
      <button ref={btnRef} className={className} onClick={handleOpen}>{label}</button>
      <AnimatePresence>
        {isOpen && <BookingModal onClose={() => setIsOpen(false)} origin={origin} />}
      </AnimatePresence>
    </>
  )
}
