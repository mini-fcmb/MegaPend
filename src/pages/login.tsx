import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { loginWithRole } from "../firebase/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, role, studentSubjects, teaching } = await loginWithRole(
        email,
        password
      );

      // ✅ Check if email is verified
      if (!user.emailVerified) {
        alert("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      alert(`Welcome back, ${user.displayName || "User"}!`);

      if (role === "student") {
        navigate("/student-dashboard", {
          state: {
            fullName: user.displayName,
            email: user.email,
            studentSubjects,
          },
        });
      } else {
        navigate("/teacher-dashboard", {
          state: { fullName: user.displayName, email: user.email, teaching },
        });
      }
    } catch (error: any) {
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
