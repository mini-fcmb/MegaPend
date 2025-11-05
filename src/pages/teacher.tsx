// src/pages/teacher.tsx
import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import { addContent } from "../firebase/contentService";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Tesseract from "tesseract.js";
import { PDFDocument } from "pdf-lib";
import FileIcon from "../components/fileIcon";
import "./teacher.css";

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const teacherSubjects = location.state?.subjects || [];
  const [activeSection, setActiveSection] = useState<
    | "dashboard"
    | "students"
    | "note"
    | "assignment"
    | "quiz"
    | "announcement"
    | "chat"
  >("dashboard");

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [textResult, setTextResult] = useState<string | null>(null);

  // Load teacher info
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

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (prefersDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

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

  // ✅ File Upload Handler
  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);

    const storageRef = ref(storage, `teacher_notes/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "teacher_notes"), {
          name: file.name,
          url,
          type: file.type,
          uploadedAt: serverTimestamp(),
        });
        alert("File uploaded successfully!");
        setFile(null);
        setUploadProgress(0);
        setLoading(false);
      }
    );
  };

  // ✅ Scan Image & Extract Text
  const handleScanImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;
    setLoading(true);

    try {
      const { data } = await Tesseract.recognize(imageFile, "eng");
      setTextResult(data.text);

      // Convert to PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      page.drawText(data.text || "No text found", {
        x: 50,
        y: height - 100,
        size: 12,
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfRef = ref(storage, `teacher_notes/scanned_${Date.now()}.pdf`);
      await uploadBytesResumable(pdfRef, blob);

      alert("Scanned text converted to PDF and uploaded!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dashboard ${isDark ? "dark" : ""}`}>
      {/* Sidebar */}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          ✕
        </button>
        <h2 className="logo">{sidebarOpen ? "Teacher Panel" : ""}</h2>
        <ul>
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            🏠 Dashboard
          </li>
          <li
            className={activeSection === "students" ? "active" : ""}
            onClick={() => setActiveSection("students")}
          >
            👩‍🎓 Student List
          </li>
          <li
            className={activeSection === "note" ? "active" : ""}
            onClick={() => setActiveSection("note")}
          >
            📚 Upload Notes
          </li>
          <li
            className={activeSection === "assignment" ? "active" : ""}
            onClick={() => setActiveSection("assignment")}
          >
            📤 Upload Assignment
          </li>
          <li
            className={activeSection === "quiz" ? "active" : ""}
            onClick={() => setActiveSection("quiz")}
          >
            📝 Upload Quiz
          </li>
          <li
            className={activeSection === "announcement" ? "active" : ""}
            onClick={() => setActiveSection("announcement")}
          >
            📢 Announcements
          </li>
          <li
            className={activeSection === "chat" ? "active" : ""}
            onClick={() => setActiveSection("chat")}
          >
            💬 Chat
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <div className="main">
        <div className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="dashboard-title">Teacher Dashboard ✨</h1>
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
                <button onClick={toggleTheme}>
                  Switch to {isDark ? "Light" : "Dark"} Mode
                </button>
                <button>Profile</button>
                <button>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className="content-grid">
          {activeSection === "dashboard" && (
            <div className="card tips-card">
              <h2>Welcome, {teacherName}!</h2>
              <p>Select a section from the sidebar to get started.</p>
            </div>
          )}

          {(activeSection === "note" ||
            activeSection === "assignment" ||
            activeSection === "quiz") && (
            <div className="card form-card">
              {/* Your existing form here */}
            </div>
          )}

          {activeSection === "students" && (
            <div className="card">
              <h2>Student List</h2>
              <p>Student info will appear here.</p>
            </div>
          )}

          {activeSection === "announcement" && (
            <div className="card">
              <h2>Announcements</h2>
              <p>Post updates for your students here.</p>
            </div>
          )}

          {activeSection === "chat" && (
            <div className="card">
              <h2>Chat</h2>
              <p>Teacher-student messaging goes here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
