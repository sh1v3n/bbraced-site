"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import BookingButton from "@/app/components/BookingButton"
import { SUGGESTED_QUESTIONS_BY_STAGE } from "@/lib/clinic-knowledge"

const clinic = {
  name: "b.Braced",
  doctor: "Dr. Pravin Shetty",
  phone: "+91 93217 39096",
  phoneLink: "tel:+919321739096",
  whatsappLink: "https://wa.me/919321739096",
  address: "1st floor, Anand Vihar, 20th B Rd, Khar West, Mumbai 400052",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=1st%20floor%2C%20Anand%20Vihar%20co.soc%2C%2020th%20B%20Rd%2C%20corner%2C%20Ambedkar%20Colony%2C%20Khar%20West%2C%20Mumbai%2C%20Maharashtra%20400052",
  website: "https://invisiblebraces.in"
}

const LANGUAGES = [
  "Auto Detect", "English", "Hindi", "Bengali", "Telugu", "Marathi",
  "Tamil", "Urdu", "Gujarati", "Kannada", "Malayalam", "Odia",
  "Punjabi", "Assamese", "Maithili", "Santali", "Kashmiri", "Nepali",
  "Sindhi", "Dogri", "Konkani", "Manipuri (Meitei)", "Bodo"
]

const SPEECH_LOCALE_MAP = {
  English: "en-IN", Hindi: "hi-IN", Bengali: "bn-IN", Telugu: "te-IN",
  Marathi: "mr-IN", Tamil: "ta-IN", Urdu: "ur-IN", Gujarati: "gu-IN",
  Kannada: "kn-IN", Malayalam: "ml-IN", Odia: "or-IN", Punjabi: "pa-IN",
  Assamese: "as-IN", Maithili: "mai-IN", Santali: "sat-IN", Kashmiri: "ks-IN",
  Nepali: "ne-IN", Sindhi: "sd-IN", Dogri: "doi-IN", Konkani: "kok-IN",
  "Manipuri (Meitei)": "mni-IN", Bodo: "brx-IN"
}

const STAGE_LABELS = {
  new_patient: "New Patient",
  early: "Early · Tray 1–10",
  mid: "Mid · Tray 11–20",
  advanced: "Advanced · Tray 21+",
  completed: "Retainer Phase"
}

// ── Animation config ─────────────────────────────────────────────────────────

const springFast = { type: "spring", stiffness: 500, damping: 40 }
const springMed  = { type: "spring", stiffness: 300, damping: 30 }
const springSlow = { type: "spring", stiffness: 200, damping: 25 }

// ── Helpers ──────────────────────────────────────────────────────────────────

let _msgCounter = 0
const makeMsg = (role, text, extra = {}) => ({
  id: `msg-${++_msgCounter}-${Date.now()}`,
  role, text, time: new Date(), ...extra
})

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ThinkingIndicator() {
  const [phase, setPhase] = useState(0)
  const labels = ["Reviewing your question", "Composing response"]

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="thinking-indicator">
      <div className="thinking-dots">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={phase}
          className="thinking-text"
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.18 }}
        >
          {labels[phase]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }
  return (
    <motion.button
      className="copy-btn"
      onClick={handleCopy}
      title="Copy message"
      whileTap={{ scale: 0.88 }}
      transition={springFast}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.svg
            key="check"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
            transition={springFast}
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
            transition={springFast}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
      <span className="copy-label">{copied ? "Copied!" : "Copy"}</span>
    </motion.button>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ChatClient() {
  const [selectedLanguage, setSelectedLanguage] = useState("Auto Detect")
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [patientStage, setPatientStage] = useState(null)
  const [showStageStep, setShowStageStep] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [messages, setMessages] = useState(() => [
    makeMsg("assistant", "Hello! I'm the AI assistant for b.Braced, Dr. Pravin Shetty's clear aligner clinic. I can help with questions about treatment, care, appointments, and what to expect. What would you like to know?")
  ])

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  const [hasSpeech, setHasSpeech] = useState(false)

  useEffect(() => {
    setHasSpeech("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    const t = setTimeout(() => setMounted(true), 320)
    return () => clearTimeout(t)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
  }, [input])

  // Speech recognition setup
  useEffect(() => {
    if (!hasSpeech) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = SPEECH_LOCALE_MAP[selectedLanguage] || "en-IN"
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(" ")
      setInput(transcript)
    }
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
  }, [hasSpeech, selectedLanguage])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  // Show scroll-to-bottom FAB
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distanceFromBottom > 200)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const now = new Date()
    const userMsg = makeMsg("user", text)
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput("")
    setIsStreaming(true)

    // Streaming placeholder — empty text triggers typing indicator
    const placeholderMsg = makeMsg("assistant", "", { streaming: true })
    setMessages(prev => [...prev, placeholderMsg])
    const placeholderId = placeholderMsg.id

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message: text, messages: nextMessages, patientStage })
      })

      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const data = await res.json()
        setMessages(prev => prev.map(m =>
          m.id === placeholderId
            ? { ...m, text: data.reply || "Sorry, I couldn't get a response.", streaming: false }
            : m
        ))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === placeholderId ? { ...m, text: accumulated, streaming: true } : m
        ))
      }

      setMessages(prev => prev.map(m =>
        m.id === placeholderId
          ? { ...m, text: accumulated || "Sorry, I couldn't get a response.", streaming: false }
          : m
      ))
    } catch (err) {
      if (err.name === "AbortError") return
      setMessages(prev => prev.map(m =>
        m.id === placeholderId
          ? { ...m, text: "Sorry, the assistant is having trouble right now. Please try again or contact the clinic directly.", streaming: false }
          : m
      ))
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const toggleRecording = () => {
    if (!hasSpeech || !recognitionRef.current) return
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestedQuestions = SUGGESTED_QUESTIONS_BY_STAGE[patientStage] ?? SUGGESTED_QUESTIONS_BY_STAGE.new_patient

  // ── Sidebar content (shared between desktop + mobile drawer) ────────────

  const SidebarContent = () => (
    <>
      <div className="brand">
        <div className="brand-logo">
          <img src="/bbraced-logo.png" alt="b.Braced logo" style={{ borderRadius: '6px', background: '#fff', padding: '2px 6px' }} />
        </div>
        <div>
          <h1>b.Braced Coach</h1>
          <small>{clinic.doctor}</small>
        </div>
      </div>

      <div className="sidebar-card">
        <h3>Clinic</h3>
        <small>{clinic.name}</small>
        <div className="sidebar-links">
          <a href={clinic.phoneLink}>{clinic.phone}</a>
          <a href={clinic.whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp clinic</a>
          <a href={clinic.mapsLink} target="_blank" rel="noopener noreferrer">Directions</a>
          <a href={clinic.website} target="_blank" rel="noopener noreferrer">Clinic website</a>
        </div>
      </div>

      <div className="sidebar-card">
        <h3>Language</h3>
        <select
          className="select"
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
        >
          {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
        </select>
      </div>

      <div className="sidebar-card">
        <h3>Voice input</h3>
        <button
          className={`btn btn-primary${isRecording ? " recording" : ""}`}
          style={{ width: "100%" }}
          onClick={() => { toggleRecording(); setDrawerOpen(false) }}
          disabled={!hasSpeech}
        >
          {hasSpeech ? (isRecording ? "🔴 Listening…" : "🎙 Start speaking") : "Voice not supported"}
        </button>
      </div>

      <div className="sidebar-card">
        <BookingButton label="Book Appointment" className="btn btn-primary" style={{ width: "100%" }} />
      </div>

      <div className="cta-emergency">
        Emergency? Call now: <a href={clinic.phoneLink}>{clinic.phone}</a>
      </div>
    </>
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <MotionConfig reducedMotion="user">
      <div className="chat-shell">

        {/* ── Desktop sidebar ──────────────────────────────────────── */}
        <aside className="chat-sidebar">
          <SidebarContent />
        </aside>

        {/* ── Mobile drawer (spring-animated) ─────────────────────── */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            >
              <motion.div
                className="drawer"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 36 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="drawer-handle" />
                <div className="drawer-content">
                  <SidebarContent />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main chat area ───────────────────────────────────────── */}
        <main className="chat-main">
          <div className="chat-header">
            <motion.button
              className="mobile-menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              whileTap={{ scale: 0.9 }}
              transition={springFast}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.button>

            <div style={{ flex: 1 }}>
              <h2>Dr. Pravin Shetty&apos;s AI</h2>
              <p className="badge">AI answers · Multilingual support</p>
            </div>

            <AnimatePresence>
              {patientStage && (
                <motion.span
                  className="badge badge-teal"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={springFast}
                >
                  {STAGE_LABELS[patientStage]}
                </motion.span>
              )}
            </AnimatePresence>

            <a className="btn btn-outline" href="/" style={{ flexShrink: 0 }}>
              ← Home
            </a>
          </div>

          {/* ── Onboarding ↔ Chat (AnimatePresence transition) ─────── */}
          <AnimatePresence mode="wait">
            {patientStage === null ? (

              /* Onboarding */
              <motion.div
                key="onboarding"
                className="chat-messages"
                style={{ justifyContent: "center", alignItems: "center" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={springSlow}
              >
                <motion.div
                  className="onboarding-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ ...springSlow, delay: 0.05 }}
                >
                  <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>
                    Welcome to b.Braced AI
                  </h2>
                  <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                    To give you the most helpful answers, let us know where you are in your aligner journey.
                  </p>

                  <AnimatePresence mode="wait">
                    {!showStageStep ? (
                      <motion.div
                        key="initial"
                        style={{ display: "flex", flexDirection: "column", gap: 12 }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        <motion.button
                          className="btn btn-primary"
                          onClick={() => setPatientStage("new_patient")}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={springFast}
                        >
                          I&apos;m a new patient
                        </motion.button>
                        <motion.button
                          className="btn btn-outline"
                          onClick={() => setShowStageStep(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={springFast}
                        >
                          I&apos;m already in treatment
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="stages"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        <p style={{ fontWeight: 600, marginBottom: 12 }}>Which stage are you at?</p>
                        <motion.div
                          className="stage-pills"
                          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                          initial="hidden"
                          animate="visible"
                        >
                          {[
                            { key: "early", label: "Early (Tray 1–10)" },
                            { key: "mid", label: "Mid (Tray 11–20)" },
                            { key: "advanced", label: "Advanced (Tray 21+)" },
                            { key: "completed", label: "Retainer phase" }
                          ].map(s => (
                            <motion.button
                              key={s.key}
                              className="stage-pill"
                              onClick={() => setPatientStage(s.key)}
                              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                              transition={springFast}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {s.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

            ) : (

              /* Chat view */
              <motion.div
                key="chat"
                style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Messages */}
                <div
                  className="chat-messages"
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                >
                  {!mounted ? (
                    <div className="skeleton-messages">
                      {['72%', '48%', '78%', '42%'].map((w, i) => (
                        <div key={i} className={`skeleton-bubble${i % 2 === 1 ? ' skeleton-user' : ''}`} style={{ width: w }} />
                      ))}
                    </div>
                  ) : null}
                  <AnimatePresence initial={false}>
                    {mounted && messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`message ${msg.role}`}
                        initial={{ opacity: 0, scale: 0.94, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={springFast}
                        layout="position"
                      >
                        <div className="message-inner">
                          <div className="message-bubble">
                            {msg.role === "assistant" ? (
                              <>
                                {msg.streaming && !msg.text ? (
                                  <ThinkingIndicator />
                                ) : (
                                  <>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {msg.text || ""}
                                    </ReactMarkdown>
                                    {msg.streaming && <span className="stream-cursor" />}
                                  </>
                                )}
                              </>
                            ) : (
                              msg.text
                            )}
                          </div>
                          <div className="message-meta">
                            {msg.time && (
                              <span className="message-time">{formatTime(msg.time)}</span>
                            )}
                            {msg.role === "assistant" && !msg.streaming && msg.text && (
                              <CopyButton text={msg.text} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll-to-bottom FAB */}
                <AnimatePresence>
                  {showScrollBtn && (
                    <motion.button
                      className="scroll-fab"
                      onClick={scrollToBottom}
                      aria-label="Scroll to bottom"
                      initial={{ opacity: 0, scale: 0.75, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.75, y: 10 }}
                      transition={springFast}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Input area */}
                <div className="chat-input-area">
                  <motion.div
                    className="suggested-chips"
                    variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                    initial="hidden"
                    animate="visible"
                    key={patientStage}
                  >
                    {suggestedQuestions.map(q => (
                      <motion.button
                        key={q}
                        className="stage-pill"
                        onClick={() => setInput(q)}
                        disabled={isStreaming}
                        variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                        transition={springFast}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </motion.div>

                  <div className="input-row">
                    <textarea
                      ref={textareaRef}
                      className="form-textarea"
                      placeholder="Ask your question… (Shift+Enter for new line)"
                      value={input}
                      rows={1}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isStreaming}
                    />
                    <motion.button
                      className={`voice-btn${isRecording ? " active" : ""}`}
                      onClick={toggleRecording}
                      disabled={!hasSpeech}
                      title={isRecording ? "Stop recording" : "Speak"}
                      whileHover={{ scale: 1.06, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springFast}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="btn btn-primary send-btn"
                      onClick={sendMessage}
                      disabled={isStreaming || !input.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      transition={springFast}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isStreaming ? (
                          <motion.svg
                            key="stop"
                            width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                            initial={{ scale: 0.6, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.6, rotate: 90 }} transition={springFast}
                          >
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </motion.svg>
                        ) : (
                          <motion.svg
                            key="send"
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            initial={{ scale: 0.6, rotate: 90 }} animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.6, rotate: -90 }} transition={springFast}
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>

                  <p className="input-disclaimer">
                    This assistant provides general information only and is not a substitute for professional dental advice. For urgent issues, call the clinic.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
