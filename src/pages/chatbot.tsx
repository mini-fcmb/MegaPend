import React, { useState } from "react";
import "./chatbot.css";

function App() {
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("grok_api_key") || ""
  );

  const saveApiKey = () => {
    localStorage.setItem("grok_api_key", apiKey);
    setShowApiModal(false);
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="new-chat">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search Ctrl+K"
            className="search-input"
          />
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <div className="nav-items">
          <div className="nav-item">Chat</div>
          <div className="nav-item">Voice</div>
          <div className="nav-item">Imagine</div>
          <div className="nav-item">Projects</div>
          <div className="nav-item">History</div>
        </div>

        <div className="history">
          <div className="history-title">Today</div>
          <div className="history-item active">
            Building Teacher's Dashboard
          </div>
          <div className="history-item">Chatbot UI Design Update</div>

          <div className="history-title">Yesterday</div>
          <div className="history-item">Synchronize Navbar and Sidebar</div>
          <div className="history-item">Casual coding chat, UI tweaks</div>
          <div className="history-item">Teacher Dashboard Message</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        {/* TOP TABS */}
        <div className="top-bar">
          <div className="tab-group">
            <div className="tab active">
              Building Teacher's Dashboard
              <svg
                className="tab-close"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <div className="tab">
              Chatbot project discussion
              <svg
                className="tab-close"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <div className="tab">
              MegaPend-Auth - Database
              <svg
                className="tab-close"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <div className="tab">
              Vite + React + TS
              <svg
                className="tab-close"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="chat-area">
          <div className="chat-content">
            <div className="hero">
              <h1>How can Grok help?</h1>
            </div>

            <div className="code-block">
              <div className="code-header">
                <div className="avatar">G</div>
                <span>Student List</span>
                <span style={{ color: "#666" }}>
                  &amp;&amp; activeTab !== "Announcement" &amp;&amp; (
                </span>
              </div>
              <div className="empty-box">
                <div className="empty-text">
                  <span style={{ color: "#fff" }}>empty</span> text-white
                  text-center text-2xl
                </div>
                <p style={{ color: "#888", marginTop: "16px" }}>
                  <span className="empty-hint">activeTab</span> coming soon!
                </p>
              </div>
              <div style={{ marginTop: "20px", color: "#666" }}>
                &nbsp;&nbsp;)
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button className="think-harder">Think Harder</button>
            </div>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="input-area">
          <div className="input-container">
            <div className="input-bar">
              <div className="icon-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <input type="text" placeholder="How can Grok help?" />
              <div className="icon-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
              </div>
              <div className="icon-btn send-btn">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
            </div>

            <div className="input-footer">
              <div>
                <span
                  className="api-key-link"
                  onClick={() => setShowApiModal(true)}
                >
                  Set API Key
                </span>
                <span style={{ marginLeft: "16px" }}>
                  Photo/Video/File upload 100% WORKING
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span>Auto</span>
                <div className="toggle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API KEY MODAL */}
      {showApiModal && (
        <div className="modal-backdrop" onClick={() => setShowApiModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Enter Your API Key</h2>
            <input
              type="password"
              placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXX"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                className="modal-btn cancel"
                onClick={() => setShowApiModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn save" onClick={saveApiKey}>
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
