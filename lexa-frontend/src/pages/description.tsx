import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../styles/Description.css";
import { useNavigate } from "react-router-dom";

type Feature = {
  id: string;
  icon: string;
  title: string;
  short: string;
  long: string;
};

const featuresSeed: Feature[] = [
  {
    id: "f1",
    icon: "🧠",
    title: "Adaptive Intelligence",
    short: "Learns from context and personalizes responses over time.",
    long:
      "Lexa models user context across sessions, adapting tone and recommendations. It uses multi-turn understanding and lightweight memory primitives to keep conversations relevant — whether you're drafting an email, debugging code, or planning a presentation.",
  },
  {
    id: "f2",
    icon: "⚡",
    title: "Creative Productivity",
    short: "Turn ideas into structured outputs — fast.",
    long:
      "From brainstorming to full drafts, Lexa helps you ideate, outline, and execute. Generate technical specs, lesson plans, marketing copy, or production-ready code. It understands constraints (length, tone, format) and delivers outputs you can use immediately.",
  },
  {
    id: "f3",
    icon: "🎧",
    title: "Voice & Vision",
    short: "Talk naturally and upload images — Lexa understands both.",
    long:
      "Use voice to converse hands-free and upload screenshots or photos for multimodal understanding. Lexa extracts visual context and weaves it into the response—helpful for design feedback, code review screenshots, and diagrams.",
  },
];

const DescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Typing hero subtitle
  const heroText =
    "A refined AI co-pilot for ideas, learning, and real work — fast, precise, and human-friendly.";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(heroText.slice(0, i));
      i++;
      if (i > heroText.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, []);

  const toggleFeature = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    // optional: scroll into view smoothly when expanding
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 220);
  };

  return (
    <div className="lexa-onepage">
      {/* Live animated background (aurora + particles) */}
      <div className="aurora-bg" aria-hidden />
      <div className="particles" aria-hidden />

      {/* HERO */}
      <header className="hero-section">
        <Container className="hero-inner text-center">
          <h1 className="hero-title">
            Meet <span className="hero-gradient">Lexa AI</span>
          </h1>
          <p className="hero-subtitle" aria-live="polite">
            {typed}
            <span className="hero-caret" aria-hidden>
              |
            </span>
          </p>

          <div className="hero-ctas">
            <Button className="btn-primary-lexa" onClick={() => navigate("/login")}>
              Get Started
            </Button>
            <Button className="btn-outline-lexa" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </div>
        </Container>
      </header>

      {/* FEATURES (single page with inline expand) */}
      <main className="features-section" id="features">
        <Container>
          <h2 className="features-heading">Capabilities</h2>
          <p className="features-sub">
            Powerful multimodal intelligence, built for real work. Click any card to learn more.
          </p>

          <Row className="g-4 justify-content-center">
            {featuresSeed.map((f) => {
              const isOpen = expanded === f.id;
              return (
                <Col key={f.id} md={8} lg={6}>
                  <article
                    id={f.id}
                    className={`feature-article ${isOpen ? "open" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFeature(f.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") toggleFeature(f.id);
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`${f.id}-content`}
                  >
                    <div className="feature-head">
                      <div className="feature-icon" aria-hidden>
                        {f.icon}
                      </div>
                      <div className="feature-meta">
                        <h3 className="feature-title">{f.title}</h3>
                        <p className="feature-short">{f.short}</p>
                      </div>
                      <div className="feature-chevron" aria-hidden>
                        {isOpen ? "▲" : "▼"}
                      </div>
                    </div>

                    <div
                      id={`${f.id}-content`}
                      className="feature-body"
                      style={{
                        // animated expand using maxHeight
                        maxHeight: isOpen ? "500px" : "0px",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="feature-long">{f.long}</p>

                      {/* Optional extra detailed bullets (example) */}
                      <ul className="feature-points">
                        <li>Context-aware answers across sessions</li>
                        <li>Concise summaries and long-form drafts</li>
                        <li>Multimodal inputs: text, voice, images</li>
                      </ul>

                      <div className="feature-actions">
                        <Button className="btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); navigate("/signup"); }}>
                          Try Lexa — Free
                        </Button>
                        <Button className="btn-sm btn-outline-ghost" onClick={(e) => { e.stopPropagation(); toggleFeature(f.id); }}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </article>
                </Col>
              );
            })}
          </Row>
        </Container>
      </main>

      {/* ABOUT / FOOTER */}
      <section className="about-section">
        <Container className="text-center">
          <h3>Made for creators, builders & curious minds</h3>
          <p className="about-copy">
            Lexa is built to augment human thinking — fast iterations, clear explanations,
            and deep contextual memory when you need it. Privacy-first by design.
          </p>
        </Container>
      </section>

      <footer className="site-footer text-center">
        <Container>
          <small>© {new Date().getFullYear()} Lexa AI — Crafted with precision.</small>
        </Container>
      </footer>
    </div>
  );
};

export default DescriptionPage;
