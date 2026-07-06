"use client"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useMotionValue, useTransform, useSpring, AnimatePresence, MotionConfig } from "framer-motion"
import BookingButton from '@/app/components/BookingButton'
import { CLINIC_INFO, WHATSAPP_NUMBER } from '@/lib/clinic-knowledge'

const LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil',
  'Telugu', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese',
  'Urdu', 'Sindhi', 'Konkani', 'Tulu', 'Bhojpuri', 'Rajasthani',
  'Maithili', 'Haryanvi', 'Chhattisgarhi', 'Awadhi', 'Magahi',
]

const FEATURES = [
  {
    num: '01',
    title: 'Doctor-led AI',
    body: "Every answer is grounded in Dr. Pravin's clinical protocols — not generic internet advice.",
  },
  {
    num: '02',
    title: 'Voice + Text, 23 languages',
    body: 'Speak or type in Hindi, Marathi, Tamil, and 20 more Indian languages. The assistant responds naturally.',
  },
  {
    num: '03',
    title: 'Always available',
    body: 'Get answers at midnight, on weekends, or between appointments — whenever you need them.',
  },
  {
    num: '04',
    title: 'Symptom triage',
    body: "Worried about a symptom? The AI knows what's normal, what to watch, and when to call the clinic immediately.",
  },
]

const STRIP_STATS = [
  { stat: 'Mumbai, India', label: 'b.Braced Clinic' },
  { stat: '23+ Languages', label: 'Fully supported' },
  { stat: '24 / 7', label: 'AI always on' },
  { stat: 'Mon – Sat', label: '10 am – 7 pm' },
]

const GALLERY = [
  { src: '/clinic-3.webp', caption: 'Reception & Waiting Area', label: 'First impressions matter' },
  { src: '/clinic-2.webp', caption: 'Treatment Room', label: 'State-of-the-art equipment' },
  { src: '/clinic-1.webp', caption: 'Clinic Entrance', label: 'Khar West, Mumbai' },
]

const CHAT_PREVIEW = [
  { role: 'user', text: 'Can I have chai with my aligners in?' },
  { role: 'ai', text: 'No — always remove aligners before chai. Hot liquids warp the plastic, and tannins will stain them permanently.' },
  { role: 'user', text: 'My tray feels tight on the back molar — is that normal?' },
  { role: 'ai', text: "Tightness on a new tray (especially molars) is normal for the first 2–3 days. That pressure means the aligner is working. If it doesn't ease by day 4, message the clinic." },
]

// ── Animation variants ───────────────────────────────────────────────────────

const springMed = { type: "spring", stiffness: 300, damping: 30 }
const springFast = { type: "spring", stiffness: 500, damping: 40 }

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const stagger = (delay = 0.09) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
})

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

// ── MagneticWrapper ─────────────────────────────────────────────────────────

function MagneticWrapper({ children, strength = 0.25 }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 })

  function onMove(e) {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

// ── FeatureCard (tilt + spotlight) ─────────────────────────────────────────

function FeatureCard({ f }) {
  const ref = useRef(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sx = useSpring(rotX, { stiffness: 150, damping: 20 })
  const sy = useSpring(rotY, { stiffness: 150, damping: 20 })

  function onMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    rotX.set(-dy * 8)
    rotY.set(dx * 8)
    ref.current.style.setProperty('--sx', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--sy', `${e.clientY - rect.top}px`)
    ref.current.style.setProperty('--so', '1')
  }

  function onMouseLeave() {
    rotX.set(0)
    rotY.set(0)
    ref.current.style.setProperty('--so', '0')
  }

  return (
    <motion.div
      ref={ref}
      className="dark-feature-card"
      variants={fadeUp}
      transition={springMed}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 1000 }}
      whileHover={{ y: -6, scale: 1.015, transition: springFast }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        className="dark-feature-number"
        whileHover={{ scale: 1.08, opacity: 0.75 }}
        transition={springFast}
      >
        {f.num}
      </motion.div>
      <h3>{f.title}</h3>
      <p>{f.body}</p>
    </motion.div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Hero parallax
  const heroX = useMotionValue(0)
  const heroY = useMotionValue(0)
  const smoothX = useSpring(heroX, { stiffness: 80, damping: 25 })
  const smoothY = useSpring(heroY, { stiffness: 80, damping: 25 })
  const headlineX = useTransform(smoothX, v => v * 0.015)
  const headlineY = useTransform(smoothY, v => v * 0.015)
  const cardX = useTransform(smoothX, v => v * 0.08)
  const cardY = useTransform(smoothY, v => v * 0.08)

  function onHeroMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    heroX.set(e.clientX - r.left - r.width / 2)
    heroY.set(e.clientY - r.top - r.height / 2)
  }

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % GALLERY.length)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + GALLERY.length) % GALLERY.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  return (
    <MotionConfig reducedMotion="user">
      <div className="dark-page">

        {/* ── Scroll progress ─────────────────────────────────────── */}
        <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />

        {/* ── Gradient mesh (slow animated) ───────────────────────── */}
        <div className="gradient-mesh" aria-hidden="true" />

        {/* ── Ambient background blobs ────────────────────────────── */}
        <div className="bg-blob bg-blob-1" aria-hidden="true" />
        <div className="bg-blob bg-blob-2" aria-hidden="true" />
        <div className="bg-blob bg-blob-3" aria-hidden="true" />

        {/* ── Navigation ──────────────────────────────────────────── */}
        <nav className="dark-nav">
          <motion.div
            className="dark-nav-logo"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springMed, delay: 0.1 }}
          >
            <img
              src="/bbraced-logo.png"
              alt="b.Braced"
              style={{ height: '36px', width: 'auto', borderRadius: '6px', background: '#fff', padding: '3px 8px' }}
            />
            <div>
              <p className="dark-nav-logo-text">b.Braced</p>
              <p className="dark-nav-sub">Dr. {CLINIC_INFO.doctor} · Clear Aligners</p>
            </div>
          </motion.div>

          <motion.ul
            className="dark-nav-links"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <li><a href="#features">How it works</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#languages">Languages</a></li>
            <li><a href="#clinic">Clinic</a></li>
          </motion.ul>

          <motion.div
            className="dark-nav-right"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springMed, delay: 0.15 }}
          >
            <a
              href={`tel:${CLINIC_INFO.phone.replace(/\s/g, '')}`}
              className="dark-nav-phone"
            >
              {CLINIC_INFO.phone}
            </a>
            <BookingButton label="Book Now" className="btn btn-primary" />
          </motion.div>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div
          className="hero-split"
          onMouseMove={onHeroMove}
          onMouseLeave={() => { heroX.set(0); heroY.set(0) }}
        >

          {/* Left: dark content panel */}
          <div className="hero-left">
            {/* Parallax wrapper on headline content */}
            <motion.div style={{ x: headlineX, y: headlineY }}>
              <motion.div
                variants={stagger(0.1)}
                initial="hidden"
                animate="visible"
              >
                <motion.p variants={fadeUp} transition={springMed} className="hero-eyebrow">
                  AI-Powered · Free · 24 / 7
                </motion.p>

                <motion.h1 variants={fadeUp} transition={springMed} className="hero-headline">
                  Clear aligners.<br />
                  Questions answered.<br />
                  In <em>your</em> language.
                </motion.h1>

                <motion.p variants={fadeUp} transition={springMed} className="hero-subhead">
                  Dr. {CLINIC_INFO.doctor}&apos;s AI assistant knows your treatment stage, your symptoms, and your
                  concerns — available 24/7 in 23+ Indian languages.
                </motion.p>

                <motion.div variants={fadeUp} transition={springMed} className="hero-ctas">
                  <MagneticWrapper strength={0.3}>
                    <motion.a
                      href="/chat"
                      className="btn btn-primary"
                      style={{ fontSize: '0.95rem', padding: '14px 30px' }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={springFast}
                    >
                      Start chatting →
                    </motion.a>
                  </MagneticWrapper>
                  <BookingButton label="Book Consultation" className="btn btn-ghost" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: orange panel with clinic photo */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <img
              src="/clinic-3.webp"
              alt="b.Braced clinic reception"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                display: 'block',
              }}
            />

            {/* Parallax wrapper on doctor card */}
            <motion.div style={{ x: cardX, y: cardY }}>
              <motion.div
                className="hero-doctor-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springMed, delay: 0.7 }}
              >
                <h3>Dr. {CLINIC_INFO.doctor}</h3>
                <p>Clear Aligner Specialist · b.Braced, Mumbai</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────────── */}
        <motion.div
          className="hero-strip"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {STRIP_STATS.map(({ stat, label }) => (
            <motion.div
              key={stat}
              className="hero-strip-item"
              variants={fadeUp}
              transition={springMed}
            >
              <strong>{stat}</strong>
              <span>{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Features ────────────────────────────────────────────── */}
        <section id="features" className="dark-section">
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.span variants={fadeUp} transition={springMed} className="section-label">
                What makes it different
              </motion.span>
              <motion.h2 variants={fadeUp} transition={springMed} className="section-headline">
                Built for Dr. Pravin&apos;s<br />patients, not everyone.
              </motion.h2>
              <motion.p variants={fadeUp} transition={springMed} className="section-body">
                A general chatbot gives general answers. b.Braced AI knows your treatment stage, your
                specific procedure, and the exact protocols used at this clinic.
              </motion.p>
            </motion.div>

            <motion.div
              className="dark-features-grid"
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {FEATURES.map(f => <FeatureCard key={f.num} f={f} />)}
            </motion.div>
          </div>
        </section>

        {/* ── About the Doctor ────────────────────────────────────── */}
        <section id="about" className="dark-section-alt">
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

            {/* Top row: photo + credentials + bio */}
            <div className="about-row">

              {/* Portrait */}
              <motion.div
                className="about-photo-wrap"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={springMed}
              >
                <img
                  src="/dr-pravin-shetty.png"
                  alt="Dr. Pravin Shetty"
                  className="about-photo"
                />
              </motion.div>

              {/* Credentials */}
              <motion.div
                className="about-credentials"
                variants={stagger(0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.span variants={fadeUp} transition={springMed} className="section-label">
                  Meet your doctor
                </motion.span>
                <motion.h2 variants={fadeUp} transition={springMed} className="about-name">
                  Dr. Pravin Shetty
                </motion.h2>
                <motion.p variants={fadeUp} transition={springMed} className="about-degree">M.D.S</motion.p>
                <motion.p variants={fadeUp} transition={springMed} className="about-title">
                  Orthodontist &amp; Dentofacial Orthopaedics
                </motion.p>
              </motion.div>

              {/* Bio */}
              <motion.p
                className="about-bio"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...springMed, delay: 0.2 }}
              >
                Dr. Pravin Shetty, a renowned celebrity orthodontist in Mumbai, has been at the forefront
                of digital orthodontics for over 23 years. Specialising in invisible braces, aligners, and
                lingual orthodontics, he has introduced groundbreaking solutions that have transformed
                thousands of smiles worldwide. Beyond clinical practice, he is a sought-after speaker,
                having delivered 200+ keynote lectures and trained orthodontists across Seoul, Germany,
                Dubai, Australia, and more. Holding two patents in orthodontic technology, Dr. Shetty
                continues to redefine modern orthodontic care with innovation and expertise.
              </motion.p>
            </div>

            {/* Stats strip */}
            <motion.div
              className="about-stats"
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {[
                { stat: '9K+', label: 'Patients' },
                { stat: '200+', label: 'Keynote Lectures' },
                { stat: '23+', label: 'Years of Practice' },
                { stat: '2+', label: 'Patents' },
              ].map(({ stat, label }) => (
                <motion.div key={label} className="about-stat-item" variants={fadeUp} transition={springMed}>
                  <strong>{stat}</strong>
                  <span>{label}</span>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* ── Chat preview ────────────────────────────────────────── */}
        <section className="dark-section-alt">
          <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center' }}>
            <motion.div
              style={{ flex: '1 1 280px' }}
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.span variants={fadeUp} transition={springMed} className="section-label">
                See it in action
              </motion.span>
              <motion.h2
                variants={fadeUp}
                transition={springMed}
                className="section-headline"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}
              >
                Real questions,<br />real answers.
              </motion.h2>
              <motion.p variants={fadeUp} transition={springMed} className="section-body" style={{ marginTop: '12px' }}>
                Patients get instant, accurate answers instead of waiting for the clinic to open.
                Fewer calls, more confidence.
              </motion.p>
              <motion.a
                href="/chat"
                className="btn btn-primary"
                style={{ marginTop: '32px', display: 'inline-flex' }}
                variants={fadeUp}
                transition={springMed}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Try it now →
              </motion.a>
            </motion.div>

            <motion.div
              className="dark-chat-preview"
              style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              variants={stagger(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <p style={{ fontWeight: 700, fontSize: '0.7rem', color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Example conversation
              </p>
              {CHAT_PREVIEW.map((msg, i) => (
                <motion.div
                  key={i}
                  className={msg.role === 'user' ? 'dark-bubble-user' : 'dark-bubble-ai'}
                  variants={{
                    hidden: { opacity: 0, x: msg.role === 'user' ? 20 : -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={springMed}
                >
                  {msg.text}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Clinic Gallery ──────────────────────────────────────── */}
        <section className="dark-section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.span variants={fadeUp} transition={springMed} className="section-label">
                Inside the clinic
              </motion.span>
              <motion.h2 variants={fadeUp} transition={springMed} className="section-headline">
                Where your smile begins.
              </motion.h2>
              <motion.p variants={fadeUp} transition={springMed} className="section-body">
                A premium space designed around patient comfort — Khar West, Mumbai.
              </motion.p>
            </motion.div>

            <motion.div
              className="clinic-gallery-grid"
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {GALLERY.map((img, i) => (
                <motion.div
                  key={i}
                  className="clinic-gallery-item"
                  variants={fadeUp}
                  transition={springMed}
                  whileHover={{ scale: 1.02, transition: springFast }}
                  onClick={() => setLightboxIndex(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${img.caption}`}
                  onKeyDown={e => e.key === 'Enter' && setLightboxIndex(i)}
                >
                  <img src={img.src} alt={img.caption} loading="lazy" />
                  <div className="clinic-gallery-overlay">
                    <div>
                      <p className="clinic-gallery-caption">{img.caption}</p>
                      <p className="clinic-gallery-label">{img.label}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Languages ───────────────────────────────────────────── */}
        <section id="languages" className="dark-section">
          <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.span
                variants={fadeUp}
                transition={springMed}
                className="section-label"
                style={{ display: 'block', textAlign: 'center' }}
              >
                23+ Languages
              </motion.span>
              <motion.h2 variants={fadeUp} transition={springMed} className="section-headline" style={{ textAlign: 'center' }}>
                Speak to us in your language
              </motion.h2>
              <motion.p variants={fadeUp} transition={springMed} className="section-body" style={{ margin: '0 auto 40px', textAlign: 'center', maxWidth: '440px' }}>
                The AI understands and responds naturally — no need to switch to English.
              </motion.p>
            </motion.div>

            <motion.div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}
              variants={stagger(0.03)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {LANGUAGES.map(lang => (
                <motion.span
                  key={lang}
                  className="dark-lang-badge"
                  variants={fadeUp}
                  transition={springFast}
                  whileHover={{ scale: 1.06, y: -2, transition: springFast }}
                >
                  {lang}
                </motion.span>
              ))}
            </motion.div>
            <p style={{ fontSize: '0.78rem', color: '#2e2e2e' }}>Powered by Sarvam AI — built for India</p>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section className="cta-orange">
          <motion.div
            style={{ maxWidth: '560px', margin: '0 auto' }}
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.h2 variants={fadeUp} transition={springMed}>
              Your smile starts<br />with one question.
            </motion.h2>
            <motion.p variants={fadeUp} transition={springMed}>
              Book a free consultation, or ask the AI first — no commitment, no waiting.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={springMed}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <MagneticWrapper strength={0.2}>
                <BookingButton label="Book Consultation →" className="btn btn-white" />
              </MagneticWrapper>
              <motion.a
                href="/chat"
                className="btn-white-outline"
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.97 }}
                transition={springFast}
              >
                Ask AI first
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Clinic Info ─────────────────────────────────────────── */}
        <section id="clinic" className="dark-section">
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.span variants={fadeUp} transition={springMed} className="section-label">
                Visit us
              </motion.span>
              <motion.h2 variants={fadeUp} transition={springMed} className="section-headline" style={{ marginBottom: '40px' }}>
                The clinic
              </motion.h2>
            </motion.div>

            <motion.div
              className="dark-info-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={springMed}
            >
              <h3 style={{ fontSize: '1.2rem', color: '#f0ede8', marginBottom: '4px' }}>{CLINIC_INFO.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#4a4a4a', marginBottom: '0' }}>
                Dr. {CLINIC_INFO.doctor} · Clear Aligner Specialist
              </p>

              <div style={{ height: '1px', background: '#1c1c1c', margin: '24px 0' }} />

              <motion.div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '36px' }}
                variants={stagger(0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={fadeUp} transition={springMed}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3a3a3a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Address
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#a0a09a', lineHeight: 1.6, marginBottom: '6px' }}>{CLINIC_INFO.address}</p>
                  <a href={CLINIC_INFO.mapUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#f27d2d', textDecoration: 'none' }}>
                    Get directions →
                  </a>
                </motion.div>
                <motion.div variants={fadeUp} transition={springMed}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3a3a3a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Contact
                  </p>
                  <p style={{ marginBottom: '6px' }}>
                    <a href={`tel:${CLINIC_INFO.phone.replace(/\s/g, '')}`} style={{ fontSize: '0.9rem', color: '#a0a09a', textDecoration: 'none' }}>
                      {CLINIC_INFO.phone}
                    </a>
                  </p>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#f27d2d', textDecoration: 'none' }}>
                    WhatsApp →
                  </a>
                </motion.div>
                <motion.div variants={fadeUp} transition={springMed}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3a3a3a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Hours
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#a0a09a', marginBottom: '6px' }}>{CLINIC_INFO.hours}</p>
                  <a href={CLINIC_INFO.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#f27d2d', textDecoration: 'none' }}>
                    {CLINIC_INFO.website.replace('https://', '')} →
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="dark-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p className="dark-footer-brand">{CLINIC_INFO.name} · Dr. {CLINIC_INFO.doctor}</p>
            <a href={CLINIC_INFO.website} target="_blank" rel="noopener noreferrer">
              {CLINIC_INFO.website.replace('https://', '')}
            </a>
          </div>
          <p style={{ maxWidth: '380px', textAlign: 'right' }}>
            © {new Date().getFullYear()} {CLINIC_INFO.name}. AI assistant provides information only — not a substitute for professional dental advice.
          </p>
        </footer>

        {/* ── Lightbox ────────────────────────────────────────────── */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              className="lightbox-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setLightboxIndex(null)}
            >
              {/* Prev */}
              <motion.button
                className="lightbox-nav lightbox-nav-prev"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + GALLERY.length) % GALLERY.length) }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.9 }}
                transition={springFast}
                aria-label="Previous photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </motion.button>

              {/* Image */}
              <motion.div
                className="lightbox-content"
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.93, opacity: 0 }}
                transition={springMed}
                onClick={e => e.stopPropagation()}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={lightboxIndex}
                    src={GALLERY[lightboxIndex].src}
                    alt={GALLERY[lightboxIndex].caption}
                    className="lightbox-img"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
                <div className="lightbox-caption-bar">
                  <p className="lightbox-caption-title">{GALLERY[lightboxIndex].caption}</p>
                  <p className="lightbox-caption-sub">{GALLERY[lightboxIndex].label}</p>
                  <div className="lightbox-dots">
                    {GALLERY.map((_, i) => (
                      <motion.button
                        key={i}
                        className={`lightbox-dot${i === lightboxIndex ? ' active' : ''}`}
                        onClick={e => { e.stopPropagation(); setLightboxIndex(i) }}
                        whileHover={{ scale: 1.3 }}
                        transition={springFast}
                        aria-label={`Go to photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Next */}
              <motion.button
                className="lightbox-nav lightbox-nav-next"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % GALLERY.length) }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.9 }}
                transition={springFast}
                aria-label="Next photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </motion.button>

              {/* Close */}
              <motion.button
                className="lightbox-close"
                onClick={() => setLightboxIndex(null)}
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(255,255,255,0.15)', transition: springFast }}
                whileTap={{ scale: 0.9 }}
                transition={springFast}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MotionConfig>
  )
}
