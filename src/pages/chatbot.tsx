import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./chatbot.css";

interface Message {
  sender: "user" | "bot";
  text: string;
  file?: string;
}

interface ChatTopic {
  topic: string;
  messages: Message[];
}

export default function Chatbot() {
  const [chats, setChats] = useState<ChatTopic[]>([
    {
      topic: "Welcome Chat",
      messages: [{ sender: "bot", text: "Hello! How can I help you today?" }],
    },
  ]);
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [logo, setLogo] = useState<string>("");

  const navigate = useNavigate();
  const activeChat = chats[activeChatIndex];

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = { sender: "user", text: input };
    setChats((prev) => {
      const updated = [...prev];
      updated[activeChatIndex].messages.push(newMessage);
      return updated;
    });

    const userMessage = input;
    setInput("");

    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setChats((prev) => {
        const updated = [...prev];
        updated[activeChatIndex].messages.push({
          sender: "bot",
          text: data.reply || "No response",
        });
        return updated;
      });
    } catch {
      setChats((prev) => {
        const updated = [...prev];
        updated[activeChatIndex].messages.push({
          sender: "bot",
          text: "Error: Could not reach API",
        });
        return updated;
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInput(e.target.value);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setChats((prev) => {
        const updated = [...prev];
        updated[activeChatIndex].messages.push({
          sender: "user",
          text: `Uploaded (${type}): ${file.name}`,
          file: reader.result as string,
        });
        return updated;
      });
    };
    reader.readAsDataURL(file);
    setShowFileOptions(false);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const startNewChat = () => {
    const topic = `Chat ${chats.length + 1}`;
    setChats([...chats, { topic, messages: [] }]);
    setActiveChatIndex(chats.length);
  };
  const handleClose = () => navigate("/student-dashboard");

  const fileOptions = [
    { type: "Photo", icon: "bx-image" },
    { type: "Video", icon: "bx-video" },
    { type: "Clips", icon: "bx-film" },
    { type: "Document", icon: "bx-file" },
  ];

  return (
    <div className="chatbot-container">
      <button className="close-chat-btn" onClick={handleClose}>
        <i className="bx bx-x"></i>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="logo-toggle-container">
          {sidebarOpen ? (
            <>
              <label className="logo-circle">
                {logo ? <img src={logo} alt="logo" /> : <span>Logo</span>}
                <input
                  type="file"
                  onChange={handleLogoUpload}
                  style={{ display: "none" }}
                />
              </label>
              <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                <i className="bx bx-left-arrow-alt"></i>
              </button>
            </>
          ) : (
            <button
              className="sidebar-toggle-btn collapsed"
              onClick={toggleSidebar}
            >
              <i className="bx bx-menu"></i>
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            <div className="sidebar-menu">
              <div className="menu-item" onClick={startNewChat}>
                <i className="bx bx-plus menu-icon"></i>
                <span className="menu-text">New Chat</span>
              </div>
              <div className="menu-item">
                <i className="bx bx-book menu-icon"></i>
                <span className="menu-text">Library</span>
              </div>
              <div className="menu-item">
                <i className="bx bx-folder menu-icon"></i>
                <span className="menu-text">Projects</span>
              </div>
            </div>

            <div className="chat-history-section">
              <h3 className="chat-history-title">Chat History</h3>
              {chats.map((chat, i) => (
                <div
                  key={i}
                  className={`menu-item ${
                    activeChatIndex === i ? "active" : ""
                  }`}
                  onClick={() => setActiveChatIndex(i)}
                >
                  <i className="bx bx-chat menu-icon"></i>
                  <span className="menu-text">{chat.topic}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Chat Area */}
      <main className={`chat-area ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <div className="messages">
          {activeChat.messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text}
              {msg.file && (
                <img src={msg.file} alt="uploaded" className="uploaded-image" />
              )}
            </div>
          ))}
        </div>

        <form className="input-area" onSubmit={sendMessage}>
          <div className="input-wrapper">
            <i className="bx bx-message-rounded input-icon"></i>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={handleChange}
            />
            <div className="upload-wrapper">
              <button
                type="button"
                className="upload-btn"
                onClick={() => setShowFileOptions(!showFileOptions)}
              >
                <i className="bx bx-paperclip"></i>
              </button>

              {showFileOptions && (
                <div className="file-options top-left">
                  {fileOptions.map((option) => (
                    <label key={option.type}>
                      <i className={`bx ${option.icon}`}></i>
                      {option.type}
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, option.type)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="send-btn">
              <i className="bx bx-up-arrow-alt"></i>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
