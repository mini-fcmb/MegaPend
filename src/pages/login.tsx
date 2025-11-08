import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import {
  loginWithRole,
  resendVerificationEmail,
  onUserStateChanged,
} from "../firebase/authService";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth"; // CUCUMA ADD THIS LINE

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [manualNavigation, setManualNavigation] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth(); // CUCUMA ADD THIS

  // CUCUMA MAGIC LINK DETECTION – USER CLICK EMAIL → LOGIN DIRECT!!!
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem("emailForSignIn");
      if (!savedEmail) {
        savedEmail = window.prompt(
          "Please confirm your email to complete login:"
        );
      }
      if (!savedEmail) {
        alert("Email is required to complete login.");
        return;
      }

      signInWithEmailLink(auth, savedEmail, window.location.href)
        .then((result) => {
          window.localStorage.removeItem("emailForSignIn");
          alert(
            `Magic login successful! Welcome back, ${
              result.user.displayName || "Boss"
            }!`
          );

          // Auto redirect based on role
          const role = localStorage.getItem("role") || "student";
          if (role === "teacher") {
            navigate("/teacher-dashboard");
          } else {
            navigate("/student-dashboard");
          }
        })
        .catch((error) => {
          console.error("Magic link error:", error);
          alert(
            "Link expired or invalid. Please sign up again or use password."
          );
        });
    }
  }, [auth, navigate]);

  useEffect(() => {
    const unsubscribe = onUserStateChanged(async (user) => {
      if (!manualNavigation && user && localStorage.getItem("role")) {
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
  }, [navigate, manualNavigation]);

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
      alert("Verification email sent! Check your inbox (and spam).");
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        console.log("Too many requests, but email likely sent.");
        alert("Verification email sent! (Firebase rate limit warning ignored)");
      } else {
        alert(error.message || "Cannot resend verification.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    setManualNavigation(true);
    navigate("/");
  };

  if (checkingUser) return <div>Checking authentication...</div>;

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="close-btn" onClick={handleClose}>
          X
        </button>
        <h2>Welcome Back</h2>

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
