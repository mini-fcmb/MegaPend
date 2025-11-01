import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import {
  loginWithRole,
  resendVerificationEmail,
  onUserStateChanged,
} from "../firebase/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onUserStateChanged(async (user) => {
      console.log("Firebase user:", user);
      console.log("Role in localStorage:", localStorage.getItem("role"));
      if (user && localStorage.getItem("role")) {
        await user.reload();
        const role = localStorage.getItem("role");
        if (user.emailVerified) {
          if (role === "student") navigate("/student-dashboard");
          else if (role === "teacher") navigate("/teacher-dashboard");
        }
      }
      setCheckingUser(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, role, studentSubjects, teaching } = await loginWithRole(
        email,
        password
      );

      if (!user.emailVerified) {
        alert("Your email is not verified. Please check your inbox.");
        setUserData({ user, role, studentSubjects, teaching });
        setShowResend(true);
        setLoading(false);
        return;
      }

      localStorage.setItem("role", role);

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

  const handleResend = async () => {
    if (!userData) return;
    setResendLoading(true);

    try {
      await resendVerificationEmail(userData.user);
      alert(
        "Verification email resent! Check your inbox (and spam). It will expire in 10 minutes."
      );
    } catch (error: any) {
      alert(
        error.message ||
          "Cannot resend verification. Limit reached for today. Try again tomorrow!"
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/"); // Explicit user action only
  };

  if (checkingUser) return <div>Checking authentication...</div>;

  return (
    <div className="login-page">
      <button className="close-btn" onClick={handleClose}>
        ✕
      </button>

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

        {showResend && (
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? "Resending..." : "Resend Verification Email"}
            </button>
          </div>
        )}

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
