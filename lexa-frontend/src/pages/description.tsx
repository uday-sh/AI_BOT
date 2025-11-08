import React, { useEffect, useState } from "react";
import { Container, Button, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../App.css";

const DescriptionPage: React.FC = () => {
  const [typedText, setTypedText] = useState("");
  const navigate = useNavigate();

  const fullText = "Your Personal AI Assistant for Conversations, Learning, and Productivity.";

  // Typing effect for intro
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // Always go to login
  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="description-wrapper d-flex align-items-center justify-content-center flex-column text-center px-3">
      <Container>
        {/* Title */}
        <h1 className="lexa-main-title fw-bold mb-3 animate-fade">
          Welcome to <span className="text-gradient">Lexa AI 🤖</span>
        </h1>

        {/* Typing effect */}
        <p className="lexa-subtext mb-5">{typedText}</p>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 mb-5">
          <Button
            variant="primary"
            size="lg"
            className="rounded-pill fw-semibold px-4 shadow-sm hover-glow"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
          <Button
            variant="outline-primary"
            size="lg"
            className="rounded-pill fw-semibold px-4 hover-outline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>

        {/* Feature cards */}
        <Row className="justify-content-center">
          {[
            {
              icon: "💬",
              title: "Smart Conversations",
              desc: "Chat naturally — Lexa adapts to your tone, context, and needs for fluid conversations.",
            },
            {
              icon: "⚙️",
              title: "Productivity Tools",
              desc: "Summarize, brainstorm, and organize — Lexa boosts your efficiency like a digital co-pilot.",
            },
            {
              icon: "🎙",
              title: "Voice Interaction",
              desc: "Speak to Lexa hands-free. Smart voice recognition lets you chat without typing.",
            },
          ].map((f, i) => (
            <Col md={4} sm={10} key={i} className="mb-4">
              <Card className="feature-card text-start shadow-sm border-0">
                <Card.Body>
                  <div className="feature-icon mb-3">{f.icon}</div>
                  <Card.Title className="fw-bold">{f.title}</Card.Title>
                  <Card.Text className="text-muted">{f.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Footer */}
        <footer className="mt-5 text-muted small">
          © 2025 <span className="fw-semibold text-primary">Lexa AI</span> • Redefining Intelligence
        </footer>
      </Container>
    </div>
  );
};

export default DescriptionPage;
