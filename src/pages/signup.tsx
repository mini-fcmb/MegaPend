import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendSignInLinkToEmail, // ← CUCUMA ADD THIS ONE
  getAuth,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Signup() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classInput, setClassInput] = useState("SS1"); // for student
  const [teaching, setTeaching] = useState<
    { subject: string; classLevel: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth(); // ← CUCUMA ADD THIS

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: fullName });

      // Send verification email
      await sendEmailVerification(user);
      alert("Account created! Verification email sent. Check your inbox/spam.");

      // Prepare user data
      const userData: any = {
        uid: user.uid,
        fullName,
        email,
        role,
        createdAt: serverTimestamp(),
      };

      if (role === "student") {
        const classLevels = classInput
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c);
        userData.classLevels = classLevels;
      } else if (role === "teacher") {
        if (
          teaching.length === 0 ||
          teaching.some((t) => !t.subject || !t.classLevel)
        ) {
          alert("Please add at least one valid subject and class");
          setLoading(false);
          return;
        }
        userData.teaching = teaching.map((t) => ({
          subject: t.subject.trim(),
          classLevel: t.classLevel.trim(),
        }));
      }

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // CUCUMA MAGIC LINK ADDED HERE – NO PASSWORD NEXT TIME!!!
      const actionCodeSettings = {
        url: "https://megapend-auth.web.app/login", // CHANGE TO YOUR REAL URL LATER
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);

      alert(
        "Account created + MAGIC LINK SENT! Check your email to login without password next time! NO MORE PASSWORD STRESS!!!"
      );

      // SUCCESS: Redirect based on role
      if (role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error.message || "Failed to create account");
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
          X
        </button>

        <h2 className="signup-title">Create Account</h2>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => {
              setRole("student");
              setTeaching([]);
            }}
          >
            Student
          </button>
          <button
            type="button"
            className={role === "teacher" ? "active" : ""}
            onClick={() => {
              setRole("teacher");
              setClassInput("");
            }}
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
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {role === "student" ? (
            <div>
              <label>
                Your Class(es){" "}
                <span style={{ fontSize: "12px", color: "#666" }}>
                  (comma separated)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. SS1, SS2, JSS3"
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label>Subjects You Teach</label>
              <button
                type="button"
                className="asbtn"
                onClick={() =>
                  setTeaching([...teaching, { subject: "", classLevel: "" }])
                }
              >
                + Add Subject
              </button>
              {teaching.map((t, i) => (
                <div
                  key={i}
                  style={{ marginTop: "10px", display: "flex", gap: "8px" }}
                >
                  <input
                    type="text"
                    placeholder="Subject (e.g Math)"
                    value={t.subject}
                    onChange={(e) => {
                      const newT = [...teaching];
                      newT[i].subject = e.target.value;
                      setTeaching(newT);
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Class (e.g SS1)"
                    value={t.classLevel}
                    onChange={(e) => {
                      const newT = [...teaching];
                      newT[i].classLevel = e.target.value;
                      setTeaching(newT);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setTeaching(teaching.filter((_, idx) => idx !== i))
                    }
                    style={{ color: "red" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {teaching.length === 0 && (
                <p
                  style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}
                >
                  Click "Add Subject" to get started
                </p>
              )}
            </div>
          )}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating..." : `Sign Up as ${role}`}
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
