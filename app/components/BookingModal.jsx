'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { WHATSAPP_NUMBER } from '@/lib/clinic-knowledge'

const springMed = { type: "spring", stiffness: 300, damping: 28 }
const springFast = { type: "spring", stiffness: 500, damping: 40 }

export default function BookingModal({ onClose, origin = '50% 50%' }) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', reason: 'New patient consultation' })
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const msg = `Hi Dr. Pravin, I'd like to book an appointment at b.Braced.\n\nName: ${form.name}\nPhone: ${form.phone}\nPreferred date: ${form.date}\nReason: ${form.reason}\n\nPlease confirm a suitable time. Thank you!`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    setSubmitted(true)
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal"
        initial={{ scale: 0.91, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={springMed}
        style={{ transformOrigin: origin }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>Book an Appointment</h2>
          <motion.button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}
            whileHover={{ scale: 1.2, color: 'var(--text-primary)' }}
            whileTap={{ scale: 0.9 }}
            transition={springFast}
          >
            ×
          </motion.button>
        </div>

        {submitted ? (
          <motion.div
            style={{ textAlign: 'center', padding: '24px 0' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springMed}
          >
            <motion.div
              style={{ fontSize: '2.5rem', marginBottom: 12 }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              ✓
            </motion.div>
            <h3 style={{ marginBottom: 8 }}>WhatsApp opened!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your booking request is ready to send. Just hit send in WhatsApp and Dr. Pravin&apos;s team will confirm your slot.
            </p>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Your name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Ananya Shah" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input className="form-input" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred date</label>
              <input className="form-input" name="date" type="date" value={form.date} onChange={handleChange} min={today} required />
            </div>
            <div className="form-group">
              <label className="form-label">Reason for visit</label>
              <select className="form-select" name="reason" value={form.reason} onChange={handleChange}>
                <option>New patient consultation</option>
                <option>Existing patient — tray issue</option>
                <option>Progress check</option>
                <option>Attachment / refinement visit</option>
                <option>Retainer fitting</option>
                <option>Other</option>
              </select>
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springFast}
            >
              Open WhatsApp to Book
            </motion.button>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              This opens WhatsApp with your details pre-filled. The clinic will confirm your appointment.
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
