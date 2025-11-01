// src/components/Chatbot.tsx
import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css"; // Make sure to create or update this CSS

interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp?: string;
}

interface ChatbotProps {
  theme: "light" | "dark";
}

const Chatbot: React.FC<ChatbotProps> = ({ theme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      text: "Hello! How can I help you with your studies today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const typingId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: typingId, text: "Typing...", sender: "bot" },
    ]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                ...msg,
                text: `Echo: ${userMessage.text}`,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }
            : msg
        )
      );
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className={`chatbot-page ${theme}`}>
      {/* Sidebar */}
      <aside
        className={`chatbot-sidebar ${sidebarVisible ? "visible" : "hidden"}`}
      >
        <div className="chatbot-logo">
          <div className="logo-icon">EF</div>
          <div className="logo-text">
            <h1>EduFlow</h1>
            <p>v1.0</p>
          </div>
        </div>

        <nav className="chatbot-nav">
          <div className="nav-item active">Home</div>
          <div className="nav-item">Topics</div>
          <div className="nav-item">Library</div>
          <div className="nav-item">History</div>
        </nav>

        <div className="chatbot-prompts">
          <p>Ask a math question.</p>
          <p>Explain a concept.</p>
          <p>Give an example problem.</p>
          <p>Check my answer.</p>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="chatbot-main">
        <header className="chatbot-header">
          <div className="title">EduFlow AI</div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarVisible((prev) => !prev)}
          >
            ☰
          </button>
        </header>

        <section className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}-message`}>
              {msg.text}
              {msg.timestamp && (
                <div className="timestamp">{msg.timestamp}</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </section>

        <footer className="chatbot-input-area">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="send-btn" onClick={sendMessage}>
            ➤
          </button>
        </footer>
      </main>
    </div>
  );
};

export default Chatbot;
