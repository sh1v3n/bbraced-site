export default function HomePage() {
  return (
    <div>
      <header>
        <div className="top-strip">
          <div className="container top-strip-inner">
            <span>
              <a href="tel:+919321739096">Call: +91 93217 39096</a> ·{" "}
              <a href="https://wa.me/919321739096">WhatsApp</a>
            </span>
          </div>
        </div>
        <div className="container nav">
          <div className="brand">
            <div className="brand-logo">
              <img src="/bbraced-logo.svg" alt="b.Braced logo" />
            </div>
            <div>
              <h1>Pravin Shetty&apos;s AI Team</h1>
              <p className="badge">AI aligner assistant • Multilingual support</p>
            </div>
          </div>
          <div className="hero-actions">
            <a className="btn btn-outline" href="/chat">Try the assistant</a>
            <a className="btn btn-primary" href="https://wa.me/919321739096">
              Book on WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <span className="badge">Powered by trusted clinical guidance</span>
            <h2>
              Clear aligner answers, in your language,{" "}
              <span className="nowrap">from Dr. Pravin Shetty&apos;s team.</span>
            </h2>
            <p>
              b.Braced Aligner Coach is a voice-first AI companion that explains
              clear aligners, aftercare, and treatment expectations. Patients can
              speak naturally and get instant responses in multiple Indian languages.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="/chat">Start chatting</a>
              <a className="btn btn-outline" href="https://wa.me/919321739096">
                WhatsApp Dr. Pravin
              </a>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <span>Multi</span>
                Languages supported
              </div>
              <div className="stat">
                <span>Voice</span>
                Powered guidance
              </div>
              <div className="stat">
                <span>24/7</span>
                Answers on demand
              </div>
            </div>
          </div>
          <div className="hero-card">
            <h3>What patients ask most</h3>
            <div className="chat-bubble">
              “How long will I need to wear aligners every day?”
            </div>
            <div className="chat-bubble">
              “Will aligners affect my speech at work?”
            </div>
            <div className="chat-bubble">
              “What if I lose a tray while traveling?”
            </div>
            <div className="chat-bubble">
              “Can I have tea or coffee with my aligners?”
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Why patients trust b.Braced</h3>
          <div className="features">
            <div className="card">
              <h4>Doctor-led guidance</h4>
              <p>
                Curated by Dr. Pravin Shetty and his clinical team for consistent,
                safe, patient-friendly explanations.
              </p>
            </div>
            <div className="card">
              <h4>Voice and text</h4>
              <p>
                Speak or type naturally. The assistant detects the language and
                responds instantly.
              </p>
            </div>
            <div className="card">
              <h4>Emergency-ready</h4>
              <p>
                A single tap connects patients to your clinic for urgent aligner
                issues and broken trays.
              </p>
            </div>
            <div className="card">
              <h4>Private and secure</h4>
              <p>
                Designed for patient education with minimal data capture and
                clear consent prompts.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Languages supported</h3>
          <p className="language-summary">
            Hindi · English · Marathi · Gujarati +18 more
          </p>
        </section>

        <section className="section">
          <h3 className="section-title">Visit the clinic</h3>
          <div className="clinic-split">
            <div className="clinic-info">
              <div className="card">
                <h4>Address</h4>
                <p>
                  1st floor, Anand Vihar co.soc, 20th B Rd, corner, Ambedkar Colony,
                  Khar West, Mumbai, Maharashtra 400052
                </p>
                <p>
                  <a href="https://www.google.com/maps/search/?api=1&query=1st%20floor%2C%20Anand%20Vihar%20co.soc%2C%2020th%20B%20Rd%2C%20corner%2C%20Ambedkar%20Colony%2C%20Khar%20West%2C%20Mumbai%2C%20Maharashtra%20400052">
                    Get directions
                  </a>
                </p>
              </div>
              <div className="card">
                <h4>Contact</h4>
                <p>Phone: +91 93217 39096</p>
                <p>
                  <a href="tel:+919321739096">Call now</a> ·{" "}
                  <a href="https://wa.me/919321739096">WhatsApp</a>
                </p>
              </div>
              <div className="card">
                <h4>Services</h4>
                <p>
                  Learn about aligner options and care plans on our site.
                </p>
                <p>
                  <a href="https://invisiblebraces.in">invisiblebraces.in</a>
                </p>
              </div>
            </div>
            <div className="clinic-gallery">
              <figure className="clinic-photo tall">
                <img src="/clinic-1.webp" alt="Clinic welcome area" />
              </figure>
              <figure className="clinic-photo medium">
                <img src="/clinic-2.webp" alt="Treatment room" />
              </figure>
              <figure className="clinic-photo short">
                <img src="/clinic-3.webp" alt="Waiting lounge" />
              </figure>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
