import { useState, FormEvent, useEffect } from "react";
import { addContent } from "../firebase/contentService";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import { auth } from "../firebase/config";
import "./teacher.css";

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ initialize navigation hook
  const teacherSubjects = location.state?.subjects || [];

  const [teacherName, setTeacherName] = useState("John Doe");
  const [teacherPhoto, setTeacherPhoto] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"note" | "assignment" | "quiz">("note");
  const [subject, setSubject] = useState(teacherSubjects[0] || "");
  const [classLevel, setClassLevel] = useState("SS1");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTeacherName(user.displayName || "Unknown Teacher");
        setTeacherPhoto(user.photoURL || "");
      } else {
        setTeacherName("Guest Teacher");
        setTeacherPhoto("");
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addContent(
        title,
        type,
        subject,
        classLevel,
        description,
        auth.currentUser?.uid || "unknown-teacher"
      );
      alert("Content uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className={`dashboard ${isDark ? "dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          ✕
        </button>
        <ul>
          <li>Dashboard</li>
          <li>
            Kanban <span className="badge">Pro</span>
          </li>
          <li>
            Inbox <span className="badge blue">3</span>
          </li>
          <li>Users</li>
          <li>Products</li>
          <li>Sign In</li>
          <li>Sign Up</li>
        </ul>
      </aside>

      <div className="main">
        <div className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>

          <div className="avatar-wrapper" onClick={toggleAvatar}>
            {teacherPhoto ? (
              <img src={teacherPhoto} alt="Profile" className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}

            {avatarOpen && (
              <div className="avatar-dropdown">
                <p>{teacherName}</p>
                <button>Profile</button>
                <button>Settings</button>
                <button onClick={handleLogout}>Logout</button> {/* ✅ fixed */}
              </div>
            )}
          </div>
        </div>

        <h1 className="dashboard-title animate-pulse">Teacher Dashboard ✨</h1>

        <div className="content-grid">
          <div className="card form-card">
            <h2>Add New Content</h2>
            <form onSubmit={handleSubmit} className="content-form">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="form-row">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="note">Note</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                </select>

                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {teacherSubjects.map((s: string) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Class Level"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                />
              </div>

              <textarea
                placeholder="Type your content, questions, or instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Content"}
              </button>
            </form>
          </div>

          <div className="card tips-card">
            <h2>Tips & Tricks</h2>
            <ul>
              <li>
                Type or paste content directly for notes, assignments, or
                quizzes.
              </li>
              <li>
                Upload files to convert text later (OCR integration soon).
              </li>
              <li>Select the correct class and subject.</li>
              <li>
                Content appears immediately for all students in that class.
              </li>
            </ul>
          </div>

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
