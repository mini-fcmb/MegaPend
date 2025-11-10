// App.tsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import TeacherDashboard from "./pages/teacher";
import StudentDashboard from "./pages/student";
import UploadExam from "./pages/upload";
import ProtectedRoute from "./components/protectedroute";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Routes>
      {/* Default route */}
      {/*<Route path="/" element={<Home theme={theme} setTheme={setTheme} />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Chatbot page route */}
      {/*<Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/upload" element={<UploadExam />} />*/}
      <Route path="/" element={<UploadExam />} />
    </Routes>
  );
}

export default App;
