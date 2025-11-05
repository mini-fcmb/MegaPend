// src/pages/teacher.tsx
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import { addContent } from "../firebase/contentService";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Tesseract from "tesseract.js";
import { PDFDocument } from "pdf-lib";
import "./teacher.css";

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const teacherSubjects: string[] = location.state?.subjects || [];

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
  const [subject, setSubject] = useState<string>(teacherSubjects[0] || "");
  const [classLevel, setClassLevel] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // Load teacher info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setTeacherName(user.displayName || "Unknown Teacher");
        setTeacherPhoto(user.photoURL || "");

        try {
          const teacherRef = doc(db, "teachers", user.uid);
          const docSnap = await getDoc(teacherRef);
          if (docSnap.exists()) {
            setClassLevel(docSnap.data().classLevel || null);
          }
        } catch (err) {
          console.error("Error fetching teacher data:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch students filtered only by classLevel
  useEffect(() => {
    if (!classLevel) return;

    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, "students");
        const q = query(
          studentsRef,
          where("classLevel", "==", classLevel) // filter by classLevel only
        );

        const snapshot = await getDocs(q);
        const students: any[] = [];
        snapshot.forEach((doc) => students.push({ id: doc.id, ...doc.data() }));
        setStudentsList(students);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [classLevel]);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
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
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!classLevel) {
      alert("Class level not loaded yet. Please wait...");
      return;
    }

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

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    const storageRef = ref(storage, `teacher_notes/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) =>
        setUploadProgress(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        ),
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

  const handleScanImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;
    setLoading(true);

    try {
      const { data } = await Tesseract.recognize(imageFile, "eng");
      setTextResult(data.text);

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { height } = page.getSize();
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
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          ✕
        </button>
        <h2 className="logo">{sidebarOpen ? "Teacher Panel" : ""}</h2>
        <ul>
          {[
            "dashboard",
            "students",
            "note",
            "assignment",
            "quiz",
            "announcement",
            "chat",
          ].map((section) => (
            <li
              key={section}
              className={activeSection === section ? "active" : ""}
              onClick={() => setActiveSection(section as any)}
            >
              {section === "dashboard" && "🏠 Dashboard"}
              {section === "students" && "👩‍🎓 Student List"}
              {section === "note" && "📚 Upload Notes"}
              {section === "assignment" && "📤 Upload Assignment"}
              {section === "quiz" && "📝 Upload Quiz"}
              {section === "announcement" && "📢 Announcements"}
              {section === "chat" && "💬 Chat"}
            </li>
          ))}
        </ul>
      </aside>

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

        <div className="content-grid">
          {activeSection === "dashboard" && (
            <div className="card tips-card">
              <h2>Welcome, {teacherName}!</h2>
              <p>Select a section from the sidebar to get started.</p>
            </div>
          )}

          {activeSection === "students" && (
            <div className="card">
              <h2>Student List - {classLevel || "Loading..."}</h2>
              {studentsList.length === 0 ? (
                <p>No students found for this class.</p>
              ) : (
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>UID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.fullName}</td>
                        <td>{student.email}</td>
                        <td>{student.uid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {(activeSection === "note" ||
            activeSection === "assignment" ||
            activeSection === "quiz") && (
            <div className="card form-card">
              <h2>
                {type === "note"
                  ? "Upload Note"
                  : type === "assignment"
                  ? "Upload Assignment"
                  : "Upload Quiz"}
              </h2>
              <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <label>Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {teacherSubjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label>Upload File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && (
                  <>
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={loading}
                    >
                      Upload File
                    </button>
                    <p>Progress: {uploadProgress.toFixed(0)}%</p>
                  </>
                )}
                <label>Scan Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanImage}
                />
                {textResult && <textarea value={textResult} readOnly />}
                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </form>
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
