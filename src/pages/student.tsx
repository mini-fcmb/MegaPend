// StudentDashboard.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "boxicons/css/boxicons.min.css";
import "./student.css";

interface LocationState {
  fullName?: string;
  email?: string;
  studentSubjects?: string[];
}

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  const [studentName, setStudentName] = useState("Student Name");
  const [studentEmail, setStudentEmail] = useState("student@example.com");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (state) {
      setStudentName(state.fullName || "Student Name");
      setStudentEmail(state.email || "student@example.com");
    }
  }, [state]);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/getstarted");
  };

  const menuItems = [
    { id: "inbox", label: "Notifications", icon: "bx-envelope", count: 9 },
    { id: "subjects", label: "My Subjects", icon: "bx-book" },
    { id: "assignments", label: "Assignments", icon: "bx-clipboard" },
    { id: "notes", label: "Notes", icon: "bx-notepad" },
    { id: "quizzes", label: "Quizzes", icon: "bx-help-circle" },
    {
      id: "chatbot",
      label: "Chatbot",
      icon: "bx-bot",
      action: () => navigate("/student-dashboard/chatbot"),
    },
    { id: "logout", label: "Logout", icon: "bx-log-out", action: handleLogout },
  ];

  const announcements = [
    {
      id: 1,
      from: "Math Teacher",
      subject: "Homework Due Tomorrow",
      preview: "Don't forget to submit your algebra worksheet...",
      date: "Yesterday",
      starred: true,
    },
    {
      id: 2,
      from: "Proton Official",
      subject: "You only have three more days to upgrade...",
      preview: "Get more storage for free!",
      date: "Thursday",
      official: true,
    },
    {
      id: 3,
      from: "Science Dept",
      subject: "Lab Report Guidelines",
      preview: "Follow the new format for submissions",
      date: "Wednesday",
    },
    {
      id: 4,
      from: "GitHub",
      subject: "[mini-tcmb/MegaPend] Possible valid secrets detected",
      preview: "Review your repository settings",
      date: "Oct 30",
      alert: true,
    },
  ];

  return (
    <div className="megapend-student-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">MegaPend</span>
            <span className="role">Student Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${selectedTab === item.id ? "active" : ""}`}
              onClick={() => {
                setSelectedTab(item.id);
                item.action?.();
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <i className={`bx ${item.icon} icon`}></i>
              <span className="label">{item.label}</span>
              {item.count && <span className="count">{item.count}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{studentName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="name">{studentName}</div>
              <div className="email">{studentEmail}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - PERFECTLY CENTERED */}
      <div className="main-content">
        <header className="top-bar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bx bx-menu"></i>
          </button>

          <div className="search-bar">
            <i className="bx bx-search search-icon"></i>
            <input
              type="text"
              placeholder="Search messages, subjects, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="new-message">
            <i className="bx bx-plus"></i> New message
          </button>
        </header>

        <div className="inbox-container">
          <div className="inbox-header">
            <h2>Inbox</h2>
            <span className="count-total">{announcements.length} messages</span>
          </div>

          <div className="message-list">
            {announcements.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${msg.starred ? "starred" : ""}`}
              >
                <div className="checkbox"></div>
                <div className="star">
                  <i
                    className={`bx ${msg.starred ? "bxs-star" : "bx-star"}`}
                  ></i>
                </div>
                <div className="sender">
                  {msg.official && <span className="official-badge">M</span>}
                  {msg.from}
                </div>
                <div className="subject-preview">
                  <span className="subject">{msg.subject}</span>
                  <span className="preview"> - {msg.preview}</span>
                </div>
                <div className="date">{msg.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bottom-bar">
          <span>MegaPend © 2025 • Secure & Private • Built for Students</span>
        </div>
      </div>

      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}
