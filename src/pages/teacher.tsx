// src/pages/teacher.tsx
import { useState, useEffect, useRef } from "react";
import "boxicons/css/boxicons.min.css";
import "./teacher.css";
import logo from "../assets/MegaPend Logo Design.png";
import { auth, db, storage } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc as firestoreDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Student {
  id: string;
  fullName: string;
  email: string;
  classLevels: string[];
  classDisplay: string;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Student List");
  const [teacherName, setTeacherName] = useState("Teacher");
  const [teacherPhotoURL, setTeacherPhotoURL] = useState("");
  const [teachingClasses, setTeachingClasses] = useState<string[]>([]);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const studentListenerRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load teacher data
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setTeacherName(user.displayName || "Teacher");
      setTeacherPhotoURL(user.photoURL || "");
      setEditName(user.displayName || "");

      try {
        const snap = await getDoc(firestoreDoc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.role === "teacher" && Array.isArray(data.teaching)) {
            const classes = data.teaching
              .map((t: any) => t.classLevel)
              .filter(Boolean)
              .map((c: string) => c.trim().toUpperCase());
            setTeachingClasses(classes);
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    return () => unsub();
  }, [navigate]);

  // Student listener
  useEffect(() => {
    if (studentListenerRef.current) {
      studentListenerRef.current();
      studentListenerRef.current = null;
    }

    if (teachingClasses.length === 0) {
      setStudentsList([]);
      setLoadingStudents(false);
      return;
    }

    setLoadingStudents(true);

    const q = query(collection(db, "users"), where("role", "==", "student"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const students: Student[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data?.fullName) return;

        let studentClasses: string[] = [];
        const raw = data.classLevels || [];

        if (Array.isArray(raw)) {
          studentClasses = raw
            .map((c: any) => String(c).trim().toUpperCase())
            .filter(Boolean);
        } else if (typeof raw === "string") {
          studentClasses = raw
            .split(",")
            .map((c: string) => c.trim().toUpperCase())
            .filter(Boolean);
        }

        const hasMatch = teachingClasses.some((tc) =>
          studentClasses.includes(tc)
        );

        if (hasMatch) {
          students.push({
            id: doc.id,
            fullName: data.fullName,
            email: data.email || "No email",
            classLevels: studentClasses,
            classDisplay: studentClasses.join(", "),
          });
        }
      });

      students.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setStudentsList(students);
      setLoadingStudents(false);
    });

    studentListenerRef.current = unsubscribe;

    return () => {
      if (studentListenerRef.current) {
        studentListenerRef.current();
        studentListenerRef.current = null;
      }
    };
  }, [teachingClasses]);

  const getInitials = (name: string) => {
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return names[names.length - 1][0].toUpperCase();
    }
    return name[0]?.toUpperCase() || "T";
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL: url });
      setTeacherPhotoURL(url);
      alert("Photo updated!");
    } catch (err) {
      alert("Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!auth.currentUser || !editName.trim()) return;

    try {
      await updateProfile(auth.currentUser, { displayName: editName });
      await updateDoc(firestoreDoc(db, "users", auth.currentUser.uid), {
        fullName: editName,
      });
      setTeacherName(editName);
      alert("Name updated!");
    } catch (err) {
      alert("Name update failed");
    }
  };

  const handlePasswordUpdate = async () => {
    if (
      !auth.currentUser ||
      newPassword !== confirmPassword ||
      newPassword.length < 6
    ) {
      alert("Passwords don't match or too short");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.message || "Wrong current password");
    }
  };

  const handleLogout = () => {
    if (studentListenerRef.current) studentListenerRef.current();
    auth.signOut();
    navigate("/getstarted");
  };

  const tabs = [
    "Dashboard",
    "Announcement",
    "Student List",
    "Upload Content",
    "Message",
    "Settings",
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <div className="text-center mb-6">
              <div
                className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold cursor-pointer hover:opacity-90 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {teacherPhotoURL ? (
                  <img
                    src={teacherPhotoURL}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(teacherName)
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">
                Click to change photo
              </p>
              {uploadingPhoto && <p className="text-blue-500">Uploading...</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <button
                  onClick={handleNameUpdate}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Name
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email (cannot change)
                </label>
                <input
                  type="email"
                  value={auth.currentUser?.email || ""}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Change Password</h3>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 mb-2"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 mb-2"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 mb-3"
                />
                <button
                  onClick={handlePasswordUpdate}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Change Password
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="firebase-perfect">
        {/* Sidebar */}
        <aside
          className={`firebase-sidebar ${isCollapsed ? "collapsed" : ""} ${
            isMobileOpen ? "mobile-open" : ""
          }`}
        >
          <div className="firebase-header">
            <button
              className="collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <i
                className={`bx ${
                  isCollapsed ? "bx-chevron-right" : "bx-chevron-left"
                }`}
              ></i>
            </button>
          </div>

          {/* PROFILE SECTION MOVED UP */}
          <div
            className="profile-section"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="profile-avatar">
              {teacherPhotoURL ? (
                <img src={teacherPhotoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(teacherName)}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="profile-info">
                <div className="profile-name">{teacherName}</div>
                <div className="profile-role">Teacher</div>
              </div>
            )}
          </div>

          <nav className="firebase-nav">
            <div className="firebase-nav-group">
              <div className="firebase-nav-title">Teacher Menu</div>

              {/* Map top tabs to sidebar items */}
              <div
                className={`firebase-nav-item ${
                  activeTab === "Dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Dashboard")}
              >
                <i className="bx bx-home"></i>
                <span>Dashboard</span>
              </div>

              <div
                className={`firebase-nav-item ${
                  activeTab === "Announcement" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Announcement")}
              >
                <i className="bx bx-bullhorn"></i>
                <span>Announcements</span>
              </div>

              <div
                className={`firebase-nav-item ${
                  activeTab === "Student List" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Student List")}
              >
                <i className="bx bx-user"></i>
                <span>Students</span>
              </div>

              <div
                className={`firebase-nav-item ${
                  activeTab === "Upload Content" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Upload Content")}
              >
                <i className="bx bx-cloud-upload"></i>
                <span>Upload</span>
              </div>

              <div
                className={`firebase-nav-item ${
                  activeTab === "Message" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Message")}
              >
                <i className="bx bx-message"></i>
                <span>Messages</span>
              </div>

              <div className="firebase-nav-item" onClick={handleLogout}>
                <i className="bx bx-log-out"></i>
                <span>Logout</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={`firebase-main ${isCollapsed ? "collapsed" : ""}`}>
          <header className="firebase-topbar">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden mr-4"
            >
              <div className="firebase-logo">
                <img src={logo} alt="MegaPend" />
              </div>{" "}
            </button>

            <div className="firebase-title">
              MegaPend
              <small>Teachers Dashboard • {teacherName}</small>
            </div>

            <button className="gemini-btn" onClick={() => navigate("/chatbot")}>
              <i className="bx bxs-star"></i>
              Ask MegaBot for help
            </button>
          </header>

          <main className="firebase-content">
            <div className="banner">
              <i className="bx bx-info-circle"></i>
              <div>
                Welcome back, {teacherName}! Managing classes:{" "}
                <strong>{teachingClasses.join(", ")}</strong>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="tabs">
                  {tabs.map((tab) => (
                    <div
                      key={tab}
                      className={`tab ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="active-underline"></div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="add-btn">
                  <i className="bx bx-plus"></i>
                  Add Student
                </button>
              </div>

              {activeTab === "Student List" && (
                <>
                  <div className="table-header">
                    <div className="col identifier">Name</div>
                    <div className="col providers">Email</div>
                    <div className="col created">Class</div>
                    <div className="col signed-in">Status</div>
                  </div>

                  {loadingStudents ? (
                    <div className="empty">Loading students...</div>
                  ) : studentsList.length === 0 ? (
                    <div className="empty">
                      <i className="bx bx-user-x text-6xl text-gray-400"></i>
                      <p>No students in your classes yet</p>
                      <small>
                        Students in {teachingClasses.join(", ")} will appear
                        here
                      </small>
                    </div>
                  ) : (
                    <div className="table-body">
                      {studentsList.map((student, i) => (
                        <div key={student.id} className="table-row">
                          <div className="col identifier">
                            <strong>
                              {i + 1}. {student.fullName}
                            </strong>
                          </div>
                          <div className="col providers">{student.email}</div>
                          <div className="col created">
                            {student.classDisplay}
                          </div>
                          <div className="col signed-in">
                            <span className="status active">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab !== "Student List" && (
                <div className="empty">
                  <i className="bx bx-construction text-6xl text-gray-400"></i>
                  <p>{activeTab} section coming soon!</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
