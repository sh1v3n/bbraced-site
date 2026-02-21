"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const languages = [
  "Auto Detect",
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Odia",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Santali",
  "Kashmiri",
  "Nepali",
  "Sindhi",
  "Dogri",
  "Konkani",
  "Manipuri (Meitei)",
  "Bodo"
];

const clinic = {
  name: "b.Braced Clinic",
  doctor: "Dr. Pravin Shetty",
  phone: "+91 93217 39096",
  phoneLink: "tel:+919321739096",
  whatsappLink: "https://wa.me/919321739096",
  address:
    "1st floor, Anand Vihar co.soc, 20th B Rd, corner, Ambedkar Colony, Khar West, Mumbai, Maharashtra 400052",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=1st%20floor%2C%20Anand%20Vihar%20co.soc%2C%2020th%20B%20Rd%2C%20corner%2C%20Ambedkar%20Colony%2C%20Khar%20West%2C%20Mumbai%2C%20Maharashtra%20400052",
  website: "https://invisiblebraces.in"
};

const suggested = [
  "How long should I wear aligners daily?",
  "What if I skip a day?",
  "Can I drink chai with aligners?",
  "When do I change to the next tray?"
];

const speechLocaleMap = {
  English: "en-IN",
  Hindi: "hi-IN",
  Bengali: "bn-IN",
  Telugu: "te-IN",
  Marathi: "mr-IN",
  Tamil: "ta-IN",
  Urdu: "ur-IN",
  Gujarati: "gu-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Odia: "or-IN",
  Punjabi: "pa-IN",
  Assamese: "as-IN",
  Maithili: "mai-IN",
  Santali: "sat-IN",
  Kashmiri: "ks-IN",
  Nepali: "ne-IN",
  Sindhi: "sd-IN",
  Dogri: "doi-IN",
  Konkani: "kok-IN",
  "Manipuri (Meitei)": "mni-IN",
  Bodo: "brx-IN"
};

export default function ChatClient() {
  const [selectedLanguage, setSelectedLanguage] = useState("Auto Detect");
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hello, I'm Dr. Pravin Shetty's AI. Ask me anything about clear aligners, treatment time, care, or scheduling."
    }
  ]);
  const recognitionRef = useRef(null);

  const hasSpeech = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    );
  }, []);

  useEffect(() => {
    if (!hasSpeech) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang =
      speechLocaleMap[selectedLanguage] || "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [hasSpeech, selectedLanguage]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const nextMessages = [
      ...messages,
      { role: "user", text: input.trim() }
    ];
    setMessages(nextMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nextMessages[nextMessages.length - 1].text,
          language: selectedLanguage,
          messages: nextMessages
        })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "Thanks for asking. We will follow up soon."
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, the assistant is having trouble right now."
        }
      ]);
    }
  };

  const toggleRecording = () => {
    if (!hasSpeech || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }
    recognitionRef.current.start();
    setIsRecording(true);
  };

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <div className="brand">
          <div className="brand-logo">
            <img src="/bbraced-logo.svg" alt="b.Braced logo" />
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
            <a href={clinic.whatsappLink}>WhatsApp clinic</a>
            <a href={clinic.mapsLink}>Directions</a>
            <a href={clinic.website}>Clinic website</a>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Language</h3>
          <select
            className="select"
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar-card">
          <h3>Voice input</h3>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={toggleRecording}
            disabled={!hasSpeech}
          >
            {hasSpeech
              ? isRecording
                ? "Listening..."
                : "Start speaking"
              : "Voice not supported"}
          </button>
        </div>

        <div className="cta-emergency">
          Emergency? Call now: <a href={clinic.phoneLink}>{clinic.phone}</a>
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-header">
          <div>
            <h2>Dr. Pravin Shetty&apos;s AI</h2>
            <p className="badge">AI answers • Multilingual support</p>
          </div>
          <a className="btn btn-outline" href="/">
            Back to home
          </a>
        </div>

        <div className="chat-card">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`chat-bubble ${msg.role}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-card">
          <h4>Suggested questions</h4>
          <div className="languages">
            {suggested.map((question) => (
              <button
                type="button"
                key={question}
                className="lang-pill pill-button"
                onClick={() => setInput(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-card">
          <div className="chat-input">
            <input
              placeholder="Ask your question..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>

        <div className="chat-card">
          <small>
            This assistant is for general information and does not replace an in
            person consultation. For urgent issues, contact the clinic.
          </small>
        </div>
      </main>
    </div>
  );
}
