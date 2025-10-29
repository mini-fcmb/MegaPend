import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Courses from "./pages/courses";
import ProtectedRoute from "./components/protectedroute";
import Login from "./pages/login";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Login />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
export default App;
