import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Col,
  Button,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import "./App.css";
import "./styles/Description.css";


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

  // ✅ Scroll behavior refs
  const isAutoScroll = useRef(true);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // ============================
  // Scroll Fix (ChatGPT behavior)
  // ============================
  const handleScroll = () => {
    const el = chatBodyRef.current;
    if (!el) return;
    // If user is near bottom (within 150px)
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    isAutoScroll.current = nearBottom;
  };

  const scrollToBottom = (smooth = true) => {
    const el = chatBodyRef.current;
    if (!el) return;
    if (isAutoScroll.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollToBottom(true), 60);
    return () => clearTimeout(t);
  }, [activeChat?.messages?.length]);

  // ============================
  // Speech recognition setup
  // ============================
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
        const transcript =
          event.results[event.results.length - 1][0].transcript.trim();
        transcriptRef.current = transcript;
        setInput(transcript);

        if (silenceTimer) clearTimeout(silenceTimer);

        silenceTimer = setTimeout(() => {
          if (transcriptRef.current && transcriptRef.current.length > 0) {
            recognitionRef.current?.stop();
            setListening(false);
            setProcessingVoice(true);

            setTimeout(() => {
              const form = document.querySelector("form");
              if (form)
                form.dispatchEvent(new Event("submit", { bubbles: true }));
            }, 150);

            transcriptRef.current = "";
            setTimeout(() => setProcessingVoice(false), 1000);
          }
        }, 3500);
      };

      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      transcriptRef.current = "";
      setListening(true);
      setProcessingVoice(false);
      try {
        recognitionRef.current.start();
      } catch {}
    } else {
      alert("🎤 Speech recognition not supported in this browser.");
    }
  };

  // ============================
  // Load chats
  // ============================
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
        const newChat: ChatPreview = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
        };
        setChats([newChat]);
        setActiveChatId(newChat.id);
      }
    } catch {
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

  // ============================
  // Type-out animation
  // ============================
  const typeOutResponse = (text: string, updateCallback: (s: string) => void) => {
    const words = text.split(" ");
    let index = 0;
    let displayText = "";
    const revealWord = () => {
      if (index < words.length) {
        displayText += (index === 0 ? "" : " ") + words[index];
        updateCallback(displayText.trim());
        index++;
        setTimeout(revealWord, 40 + Math.random() * 40);
      }
    };
    revealWord();
  };

  // ============================
  // Send message
  // ============================
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMsg: Message = { role: "user", content: text };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
      )
    );
    setInput("");
    setLoading(true);
    scrollToBottom(false);

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

      const finalReply =
        reply.trim() !== ""
          ? reply
          : "⚠️ Lexa didn’t respond properly, try again later.";

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                messages: [...c.messages, { role: "bot", content: "" }],
              }
            : c
        )
      );

      typeOutResponse(finalReply, (partial) => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  messages: c.messages.map((m, idx) =>
                    idx === c.messages.length - 1
                      ? { ...m, content: partial }
                      : m
                  ),
                }
              : c
          )
        );
        scrollToBottom(true);
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { role: "bot", content: "🚨 Server not responding." },
                ],
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // JSX
  // ============================
  return (
    <Container fluid className="chat-root p-0">
      {/* Sidebar */}
      <Col md={3} className="sidebar-gpt d-flex flex-column text-white">
        <div className="sidebar-header-gpt d-flex justify-content-between align-items-center px-3 py-3 border-bottom border-secondary">
          <h5 className="fw-semibold mb-0">Lexa AI</h5>
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-circle border-0 bg-dark-subtle text-white"
            onClick={() => {
              const newChat: ChatPreview = {
                id: Date.now().toString(),
                title: `New Chat #${chats.length + 1}`,
                messages: [],
              };
              setChats((prev) => [newChat, ...prev]);
              setActiveChatId(newChat.id);
            }}
          >
            +
          </Button>
        </div>

        <div className="saved-chats-gpt flex-grow-1 overflow-auto px-3 py-2">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`chat-item-gpt p-2 px-3 rounded-3 mb-2 ${
                  activeChatId === chat.id ? "active-chat-gpt" : ""
                }`}
              >
                <i className="bi bi-chat-left-text me-2"></i>
                <span className="chat-title">{chat.title}</span>
              </div>
            ))
          ) : (
            <p className="text-secondary small text-center mt-3">
              No conversations yet.
            </p>
          )}
        </div>

        <div className="sidebar-footer-gpt border-top border-secondary py-3 px-3 small d-flex justify-content-between">
          <span>👤 {username}</span>
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-pill px-3 fw-semibold"
            onClick={() => {
              localStorage.removeItem("lexaUser");
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </div>
      </Col>

      {/* Chat Area */}
      <Col md={9} className="chat-area d-flex flex-column">
        <div
          className="chat-body flex-grow-1 overflow-auto px-4 py-3"
          ref={chatBodyRef}
        >
          {(activeChat?.messages || []).map((msg, i) => (
            <div
              key={i}
              className={`d-flex mb-3 ${
                msg.role === "user"
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`message-bubble ${
                  msg.role === "user" ? "user-bubble" : "bot-bubble"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input-area border-top p-3 bg-dark-subtle">
          <Form onSubmit={sendMessage}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-pill bg-dark text-white border-secondary"
              />
              <Button
                variant={listening ? "danger" : "outline-light"}
                className="rounded-circle ms-2"
                onClick={startListening}
                type="button"
                disabled={processingVoice}
              >
                {processingVoice ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <i className="bi bi-mic"></i>
                )}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="rounded-circle ms-2"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "➤"}
              </Button>
            </InputGroup>
          </Form>
        </div>
      </Col>
    </Container>
  );
};

export default ChatApp;
