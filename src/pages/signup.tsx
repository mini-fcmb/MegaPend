import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { registerWithRole } from "../firebase/authService";
import { updateProfile, sendEmailVerification, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

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
      let user: User;

      if (role === "student") {
        const studentSubjects = classLevel.split(",").map((c) => c.trim());
        user = await registerWithRole(
          email,
          password,
          role,
          fullName,
          studentSubjects
        );
      } else {
        user = await registerWithRole(
          email,
          password,
          role,
          fullName,
          teaching
        );
      }

      await updateProfile(user, { displayName: fullName });

      await sendEmailVerification(user);

      await setDoc(doc(db, "emailVerification", user.uid), {
        lastSentAt: serverTimestamp(),
        attemptsToday: 1,
      });

      alert(
        "Account created successfully! Check your email to verify your account before logging in. You have 10 minutes to verify before requesting a new code."
      );

      // ✅ Redirect to Home/GetStarted after signup
      navigate("/");
    } catch (error: any) {
      alert(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* ✅ Close Button added here */}
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
