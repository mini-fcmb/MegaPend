import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./teacher.css";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (state) {
      setStudentName(state.fullName || "Student Name");
      setStudentEmail(state.email || "student@example.com");
      setStudentSubjects(state.studentSubjects || []);
    }
  }, [state]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleAvatar = () => setAvatarOpen(!avatarOpen);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/getstarted");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`dashboard ${isDark ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          ✕
        </button>
        <h2 className="logo">Student Panel</h2>
        <ul>
          <li onClick={() => navigate("/student-dashboard")}>Dashboard</li>
          <li>My Subjects</li>
          <li>Assignments</li>
          <li>Notes</li>
          <li>Quizzes</li>
          <li
            onClick={() => navigate("/student-dashboard/chatbot")}
            style={{ cursor: "pointer" }}
          >
            💬 Chatbot
          </li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      {/* Main content */}
      <div className="main">
        {/* Top bar */}
        <div className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>

          <h1 className="dashboard-title">Student Dashboard ✨</h1>

          <div className="avatar-wrapper" onClick={toggleAvatar}>
            <div className="avatar-placeholder">
              {studentName.charAt(0).toUpperCase()}
            </div>

            {avatarOpen && (
              <div className="avatar-dropdown">
                <p>{studentName}</p>
                <p>{studentEmail}</p>
                <button>Profile</button>
                <button>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className="content-grid">
          {/* Column 1 - Profile info */}
          <div className="card form-card">
            <h2>My Profile</h2>
            <div className="content-form">
              <p>
                <strong>Name:</strong> {studentName}
              </p>
              <p>
                <strong>Email:</strong> {studentEmail}
              </p>

              <h3 style={{ marginTop: "1rem" }}>My Subjects</h3>
              {studentSubjects.length ? (
                <ul style={{ marginTop: "0.5rem" }}>
                  {studentSubjects.map((subject, index) => (
                    <li key={index}>{subject}</li>
                  ))}
                </ul>
              ) : (
                <p>No subjects assigned yet.</p>
              )}
            </div>
          </div>

          {/* Column 2 - Tips */}
          <div className="card tips-card">
            <h2>Tips & Tricks</h2>
            <ul>
              <li>Check your dashboard regularly for updates.</li>
              <li>Complete assignments before their due date.</li>
              <li>Use notes and quizzes for revision.</li>
              <li>Contact teachers if you have any questions.</li>
            </ul>
          </div>

          {/* Column 3 - Empty placeholders */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card empty">
              +
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
