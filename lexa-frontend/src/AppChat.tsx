import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import "./App.css";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

type Message = { role: "user" | "bot"; content: string };
type ChatPreview = { id: string; title: string; messages: Message[] };

const getUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("lexaUser") || "{}");
    return {
      id: user._id || user.id || "guest123",
      name: user.name || "Guest User",
    };
  } catch {
    return { id: "guest123", name: "Guest User" };
  }
};

const API_BASE = "http://localhost:5000/api/chats";

const ChatApp: React.FC = () => {
  const { id: userId, name: username } = getUser();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");

  const activeChat = chats.find((c) => c.id === activeChatId);

  // ========================
  // Speech recognition setup
  // ========================
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.interimResults = false;

      let silenceTimer: ReturnType<typeof setTimeout> | null = null;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        transcriptRef.current = transcript;
        setInput(transcript);

        if (silenceTimer) clearTimeout(silenceTimer);

        // Wait 3.5s silence then auto-send (simulate normal form submit)
        silenceTimer = setTimeout(() => {
          if (transcriptRef.current && transcriptRef.current.length > 0) {
            recognitionRef.current?.stop();
            setListening(false);
            setProcessingVoice(true);

            // small delay to ensure input state propagated
            setTimeout(() => {
              const form = document.querySelector("form");
              if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
            }, 150);

            transcriptRef.current = "";
            setTimeout(() => setProcessingVoice(false), 1000);
          }
        }, 3500);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      transcriptRef.current = "";
      setListening(true);
      setProcessingVoice(false);
      try {
        recognitionRef.current.start();
      } catch {
        // ignore start errors if already started
      }
    } else {
      alert("🎤 Speech recognition not supported in this browser.");
    }
  };

  // ========================
  // Load chats
  // ========================
  const loadChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const chatPreview: ChatPreview = {
          id: Date.now().toString(),
          title: "Previous Chat",
          messages: data,
        };
        setChats([chatPreview]);
        setActiveChatId(chatPreview.id);
      } else {
        // initialize empty chat if backend returns something else
        const newChat: ChatPreview = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
        };
        setChats([newChat]);
        setActiveChatId(newChat.id);
      }
    } catch {
      // fallback: create an empty chat
      const newChat: ChatPreview = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
      console.error("Error loading chats");
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // ========================
  // Scroll helpers
  // ========================
  const scrollToBottom = (smooth = true) => {
    const container = chatBodyRef.current;
    if (!container) return;

    // If there's a last child message element, scroll it into view for best results
    const last = container.querySelector<HTMLElement>(".message-bubble-white:last-child, .message-bubble-white:last-of-type");
    if (last) {
      last.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
      return;
    }

    // fallback: set scrollTop
    if (smooth) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // whenever active chat messages change, scroll to bottom (delayed a bit to allow DOM update)
  useEffect(() => {
    // slight delay to ensure rendering finished
    const t = setTimeout(() => scrollToBottom(true), 60);
    return () => clearTimeout(t);
  }, [activeChat?.messages?.length]);

  // ========================
  // New chat
  // ========================
  const handleNewChat = async () => {
    const newId = Date.now().toString();
    const newChat: ChatPreview = {
      id: newId,
      title: `New Chat #${chats.length + 1}`,
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
    try {
      await fetch(`${API_BASE}/${userId}`, { method: "DELETE" });
    } catch {}
  };

  // ========================
  // Typing animation (aesthetic)
  // ========================
  const typeOutResponse = (text: string, updateCallback: (s: string) => void) => {
    const sentences = text.split(/(?<=[.?!])\s+/);
    let index = 0;
    let displayText = "";

    const revealSentence = () => {
      if (index < sentences.length) {
        displayText += sentences[index] + " ";
        updateCallback(displayText.trim());
        index++;
        setTimeout(revealSentence, 700 + Math.random() * 400);
      }
    };

    revealSentence();
  };

  // ========================
  // Send message
  // ========================
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMsg: Message = { role: "user", content: text };
    // push user message
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg] } : c
      )
    );
    setInput("");
    setLoading(true);

    // ensure UI scrolled to user's message immediately
    setTimeout(() => scrollToBottom(false), 30);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, prompt: text }),
      });

      const data = await res.json();

      const reply =
        data.botMessage ||
        data.reply ||
        data.message ||
        data.output ||
        data.content ||
        "";

      const finalReply = reply.trim() !== "" ? reply : "⚠️ Lexa didn’t respond properly, try again later.";

      // add an empty bot message placeholder (so typing animates into it)
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, messages: [...c.messages, { role: "bot", content: "" }] } : c
        )
      );

      // animate bot response sentence by sentence
      typeOutResponse(finalReply, (partial) => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  messages: c.messages.map((m, idx) =>
                    idx === c.messages.length - 1 ? { ...m, content: partial } : m
                  ),
                }
              : c
          )
        );
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, { role: "bot", content: "🚨 Server not responding or offline." }] }
            : c
        )
      );
    } finally {
      setLoading(false);
      // ensure final scroll after all DOM updates
      setTimeout(() => scrollToBottom(true), 120);
    }
  };

  return (
    <Container fluid className="chat-root-white p-0 vh-100 d-flex flex-column">
      <Row className="g-0 flex-grow-1 h-100">
        {/* SIDEBAR */}
        <Col xs={12} md={3} className="sidebar-white d-flex flex-column shadow-sm">
          <div className="sidebar-header text-center py-4 border-bottom">
            <h4 className="fw-semibold text-dark mb-0">Lexa AI</h4>
            <p className="text-muted small mb-2">Your smart assistant</p>
            <Button variant="outline-primary" className="rounded-pill fw-semibold w-100 mt-2" onClick={handleNewChat}>
              + New Chat
            </Button>
          </div>

          <div className="saved-chats flex-grow-1 overflow-auto px-3 mt-2">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`saved-chat-item-white p-2 px-3 rounded-3 mb-2 ${activeChatId === chat.id ? "active-chat-white" : ""}`}
                >
                  {chat.title}
                </div>
              ))
            ) : (
              <p className="text-muted small text-center mt-4">No saved conversations yet.</p>
            )}
          </div>

          <div className="sidebar-footer border-top py-3 text-center text-secondary small">
            Signed in as <strong className="text-primary">{username}</strong>
          </div>
        </Col>

        {/* CHAT AREA */}
        <Col xs={12} md={9} className="chat-area-white d-flex flex-column">
          {/* Header */}
          <div className="chat-header px-4 py-3 border-bottom text-primary fw-semibold flex-shrink-0">
            {activeChat ? activeChat.title : "Start a conversation with Lexa 🤖"}
          </div>

        
          <div className="chat-body flex-grow-1 overflow-auto px-4 py-3" ref={chatBodyRef}>
            {(activeChat?.messages || []).map((msg, i) => (
              <div key={i} className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                <div className={`message-bubble-white ${msg.role === "user" ? "user-bubble-white" : "bot-bubble-white"}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="message-bubble-white bot-bubble-white">
                  <Spinner animation="grow" size="sm" className="text-primary" />
                  <Spinner animation="grow" size="sm" className="text-primary ms-1" />
                  <Spinner animation="grow" size="sm" className="text-primary ms-1" />
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area border-top p-3 bg-light flex-shrink-0">
            <Form onSubmit={sendMessage}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Type a message or speak..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="chat-input-white rounded-pill border-primary shadow-sm"
                />

              
                <Button
                  variant={listening ? "danger" : "outline-secondary"}
                  className={`rounded-circle voice-btn ms-2 ${listening ? "listening-pulse" : ""}`}
                  onClick={startListening}
                  type="button"
                >
                  <i className="bi bi-mic"></i>
                </Button>

               
                <Button type="submit" variant="primary" className="rounded-circle send-btn-white ms-2" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "➤"}
                </Button>
              </InputGroup>

              {listening && (
                <div className="text-muted small mt-2 text-center">🎤 Listening... (auto-send after 3s silence)</div>
              )}
              {processingVoice && (
                <div className="text-primary small mt-2 text-center">🔄 Processing your voice input...</div>
              )}
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatApp;
