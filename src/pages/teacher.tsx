// src/pages/teacher.tsx
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import Tesseract from "tesseract.js";
import { PDFDocument } from "pdf-lib";
import { addContent } from "../firebase/contentService";
import "./teacher.css";

interface Student {
  id: string;
  fullName: string;
  email: string;
  classLevels: string[];
}

interface Teaching {
  subject: string;
  classLevel: string;
}

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<
    | "dashboard"
    | "students"
    | "note"
    | "assignment"
    | "quiz"
    | "announcement"
    | "chat"
  >("students"); // default to students so they see it first

  const [teacherName, setTeacherName] = useState("Teacher");
  const [teacherPhoto, setTeacherPhoto] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [teachingClasses, setTeachingClasses] = useState<string[]>([]); // e.g. ["SS1", "SS2"]
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Load teacher data + classes they teach
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setTeacherName(user.displayName || "Teacher");
      setTeacherPhoto(user.photoURL || "");

      // Fetch teacher's teaching classes
      const teacherDoc = await getDoc(doc(db, "users", user.uid));
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        if (data.role === "teacher" && data.teaching) {
          const classes = data.teaching.map((t: Teaching) => t.classLevel);
          setTeachingClasses(classes);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // REAL-TIME: Fetch students in teacher's classes
  useEffect(() => {
    if (teachingClasses.length === 0) {
      setLoadingStudents(false);
      return;
    }

    const studentsRef = collection(db, "users");
    const q = query(
      studentsRef,
      where("role", "==", "student"),
      where("classLevels", "array-contains-any", teachingClasses)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const students: Student[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          students.push({
            id: doc.id,
            fullName: data.fullName || "No Name",
            email: data.email || "No Email",
            classLevels: data.classLevels || [],
          });
        });
        setStudentsList(students);
        setLoadingStudents(false);
      },
      (error) => {
        console.error("Error fetching students:", error);
        setLoadingStudents(false);
      }
    );

    return () => unsubscribe();
  }, [teachingClasses]);

  // Theme
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

  const handleLogout = () => {
    auth.signOut();
    navigate("/getstarted");
  };

  return (
    <div className={`dashboard ${isDark ? "dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          X
        </button>
        <h2 className="logo">{sidebarOpen ? "Teacher Panel" : ""}</h2>
        <ul>
          {[
            { id: "dashboard", icon: "Dashboard", label: "Dashboard" },
            { id: "students", icon: "Student List", label: "Student List" },
            { id: "note", icon: "Upload Notes", label: "Upload Notes" },
            {
              id: "assignment",
              icon: "Upload Assignment",
              label: "Upload Assignment",
            },
            { id: "quiz", icon: "Upload Quiz", label: "Upload Quiz" },
            {
              id: "announcement",
              icon: "Announcements",
              label: "Announcements",
            },
            { id: "chat", icon: "Chat", label: "Chat" },
          ].map((item) => (
            <li
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => setActiveSection(item.id as any)}
            >
              {item.icon} {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <div className="main">
        <div className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            Menu
          </button>
          <h1 className="dashboard-title">Teacher Dashboard</h1>
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
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <div className="content-grid">
          {activeSection === "dashboard" && (
            <div className="card tips-card">
              <h2>Welcome back, {teacherName}!</h2>
              <p>
                You are teaching: <strong>{teachingClasses.join(", ")}</strong>
              </p>
              <p>Currently {studentsList.length} student(s) in your classes.</p>
            </div>
          )}

          {activeSection === "students" && (
            <div className="card">
              <h2>
                Student List ({studentsList.length}) -{" "}
                {teachingClasses.join(", ")}
              </h2>

              {loadingStudents ? (
                <p>Loading students...</p>
              ) : studentsList.length === 0 ? (
                <p>
                  No students have joined your classes yet. Share the signup
                  link!
                </p>
              ) : (
                <div className="table-container">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map((student, i) => (
                        <tr key={student.id}>
                          <td>{i + 1}</td>
                          <td>{student.fullName}</td>
                          <td>{student.email}</td>
                          <td>{student.classLevels.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Keep your other sections (note, assignment, etc.) here */}
          {activeSection === "note" && (
            <div className="card form-card">
              <h2>Upload Note</h2>
              <p>Coming soon...</p>
            </div>
          )}

          {activeSection === "announcement" && (
            <div className="card">
              <h2>Announcements</h2>
              <p>Feature coming soon!</p>
            </div>
          )}

          {activeSection === "chat" && (
            <div className="card">
              <h2>Chat</h2>
              <p>Messaging system coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
