// StudentDashboard.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
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
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (state) {
      setStudentName(state.fullName || "Student Name");
      setStudentEmail(state.email || "student@example.com");
      setStudentSubjects(state.studentSubjects || []);
    }
  }, [state]);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/getstarted");
  };

  const menuItems = [
    { id: "inbox", label: "Notifications", icon: "✉️", count: 9 },
    { id: "subjects", label: "My Subjects", icon: "📚" },
    { id: "assignments", label: "Assignments", icon: "📋" },
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "quizzes", label: "Quizzes", icon: "❓" },
    { id: "chatbot", label: "Chatbot", icon: "💬", action: () => navigate("/student-dashboard/chatbot") },
    { id: "logout", label: "Logout", icon: "🚪", action: handleLogout },
  ];

  const announcements = [
    { id: 1, from: "Math Teacher", subject: "Homework Due Tomorrow", preview: "Don't forget to submit your algebra worksheet...", date: "Yesterday", starred: true },
    { id: 2, from: "Proton Official", subject: "You only have three more days to upgrade...", preview: "Get more storage for free!", date: "Thursday", official: true },
    { id: 3, from: "Science Dept", subject: "Lab Report Guidelines", preview: "Follow the new format for submissions", date: "Wednesday" },
    { id: 4, from: "GitHub", subject: "[mini-tcmb/MegaPend] Possible valid secrets detected", preview: "Review your repository settings", date: "Oct 30", alert: true },
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
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${selectedTab === item.id ? "active" : ""}`}
              onClick={() => {
                setSelectedTab(item.id);
                item.action?.();
                if (window.innerWidth <= 768) setSidebarOpen(false);
              }}
            >
              <span className="icon">{item.icon}</span>
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

      {/* Main Content - CENTERED */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search messages, subjects, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="new-message">+ New message</button>
        </header>

        {/* Inbox Area */}
        <div className="inbox-container">
          <div className="inbox-header">
            <h2>Inbox</h2>
            <span className="count-total">{announcements.length} messages</span>
          </div>

          <div className="message-list">
            {announcements.map(msg => (
              <div key={msg.id} className={`message-row ${msg.starred ? "starred" : ""}`}>
                <div className="checkbox"></div>
                <div className="star">⭐</div>
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

        {/* Bottom Bar */}
        <div className="bottom-bar">
          <span>MegaPend © 2025 • Secure & Private • Built for Students</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}