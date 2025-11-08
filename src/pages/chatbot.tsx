import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./chatbot.css";

interface Message { sender: "user" | "bot"; text: string; }
interface ChatTopic { id: string; topic: string; messages: Message[]; }

export default function Chatbot() {
  const [chats, setChats] = useState<ChatTopic[]>([
    {
      id: "1",
      topic: "Chatbot project discussion",
      messages: [
        { sender: "bot", text: "Hey Fred! How's it going? Want to continue with your chatbot project today or start something new?" },
        { sender: "user", text: "hi" },
      ],
    },
  ]);
  const [activeChatId, setActiveChatId] = useState("1");
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Swipe to open sidebar
  useEffect(() => {
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX - touchStartX > 100 && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [sidebarOpen]);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user" as const, text: input.trim() };
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMsg] } : c));
    setInput("");

    setTimeout(() => {
      setChats(prev => prev.map(c => c.id === activeChatId ? {
        ...c,
        messages: [...c.messages, { sender: "bot", text: "I'm thinking..." }]
      } : c));
    }, 800);
  };

  const startNewChat = () => {
    const newChat = { id: Date.now().toString(), topic: "New Chat", messages: [] };
    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className="chatgpt-clone">
      {/* Swipe Area */}
      <div className="sidebar-swipe-area" onClick={() => setSidebarOpen(true)} />

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* ... same as before ... */}
        <div className="sidebar-top">
          <button className="new-chat-btn" onClick={startNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>
        <div className="chat-list">
          {chats.map(chat => (
            <div key={chat.id} className={`chat-item ${activeChatId === chat.id ? "active" : ""}`} onClick={() => {
              setActiveChatId(chat.id);
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{chat.topic}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="upgrade-btn">
            <span>Upgrade to Go ∞</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
          <div className="user-menu">
            <div className="user-avatar">F</div>
            <span>Fred</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <div className="chat-container">
          <div className="messages">
            {activeChat.messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="bot-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                    </svg>
                  </div>
                )}
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  {msg.sender === "bot" && i === activeChat.messages.length - 1 && (
                    <div className="feedback">
                      <span>Is this conversation helpful so far?</span>
                      <button>Like</button>
                      <button>Dislike</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="input-area" onSubmit={sendMessage}>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask anything"
                value={input}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              />
              <button type="submit" disabled={!input.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <div className="input-footer">
              <span>ChatGPT can make mistakes. Check important info.</span>
              <div className="voice-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v4" />
                </svg>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Button */}
      {!sidebarOpen && window.innerWidth <= 768 && (
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}