import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  const studentSubjects: string[] = state?.studentSubjects || [];

  const [studentName, setStudentName] = useState<string>(
    state?.fullName || "Student Name"
  );
  const [studentEmail, setStudentEmail] = useState<string>(
    state?.email || "student@example.com"
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [avatarOpen, setAvatarOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleAvatar = () => setAvatarOpen(!avatarOpen);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className={`dashboard ${isDark ? "dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          ✕
        </button>
        <ul>
          <li>Dashboard</li>
          <li>Subjects</li>
          <li>Assignments</li>
          <li>Notes</li>
          <li>Quizzes</li>
          <li>Messages</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <div className="main">
        <div className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>

          <div className="avatar-wrapper" onClick={toggleAvatar}>
            <div className="avatar-placeholder">
              {studentName.charAt(0).toUpperCase()}
            </div>

            {avatarOpen && (
              <div className="avatar-dropdown">
                <p>{studentName}</p>
                <p>{studentEmail}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <h1 className="dashboard-title animate-pulse">Student Dashboard ✨</h1>

        <div className="content-grid">
          <div className="card profile-card">
            <h2>Profile</h2>
            <p>Name: {studentName}</p>
            <p>Email: {studentEmail}</p>
          </div>

          <div className="card subjects-card">
            <h2>Your Subjects</h2>
            {studentSubjects.length ? (
              <ul>
                {studentSubjects.map((subject: string, index: number) => (
                  <li key={index}>{subject}</li>
                ))}
              </ul>
            ) : (
              <p>No subjects assigned yet.</p>
            )}
          </div>

          <div className="card tips-card">
            <h2>Tips & Tricks</h2>
            <ul>
              <li>Check your subjects regularly for new content.</li>
              <li>Click on assignments to submit on time.</li>
              <li>Use notes and quizzes to revise faster.</li>
              <li>Contact your teachers if you have questions.</li>
            </ul>
          </div>

          {[...Array(4)].map((_, index: number) => (
            <div key={index} className="card empty">
              +
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
