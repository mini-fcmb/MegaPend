import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Signup() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classLevel, setClassLevel] = useState("SS1");
  const [teaching, setTeaching] = useState<
    { subject: string; classLevel: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(userCredential.user, { displayName: fullName });

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        alert(
          "Account created! A verification email has been sent. Please check your inbox."
        );
      } catch (emailError: any) {
        if (emailError.code === "auth/too-many-requests") {
          console.warn(
            "Verification email was sent, but rate limit reached. Please check your inbox."
          );
          alert(
            "A verification email has been sent! Please check your inbox. Try again later if you don't receive it."
          );
        } else {
          alert(emailError.message);
        }
      }

      // Save user info in Firestore
      const userData: any = {
        fullName,
        email,
        role,
        createdAt: serverTimestamp(),
      };

      if (role === "student") {
        userData.classLevel = classLevel;
      } else {
        userData.teaching = teaching;
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      // Optionally redirect to login page
      navigate("/login");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <button
          type="button"
          className="close-btn"
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            color: "#555",
          }}
        >
          ✕
        </button>

        <h2 className="signup-title">Create Account ✨</h2>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={role === "teacher" ? "active" : ""}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>
        </div>

        <form className="signup-form" onSubmit={handleSignup}>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {role === "student" ? (
            <div>
              <label>Class / Level (comma separated if multiple)</label>
              <input
                type="text"
                placeholder="e.g., SS2, SS3"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label>Subjects & Classes</label>
              <button
                type="button"
                className="asbtn"
                onClick={() =>
                  setTeaching([...teaching, { subject: "", classLevel: "" }])
                }
              >
                Add Subject
              </button>
              {teaching.map((t, i) => (
                <div key={i} style={{ marginTop: "5px" }}>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={t.subject}
                    onChange={(e) => {
                      const newTeaching = [...teaching];
                      newTeaching[i].subject = e.target.value;
                      setTeaching(newTeaching);
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Class"
                    value={t.classLevel}
                    onChange={(e) => {
                      const newTeaching = [...teaching];
                      newTeaching[i].classLevel = e.target.value;
                      setTeaching(newTeaching);
                    }}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : `Sign Up as ${role}`}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
